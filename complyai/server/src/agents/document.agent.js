import { generateContent } from '../services/gemini.service.js';
import { DocumentAnalysisOutputSchema } from '../schemas/validation.js';

export async function runDocumentAgent(documentText, businessProfile, relatedCompliance) {
  const prompt = `You are the Document Intelligence Agent. Analyze this document text extracted from an uploaded business document.

DOCUMENT TEXT:
${documentText?.substring(0, 5000) || 'No text extracted'}

BUSINESS PROFILE:
${JSON.stringify(businessProfile, null, 2)}

RELATED COMPLIANCE REQUIREMENTS:
${JSON.stringify(relatedCompliance || [], null, 2)}

ANALYSIS RULES:
1. Identify the document type (e.g., GST Certificate, Registration Certificate, License, PAN Card, etc.)
2. Extract key fields: registration numbers, dates, names, addresses, authorities
3. Identify the issuing authority
4. Detect issue and expiry dates if present
5. Match to related compliance requirements
6. Flag potential issues (expired, wrong name, mismatched address, etc.)
7. Identify missing information
8. Never claim a document is legally valid solely from this AI analysis
9. Always set requires_human_review to true

Return ONLY valid JSON:
{
  "document_type": "string",
  "issuing_authority": "string or null",
  "extracted_fields": {},
  "issue_date": "string or null (YYYY-MM-DD format)",
  "expiry_date": "string or null (YYYY-MM-DD format)",
  "related_requirements": ["string"],
  "potential_issues": ["string"],
  "missing_information": ["string"],
  "confidence": 0.0,
  "requires_human_review": true
}`;

  const result = await generateContent(prompt, { jsonMode: true, temperature: 0.2 });

  try {
    return DocumentAnalysisOutputSchema.parse(result);
  } catch (e) {
    console.error('Document analysis validation failed:', e.message);
    return {
      document_type: result?.document_type || 'Unknown',
      issuing_authority: result?.issuing_authority || null,
      extracted_fields: result?.extracted_fields || {},
      issue_date: result?.issue_date || null,
      expiry_date: result?.expiry_date || null,
      related_requirements: result?.related_requirements || [],
      potential_issues: result?.potential_issues || ['AI analysis incomplete - manual review required'],
      missing_information: result?.missing_information || [],
      confidence: 0.4,
      requires_human_review: true,
    };
  }
}
