import { supabase } from '../index.js';

export const getDogs = async (req, res) => {
  const { data, error } = await supabase
    .from('dogs')
    .select('*')
    .eq('user_id', req.user.id);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
};

export const getDog = async (req, res) => {
  const { data, error } = await supabase
    .from('dogs')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();

  if (error) return res.status(404).json({ error: 'Dog not found' });

  res.json(data);
};

export const createDog = async (req, res) => {
  const { name, breed, birth_date, weight, photo_url, notes } = req.body;

  if (!name) return res.status(400).json({ error: 'Name is required' });

  const { data, error } = await supabase
    .from('dogs')
    .insert([{ name, breed, birth_date, weight, photo_url, notes, user_id: req.user.id }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json(data);
};

export const updateDog = async (req, res) => {
  const { name, breed, birth_date, weight, photo_url, notes } = req.body;

  const { data, error } = await supabase
    .from('dogs')
    .update({ name, breed, birth_date, weight, photo_url, notes, updated_at: new Date() })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
};

export const deleteDog = async (req, res) => {
  const { error } = await supabase
    .from('dogs')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: 'Dog deleted successfully' });
};