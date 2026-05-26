import Anthropic from '@anthropic-ai/sdk';

const getAnalysisPrompt = (dog, records) => `Eres un asistente veterinario experto analizando el historial de salud de un perro.

DATOS DEL PACIENTE:
- Nombre: ${dog.name}
- Raza: ${dog.breed || 'No especificada'}
- Fecha de nacimiento: ${dog.birth_date || 'No especificada'}
- Peso actual: ${dog.weight ? dog.weight + ' kg' : 'No registrado'}
- Notas: ${dog.notes || 'Ninguna'}

HISTORIAL CLÍNICO:
${JSON.stringify(records, null, 2)}

Genera un informe de salud completo en español con estas secciones:
1. RESUMEN GENERAL: estado de salud general del animal
2. HISTORIAL DE VISITAS: análisis de las consultas veterinarias
3. VACUNACIÓN: estado actual y observaciones
4. TRATAMIENTOS: tratamientos realizados y en curso
5. ALERGIAS: alergias conocidas y recomendaciones
6. RECOMENDACIONES: acciones sugeridas basadas en el historial

Sé claro, conciso y usa lenguaje comprensible para el dueño del perro.`;

const analyzeWithAnthropic = async (prompt, apiKey) => {
  const anthropic = new Anthropic({ apiKey });
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }]
  });
  return response.content[0].text;
};

const analyzeWithOpenAI = async (prompt, apiKey) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await response.json();
  return data.choices[0].message.content;
};

const analyzeWithGemini = async (prompt, apiKey) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    }
  );
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

export const analyzeHealthReport = async (dog, records, provider, apiKey) => {
  const prompt = getAnalysisPrompt(dog, records);

  switch (provider) {
    case 'anthropic':
      return analyzeWithAnthropic(prompt, apiKey);
    case 'openai':
      return analyzeWithOpenAI(prompt, apiKey);
    case 'gemini':
      return analyzeWithGemini(prompt, apiKey);
    default:
      throw new Error('Invalid AI provider');
  }
};