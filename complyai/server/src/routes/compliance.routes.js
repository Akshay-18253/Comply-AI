import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { supabaseAdmin } from '../config/supabase.js';
import { ComplianceUpdateSchema } from '../schemas/validation.js';
import { runComplianceDiscoveryWorkflow } from '../agents/orchestrator.agent.js';

const router = Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('id')
      .eq('owner_id', req.user.id)
      .single();

    if (!business) return res.json({ compliance: [] });

    const { data, error } = await supabaseAdmin
      .from('business_compliance')
      .select('*, compliance_requirements(*)')
      .eq('business_id', business.id)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ compliance: data || [] });
  } catch (err) { next(err); }
});

router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('id')
      .eq('owner_id', req.user.id)
      .single();

    if (!business) return res.status(404).json({ error: 'No business found' });

    const { data, error } = await supabaseAdmin
      .from('business_compliance')
      .select('*, compliance_requirements(*, sources:source_id(*))')
      .eq('id', req.params.id)
      .eq('business_id', business.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Compliance item not found' });

    const { data: docs } = await supabaseAdmin
      .from('compliance_documents')
      .select('*, documents(*)')
      .eq('business_compliance_id', data.id);

    res.json({ compliance: data, documents: docs || [] });
  } catch (err) { next(err); }
});

router.post('/discover', authMiddleware, async (req, res, next) => {
  try {
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .eq('owner_id', req.user.id)
      .single();

    if (!business) return res.status(400).json({ error: 'Complete business onboarding first' });

    const result = await runComplianceDiscoveryWorkflow(business, req.user.id);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
});

router.patch('/:id', authMiddleware, async (req, res, next) => {
  try {
    const validated = ComplianceUpdateSchema.parse(req.body);
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('id')
      .eq('owner_id', req.user.id)
      .single();

    if (!business) return res.status(404).json({ error: 'No business found' });

    const update = { ...validated };
    if (validated.status === 'Completed') {
      update.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from('business_compliance')
      .update(update)
      .eq('id', req.params.id)
      .eq('business_id', business.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ compliance: data });
  } catch (err) { next(err); }
});

router.post('/:id/complete', authMiddleware, async (req, res, next) => {
  try {
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('id')
      .eq('owner_id', req.user.id)
      .single();

    if (!business) return res.status(404).json({ error: 'No business found' });

    const { data, error } = await supabaseAdmin
      .from('business_compliance')
      .update({ status: 'Completed', completed_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('business_id', business.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ compliance: data });
  } catch (err) { next(err); }
});

export default router;
