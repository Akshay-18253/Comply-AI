import { generateContent } from '../services/gemini.service.js';
import { ComplianceReasoningOutputSchema } from '../schemas/validation.js';

export async function runReasoningAgent(businessProfile, candidateRequirements, retrievedSources) {
  const prompt = `You are the Compliance Reasoning Agent. Your job is to carefully reason over each candidate compliance requirement and determine its applicability to this specific business.

BUSINESS PROFILE:
${JSON.stringify(businessProfile, null, 2)}

CANDIDATE REQUIREMENTS:
${JSON.stringify(candidateRequirements, null, 2)}

REGULATORY SOURCES:
${retrievedSources.map(s => `[${s.source?.name || s.name || 'Source'}]: ${s.content || s.description || ''}`).join('\n\n')}

REASONING RULES:
1. For each requirement, reason about whether it truly applies to THIS business
2. Consider: business type, registration status, industry, state, turnover, employees, operational characteristics
3. Assign a decision: "Applicable", "Potentially Applicable", "Not Applicable", or "Needs Verification"
4. Never infer a deadline from general assumptions - only include specific deadlines if clearly stated in sources
5. Provide a clear next_action for each requirement
6. Assign priority: Critical (legal/statutory deadline-driven), High (important for operations), Medium (recommended), Low (optional/beneficial)
7. Be conservative - when in doubt, use "Potentially Applicable" or "Needs Verification"

Return ONLY valid JSON:
{
  "recommendations": [
    {
      "requirement_name": "string",
      "decision": "Applicable | Potentially Applicable | Not Applicable | Needs Verification",
      "reason": "Detailed explanation of why this applies or doesn't apply to this specific business",
      "priority": "Low | Medium | High | Critical",
      "next_action": "Specific actionable next step",
      "required_documents": ["string"],
      "deadline": "string or null",
      "source_ids": ["string"],
      "confidence": 0.0
    }
  ]
}`;

  const result = await generateContent(prompt, { jsonMode: true, temperature: 0.2, maxTokens: 8192 });

  try {
    return ComplianceReasoningOutputSchema.parse(result);
  } catch (e) {
    console.error('Reasoning validation failed:', e.message);
    if (result && result.recommendations) {
      return {
        recommendations: result.recommendations.map(r => ({
          requirement_name: r.requirement_name || 'Unknown',
          decision: r.decision || 'Needs Verification',
          reason: r.reason || '',
          priority: r.priority || 'Medium',
          next_action: r.next_action || 'Verify with a compliance professional',
          required_documents: r.required_documents || [],
          deadline: r.deadline || null,
          source_ids: r.source_ids || [],
          confidence: typeof r.confidence === 'number' ? r.confidence : 0.5,
        })),
      };
    }
    return { recommendations: [] };
  }
}
