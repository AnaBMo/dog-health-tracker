import { supabaseWithAuth } from '../index.js';
import { extractDataFromFile } from '../services/ai.service.js';

export const uploadDocument = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });

  const { dogId } = req.params;
  const userId = req.user.id;
  const confirmed = req.body.confirmed === 'true';
  const supabase = supabaseWithAuth(req.token);

  try {
    // 1. Obtener la configuración de IA del usuario
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('ai_provider, ai_api_key')
      .eq('user_id', userId)
      .single();

    if (settingsError || !settings?.ai_provider || !settings?.ai_api_key) {
      return res.status(400).json({ error: 'AI provider not configured. Please set up your API key in settings.' });
    }

    // 2. Obtener el nombre del perro
    const { data: dog, error: dogError } = await supabase
      .from('dogs')
      .select('name')
      .eq('id', dogId)
      .eq('user_id', userId)
      .single();

    if (dogError || !dog) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    // 3. Extraer datos con IA
    const extractedData = await extractDataFromFile(
      req.file.buffer,
      req.file.mimetype,
      settings.ai_provider,
      settings.ai_api_key,
      dog.name
    );

    // 4. Comprobar si hay mismatch de nombre y no está confirmado
    const hasMismatch = extractedData.notes && extractedData.notes.startsWith('Aviso:');
    if (hasMismatch && !confirmed) {
      return res.status(200).json({
        name_mismatch: true,
        dog_name: dog.name,
        extractedData
      });
    }

    // 5. Guardar los datos extraídos del documento en la base de datos
        const fileName = extractedData.visit_date
          ? `${extractedData.visit_date}${req.file.originalname.substring(req.file.originalname.lastIndexOf('.'))}`
          : req.file.originalname;

        const { data: document, error: docError } = await supabase
          .from('documents')
          .insert([{
            dog_id: dogId,
            file_name: fileName,
            extracted_data: extractedData
          }])
          .select()
          .single();

        if (docError) throw new Error(docError.message);

    // 6. Guardar la visita veterinaria si hay datos
    if (extractedData.visit_date) {
      const { data: vetVisit } = await supabase.from('vet_visits').insert([{
        dog_id: dogId,
        visit_date: extractedData.visit_date,
        reason: extractedData.reason,
        diagnosis: extractedData.diagnosis,
        notes: extractedData.notes,
        document_id: document.id
      }]).select().single();

      if (vetVisit) {
        await supabase.from('documents')
          .update({ vet_visit_id: vetVisit.id })
          .eq('id', document.id);
      }
    }

    // 7. Guardar vacunas si las hay
    if (extractedData.vaccines?.length > 0) {
      await supabase.from('vaccines').insert(
        extractedData.vaccines.map(v => ({ ...v, dog_id: dogId, document_id: document.id }))
      );
    }

    // 8. Guardar tratamientos si los hay
    if (extractedData.treatments?.length > 0) {
      await supabase.from('treatments').insert(
        extractedData.treatments.map(t => ({ ...t, dog_id: dogId, document_id: document.id }))
      );
    }

    // 9. Guardar alergias si las hay
    if (extractedData.allergies?.length > 0) {
      await supabase.from('allergies').insert(
        extractedData.allergies.map(a => ({ ...a, dog_id: dogId, document_id: document.id }))
      );
    }

    // 10. Actualizar peso del perro solo si es la visita más reciente
    if (extractedData.weight && extractedData.visit_date) {
      const { data: latestVisit } = await supabase
        .from('vet_visits')
        .select('visit_date')
        .eq('dog_id', dogId)
        .not('id', 'eq', document.id)
        .order('visit_date', { ascending: false })
        .limit(1)
        .single();

      const isMoreRecent = !latestVisit || extractedData.visit_date >= latestVisit.visit_date;
      if (isMoreRecent) {
        await supabase.from('dogs')
          .update({ weight: extractedData.weight })
          .eq('id', dogId);
      }
    }

    res.status(201).json({
      message: 'Document uploaded and processed successfully',
      document,
      extractedData
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDocuments = async (req, res) => {
  const supabase = supabaseWithAuth(req.token);
  const { dogId } = req.params;

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('dog_id', dogId)
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
};

export const deleteDocument = async (req, res) => {
  const supabase = supabaseWithAuth(req.token);
  const { dogId, id } = req.params;

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)
    .eq('dog_id', dogId);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: 'Document deleted successfully' });
};