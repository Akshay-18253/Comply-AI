import { generateContent } from '../services/gemini.service.js';
import { MonitoringOutputSchema } from '../schemas/validation.js';

export async function runMonitoringAgent(source, previousContent, newContent) {
  const prompt = `You are the Regulation Monitoring Agent. Compare the previous and new versions of content from an official regulatory source to detect meaningful changes.

SOURCE: ${source.name} (${source.url})
AUTHORITY: ${source.authority}

PREVIOUS CONTENT:
${(previousContent || '').substring(0, 3000)}

NEW CONTENT:
${(newContent || '').substring(0, 3000)}

RULES:
1. Identify if a meaningful regulatory change has occurred
2. Ignore formatting changes, minor wording updates
3. Focus on: new requirements, changed deadlines, new thresholds, new forms, changed authorities, new exemptions
4. Determine affected compliance categories
5. Assess impact level
6. Always set requires_human_review to true

Return ONLY valid JSON:
{
  "change_detected": true/false,
  "summary": "string",
  "affected_categories": ["string"],
  "potentially_affected_requirements": ["string"],
  "impact": "Low | Medium | High | Critical",
  "recommended_action": "string",
  "requires_human_review": true
}`;

  const result = await generateContent(prompt, { jsonMode: true, temperature: 0.1 });

  try {
    return MonitoringOutputSchema.parse(result);
  } catch {
    return {
      change_detected: false,
      summary: 'Unable to analyze changes',
      affected_categories: [],
      potentially_affected_requirements: [],
      impact: 'Low',
      recommended_action: 'Manual review recommended',
      requires_human_review: true,
    };
  }
}
