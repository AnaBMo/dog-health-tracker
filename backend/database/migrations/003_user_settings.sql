CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  ai_provider TEXT CHECK (ai_provider IN ('anthropic', 'openai', 'gemini')),
  ai_api_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);