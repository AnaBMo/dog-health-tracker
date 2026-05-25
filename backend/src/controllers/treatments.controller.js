import { supabase } from '../index.js';

export const getTreatments = async (req, res) => {
  const { data, error } = await supabase
    .from('treatments')
    .select('*')
    .eq('dog_id', req.params.dogId);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
};

export const getTreatment = async (req, res) => {
  const { data, error } = await supabase
    .from('treatments')
    .select('*')
    .eq('id', req.params.id)
    .eq('dog_id', req.params.dogId)
    .single();

  if (error) return res.status(404).json({ error: 'Treatment not found' });

  res.json(data);
};

export const createTreatment = async (req, res) => {
  const { type, name, date, next_date, notes } = req.body;

  if (!type || !date) return res.status(400).json({ error: 'Type and date are required' });

  const { data, error } = await supabase
    .from('treatments')
    .insert([{ type, name, date, next_date, notes, dog_id: req.params.dogId }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json(data);
};

export const updateTreatment = async (req, res) => {
  const { type, name, date, next_date, notes } = req.body;

  const { data, error } = await supabase
    .from('treatments')
    .update({ type, name, date, next_date, notes })
    .eq('id', req.params.id)
    .eq('dog_id', req.params.dogId)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
};

export const deleteTreatment = async (req, res) => {
  const { error } = await supabase
    .from('treatments')
    .delete()
    .eq('id', req.params.id)
    .eq('dog_id', req.params.dogId);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: 'Treatment deleted successfully' });
};