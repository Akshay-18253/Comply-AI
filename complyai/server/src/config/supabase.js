import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isPlaceholder = !supabaseUrl ||
  supabaseUrl.includes('your-project.supabase.co') ||
  !supabaseServiceKey ||
  supabaseServiceKey.includes('your-supabase');

// In-Memory Database store for local development and demo mode
const inMemoryStore = {
  businesses: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      owner_id: '00000000-0000-0000-0000-000000000001',
      business_name: 'NovaTech Analytics Private Limited',
      business_type: 'Private Limited Company',
      industry: 'Information Technology / SaaS',
      state: 'Karnataka',
      city: 'Bengaluru',
      employee_count: 18,
      turnover_range: '₹1 Cr - ₹5 Cr',
      gst_registered: true,
      gstin: '29AABCN1234F1Z5',
      pan: 'AABCN1234F',
      cin: 'U72200KA2023PTC172890',
      physical_location: true,
      handles_food: false,
      incorporation_date: '2023-04-15',
      onboarding_completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ],
  sources: [
    {
      id: 'src-1',
      name: 'Ministry of Corporate Affairs (MCA)',
      authority: 'Government of India',
      domain: 'mca.gov.in',
      url: 'https://www.mca.gov.in',
      category: 'Corporate Law',
      status: 'Active',
      last_verified_at: new Date().toISOString(),
    },
    {
      id: 'src-2',
      name: 'Goods and Services Tax Network (GSTN / CBIC)',
      authority: 'Central Board of Indirect Taxes and Customs',
      domain: 'gst.gov.in',
      url: 'https://www.gst.gov.in',
      category: 'Taxation',
      status: 'Active',
      last_verified_at: new Date().toISOString(),
    },
    {
      id: 'src-3',
      name: 'Employees\' Provident Fund Organisation (EPFO)',
      authority: 'Ministry of Labour & Employment',
      domain: 'epfindia.gov.in',
      url: 'https://www.epfindia.gov.in',
      category: 'Labour & Employment',
      status: 'Active',
      last_verified_at: new Date().toISOString(),
    },
    {
      id: 'src-4',
      name: 'Employees\' State Insurance Corporation (ESIC)',
      authority: 'Ministry of Labour & Employment',
      domain: 'esic.gov.in',
      url: 'https://www.esic.gov.in',
      category: 'Labour & Employment',
      status: 'Active',
      last_verified_at: new Date().toISOString(),
    },
    {
      id: 'src-5',
      name: 'Data Protection Board of India / MeitY',
      authority: 'Ministry of Electronics & Information Technology',
      domain: 'meity.gov.in',
      url: 'https://www.meity.gov.in',
      category: 'Data Privacy',
      status: 'Active',
      last_verified_at: new Date().toISOString(),
    },
    {
      id: 'src-6',
      name: 'Karnataka Commercial Taxes Department',
      authority: 'Government of Karnataka',
      domain: 'karnatakatax.gov.in',
      url: 'https://karnatakatax.gov.in',
      category: 'State Tax',
      status: 'Active',
      last_verified_at: new Date().toISOString(),
    }
  ],
  compliance_requirements: [
    {
      id: 'req-1',
      name: 'Filing of Financial Statements (Form AOC-4)',
      category: 'Corporate & MCA',
      act_name: 'Companies Act, 2013',
      section_citation: '137',
      description: 'Every Private Limited company must file its audited financial statements (balance sheet, profit & loss, directors\' report) with the Registrar of Companies within 30 days of the Annual General Meeting.',
      penalty_description: '₹100 per day of default on the company and every officer in default, up to ₹10,00,000 for company and ₹5,00,000 for directors.',
      penalty_amount: '₹100/day + up to ₹10 Lakhs',
      imprisonment_risk: true,
      frequency: 'Annual',
      source_id: 'src-1',
    },
    {
      id: 'req-2',
      name: 'Filing of Annual Return (Form MGT-7 / MGT-7A)',
      category: 'Corporate & MCA',
      act_name: 'Companies Act, 2013',
      section_citation: '92',
      description: 'Annual return containing particulars of registered office, principal business activities, shareholding pattern, indebtedness, members, and directors must be filed within 60 days of the AGM.',
      penalty_description: '₹100 per day of continuing default plus fine on officers.',
      penalty_amount: '₹100/day + ₹50,000 - ₹5,00,000',
      imprisonment_risk: false,
      frequency: 'Annual',
      source_id: 'src-1',
    },
    {
      id: 'req-3',
      name: 'GSTR-3B Monthly Return and Tax Payment',
      category: 'Tax & GST',
      act_name: 'Central Goods and Services Tax Act, 2017',
      section_citation: '39',
      description: 'Self-declared summary return of outward and inward supplies along with payment of output tax liability after input tax credit (ITC) adjustment.',
      penalty_description: 'Late fee of ₹50/day (₹20/day for NIL returns) plus 18% annual interest on unpaid tax.',
      penalty_amount: '₹50/day + 18% p.a. interest',
      imprisonment_risk: false,
      frequency: 'Monthly',
      source_id: 'src-2',
    },
    {
      id: 'req-4',
      name: 'GSTR-1 Monthly Outward Supplies Statement',
      category: 'Tax & GST',
      act_name: 'Central Goods and Services Tax Act, 2017',
      section_citation: '37',
      description: 'Monthly statement details of all B2B and B2C sales and debit/credit notes issued during the tax period.',
      penalty_description: 'Late fee up to ₹50/day; blocks subsequent GSTR-3B filings.',
      penalty_amount: '₹50/day (max ₹10,000)',
      imprisonment_risk: false,
      frequency: 'Monthly',
      source_id: 'src-2',
    },
    {
      id: 'req-5',
      name: 'EPF Monthly Contribution & ECR Filing',
      category: 'Labour & Employment',
      act_name: 'Employees\' Provident Funds and Misc Provisions Act, 1952',
      section_citation: '6',
      description: 'Remittance of employer (12%) and employee (12%) provident fund contributions along with filing Electronic Challan cum Return (ECR) on the EPFO unified portal by the 15th of each month.',
      penalty_description: 'Damages ranging from 5% to 25% p.a. plus 12% penal interest; criminal prosecution under Section 14.',
      penalty_amount: '12% interest + up to 25% damages',
      imprisonment_risk: true,
      frequency: 'Monthly',
      source_id: 'src-3',
    },
    {
      id: 'req-6',
      name: 'Digital Personal Data Protection (DPDP) Act Consent & Notice',
      category: 'Data Protection & Privacy',
      act_name: 'Digital Personal Data Protection Act, 2023',
      section_citation: '5 & 6',
      description: 'Every data fiduciary processing digital personal data of Indian citizens must give itemized, clear notice in 22 scheduled languages with granular consent capture, withdrawal options, and grievance redressal mechanisms.',
      penalty_description: 'Monetary penalties adjudicated by the Data Protection Board up to ₹250 Crores for significant breaches.',
      penalty_amount: 'Up to ₹250 Crores',
      imprisonment_risk: false,
      frequency: 'Continuous',
      source_id: 'src-5',
    },
    {
      id: 'req-7',
      name: 'Karnataka Professional Tax Monthly Return (Form 5A)',
      category: 'State Statutory',
      act_name: 'Karnataka Tax on Professions, Trades, Callings and Employments Act, 1976',
      section_citation: '5 & 6',
      description: 'Monthly deduction from employee salaries earning above ₹15,000 (₹200/month) and remittance to the commercial tax department by the 20th of the following month.',
      penalty_description: 'Interest at 1.25% per month plus penalty up to 50% of tax amount.',
      penalty_amount: '1.25% per month + up to 50% penalty',
      imprisonment_risk: false,
      frequency: 'Monthly',
      source_id: 'src-6',
    },
    {
      id: 'req-8',
      name: 'Director KYC Filing (Form DIR-3 KYC)',
      category: 'Corporate & MCA',
      act_name: 'Companies (Appointment and Qualification of Directors) Rules, 2014',
      section_citation: '12A',
      description: 'Annual verification of DIN for all directors holding active Director Identification Numbers as of March 31.',
      penalty_description: 'Deactivation of DIN and mandatory ₹5,000 late fee per director.',
      penalty_amount: '₹5,000 per director + DIN Deactivation',
      imprisonment_risk: false,
      frequency: 'Annual',
      source_id: 'src-1',
    }
  ],
  business_compliance: [
    {
      id: 'bc-1',
      business_id: '00000000-0000-0000-0000-000000000001',
      compliance_requirement_id: 'req-1',
      status: 'In Progress',
      priority: 'Critical',
      due_date: '2026-10-30T00:00:00.000Z',
      applicability_reason: 'Mandatory for all Private Limited companies incorporated in India under Companies Act 2013 Section 137.',
      confidence_score: 0.98,
      notes: 'Auditor draft received. AGM scheduled for October 15.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'bc-2',
      business_id: '00000000-0000-0000-0000-000000000001',
      compliance_requirement_id: 'req-2',
      status: 'Not Started',
      priority: 'High',
      due_date: '2026-11-29T00:00:00.000Z',
      applicability_reason: 'Required within 60 days of AGM for NovaTech Analytics Pvt Ltd.',
      confidence_score: 0.98,
      notes: '',
      created_at: new Date().toISOString(),
    },
    {
      id: 'bc-3',
      business_id: '00000000-0000-0000-0000-000000000001',
      compliance_requirement_id: 'req-3',
      status: 'Documents Pending',
      priority: 'High',
      due_date: '2026-10-20T00:00:00.000Z',
      applicability_reason: 'Monthly return mandatory for GST registered entities with turnover above threshold.',
      confidence_score: 0.99,
      notes: 'Sales invoice ledger reconciled; awaiting bank statement.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'bc-4',
      business_id: '00000000-0000-0000-0000-000000000001',
      compliance_requirement_id: 'req-4',
      status: 'In Progress',
      priority: 'High',
      due_date: '2026-10-11T00:00:00.000Z',
      applicability_reason: 'Monthly B2B outward invoice filing due on 11th of each month.',
      confidence_score: 0.99,
      notes: 'E-way bills and B2B invoices synced.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'bc-5',
      business_id: '00000000-0000-0000-0000-000000000001',
      compliance_requirement_id: 'req-5',
      status: 'Completed',
      priority: 'Critical',
      due_date: '2026-10-15T00:00:00.000Z',
      applicability_reason: 'Headcount of 18 employees approaching mandatory threshold of 20; voluntary registration active.',
      confidence_score: 0.95,
      completed_at: '2026-10-05T09:30:00.000Z',
      notes: 'Challan paid via SBI Netbanking. ECR receipt downloaded.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'bc-6',
      business_id: '00000000-0000-0000-0000-000000000001',
      compliance_requirement_id: 'req-6',
      status: 'In Progress',
      priority: 'Critical',
      due_date: '2026-12-31T00:00:00.000Z',
      applicability_reason: 'Applicable to SaaS application processing personal data (name, email, billing details) of Indian users.',
      confidence_score: 0.94,
      notes: 'Privacy policy and consent banner drafted for v2.0 release.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'bc-7',
      business_id: '00000000-0000-0000-0000-000000000001',
      compliance_requirement_id: 'req-7',
      status: 'In Progress',
      priority: 'Medium',
      due_date: '2026-10-20T00:00:00.000Z',
      applicability_reason: 'Mandatory under Karnataka state law for Bangalore registered office.',
      confidence_score: 0.97,
      notes: '',
      created_at: new Date().toISOString(),
    },
    {
      id: 'bc-8',
      business_id: '00000000-0000-0000-0000-000000000001',
      compliance_requirement_id: 'req-8',
      status: 'Completed',
      priority: 'Medium',
      due_date: '2026-09-30T00:00:00.000Z',
      applicability_reason: 'Completed for all 2 directors for FY 2025-26.',
      confidence_score: 0.99,
      completed_at: '2026-09-28T14:15:00.000Z',
      notes: 'SRN generated: R98765432.',
      created_at: new Date().toISOString(),
    }
  ],
  documents: [
    {
      id: 'doc-1',
      business_id: '00000000-0000-0000-0000-000000000001',
      uploaded_by: '00000000-0000-0000-0000-000000000001',
      file_name: 'GST_Registration_Certificate_REG-06.pdf',
      storage_path: 'demo/gst_cert.pdf',
      mime_type: 'application/pdf',
      file_size: 428000,
      document_type: 'GST Registration Certificate',
      issue_date: '2023-05-10',
      expiry_date: null,
      verification_status: 'Verified',
      extracted_text: 'FORM GST REG-06 [See Rule 10(1)] Government of India Registration Certificate Registration Number: 29AABCN1234F1Z5 Legal Name: NovaTech Analytics Private Limited Date of Issue: 10/05/2023 Period of Validity: From 10/05/2023 To Perpetual',
      analysis: {
        document_number: '29AABCN1234F1Z5',
        issuing_authority: 'Goods and Services Tax Network, Karnataka',
        issue_date: '2023-05-10',
        expiry_date: null,
        document_type: 'GST Registration Certificate',
        confidence: 0.99,
        summary: 'Official GST REG-06 certificate confirming active GSTIN in Karnataka state jurisdiction.'
      },
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 'doc-2',
      business_id: '00000000-0000-0000-0000-000000000001',
      uploaded_by: '00000000-0000-0000-0000-000000000001',
      file_name: 'Certificate_of_Incorporation_MCA.pdf',
      storage_path: 'demo/coi.pdf',
      mime_type: 'application/pdf',
      file_size: 312000,
      document_type: 'Certificate of Incorporation',
      issue_date: '2023-04-15',
      expiry_date: null,
      verification_status: 'Verified',
      extracted_text: 'MINISTRY OF CORPORATE AFFAIRS Registrar of Companies, Bangalore Certificate of Incorporation Corporate Identity Number: U72200KA2023PTC172890',
      analysis: {
        document_number: 'U72200KA2023PTC172890',
        issuing_authority: 'Registrar of Companies, Bangalore, MCA',
        issue_date: '2023-04-15',
        expiry_date: null,
        document_type: 'Certificate of Incorporation',
        confidence: 0.98,
        summary: 'Statutory certificate confirming legal incorporation of Private Limited entity.'
      },
      created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    },
    {
      id: 'doc-3',
      business_id: '00000000-0000-0000-0000-000000000001',
      uploaded_by: '00000000-0000-0000-0000-000000000001',
      file_name: 'Commercial_Shop_Premise_License.pdf',
      storage_path: 'demo/shop_license.pdf',
      mime_type: 'application/pdf',
      file_size: 215000,
      document_type: 'Shop & Establishment License',
      issue_date: '2025-11-01',
      expiry_date: '2026-10-31',
      verification_status: 'Needs Review',
      extracted_text: 'GOVERNMENT OF KARNATAKA DEPARTMENT OF LABOUR Form C Registration Certificate of Establishment Registration No: BLR/SHP/2023/84920 Valid Until: 31-10-2026',
      analysis: {
        document_number: 'BLR/SHP/2023/84920',
        issuing_authority: 'Karnataka Department of Labour',
        issue_date: '2025-11-01',
        expiry_date: '2026-10-31',
        document_type: 'Shop & Establishment License',
        confidence: 0.96,
        summary: 'Commercial premises registration certificate expiring on October 31, 2026.'
      },
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    }
  ],
  actions: [
    {
      id: 'act-1',
      business_id: '00000000-0000-0000-0000-000000000001',
      compliance_requirement_id: 'req-4',
      title: 'File GSTR-1 Outward Supply Statement for September',
      description: 'Upload B2B invoice data and e-way bill summaries on GSTN portal before 11th deadline.',
      due_date: '2026-10-11T00:00:00.000Z',
      priority: 'High',
      status: 'Pending',
      created_at: new Date().toISOString(),
    },
    {
      id: 'act-2',
      business_id: '00000000-0000-0000-0000-000000000001',
      compliance_requirement_id: 'req-3',
      title: 'Compute Net GST Liability and File GSTR-3B',
      description: 'Verify GSTR-2B input tax credit eligible vs ineligible, compute cash ledger payments, and discharge liability.',
      due_date: '2026-10-20T00:00:00.000Z',
      priority: 'High',
      status: 'Pending',
      created_at: new Date().toISOString(),
    },
    {
      id: 'act-3',
      business_id: '00000000-0000-0000-0000-000000000001',
      compliance_requirement_id: 'req-1',
      title: 'Obtain Signed Audit Report and File AOC-4 with MCA',
      description: 'Prepare XBRL / non-XBRL balance sheet, Directors\' Report, and file with RoC Bangalore.',
      due_date: '2026-10-30T00:00:00.000Z',
      priority: 'Critical',
      status: 'Pending',
      created_at: new Date().toISOString(),
    },
    {
      id: 'act-4',
      business_id: '00000000-0000-0000-0000-000000000001',
      compliance_requirement_id: 'req-7',
      title: 'Deduct and Remit Karnataka Professional Tax for Employees',
      description: 'Deduct ₹200 from employee salaries earning >= ₹15,000 and deposit with state tax department.',
      due_date: '2026-10-20T00:00:00.000Z',
      priority: 'Medium',
      status: 'Pending',
      created_at: new Date().toISOString(),
    }
  ],
  notifications: [
    {
      id: 'notif-1',
      user_id: '00000000-0000-0000-0000-000000000001',
      business_id: '00000000-0000-0000-0000-000000000001',
      type: 'compliance_due',
      title: 'Urgent: GSTR-1 Deadline in 4 Days',
      message: 'Monthly outward supply return GSTR-1 must be filed by October 11 to avoid blocking GSTR-3B.',
      severity: 'Warning',
      read: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'notif-2',
      user_id: '00000000-0000-0000-0000-000000000001',
      business_id: '00000000-0000-0000-0000-000000000001',
      type: 'document_expiry',
      title: 'License Renewal: Shop & Establishment License',
      message: 'Your Karnataka Commercial Shop License expires on October 31, 2026 (24 days remaining).',
      severity: 'Warning',
      read: false,
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'notif-3',
      user_id: '00000000-0000-0000-0000-000000000001',
      business_id: '00000000-0000-0000-0000-000000000001',
      type: 'system',
      title: 'AI Multi-Agent Compliance Audit Complete',
      message: 'ComplyAI identified 8 statutory requirements applicable to NovaTech Analytics Pvt Ltd with 97% average confidence.',
      severity: 'Info',
      read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    }
  ],
  agent_runs: [
    {
      id: 'run-1',
      user_id: '00000000-0000-0000-0000-000000000001',
      business_id: '00000000-0000-0000-0000-000000000001',
      workflow_type: 'Full Compliance Discovery',
      status: 'Completed',
      started_at: new Date(Date.now() - 7200000).toISOString(),
      completed_at: new Date(Date.now() - 7192000).toISOString(),
    }
  ],
  agent_steps: [
    {
      id: 'step-1',
      agent_run_id: 'run-1',
      step_order: 1,
      agent_name: 'Business Profiler Agent',
      status: 'Completed',
      duration_ms: 1240,
      input_context: { entity: 'NovaTech Analytics Pvt Ltd', sector: 'SaaS' },
      output_payload: {
        entity_classification: 'Private Limited Company',
        jurisdiction: 'Karnataka, India',
        employee_tier: '10-20 Headcount (EPFO Voluntary, ESIC Threshold)',
        turnover_tier: 'Tier 2 (Regular GST Monthly Filer)',
        risk_profile: 'Moderate Statutory Exposure'
      },
    },
    {
      id: 'step-2',
      agent_run_id: 'run-1',
      step_order: 2,
      agent_name: 'Knowledge Retrieval Agent',
      status: 'Completed',
      duration_ms: 980,
      input_context: { query: 'Companies Act, CGST, EPFO, DPDP 2023, Karnataka PT' },
      output_payload: {
        retrieved_acts: ['Companies Act 2013', 'CGST Act 2017', 'EPFO Act 1952', 'DPDP Act 2023'],
        matched_sections: ['Sec 137', 'Sec 92', 'Sec 37', 'Sec 39', 'Sec 6']
      },
    },
    {
      id: 'step-3',
      agent_run_id: 'run-1',
      step_order: 3,
      agent_name: 'Compliance Discovery Agent',
      status: 'Completed',
      duration_ms: 1820,
      input_context: { profile: 'Pvt Ltd IT Company' },
      output_payload: {
        candidate_count: 8,
        categories: ['Corporate & MCA', 'Tax & GST', 'Labour', 'Data Protection', 'State Tax']
      },
    },
    {
      id: 'step-4',
      agent_run_id: 'run-1',
      step_order: 4,
      agent_name: 'Legal Reasoning Agent',
      status: 'Completed',
      duration_ms: 2150,
      input_context: { evaluate: 8, facts: '18 employees, SaaS platform' },
      output_payload: {
        verified_applicable: 8,
        average_confidence: 0.97,
        high_penalty_risks: ['DPDP Act 2023 (Up to ₹250 Cr)', 'AOC-4 Director Liability']
      },
    },
    {
      id: 'step-5',
      agent_run_id: 'run-1',
      step_order: 5,
      agent_name: 'Deadline & Action Generator',
      status: 'Completed',
      duration_ms: 1100,
      input_context: { verified: 8 },
      output_payload: {
        actions_generated: 4,
        next_deadline: '2026-10-11 (GSTR-1 Monthly Return)'
      },
    },
    {
      id: 'step-6',
      agent_run_id: 'run-1',
      step_order: 6,
      agent_name: 'Verification & QA Agent',
      status: 'Completed',
      duration_ms: 710,
      input_context: { claims: 8 },
      output_payload: {
        hallucination_check: 'PASSED',
        statutory_citations_validated: '100%',
        presentation_authorized: true
      },
    }
  ]
};

// Mock Query Builder that mirrors Supabase Client
function createMockQueryBuilder(tableName) {
  let tableData = inMemoryStore[tableName] || [];
  let filters = [];
  let selectFields = '*';
  let isSingle = false;
  let limitCount = null;
  let orderColumn = null;
  let orderAscending = true;

  const builder = {
    select: (fields = '*') => {
      selectFields = fields;
      return builder;
    },
    insert: (records) => {
      const items = Array.isArray(records) ? records : [records];
      const inserted = items.map(item => ({
        id: item.id || `${tableName.slice(0, 3)}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        created_at: new Date().toISOString(),
        ...item,
      }));
      if (!inMemoryStore[tableName]) inMemoryStore[tableName] = [];
      inMemoryStore[tableName].push(...inserted);

      return {
        select: () => ({
          single: () => Promise.resolve({ data: inserted[0], error: null }),
          then: (resolve) => resolve({ data: Array.isArray(records) ? inserted : inserted[0], error: null }),
        }),
        single: () => Promise.resolve({ data: inserted[0], error: null }),
        then: (resolve) => resolve({ data: Array.isArray(records) ? inserted : inserted[0], error: null }),
      };
    },
    update: (updates) => {
      return {
        eq: (col, val) => {
          filters.push({ col, val });
          return {
            eq: (col2, val2) => {
              filters.push({ col: col2, val: val2 });
              return executeUpdate(updates);
            },
            select: () => executeUpdate(updates),
            then: (resolve) => executeUpdate(updates).then(resolve),
          };
        },
      };

      function executeUpdate(updates) {
        let matched = tableData.filter(row => {
          return filters.every(f => row[f.col] === f.val);
        });
        matched.forEach(row => {
          Object.assign(row, updates, { updated_at: new Date().toISOString() });
        });
        const result = matched[0] || updates;
        return {
          select: () => ({
            single: () => Promise.resolve({ data: result, error: null }),
            then: (resolve) => resolve({ data: [result], error: null }),
          }),
          single: () => Promise.resolve({ data: result, error: null }),
          then: (resolve) => resolve({ data: result, error: null }),
        };
      }
    },
    delete: () => {
      return {
        eq: (col, val) => {
          if (inMemoryStore[tableName]) {
            inMemoryStore[tableName] = inMemoryStore[tableName].filter(row => row[col] !== val);
          }
          return Promise.resolve({ data: null, error: null });
        },
      };
    },
    eq: (col, val) => {
      filters.push({ col, val });
      return builder;
    },
    order: (col, opts = {}) => {
      orderColumn = col;
      orderAscending = opts.ascending !== false;
      return builder;
    },
    limit: (n) => {
      limitCount = n;
      return builder;
    },
    single: () => {
      isSingle = true;
      return builder;
    },
    then: (resolve, reject) => {
      let filtered = [...(inMemoryStore[tableName] || [])];

      // Apply equality filters
      for (const f of filters) {
        filtered = filtered.filter(row => row[f.col] === f.val);
      }

      // Populate relations if required (e.g. compliance_requirements(*))
      if (tableName === 'business_compliance') {
        filtered = filtered.map(item => {
          const req = inMemoryStore.compliance_requirements?.find(r => r.id === item.compliance_requirement_id);
          const source = req ? inMemoryStore.sources?.find(s => s.id === req.source_id) : null;
          return {
            ...item,
            compliance_requirements: req ? { ...req, sources: source } : null,
          };
        });
      }

      if (tableName === 'compliance_documents') {
        filtered = filtered.map(item => ({
          ...item,
          documents: inMemoryStore.documents?.find(d => d.id === item.document_id) || null,
        }));
      }

      // Ordering
      if (orderColumn) {
        filtered.sort((a, b) => {
          const valA = a[orderColumn];
          const valB = b[orderColumn];
          if (valA < valB) return orderAscending ? -1 : 1;
          if (valA > valB) return orderAscending ? 1 : -1;
          return 0;
        });
      }

      // Limit
      if (limitCount !== null) {
        filtered = filtered.slice(0, limitCount);
      }

      if (isSingle) {
        const item = filtered[0] || null;
        resolve({ data: item, error: item ? null : { code: 'PGRST116', message: 'No rows' } });
      } else {
        resolve({ data: filtered, error: null });
      }
    },
  };

  return builder;
}

// Storage Mock
const mockStorage = {
  from: (bucket) => ({
    upload: async (path, buffer, opts) => {
      return { data: { path }, error: null };
    },
    remove: async (paths) => {
      return { data: paths, error: null };
    },
  }),
};

// Create real clients if valid Supabase URL is present, otherwise export mock clients
let realSupabase = null;
let realAdmin = null;

if (!isPlaceholder) {
  try {
    realSupabase = createClient(supabaseUrl, supabaseAnonKey);
    realAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  } catch (err) {
    console.warn('Error creating real Supabase client, using in-memory provider:', err);
  }
}

export const supabase = realSupabase || {
  auth: {
    getUser: async (token) => {
      return {
        data: {
          user: {
            id: '00000000-0000-0000-0000-000000000001',
            email: 'founder@novatech.in',
            user_metadata: { full_name: 'Aarav Sharma' },
          }
        },
        error: null,
      };
    },
  },
  from: createMockQueryBuilder,
};

export const supabaseAdmin = realAdmin || {
  from: createMockQueryBuilder,
  storage: mockStorage,
  rpc: async (name, params) => ({ data: [], error: null }),
};
