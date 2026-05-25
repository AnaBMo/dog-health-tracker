-- Enable RLS on all tables
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Dogs policies
CREATE POLICY "Users can only see their own dogs" ON dogs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own dogs" ON dogs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own dogs" ON dogs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own dogs" ON dogs
  FOR DELETE USING (auth.uid() = user_id);

-- Vet visits policies
CREATE POLICY "Users can only see their own vet visits" ON vet_visits
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM dogs WHERE id = dog_id));
CREATE POLICY "Users can only insert their own vet visits" ON vet_visits
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM dogs WHERE id = dog_id));
CREATE POLICY "Users can only update their own vet visits" ON vet_visits
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM dogs WHERE id = dog_id));
CREATE POLICY "Users can only delete their own vet visits" ON vet_visits
  FOR DELETE USING (auth.uid() = (SELECT user_id FROM dogs WHERE id = dog_id));

-- Vaccines policies
CREATE POLICY "Users can only see their own vaccines" ON vaccines
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM dogs WHERE id = dog_id));
CREATE POLICY "Users can only insert their own vaccines" ON vaccines
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM dogs WHERE id = dog_id));
CREATE POLICY "Users can only update their own vaccines" ON vaccines
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM dogs WHERE id = dog_id));
CREATE POLICY "Users can only delete their own vaccines" ON vaccines
  FOR DELETE USING (auth.uid() = (SELECT user_id FROM dogs WHERE id = dog_id));

-- Treatments policies
CREATE POLICY "Users can only see their own treatments" ON treatments
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM dogs WHERE id = dog_id));
CREATE POLICY "Users can only insert their own treatments" ON treatments
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM dogs WHERE id = dog_id));
CREATE POLICY "Users can only update their own treatments" ON treatments
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM dogs WHERE id = dog_id));
CREATE POLICY "Users can only delete their own treatments" ON treatments
  FOR DELETE USING (auth.uid() = (SELECT user_id FROM dogs WHERE id = dog_id));

-- Allergies policies
CREATE POLICY "Users can only see their own allergies" ON allergies
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM dogs WHERE id = dog_id));
CREATE POLICY "Users can only insert their own allergies" ON allergies
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM dogs WHERE id = dog_id));
CREATE POLICY "Users can only update their own allergies" ON allergies
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM dogs WHERE id = dog_id));
CREATE POLICY "Users can only delete their own allergies" ON allergies
  FOR DELETE USING (auth.uid() = (SELECT user_id FROM dogs WHERE id = dog_id));

-- Documents policies
CREATE POLICY "Users can only see their own documents" ON documents
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM dogs WHERE id = dog_id));
CREATE POLICY "Users can only insert their own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM dogs WHERE id = dog_id));
CREATE POLICY "Users can only update their own documents" ON documents
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM dogs WHERE id = dog_id));
CREATE POLICY "Users can only delete their own documents" ON documents
  FOR DELETE USING (auth.uid() = (SELECT user_id FROM dogs WHERE id = dog_id));