import { generateContent } from '../services/gemini.service.js';
import { DeadlineActionOutputSchema } from '../schemas/validation.js';

export async function runDeadlineAgent(requirements, documents, businessProfile) {
  const prompt = `You are the Deadline & Action Agent. Convert compliance requirements into specific, actionable tasks for this business.

BUSINESS PROFILE:
${JSON.stringify(businessProfile, null, 2)}

COMPLIANCE REQUIREMENTS:
${JSON.stringify(requirements, null, 2)}

EXISTING DOCUMENTS:
${JSON.stringify(documents?.map(d => ({ type: d.document_type, name: d.file_name, expiry: d.expiry_date })) || [], null, 2)}

RULES:
1. Create specific actionable tasks for each applicable requirement
2. Only set due_date if there is a verified deadline from the requirements
3. If no specific deadline exists, set due_date to null
4. Prioritize based on urgency and legal importance
5. Consider what documents are already available vs missing
6. Make descriptions clear and actionable for a business owner
7. Do NOT invent arbitrary deadlines

Return ONLY valid JSON:
{
  "actions": [
    {
      "title": "string - clear action title",
      "description": "string - step-by-step description of what to do",
      "priority": "Low | Medium | High | Critical",
      "due_date": "YYYY-MM-DD or null",
      "status": "Pending",
      "related_requirement": "string - requirement name"
    }
  ]
}`;

  const result = await generateContent(prompt, { jsonMode: true, temperature: 0.3 });

  try {
    return DeadlineActionOutputSchema.parse(result);
  } catch (e) {
    console.error('Deadline action validation failed:', e.message);
    return {
      actions: (result?.actions || []).map(a => ({
        title: a.title || 'Review requirement',
        description: a.description || '',
        priority: a.priority || 'Medium',
        due_date: a.due_date || null,
        status: 'Pending',
        related_requirement: a.related_requirement || '',
      })),
    };
  }
}
