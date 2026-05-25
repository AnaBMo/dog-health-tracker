import { supabase } from '../index.js';

export const getAllergies = async (req, res) => {
  const { data, error } = await supabase
    .from('allergies')
    .select('*')
    .eq('dog_id', req.params.dogId);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
};

export const getAllergy = async (req, res) => {
  const { data, error } = await supabase
    .from('allergies')
    .select('*')
    .eq('id', req.params.id)
    .eq('dog_id', req.params.dogId)
    .single();

  if (error) return res.status(404).json({ error: 'Allergy not found' });

  res.json(data);
};

export const createAllergy = async (req, res) => {
  const { name, severity, notes } = req.body;

  if (!name) return res.status(400).json({ error: 'Name is required' });

  const { data, error } = await supabase
    .from('allergies')
    .insert([{ name, severity, notes, dog_id: req.params.dogId }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json(data);
};

export const updateAllergy = async (req, res) => {
  const { name, severity, notes } = req.body;

  const { data, error } = await supabase
    .from('allergies')
    .update({ name, severity, notes })
    .eq('id', req.params.id)
    .eq('dog_id', req.params.dogId)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
};

export const deleteAllergy = async (req, res) => {
  const { error } = await supabase
    .from('allergies')
    .delete()
    .eq('id', req.params.id)
    .eq('dog_id', req.params.dogId);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: 'Allergy deleted successfully' });
};