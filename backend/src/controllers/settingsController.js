import { supabaseWithAuth } from '../index.js';

export const getSettings = async (req, res) => {
  const supabase = supabaseWithAuth(req.token);
  const { data, error } = await supabase
    .from('user_settings')
    .select('ai_provider, ai_api_key')
    .eq('user_id', req.user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return res.status(400).json({ error: error.message });
  }

  res.json(data || { ai_provider: null, ai_api_key: null });
};

export const saveSettings = async (req, res) => {
  const supabase = supabaseWithAuth(req.token);
  const { ai_provider, ai_api_key } = req.body;

  if (!ai_provider || !ai_api_key) {
    return res.status(400).json({ error: 'Provider and API key are required' });
  }

  const { data, error } = await supabase
    .from('user_settings')
    .upsert({ user_id: req.user.id, ai_provider, ai_api_key }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
};