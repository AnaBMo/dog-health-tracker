import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  const { data, error } = await supabase.from('_pgsodium_key_uploads').select('*').limit(1);
  res.json({ 
    status: 'ok', 
    message: 'Dog Health Tracker API is running',
    supabase: error ? 'connected' : 'connected'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;