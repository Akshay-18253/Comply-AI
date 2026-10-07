import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { supabaseAdmin } from '../config/supabase.js';
import { generateContent } from '../services/gemini.service.js';
import { retrieveRelevantKnowledge } from '../services/rag.service.js';
import { AssistantChatSchema, AssistantResponseSchema } from '../schemas/validation.js';

const router = Router();

router.post('/chat', authMiddleware, async (req, res, next) => {
  try {
    const { message } = AssistantChatSchema.parse(req.body);

    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .eq('owner_id', req.user.id)
      .single();

    const { data: compliance } = await supabaseAdmin
      .from('business_compliance')
      .select('*, compliance_requirements(*)')
      .eq('business_id', business?.id);

    const { data: documents } = await supabaseAdmin
      .from('documents')
      .select('id, file_name, document_type, expiry_date, verification_status')
      .eq('business_id', business?.id);

    const { data: actions } = await supabaseAdmin
      .from('actions')
      .select('*')
      .eq('business_id', business?.id)
      .eq('status', 'Pending')
      .order('priority')
      .limit(10);

    const knowledge = await retrieveRelevantKnowledge(message, 5);

    const prompt = `The user asks: "${message}"

USER'S BUSINESS CONTEXT:
${business ? JSON.stringify({
  name: business.business_name,
  type: business.business_type,
  industry: business.industry,
  state: business.state,
  city: business.city,
  employees: business.employee_count,
  gst_registered: business.gst_registered,
  handles_food: business.handles_food,
  physical_location: business.physical_location,
}, null, 2) : 'No business profile created yet.'}

COMPLIANCE STATUS:
${(compliance || []).map(c => `- ${c.compliance_requirements?.name}: ${c.status} (Priority: ${c.priority}${c.due_date ? `, Due: ${c.due_date}` : ''})`).join('\n') || 'No compliance items yet.'}

DOCUMENTS:
${(documents || []).map(d => `- ${d.file_name} (${d.document_type || 'Unanalyzed'}${d.expiry_date ? `, Expires: ${d.expiry_date}` : ''})`).join('\n') || 'No documents uploaded.'}

PENDING ACTIONS:
${(actions || []).map(a => `- ${a.title} (${a.priority}${a.due_date ? `, Due: ${a.due_date}` : ''})`).join('\n') || 'No pending actions.'}

RELEVANT REGULATORY KNOWLEDGE:
${knowledge.map(k => `[${k.source?.name || 'Source'}]: ${k.content}`).join('\n\n') || 'No specific knowledge found.'}

RESPONSE RULES:
1. Answer specifically using the user's actual business data
2. Be practical and actionable
3. Reference specific compliance items by name
4. If information is uncertain, say so
5. Never make up deadlines or legal requirements
6. Suggest next steps
7. Include source references where available

Return ONLY valid JSON:
{
  "answer": "Your detailed, helpful response in simple language",
  "citations": [{"source_id": "string", "title": "string", "url": "string"}],
  "recommended_actions": ["Specific action items"],
  "confidence": 0.0,
  "requires_verification": false
}`;

    const result = await generateContent(prompt, { jsonMode: true, temperature: 0.4 });

    let validated;
    try {
      validated = AssistantResponseSchema.parse(result);
    } catch {
      validated = {
        answer: result?.answer || (typeof result === 'string' ? result : 'I apologize, I was unable to process your question. Please try again.'),
        citations: result?.citations || [],
        recommended_actions: result?.recommended_actions || [],
        confidence: result?.confidence || 0.5,
        requires_verification: true,
      };
    }

    res.json(validated);
  } catch (err) { next(err); }
});

export default router;
