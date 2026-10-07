import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

router.get('/runs', authMiddleware, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('agent_runs')
      .select('*')
      .eq('user_id', req.user.id)
      .order('started_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    res.json({ runs: data || [] });
  } catch (err) { next(err); }
});

router.get('/runs/:id', authMiddleware, async (req, res, next) => {
  try {
    const { data: run, error } = await supabaseAdmin
      .from('agent_runs')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    if (!run) return res.status(404).json({ error: 'Agent run not found' });

    const { data: steps } = await supabaseAdmin
      .from('agent_steps')
      .select('*')
      .eq('agent_run_id', run.id)
      .order('step_order', { ascending: true });

    res.json({ run, steps: steps || [] });
  } catch (err) { next(err); }
});

router.get('/runs/:id/steps', authMiddleware, async (req, res, next) => {
  try {
    const { data: run } = await supabaseAdmin
      .from('agent_runs')
      .select('id')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (!run) return res.status(404).json({ error: 'Agent run not found' });

    const { data, error } = await supabaseAdmin
      .from('agent_steps')
      .select('*')
      .eq('agent_run_id', run.id)
      .order('step_order', { ascending: true });

    if (error) throw error;
    res.json({ steps: data || [] });
  } catch (err) { next(err); }
});

export default router;
