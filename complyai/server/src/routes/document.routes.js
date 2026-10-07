import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { supabaseAdmin } from '../config/supabase.js';
import { runDocumentAgent } from '../agents/document.agent.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpg', 'image/jpeg'];
    cb(null, allowed.includes(file.mimetype));
  },
});

const router = Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('id')
      .eq('owner_id', req.user.id)
      .single();

    if (!business) return res.json({ documents: [] });

    const { data, error } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ documents: data || [] });
  } catch (err) { next(err); }
});

router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', req.params.id)
      .eq('uploaded_by', req.user.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Document not found' });
    res.json({ document: data });
  } catch (err) { next(err); }
});

router.post('/', authMiddleware, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('id')
      .eq('owner_id', req.user.id)
      .single();

    if (!business) return res.status(400).json({ error: 'Create a business first' });

    const storagePath = `${req.user.id}/${Date.now()}_${req.file.originalname}`;
    const { error: uploadErr } = await supabaseAdmin.storage
      .from('documents')
      .upload(storagePath, req.file.buffer, { contentType: req.file.mimetype });

    if (uploadErr) throw uploadErr;

    let extractedText = '';
    if (req.file.mimetype === 'application/pdf') {
      try {
        const pdfParse = (await import('pdf-parse')).default;
        const pdfData = await pdfParse(req.file.buffer);
        extractedText = pdfData.text || '';
      } catch {
        extractedText = 'PDF text extraction failed - manual review needed';
      }
    }

    const { data: doc, error: dbErr } = await supabaseAdmin
      .from('documents')
      .insert({
        business_id: business.id,
        uploaded_by: req.user.id,
        file_name: req.file.originalname,
        storage_path: storagePath,
        mime_type: req.file.mimetype,
        file_size: req.file.size,
        extracted_text: extractedText,
        document_type: req.body.document_type || null,
      })
      .select()
      .single();

    if (dbErr) throw dbErr;
    res.status(201).json({ document: doc });
  } catch (err) { next(err); }
});

router.post('/:id/analyze', authMiddleware, async (req, res, next) => {
  try {
    const { data: doc } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', req.params.id)
      .eq('uploaded_by', req.user.id)
      .single();

    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .eq('owner_id', req.user.id)
      .single();

    const { data: compliance } = await supabaseAdmin
      .from('business_compliance')
      .select('*, compliance_requirements(*)')
      .eq('business_id', business?.id);

    const analysis = await runDocumentAgent(
      doc.extracted_text,
      business,
      (compliance || []).map(c => c.compliance_requirements)
    );

    const updates = {
      analysis,
      document_type: analysis.document_type || doc.document_type,
      verification_status: 'Needs Review',
    };
    if (analysis.issue_date) updates.issue_date = analysis.issue_date;
    if (analysis.expiry_date) updates.expiry_date = analysis.expiry_date;

    const { data: updated } = await supabaseAdmin
      .from('documents')
      .update(updates)
      .eq('id', doc.id)
      .select()
      .single();

    if (analysis.expiry_date) {
      const expiryDate = new Date(analysis.expiry_date);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 30) {
        await supabaseAdmin.from('notifications').insert({
          user_id: req.user.id,
          business_id: business?.id,
          type: 'document_expiry',
          title: `Document Expiring: ${doc.file_name}`,
          message: `${doc.file_name} ${daysUntilExpiry <= 0 ? 'has expired' : `expires in ${daysUntilExpiry} days`}. Please renew.`,
          severity: daysUntilExpiry <= 0 ? 'Critical' : 'Warning',
        });
      }
    }

    res.json({ document: updated, analysis });
  } catch (err) { next(err); }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { data: doc } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', req.params.id)
      .eq('uploaded_by', req.user.id)
      .single();

    if (!doc) return res.status(404).json({ error: 'Document not found' });

    await supabaseAdmin.storage.from('documents').remove([doc.storage_path]);
    await supabaseAdmin.from('documents').delete().eq('id', doc.id);

    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
