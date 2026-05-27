const getTrackingPrompt = (dog, records, today) => `Eres un asistente veterinario experto en seguimiento preventivo de salud canina.

FECHA DE HOY: ${today}

DATOS DEL PACIENTE:
- Nombre: ${dog.name}
- Raza: ${dog.breed || 'No especificada'}
- Fecha de nacimiento: ${dog.birth_date || 'No especificada'}
- Peso actual: ${dog.weight ? dog.weight + ' kg' : 'No registrado'}

HISTORIAL:
${JSON.stringify(records, null, 2)}

Analiza los datos y devuelve ÚNICAMENTE un JSON con esta estructura, sin explicaciones adicionales:

{
  "recommendations": [
    {
      "priority": "urgente|media|baja",
      "category": "vacuna|tratamiento|visita|peso|general",
      "title": "título corto de la recomendación",
      "description": "explicación detallada para el dueño",
      "due_date": "fecha límite si aplica (YYYY-MM-DD) o null"
    }
  ],
  "overall_status": "bueno|atención|urgente",
  "summary": "resumen breve del estado general en 1-2 frases"
}

Considera:
- Vacunas con next_date <= 30 días desde hoy: prioridad urgente
- Vacunas con next_date entre 31-60 días: prioridad media
- Tratamientos con next_date vencido o próximo
- Si no hay visita veterinaria en los últimos 12 meses: prioridad media
- Si no hay visita en los últimos 6 meses con historial de enfermedades: prioridad urgente
- Peso no registrado o sin actualizar en 6 meses: prioridad baja`;

const trackWithAnthropic = async (prompt, apiKey) => {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const anthropic = new Anthropic({ apiKey });
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }]
  });
  return JSON.parse(response.content[0].text);
};

const trackWithOpenAI = async (prompt, apiKey) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await response.json();
  const text = data.choices[0].message.content.replace(/```json|```/g, '').trim();
  return JSON.parse(text);
};

const trackWithGemini = async (prompt, apiKey) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    }
  );
  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
  return JSON.parse(text);
};

export const getProactiveRecommendations = async (dog, records, provider, apiKey) => {
  const today = new Date().toISOString().split('T')[0];
  const prompt = getTrackingPrompt(dog, records, today);

  switch (provider) {
    case 'anthropic': return trackWithAnthropic(prompt, apiKey);
    case 'openai': return trackWithOpenAI(prompt, apiKey);
    case 'gemini': return trackWithGemini(prompt, apiKey);
    default: throw new Error('Invalid AI provider');
  }
};