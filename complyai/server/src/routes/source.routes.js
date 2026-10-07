import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('sources')
      .select('id, name, authority, domain, url, category, status, last_verified_at')
      .eq('status', 'Active')
      .order('name');

    if (error) throw error;
    res.json({ sources: data || [] });
  } catch (err) { next(err); }
});

export default router;
