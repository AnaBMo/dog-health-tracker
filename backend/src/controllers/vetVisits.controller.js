import { supabase } from '../index.js';

export const getVetVisits = async (req, res) => {
  const { data, error } = await supabase
    .from('vet_visits')
    .select('*')
    .eq('dog_id', req.params.dogId);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
};

export const getVetVisit = async (req, res) => {
  const { data, error } = await supabase
    .from('vet_visits')
    .select('*')
    .eq('id', req.params.id)
    .eq('dog_id', req.params.dogId)
    .single();

  if (error) return res.status(404).json({ error: 'Vet visit not found' });

  res.json(data);
};

export const createVetVisit = async (req, res) => {
  const { visit_date, reason, diagnosis, notes, document_url } = req.body;

  if (!visit_date) return res.status(400).json({ error: 'Visit date is required' });

  const { data, error } = await supabase
    .from('vet_visits')
    .insert([{ visit_date, reason, diagnosis, notes, document_url, dog_id: req.params.dogId }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json(data);
};

export const updateVetVisit = async (req, res) => {
  const { visit_date, reason, diagnosis, notes, document_url } = req.body;

  const { data, error } = await supabase
    .from('vet_visits')
    .update({ visit_date, reason, diagnosis, notes, document_url })
    .eq('id', req.params.id)
    .eq('dog_id', req.params.dogId)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
};

export const deleteVetVisit = async (req, res) => {
  const { error } = await supabase
    .from('vet_visits')
    .delete()
    .eq('id', req.params.id)
    .eq('dog_id', req.params.dogId);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: 'Vet visit deleted successfully' });
};