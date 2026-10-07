import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { supabaseAdmin } from '../config/supabase.js';
import { BusinessSchema } from '../schemas/validation.js';

const router = Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .eq('owner_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    res.json({ business: data || null });
  } catch (err) { next(err); }
});

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const validated = BusinessSchema.parse(req.body);
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .insert({ ...validated, owner_id: req.user.id, onboarding_completed: true })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ business: data });
  } catch (err) { next(err); }
});

router.put('/', authMiddleware, async (req, res, next) => {
  try {
    const validated = BusinessSchema.partial().parse(req.body);

    const { data: existing } = await supabaseAdmin
      .from('businesses')
      .select('id')
      .eq('owner_id', req.user.id)
      .single();

    if (!existing) {
      return res.status(404).json({ error: 'No business found' });
    }

    const { data, error } = await supabaseAdmin
      .from('businesses')
      .update(validated)
      .eq('id', existing.id)
      .eq('owner_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ business: data });
  } catch (err) { next(err); }
});

export default router;
