import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const BusinessSchema = z.object({
  business_name: z.string().min(1, 'Business name required'),
  owner_name: z.string().optional(),
  business_type: z.enum([
    'Sole Proprietorship', 'Partnership', 'LLP', 'Private Limited',
    'Public Limited', 'One Person Company', 'Trust', 'Society',
    'Section 8 Company', 'HUF', 'Other'
  ]),
  industry: z.string().min(1, 'Industry required'),
  description: z.string().optional(),
  state: z.string().min(1, 'State required'),
  city: z.string().optional(),
  district: z.string().optional(),
  pincode: z.string().optional(),
  annual_turnover: z.number().min(0).optional().nullable(),
  employee_count: z.number().int().min(0).optional(),
  business_start_date: z.string().optional().nullable(),
  gst_registered: z.boolean().optional(),
  import_export: z.boolean().optional(),
  online_business: z.boolean().optional(),
  physical_location: z.boolean().optional(),
  handles_food: z.boolean().optional(),
  handles_personal_data: z.boolean().optional(),
  uses_machinery: z.boolean().optional(),
  uses_hazardous_materials: z.boolean().optional(),
  generates_waste: z.boolean().optional(),
  uses_contract_workers: z.boolean().optional(),
  registration_status: z.string().optional(),
  number_of_locations: z.number().int().optional(),
});

export const ComplianceUpdateSchema = z.object({
  status: z.enum([
    'Not Started', 'In Progress', 'Documents Pending', 'Ready to File',
    'Completed', 'Not Applicable', 'Needs Verification', 'Overdue'
  ]).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  due_date: z.string().nullable().optional(),
  renewal_date: z.string().nullable().optional(),
  next_action: z.string().optional(),
});

export const ActionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  due_date: z.string().nullable().optional(),
  business_compliance_id: z.string().uuid().optional().nullable(),
});

export const ActionUpdateSchema = z.object({
  status: z.enum(['Pending', 'In Progress', 'Completed', 'Skipped']).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  due_date: z.string().nullable().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
});

export const AssistantChatSchema = z.object({
  message: z.string().min(1, 'Message required').max(2000, 'Message too long'),
});

export const BusinessProfilingOutputSchema = z.object({
  business_summary: z.string(),
  business_type: z.string(),
  industry: z.string(),
  jurisdiction: z.object({
    state: z.string(),
    city: z.string().optional().nullable(),
    district: z.string().optional().nullable(),
  }),
  characteristics: z.array(z.string()),
  compliance_domains: z.array(z.string()),
  missing_information: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

export const ComplianceDiscoveryItemSchema = z.object({
  name: z.string(),
  category: z.string(),
  applicability: z.enum(['Applicable', 'Potentially Applicable', 'Not Enough Information']),
  reason: z.string(),
  authority: z.string(),
  frequency: z.string(),
  documents: z.array(z.string()),
  source_ids: z.array(z.string()).optional().default([]),
  confidence: z.number().min(0).max(1),
  verification_required: z.boolean(),
});

export const ComplianceDiscoveryOutputSchema = z.object({
  requirements: z.array(ComplianceDiscoveryItemSchema),
});

export const ComplianceRecommendationSchema = z.object({
  requirement_name: z.string(),
  decision: z.enum(['Applicable', 'Potentially Applicable', 'Not Applicable', 'Needs Verification']),
  reason: z.string(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  next_action: z.string(),
  required_documents: z.array(z.string()),
  deadline: z.string().nullable(),
  source_ids: z.array(z.string()).optional().default([]),
  confidence: z.number().min(0).max(1),
});

export const ComplianceReasoningOutputSchema = z.object({
  recommendations: z.array(ComplianceRecommendationSchema),
});

export const DocumentAnalysisOutputSchema = z.object({
  document_type: z.string(),
  issuing_authority: z.string().nullable(),
  extracted_fields: z.record(z.string(), z.any()).default({}),
  issue_date: z.string().nullable(),
  expiry_date: z.string().nullable(),
  related_requirements: z.array(z.string()),
  potential_issues: z.array(z.string()),
  missing_information: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  requires_human_review: z.boolean(),
});

export const DeadlineActionItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  due_date: z.string().nullable(),
  status: z.literal('Pending'),
  related_requirement: z.string(),
});

export const DeadlineActionOutputSchema = z.object({
  actions: z.array(DeadlineActionItemSchema),
});

export const VerificationOutputSchema = z.object({
  verified: z.boolean(),
  issues: z.array(z.string()),
  warnings: z.array(z.string()),
  unsupported_claims: z.array(z.string()),
  missing_sources: z.array(z.string()),
  final_recommendations: z.array(ComplianceRecommendationSchema),
});

export const AssistantResponseSchema = z.object({
  answer: z.string(),
  citations: z.array(z.object({
    source_id: z.string(),
    title: z.string(),
    url: z.string(),
  })).default([]),
  recommended_actions: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
  requires_verification: z.boolean(),
});

export const MonitoringOutputSchema = z.object({
  change_detected: z.boolean(),
  summary: z.string(),
  affected_categories: z.array(z.string()),
  potentially_affected_requirements: z.array(z.string()),
  impact: z.enum(['Low', 'Medium', 'High', 'Critical']),
  recommended_action: z.string(),
  requires_human_review: z.boolean(),
});
