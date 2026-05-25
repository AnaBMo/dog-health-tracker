import { supabase } from '../index.js';

export const register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json({ message: 'User registered successfully', user: data.user });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: 'Login successful', user: data.user, session: data.session });
};

export const logout = async (req, res) => {
  const { error } = await supabase.auth.signOut();

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: 'Logout successful' });
};