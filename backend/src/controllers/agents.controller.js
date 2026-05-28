import { supabaseWithAuth } from '../index.js';
import { analyzeHealthReport } from '../agents/reportAnalysis.agent.js';
import { getProactiveRecommendations } from '../agents/proactiveTracking.agent.js';
import { conversationalChat } from '../agents/conversationalQuery.agent.js';
import { generateSmartAlerts } from '../agents/smartAlerts.agent.js';

const getUserAISettings = async (supabase, userId) => {
  const { data, error } = await supabase
    .from('user_settings')
    .select('ai_provider, ai_api_key')
    .eq('user_id', userId)
    .single();

  if (error || !data) throw new Error('AI settings not configured');
  if (!data.ai_api_key) throw new Error('API key not configured');

  return data;
};

const getDogRecords = async (supabase, dogId, userId) => {
  const { data: dog, error: dogError } = await supabase
    .from('dogs')
    .select('*')
    .eq('id', dogId)
    .eq('user_id', userId)
    .single();

  if (dogError || !dog) throw new Error('Dog not found');

  const [vetVisits, vaccines, treatments, allergies] = await Promise.all([
    supabase.from('vet_visits').select('*').eq('dog_id', dogId).order('visit_date', { ascending: false }),
    supabase.from('vaccines').select('*').eq('dog_id', dogId).order('date', { ascending: false }),
    supabase.from('treatments').select('*').eq('dog_id', dogId).order('date', { ascending: false }),
    supabase.from('allergies').select('*').eq('dog_id', dogId)
  ]);

  return {
    dog,
    records: {
      vet_visits: vetVisits.data || [],
      vaccines: vaccines.data || [],
      treatments: treatments.data || [],
      allergies: allergies.data || []
    }
  };
};

// POST /api/agents/:dogId/analyze
export const analyzeReport = async (req, res) => {
  try {
    const supabase = supabaseWithAuth(req.token);
    const { dogId } = req.params;
    const { ai_provider, ai_api_key } = await getUserAISettings(supabase, req.user.id);
    const { dog, records } = await getDogRecords(supabase, dogId, req.user.id);

    const report = await analyzeHealthReport(dog, records, ai_provider, ai_api_key);

    res.json({ dog_name: dog.name, report });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// POST /api/agents/:dogId/tracking
export const proactiveTracking = async (req, res) => {
  try {
    const supabase = supabaseWithAuth(req.token);
    const { dogId } = req.params;
    const { ai_provider, ai_api_key } = await getUserAISettings(supabase, req.user.id);
    const { dog, records } = await getDogRecords(supabase, dogId, req.user.id);

    const result = await getProactiveRecommendations(dog, records, ai_provider, ai_api_key);

    res.json({ dog_name: dog.name, ...result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// POST /api/agents/:dogId/chat
// Body: { message: string, history: [{role: 'user'|'assistant', content: string}] }
export const chat = async (req, res) => {
  try {
    const supabase = supabaseWithAuth(req.token);
    const { dogId } = req.params;
    const { message, history = [] } = req.body;

    if (!message) return res.status(400).json({ error: 'Message is required' });

    const trimmedHistory = history.slice(-20);

    const { ai_provider, ai_api_key } = await getUserAISettings(supabase, req.user.id);
    const { dog, records } = await getDogRecords(supabase, dogId, req.user.id);

    const reply = await conversationalChat(dog, records, trimmedHistory, message, ai_provider, ai_api_key);

    res.json({
      dog_name: dog.name,
      reply,
      updated_history: [
        ...trimmedHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: reply }
      ]
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// POST /api/agents/:dogId/alerts
export const smartAlerts = async (req, res) => {
  try {
    const supabase = supabaseWithAuth(req.token);
    const { dogId } = req.params;
    const { ai_provider, ai_api_key } = await getUserAISettings(supabase, req.user.id);
    const { dog, records } = await getDogRecords(supabase, dogId, req.user.id);

    const result = await generateSmartAlerts(dog, records, ai_provider, ai_api_key);

    res.json({ dog_name: dog.name, ...result, records });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};