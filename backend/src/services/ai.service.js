import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

import Anthropic from '@anthropic-ai/sdk';

const getExtractionPrompt = (dogName) => `Eres un asistente veterinario experto.
El informe que vas a analizar pertenece al paciente: ${dogName}.
Si el informe menciona un nombre de paciente diferente, indícalo en el campo "notes" con un aviso.

Analiza este informe veterinario y extrae la siguiente información en formato JSON:

{
  "visit_date": "fecha de la visita (YYYY-MM-DD)",
  "reason": "motivo de la consulta",
  "diagnosis": "diagnóstico",
  "notes": "notas adicionales",
  "weight": "peso del animal en kg (número)",
  "vaccines": [
    { "name": "nombre de la vacuna", "date": "fecha (YYYY-MM-DD)", "next_date": "próxima dosis (YYYY-MM-DD)" }
  ],
  "treatments": [
    { "type": "tipo de tratamiento", "name": "nombre", "date": "fecha (YYYY-MM-DD)", "next_date": "próxima aplicación (YYYY-MM-DD)", "notes": "notas" }
  ],
  "allergies": [
    { "name": "nombre de la alergia", "severity": "leve/moderada/alta", "notes": "notas" }
  ]
}

Si algún campo no aparece en el informe, usa null. Responde ÚNICAMENTE con el JSON, sin explicaciones adicionales.`;

const extractWithAnthropic = async (content, isImage, mimeType, apiKey, prompt) => {
  const anthropic = new Anthropic({ apiKey });

  const messages = isImage
    ? [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: mimeType, data: content } }, { type: 'text', text: prompt }] }]
    : [{ role: 'user', content: `${prompt}\n\nINFORME:\n${content}` }];

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages
  });

  return JSON.parse(response.content[0].text);
};

const extractWithOpenAI = async (content, isImage, mimeType, apiKey, prompt) => {
  const body = {
    model: 'gpt-4o',
    max_tokens: 1000,
    messages: isImage
      ? [{ role: 'user', content: [{ type: 'image_url', image_url: { url: `data:${mimeType};base64,${content}` } }, { type: 'text', text: prompt }] }]
      : [{ role: 'user', content: `${prompt}\n\nINFORME:\n${content}` }]
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
};

const extractWithGemini = async (content, isImage, mimeType, apiKey, prompt) => {
  const parts = isImage
    ? [{ inline_data: { mime_type: mimeType, data: content } }, { text: prompt }]
    : [{ text: `${prompt}\n\nINFORME:\n${content}` }];

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts }] })
  });

  const data = await response.json();
  return JSON.parse(data.candidates[0].content.parts[0].text);
};

export const extractDataFromFile = async (fileBuffer, mimeType, provider, apiKey, dogName) => {
  const isPDF = mimeType === 'application/pdf';
  const EXTRACTION_PROMPT = getExtractionPrompt(dogName);
  let content;

  if (isPDF) {
    const pdfData = await pdfParse(fileBuffer);
    content = pdfData.text;
  } else {
    content = fileBuffer.toString('base64');
  }

  switch (provider) {
    case 'anthropic':
      return extractWithAnthropic(content, !isPDF, mimeType, apiKey, EXTRACTION_PROMPT);
    case 'openai':
      return extractWithOpenAI(content, !isPDF, mimeType, apiKey, EXTRACTION_PROMPT);
    case 'gemini':
      return extractWithGemini(content, !isPDF, mimeType, apiKey, EXTRACTION_PROMPT);
    default:
      throw new Error('Invalid AI provider');
  }
};