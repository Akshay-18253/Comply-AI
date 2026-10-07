import { generateContent } from '../services/gemini.service.js';
import { ComplianceDiscoveryOutputSchema } from '../schemas/validation.js';

export async function runDiscoveryAgent(businessProfile, knowledgeContext) {
  const prompt = `You are the Compliance Discovery Agent. Analyze this Indian business profile and the regulatory knowledge provided to identify ALL potentially applicable compliance requirements.

BUSINESS PROFILE:
${JSON.stringify(businessProfile, null, 2)}

REGULATORY KNOWLEDGE:
${knowledgeContext.map(k => `[Source: ${k.source?.name || 'Unknown'}]\n${k.content}`).join('\n\n---\n\n')}

IMPORTANT RULES:
- Only identify requirements supported by the provided regulatory knowledge
- Consider business type, industry, state, turnover, employee count, and operational characteristics
- Mark applicability as "Applicable" only when there is strong evidence
- Mark as "Potentially Applicable" when the requirement likely applies but needs verification
- Mark as "Not Enough Information" when you cannot determine applicability
- Never invent compliance requirements not present in the knowledge base
- Include the authority responsible for each requirement
- List all required documents
- Include source references

Return ONLY valid JSON:
{
  "requirements": [
    {
      "name": "string",
      "category": "string",
      "applicability": "Applicable | Potentially Applicable | Not Enough Information",
      "reason": "string explaining why this applies to this specific business",
      "authority": "string",
      "frequency": "string",
      "documents": ["string"],
      "source_ids": ["string"],
      "confidence": 0.0,
      "verification_required": true
    }
  ]
}`;

  const result = await generateContent(prompt, { jsonMode: true, temperature: 0.2, maxTokens: 8192 });

  try {
    return ComplianceDiscoveryOutputSchema.parse(result);
  } catch (e) {
    console.error('Discovery validation failed:', e.message);
    if (result && result.requirements && Array.isArray(result.requirements)) {
      return {
        requirements: result.requirements.map(r => ({
          name: r.name || 'Unknown Requirement',
          category: r.category || 'General',
          applicability: r.applicability || 'Needs Verification',
          reason: r.reason || 'Could not determine reason',
          authority: r.authority || 'Unknown',
          frequency: r.frequency || 'Unknown',
          documents: r.documents || [],
          source_ids: r.source_ids || [],
          confidence: typeof r.confidence === 'number' ? r.confidence : 0.5,
          verification_required: r.verification_required !== false,
        })),
      };
    }
    return { requirements: [] };
  }
}
