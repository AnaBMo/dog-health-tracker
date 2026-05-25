import { supabase } from '../index.js';

export const getVaccines = async (req, res) => {
  const { data, error } = await supabase
    .from('vaccines')
    .select('*')
    .eq('dog_id', req.params.dogId);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
};

export const getVaccine = async (req, res) => {
  const { data, error } = await supabase
    .from('vaccines')
    .select('*')
    .eq('id', req.params.id)
    .eq('dog_id', req.params.dogId)
    .single();

  if (error) return res.status(404).json({ error: 'Vaccine not found' });

  res.json(data);
};

export const createVaccine = async (req, res) => {
  const { name, date, next_date, notes } = req.body;

  if (!name || !date) return res.status(400).json({ error: 'Name and date are required' });

  const { data, error } = await supabase
    .from('vaccines')
    .insert([{ name, date, next_date, notes, dog_id: req.params.dogId }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json(data);
};

export const updateVaccine = async (req, res) => {
  const { name, date, next_date, notes } = req.body;

  const { data, error } = await supabase
    .from('vaccines')
    .update({ name, date, next_date, notes })
    .eq('id', req.params.id)
    .eq('dog_id', req.params.dogId)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
};

export const deleteVaccine = async (req, res) => {
  const { error } = await supabase
    .from('vaccines')
    .delete()
    .eq('id', req.params.id)
    .eq('dog_id', req.params.dogId);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: 'Vaccine deleted successfully' });
};