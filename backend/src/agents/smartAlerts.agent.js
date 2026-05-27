const getAlertsPrompt = (dog, records, today) => `Eres un sistema de alertas veterinarias. Analiza los datos y genera alertas accionables.

FECHA DE HOY: ${today}

DATOS DEL PACIENTE:
- Nombre: ${dog.name}
- Raza: ${dog.breed || 'No especificada'}
- Fecha de nacimiento: ${dog.birth_date || 'No especificada'}
- Peso actual: ${dog.weight ? dog.weight + ' kg' : 'No registrado'}

HISTORIAL:
${JSON.stringify(records, null, 2)}

Devuelve ÚNICAMENTE un JSON con esta estructura, sin explicaciones adicionales:

{
  "alerts": [
    {
      "id": "identificador único descriptivo, ej: vaccine_rabies_expired",
      "level": "roja|amarilla|verde",
      "category": "vacuna|tratamiento|visita|peso|alergia|general",
      "title": "título corto",
      "message": "mensaje claro para el dueño explicando qué hacer",
      "due_date": "fecha relevante (YYYY-MM-DD) o null",
      "days_until": número de días hasta la fecha (negativo si ya pasó) o null
    }
  ],
  "has_urgent": true o false,
  "total_alerts": número total de alertas
}

REGLAS para niveles:
- ROJA: vacuna vencida, tratamiento vencido, sin visita veterinaria en más de 12 meses
- AMARILLA: vacuna vence en menos de 30 días, tratamiento vence en menos de 15 días, sin visita en 6-12 meses
- VERDE: recordatorios generales, peso no actualizado, próximas citas en más de 30 días

Si todo está en orden y no hay alertas, devuelve "alerts": [] igualmente.`;

const alertsWithAnthropic = async (prompt, apiKey) => {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const anthropic = new Anthropic({ apiKey });
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }]
  });
  return JSON.parse(response.content[0].text);
};

const alertsWithOpenAI = async (prompt, apiKey) => {
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

const alertsWithGemini = async (prompt, apiKey) => {
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

export const generateSmartAlerts = async (dog, records, provider, apiKey) => {
  const today = new Date().toISOString().split('T')[0];
  const prompt = getAlertsPrompt(dog, records, today);

  switch (provider) {
    case 'anthropic': return alertsWithAnthropic(prompt, apiKey);
    case 'openai': return alertsWithOpenAI(prompt, apiKey);
    case 'gemini': return alertsWithGemini(prompt, apiKey);
    default: throw new Error('Invalid AI provider');
  }
};