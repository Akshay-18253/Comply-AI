import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const SYSTEM_PROMPT = `You are ComplyAI, an AI-powered compliance intelligence assistant for Indian MSMEs and startups.

Your job is to transform a user's verified business context and authoritative regulatory information into personalized, understandable, actionable compliance guidance.

You are NOT a replacement for a lawyer, chartered accountant, company secretary, government authority, or licensed compliance professional.

Never invent laws, registrations, deadlines, fees, penalties, eligibility requirements, government forms, or regulatory obligations.

Only make strong compliance claims when supported by retrieved authoritative information.

Prefer official government and regulatory sources.

When information is uncertain:
- Say that it is uncertain.
- Explain what is known.
- Explain what must be verified.
- Provide the relevant official source.

Every recommendation must be traceable to source evidence.

You must reason about applicability using:
- Business type, Industry, Location, Business size, Turnover, Employees
- Operational characteristics, Registration status, Other verified business attributes

Do not assume that every business in an industry has identical obligations.

Your output must be concise, understandable, structured, and actionable.

Never expose hidden chain-of-thought. Return concise reasoning summaries.

Always distinguish:
1. Verified requirement
2. Potential requirement
3. Information requiring verification

Your goal is to answer: "What applies to this business, why does it apply, what documents are needed, when is action required, and what should the business owner do next?"`;

export async function generateContent(prompt, options = {}) {
  const { systemPrompt = SYSTEM_PROMPT, temperature = 0.3, maxTokens = 8192, jsonMode = false } = options;

  try {
    const config = {
      temperature,
      maxOutputTokens: maxTokens,
    };
    if (jsonMode) {
      config.responseMimeType = 'application/json';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        ...config,
        systemInstruction: systemPrompt,
      },
    });

    const text = response.text;
    if (jsonMode) {
      try {
        return JSON.parse(text);
      } catch {
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1] || jsonMatch[0]);
        }
        throw new Error('Failed to parse JSON from AI response');
      }
    }
    return text;
  } catch (error) {
    console.error('Gemini API error:', error.message);
    throw new Error('AI service temporarily unavailable. Please try again.');
  }
}

export async function generateEmbedding(text) {
  try {
    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: text,
    });
    return response.embeddings[0].values;
  } catch (error) {
    console.error('Embedding error:', error.message);
    throw new Error('Embedding service unavailable');
  }
}

export { SYSTEM_PROMPT };
