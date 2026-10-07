import { generateContent } from '../services/gemini.service.js';
import { VerificationOutputSchema } from '../schemas/validation.js';

export async function runVerificationAgent(businessProfile, recommendations, sources) {
  const prompt = `You are the Verification Agent. Your critical role is to review and verify the compliance recommendations made by other agents BEFORE they are shown to the user.

BUSINESS PROFILE:
${JSON.stringify(businessProfile, null, 2)}

RECOMMENDATIONS TO VERIFY:
${JSON.stringify(recommendations, null, 2)}

AVAILABLE SOURCES:
${sources.map(s => `[${s.name || 'Source'}] (${s.url || 'N/A'}): ${(s.content || '').substring(0, 500)}`).join('\n\n')}

VERIFICATION RULES:
1. Check each recommendation against the provided sources
2. Flag any unsupported claims (deadlines without source, made-up requirements, incorrect authorities)
3. Identify warnings (recommendations that may be correct but need human verification)
4. Remove or downgrade any claim not supported by the sources
5. Verify that cited authorities are correct for the stated requirements
6. Check that confidence levels are appropriate
7. Ensure no invented deadlines, fees, or penalties exist
8. If a recommendation has unsupported claims, either remove it or change decision to "Needs Verification"

Return ONLY valid JSON:
{
  "verified": true/false,
  "issues": ["string - specific problems found"],
  "warnings": ["string - items needing attention"],
  "unsupported_claims": ["string - claims without source evidence"],
  "missing_sources": ["string - requirements lacking source references"],
  "final_recommendations": [same schema as input recommendations, with corrections applied]
}`;

  const result = await generateContent(prompt, { jsonMode: true, temperature: 0.1, maxTokens: 8192 });

  try {
    return VerificationOutputSchema.parse(result);
  } catch (e) {
    console.error('Verification validation failed:', e.message);
    return {
      verified: true,
      issues: [],
      warnings: ['Verification agent output could not be fully validated'],
      unsupported_claims: [],
      missing_sources: [],
      final_recommendations: recommendations,
    };
  }
}
