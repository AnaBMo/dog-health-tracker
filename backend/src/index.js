import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import authRoutes from './routes/auth.routes.js';
import dogsRoutes from './routes/dogs.routes.js';
import vetVisitsRoutes from './routes/vetVisits.routes.js';
import vaccinesRoutes from './routes/vaccines.routes.js';
import treatmentsRoutes from './routes/treatments.routes.js';
import allergiesRoutes from './routes/allergies.routes.js';
import documentsRoutes from './routes/documents.routes.js';
import agentsRoutes from './routes/agents.routes.js';
import settingsRoutes from './routes/settings.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

// Cliente con JWT del usuario para operaciones con RLS
export const supabaseWithAuth = (token) => createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY,
  {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  }
);

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://dog-health-tracker-taupe.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/dogs', dogsRoutes);
app.use('/api/dogs', vetVisitsRoutes);
app.use('/api/dogs', vaccinesRoutes);
app.use('/api/dogs', treatmentsRoutes);
app.use('/api/dogs', allergiesRoutes);
app.use('/api/dogs', documentsRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Dog Health Tracker API is running'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;