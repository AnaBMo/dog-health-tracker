const getSystemPrompt = (dog, records) => `Eres un asistente veterinario amigable y experto, respondiendo preguntas sobre la salud de ${dog.name}.

DATOS DEL PACIENTE:
- Nombre: ${dog.name}
- Raza: ${dog.breed || 'No especificada'}
- Fecha de nacimiento: ${dog.birth_date || 'No especificada'}
- Peso actual: ${dog.weight ? dog.weight + ' kg' : 'No registrado'}
- Notas: ${dog.notes || 'Ninguna'}

HISTORIAL CLÍNICO COMPLETO:
${JSON.stringify(records, null, 2)}

INSTRUCCIONES:
- Responde siempre en español
- Usa lenguaje claro y comprensible para el dueño del perro
- Basa tus respuestas ÚNICAMENTE en los datos proporcionados
- Si te preguntan algo que no está en los datos, indícalo claramente
- Sé conciso pero completo
- Fecha de hoy: ${new Date().toISOString().split('T')[0]}`;

const chatWithAnthropic = async (systemPrompt, history, userMessage, apiKey) => {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const anthropic = new Anthropic({ apiKey });

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: systemPrompt,
    messages: [
      ...history,
      { role: 'user', content: userMessage }
    ]
  });

  return response.content[0].text;
};

const chatWithOpenAI = async (systemPrompt, history, userMessage, apiKey) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 1000,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userMessage }
      ]
    })
  });
  const data = await response.json();
  return data.choices[0].message.content;
};

const chatWithGemini = async (systemPrompt, history, userMessage, apiKey) => {
  // Gemini usa formato diferente para el historial
  const contents = [
    { role: 'user', parts: [{ text: systemPrompt + '\n\nEntendido. Estoy listo para responder preguntas sobre este paciente.' }] },
    { role: 'model', parts: [{ text: 'Entendido. Estoy listo para responder preguntas sobre este paciente.' }] },
    ...history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    })),
    { role: 'user', parts: [{ text: userMessage }] }
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    }
  );
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

export const conversationalChat = async (dog, records, history, userMessage, provider, apiKey) => {
  const systemPrompt = getSystemPrompt(dog, records);

  switch (provider) {
    case 'anthropic': return chatWithAnthropic(systemPrompt, history, userMessage, apiKey);
    case 'openai': return chatWithOpenAI(systemPrompt, history, userMessage, apiKey);
    case 'gemini': return chatWithGemini(systemPrompt, history, userMessage, apiKey);
    default: throw new Error('Invalid AI provider');
  }
};