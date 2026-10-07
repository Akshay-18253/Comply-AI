import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { supabaseAdmin } from '../config/supabase.js';
import { ActionSchema, ActionUpdateSchema } from '../schemas/validation.js';

const router = Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('id')
      .eq('owner_id', req.user.id)
      .single();

    if (!business) return res.json({ actions: [] });

    const { data, error } = await supabaseAdmin
      .from('actions')
      .select('*')
      .eq('business_id', business.id)
      .order('priority')
      .order('due_date');

    if (error) throw error;
    res.json({ actions: data || [] });
  } catch (err) { next(err); }
});

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const validated = ActionSchema.parse(req.body);
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('id')
      .eq('owner_id', req.user.id)
      .single();

    if (!business) return res.status(400).json({ error: 'Create a business first' });

    const { data, error } = await supabaseAdmin
      .from('actions')
      .insert({ ...validated, business_id: business.id })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ action: data });
  } catch (err) { next(err); }
});

router.patch('/:id', authMiddleware, async (req, res, next) => {
  try {
    const validated = ActionUpdateSchema.parse(req.body);
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
      .from('actions')
      .update(update)
      .eq('id', req.params.id)
      .eq('business_id', business.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ action: data });
  } catch (err) { next(err); }
});

export default router;
