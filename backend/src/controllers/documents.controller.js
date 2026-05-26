import { supabaseWithAuth } from '../index.js';
import { uploadFile } from '../services/storage.service.js';
import { extractDataFromFile } from '../services/ai.service.js';

export const uploadDocument = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });

  const { dogId } = req.params;
  const userId = req.user.id;
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

    // 3. Subir el archivo a Supabase Storage
    const { filePath, publicUrl } = await uploadFile(req.file, userId, dogId);

    // 4. Extraer datos con IA
    const extractedData = await extractDataFromFile(
      req.file.buffer,
      req.file.mimetype,
      settings.ai_provider,
      settings.ai_api_key,
      dog.name
    );

    // 5. Guardar el documento en la base de datos
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert([{
        dog_id: dogId,
        file_url: publicUrl,
        file_name: req.file.originalname,
        extracted_data: extractedData
      }])
      .select()
      .single();

    if (docError) throw new Error(docError.message);

    // 6. Guardar la visita veterinaria si hay datos
    if (extractedData.visit_date) {
      await supabase.from('vet_visits').insert([{
        dog_id: dogId,
        visit_date: extractedData.visit_date,
        reason: extractedData.reason,
        diagnosis: extractedData.diagnosis,
        notes: extractedData.notes,
        document_url: publicUrl
      }]);
    }

    // 7. Guardar vacunas si las hay
    if (extractedData.vaccines?.length > 0) {
      await supabase.from('vaccines').insert(
        extractedData.vaccines.map(v => ({ ...v, dog_id: dogId }))
      );
    }

    // 8. Guardar tratamientos si los hay
    if (extractedData.treatments?.length > 0) {
      await supabase.from('treatments').insert(
        extractedData.treatments.map(t => ({ ...t, dog_id: dogId }))
      );
    }

    // 9. Guardar alergias si las hay
    if (extractedData.allergies?.length > 0) {
      await supabase.from('allergies').insert(
        extractedData.allergies.map(a => ({ ...a, dog_id: dogId }))
      );
    }

    // 10. Actualizar peso del perro si está disponible
    if (extractedData.weight) {
      await supabase.from('dogs')
        .update({ weight: extractedData.weight })
        .eq('id', dogId);
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