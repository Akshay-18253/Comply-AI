import { generateContent } from '../services/gemini.service.js';
import { BusinessProfilingOutputSchema } from '../schemas/validation.js';

export async function runProfilingAgent(business) {
  const prompt = `Analyze the following Indian business and create a structured business profile for compliance analysis.

Business Information:
${JSON.stringify(business, null, 2)}

Create a business profile that identifies:
1. A concise business summary
2. The normalized business type
3. The specific industry
4. Jurisdiction details (state, city, district)
5. Key characteristics relevant to compliance (e.g., "employs_workers", "handles_food", "physical_establishment", "gst_registered", "imports_goods")
6. Applicable compliance domains (e.g., "Tax", "Labour & Employment", "Food & Restaurant", "Business Registration", "Environment", "Local Business Requirements")
7. Any missing information that would improve compliance analysis
8. Confidence level (0-1) in the profile completeness

Return ONLY valid JSON matching this exact schema:
{
  "business_summary": "string",
  "business_type": "string",
  "industry": "string",
  "jurisdiction": { "state": "string", "city": "string|null", "district": "string|null" },
  "characteristics": ["string"],
  "compliance_domains": ["string"],
  "missing_information": ["string"],
  "confidence": 0.0
}`;

  const result = await generateContent(prompt, { jsonMode: true, temperature: 0.2 });
  
  try {
    return BusinessProfilingOutputSchema.parse(result);
  } catch (e) {
    console.error('Profiling validation failed:', e.message);
    return {
      business_summary: `${business.business_name} - ${business.industry} business in ${business.state}`,
      business_type: business.business_type,
      industry: business.industry,
      jurisdiction: { state: business.state, city: business.city, district: business.district },
      characteristics: buildCharacteristics(business),
      compliance_domains: inferDomains(business),
      missing_information: [],
      confidence: 0.6,
    };
  }
}

function buildCharacteristics(b) {
  const chars = [];
  if (b.employee_count > 0) chars.push('employs_workers');
  if (b.handles_food) chars.push('handles_food');
  if (b.physical_location) chars.push('physical_establishment');
  if (b.gst_registered) chars.push('gst_registered');
  if (b.import_export) chars.push('import_export');
  if (b.online_business) chars.push('online_business');
  if (b.uses_machinery) chars.push('uses_machinery');
  if (b.uses_hazardous_materials) chars.push('uses_hazardous_materials');
  if (b.generates_waste) chars.push('generates_waste');
  if (b.handles_personal_data) chars.push('handles_personal_data');
  if (b.uses_contract_workers) chars.push('uses_contract_workers');
  return chars;
}

function inferDomains(b) {
  const domains = ['Business Registration', 'Tax'];
  if (b.employee_count > 0) domains.push('Labour & Employment');
  if (b.handles_food) domains.push('Food & Restaurant');
  if (b.physical_location) domains.push('Shops & Establishments', 'Local Business Requirements');
  if (b.uses_machinery || b.generates_waste) domains.push('Environment');
  if (b.import_export) domains.push('Import & Export');
  if (b.handles_personal_data) domains.push('Data & Digital Business');
  return [...new Set(domains)];
}
