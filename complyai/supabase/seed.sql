-- ComplyAI Seed Data
-- Official regulatory sources and compliance knowledge

-- ============================================
-- REGULATORY SOURCES
-- ============================================
insert into public.sources (id, name, authority, domain, url, category, content, status, last_verified_at) values
  ('a0000001-0000-0000-0000-000000000001', 'GST Portal - Goods and Services Tax', 'Central Board of Indirect Taxes and Customs (CBIC)', 'Tax', 'https://www.gst.gov.in/', 'Tax', 'The Goods and Services Tax (GST) is a comprehensive indirect tax on manufacture, sale, and consumption of goods and services in India. Every business with turnover exceeding the threshold limit must register for GST. Regular return filings are mandatory including GSTR-1 (outward supplies), GSTR-3B (monthly summary), and annual returns. Composition scheme is available for businesses with turnover up to Rs 1.5 crore (Rs 75 lakh for special category states). GST registration is mandatory for inter-state suppliers regardless of turnover.', 'Active', now()),

  ('a0000001-0000-0000-0000-000000000002', 'Ministry of Corporate Affairs - MCA', 'Ministry of Corporate Affairs', 'Business Registration', 'https://www.mca.gov.in/', 'Business Registration', 'The Ministry of Corporate Affairs (MCA) administers the Companies Act, 2013, the LLP Act, 2008, and other allied Acts. Companies must file annual returns (Form MGT-7), financial statements (Form AOC-4), and maintain statutory registers. Private Limited Companies must hold Annual General Meetings, maintain proper books of account, and file annual compliance documents. Director KYC (DIR-3 KYC) is mandatory annually for all directors.', 'Active', now()),

  ('a0000001-0000-0000-0000-000000000003', 'FSSAI - Food Safety and Standards Authority of India', 'FSSAI', 'Food & Restaurant', 'https://www.fssai.gov.in/', 'Food & Restaurant', 'FSSAI issues food licenses and registrations for food businesses. Basic Registration is for small food businesses with annual turnover up to Rs 12 lakh. State License is for medium food businesses with turnover between Rs 12 lakh to Rs 20 crore. Central License is for large food businesses, importers, and those operating in multiple states. All food businesses must display the FSSAI license number on food packages and premises. Annual returns must be filed by May 31 each year. License renewal should be applied for 30 days before expiry.', 'Active', now()),

  ('a0000001-0000-0000-0000-000000000004', 'EPFO - Employees Provident Fund Organisation', 'Ministry of Labour & Employment', 'Labour & Employment', 'https://www.epfindia.gov.in/', 'Labour & Employment', 'The Employees Provident Funds and Miscellaneous Provisions Act, 1952 applies to establishments with 20 or more employees. Both employer and employee contribute 12% of basic wages. Registration is mandatory for applicable establishments. Monthly ECR (Electronic Challan cum Return) filing is required by the 15th of each month. Annual returns are also mandatory.', 'Active', now()),

  ('a0000001-0000-0000-0000-000000000005', 'ESIC - Employees State Insurance Corporation', 'Ministry of Labour & Employment', 'Labour & Employment', 'https://www.esic.gov.in/', 'Labour & Employment', 'The ESI Act applies to factories and establishments with 10 or more employees (20 in some states) where employee wages do not exceed Rs 21,000 per month. Employer contribution is 3.25% and employee contribution is 0.75% of wages. Registration is mandatory for applicable establishments. Half-yearly returns must be filed.', 'Active', now()),

  ('a0000001-0000-0000-0000-000000000006', 'Income Tax Department', 'Central Board of Direct Taxes (CBDT)', 'Tax', 'https://www.incometax.gov.in/', 'Tax', 'Every business entity must obtain a PAN and file income tax returns annually. Companies must file by October 31 (if audit required) or July 31. Tax audit under Section 44AB is mandatory for businesses with turnover exceeding Rs 1 crore (Rs 10 crore if cash transactions are below 5%). TDS must be deducted and deposited as applicable. Advance tax must be paid in quarterly installments if tax liability exceeds Rs 10,000.', 'Active', now()),

  ('a0000001-0000-0000-0000-000000000007', 'Shops and Establishments Acts - State-wise', 'State Labour Departments', 'Shops & Establishments', 'https://labour.gov.in/', 'Shops & Establishments', 'Each state has its own Shops and Establishments Act governing working conditions, working hours, holidays, leave, and employment terms for shops and commercial establishments. Registration is typically required within 30 days of commencing business. The registration must be renewed periodically as per state-specific rules. Karnataka: Karnataka Shops and Commercial Establishments Act, 1961. Maharashtra: Maharashtra Shops and Establishments (Regulation of Employment and Conditions of Service) Act, 2017.', 'Active', now()),

  ('a0000001-0000-0000-0000-000000000008', 'Udyam Registration - MSME', 'Ministry of Micro, Small and Medium Enterprises', 'Business Registration', 'https://udyamregistration.gov.in/', 'Business Registration', 'Udyam Registration is a free, paperless online registration for MSMEs. Classification: Micro (investment up to Rs 1 crore, turnover up to Rs 5 crore), Small (investment up to Rs 10 crore, turnover up to Rs 50 crore), Medium (investment up to Rs 50 crore, turnover up to Rs 250 crore). Registration is based on self-declaration and linked with Aadhaar. Benefits include priority sector lending, protection against delayed payments, and various government scheme eligibility.', 'Active', now()),

  ('a0000001-0000-0000-0000-000000000009', 'Central Pollution Control Board', 'Ministry of Environment, Forest and Climate Change', 'Environment', 'https://cpcb.nic.in/', 'Environment', 'Industries are categorized as Red, Orange, Green, or White based on their pollution potential. Consent to Establish (CTE) and Consent to Operate (CTO) are required from State Pollution Control Boards. Hazardous waste generators must register and file annual returns. Environmental clearance may be required for certain categories of projects.', 'Active', now()),

  ('a0000001-0000-0000-0000-000000000010', 'Municipal Corporation / Trade License', 'Local Municipal Bodies', 'Local Business Requirements', 'https://www.india.gov.in/', 'Local Business Requirements', 'Trade license is mandatory for carrying on any trade, business, or profession in a municipal area. Application must be made to the local municipal corporation or municipality. The license must be renewed annually. Requirements and fees vary by municipality and type of business. Health trade license is additionally required for food establishments, beauty parlors, and similar businesses.', 'Active', now()),

  ('a0000001-0000-0000-0000-000000000011', 'Professional Tax - State Departments', 'State Revenue Departments', 'Tax', 'https://www.india.gov.in/', 'Tax', 'Professional Tax is a state-level tax levied on professions, trades, and employment. It is applicable in most Indian states including Karnataka, Maharashtra, Gujarat, West Bengal, and others. Maximum professional tax is Rs 2,500 per year. Employers must register, deduct from employee salaries, and remit to the state government. Monthly or annual filing required depending on the state.', 'Active', now()),

  ('a0000001-0000-0000-0000-000000000012', 'DGFT - Directorate General of Foreign Trade', 'Ministry of Commerce & Industry', 'Import & Export', 'https://www.dgft.gov.in/', 'Import & Export', 'Import Export Code (IEC) is mandatory for import/export of goods and services. IEC is a 10-digit code issued by DGFT. It is a lifetime code with no renewal required, but details must be updated annually. DGFT also issues various licenses and authorizations for restricted items.', 'Active', now());

-- ============================================
-- KNOWLEDGE CHUNKS
-- ============================================
insert into public.knowledge_chunks (source_id, title, content, metadata) values
  -- GST Knowledge
  ('a0000001-0000-0000-0000-000000000001', 'GST Registration Threshold',
   'GST registration is mandatory for businesses with aggregate turnover exceeding Rs 40 lakh (Rs 20 lakh for special category states) for supply of goods, and Rs 20 lakh (Rs 10 lakh for special category states) for supply of services. Certain categories require mandatory registration regardless of turnover: inter-state suppliers, e-commerce operators, casual taxable persons, non-resident taxable persons, and persons required to deduct TDS.',
   '{"category": "Tax", "subcategory": "GST", "jurisdiction": "Central", "applicability": ["all_businesses"]}'::jsonb),

  ('a0000001-0000-0000-0000-000000000001', 'GST Return Filing Requirements',
   'Registered persons must file: GSTR-1 (details of outward supplies) by 11th of next month or quarterly under QRMP scheme; GSTR-3B (summary return with tax payment) by 20th of next month or quarterly; GSTR-9 (annual return) by December 31; GSTR-9C (reconciliation statement for turnover above Rs 5 crore). Composition dealers file CMP-08 quarterly and GSTR-4 annually.',
   '{"category": "Tax", "subcategory": "GST", "type": "filing", "frequency": "monthly/quarterly/annual"}'::jsonb),

  -- FSSAI Knowledge
  ('a0000001-0000-0000-0000-000000000003', 'FSSAI License Categories',
   'FSSAI licensing is categorized by turnover and type: Basic Registration (Form A) for annual turnover up to Rs 12 lakh or petty food businesses; State License (Form B) for turnover between Rs 12 lakh and Rs 20 crore; Central License (Form B) for turnover above Rs 20 crore, importers, 100% EOU, and operators in airports, seaports, etc. All food business operators must ensure food safety standards as per FSSAI regulations.',
   '{"category": "Food & Restaurant", "subcategory": "FSSAI", "applicability": ["handles_food"]}'::jsonb),

  ('a0000001-0000-0000-0000-000000000003', 'FSSAI Compliance Requirements',
   'Food business operators must: Display FSSAI license number on premises and packaging; Maintain records of daily preparation, sale, raw material procurement; Follow food safety and hygiene standards (Schedule 4); Get annual medical examination for food handlers; File Annual Return by May 31 (Form D-1 for manufacturing, D-2 for others); Renew license 30 days before expiry; Ensure traceability of food products.',
   '{"category": "Food & Restaurant", "subcategory": "FSSAI", "type": "compliance", "applicability": ["handles_food"]}'::jsonb),

  -- Labour Law Knowledge
  ('a0000001-0000-0000-0000-000000000004', 'EPF Registration and Compliance',
   'EPF registration is mandatory for establishments with 20 or more employees. Both employer and employee contribute 12% of basic wages plus DA. Employer additionally contributes to Employee Pension Scheme (8.33%) and EDLI (0.50%). Monthly ECR filing by 15th of following month. Form 5A (new employee details) and Form 10 (leaving employee details) must be maintained.',
   '{"category": "Labour & Employment", "subcategory": "EPF", "applicability": ["has_employees", "employee_count_gte_20"]}'::jsonb),

  ('a0000001-0000-0000-0000-000000000005', 'ESI Registration and Compliance',
   'ESI registration is mandatory for establishments with 10 or more employees (20 in some states) where wages do not exceed Rs 21,000/month. Employer contribution: 3.25%. Employee contribution: 0.75%. ESI provides medical, sickness, maternity, disability, and dependent benefits. Monthly contribution must be deposited within 15 days of the following month.',
   '{"category": "Labour & Employment", "subcategory": "ESI", "applicability": ["has_employees", "employee_count_gte_10"]}'::jsonb),

  -- Company Compliance
  ('a0000001-0000-0000-0000-000000000002', 'Private Limited Company Annual Compliance',
   'Private Limited Companies must: File Annual Return (Form MGT-7A for small companies or MGT-7) within 60 days of AGM; File Financial Statements (Form AOC-4) within 30 days of AGM; Hold AGM within 6 months of financial year end; Director KYC (DIR-3 KYC) annually by September 30; Maintain statutory registers; Appoint and maintain auditor; File income tax return; Ensure ROC compliance.',
   '{"category": "Business Registration", "subcategory": "Company Law", "applicability": ["Private Limited", "One Person Company", "Public Limited"]}'::jsonb),

  -- Shop & Establishment
  ('a0000001-0000-0000-0000-000000000007', 'Shops and Establishments Registration',
   'Registration under the respective state Shops and Establishments Act is typically required within 30 days of commencing business. This applies to shops, commercial establishments, restaurants, theatres, and other places of public amusement or entertainment. The registration governs working hours, overtime, holidays, leave, conditions of service, and employment of children and women. Renewal period varies by state.',
   '{"category": "Shops & Establishments", "applicability": ["physical_location"], "jurisdiction": "State"}'::jsonb),

  -- Income Tax
  ('a0000001-0000-0000-0000-000000000006', 'Business Income Tax Compliance',
   'Every business must: Obtain PAN; File income tax return annually (July 31 for non-audit cases, October 31 for audit cases); Get tax audit if turnover exceeds threshold (Rs 1 crore for business, Rs 50 lakh for profession, Rs 10 crore if cash transactions below 5%); Deduct TDS as applicable; Pay advance tax if liability exceeds Rs 10,000; Maintain books of account for minimum 6 years.',
   '{"category": "Tax", "subcategory": "Income Tax", "applicability": ["all_businesses"]}'::jsonb),

  -- Trade License
  ('a0000001-0000-0000-0000-000000000010', 'Trade License Requirements',
   'Trade license is a mandatory permit from the local municipal body to carry on a particular trade, business, or profession. Application must include: Identity proof, address proof, property ownership/rental documents, business registration documents, photographs. The license must be renewed annually. Fees vary based on nature of business, location, and area of establishment. Health trade license additionally required for food-related businesses.',
   '{"category": "Local Business Requirements", "subcategory": "Trade License", "applicability": ["physical_location"]}'::jsonb),

  -- MSME
  ('a0000001-0000-0000-0000-000000000008', 'Udyam Registration Benefits and Process',
   'Udyam Registration (formerly Udyog Aadhaar) is a free online registration for MSMEs. Classification based on investment and turnover: Micro (up to Rs 1 Cr investment, Rs 5 Cr turnover), Small (up to Rs 10 Cr investment, Rs 50 Cr turnover), Medium (up to Rs 50 Cr investment, Rs 250 Cr turnover). Benefits include: Priority sector lending, credit guarantee scheme, protection against delayed payments, concession in electricity bills, patent/trademark registration subsidy.',
   '{"category": "Business Registration", "subcategory": "MSME", "applicability": ["all_businesses"]}'::jsonb),

  -- Professional Tax
  ('a0000001-0000-0000-0000-000000000011', 'Professional Tax Compliance',
   'Professional Tax is levied by state governments on persons earning income from salary, profession, trade, or business. Key points: Maximum Rs 2,500 per annum per employee; Employers must register within 30 days of hiring; Monthly deduction from employee salaries; Varies by state - Karnataka (monthly slabs), Maharashtra (monthly slabs), etc. Employers must obtain Professional Tax Registration Certificate (PTRC) and Professional Tax Enrollment Certificate (PTEC).',
   '{"category": "Tax", "subcategory": "Professional Tax", "applicability": ["has_employees"], "jurisdiction": "State"}'::jsonb),

  -- Import Export
  ('a0000001-0000-0000-0000-000000000012', 'Import Export Code Requirements',
   'IEC (Import Export Code) is a 10-digit code issued by DGFT mandatory for importing or exporting goods and services. Application through DGFT online portal. Documents: PAN, Aadhaar, bank certificate, business registration. Lifetime validity with annual update requirement on DGFT portal between April-June. Not required for personal imports/exports up to Rs 25,000.',
   '{"category": "Import & Export", "subcategory": "IEC", "applicability": ["import_export"]}'::jsonb),

  -- Environment
  ('a0000001-0000-0000-0000-000000000009', 'Environmental Compliance for Industries',
   'Industries must: Obtain Consent to Establish (CTE) before setting up; Obtain Consent to Operate (CTO) before commencing operations; Renew CTO periodically (typically every 5 years for Green, 2-3 years for Orange/Red); Register as hazardous waste generator if applicable; File annual environmental statement by September 30; Install and maintain pollution control equipment. Classification: Green (low pollution), Orange (medium), Red (high pollution potential).',
   '{"category": "Environment", "subcategory": "Pollution Control", "applicability": ["manufacturing", "generates_waste", "uses_hazardous_materials"]}'::jsonb);

-- ============================================
-- COMPLIANCE REQUIREMENTS SEED
-- ============================================
insert into public.compliance_requirements (id, name, category, description, authority, jurisdiction, frequency, applicability_rules, required_documents, official_source_url, source_id, confidence, verification_status, last_verified_at) values
  ('b0000001-0000-0000-0000-000000000001', 'GST Registration', 'Tax', 'Registration under the Goods and Services Tax Act for businesses exceeding the applicable threshold turnover.', 'Central Board of Indirect Taxes and Customs', 'Central', 'One-time (with amendments as needed)', '{"turnover_threshold": 4000000, "mandatory_for": ["inter_state_supply", "e_commerce"], "business_types": ["all"]}'::jsonb, '["PAN Card", "Aadhaar Card", "Business Registration Certificate", "Bank Account Statement/Cancelled Cheque", "Address Proof of Business", "Photographs", "Authorization Letter"]'::jsonb, 'https://www.gst.gov.in/', 'a0000001-0000-0000-0000-000000000001', 0.95, 'verified', now()),

  ('b0000001-0000-0000-0000-000000000002', 'GST Return Filing (GSTR-3B)', 'Tax', 'Monthly/quarterly summary return with details of outward and inward supplies, input tax credit, and tax payment.', 'Central Board of Indirect Taxes and Customs', 'Central', 'Monthly or Quarterly', '{"requires": "gst_registered", "business_types": ["all"]}'::jsonb, '["Sales Records", "Purchase Records", "Input Tax Credit Details", "Previous Return"]'::jsonb, 'https://www.gst.gov.in/', 'a0000001-0000-0000-0000-000000000001', 0.95, 'verified', now()),

  ('b0000001-0000-0000-0000-000000000003', 'FSSAI Food License/Registration', 'Food & Restaurant', 'Food license or registration required for all food business operators as per the Food Safety and Standards Act, 2006.', 'FSSAI', 'Central/State', 'One-time (renewal required)', '{"requires": "handles_food", "industries": ["Restaurant/Food", "Food Processing", "Retail"]}'::jsonb, '["Identity Proof", "Business Registration", "Address Proof", "Food Safety Management Plan", "List of Food Products", "Layout Plan of Premises", "Water Test Report", "Medical Fitness Certificates of Food Handlers"]'::jsonb, 'https://www.fssai.gov.in/', 'a0000001-0000-0000-0000-000000000003', 0.95, 'verified', now()),

  ('b0000001-0000-0000-0000-000000000004', 'Shops and Establishments Registration', 'Shops & Establishments', 'Registration under the respective state Shops and Establishments Act for commercial premises and businesses.', 'State Labour Department', 'State', 'One-time (renewal varies by state)', '{"requires": "physical_location", "business_types": ["all"]}'::jsonb, '["Identity Proof", "Address Proof of Business", "PAN Card", "Rent Agreement/Ownership Document", "Partnership Deed/MOA (if applicable)", "Photographs"]'::jsonb, 'https://labour.gov.in/', 'a0000001-0000-0000-0000-000000000007', 0.90, 'verified', now()),

  ('b0000001-0000-0000-0000-000000000005', 'EPF Registration', 'Labour & Employment', 'Registration under the Employees Provident Funds and Miscellaneous Provisions Act, 1952 for establishments with 20 or more employees.', 'EPFO', 'Central', 'One-time (monthly contributions)', '{"employee_count_min": 20, "business_types": ["all"]}'::jsonb, '["PAN Card", "Business Registration", "Address Proof", "Employee Details", "Bank Account Details", "Digital Signature"]'::jsonb, 'https://www.epfindia.gov.in/', 'a0000001-0000-0000-0000-000000000004', 0.95, 'verified', now()),

  ('b0000001-0000-0000-0000-000000000006', 'ESI Registration', 'Labour & Employment', 'Registration under the Employees State Insurance Act for establishments with 10 or more employees where wages do not exceed Rs 21,000/month.', 'ESIC', 'Central', 'One-time (monthly contributions)', '{"employee_count_min": 10, "wage_ceiling": 21000, "business_types": ["all"]}'::jsonb, '["PAN Card", "Business Registration", "Address Proof", "Employee Details", "Bank Account Details", "Employee Wage Details"]'::jsonb, 'https://www.esic.gov.in/', 'a0000001-0000-0000-0000-000000000005', 0.90, 'verified', now()),

  ('b0000001-0000-0000-0000-000000000007', 'Income Tax Return Filing', 'Tax', 'Annual filing of income tax return for the business entity.', 'Central Board of Direct Taxes', 'Central', 'Annual', '{"business_types": ["all"]}'::jsonb, '["PAN Card", "Financial Statements", "Bank Statements", "TDS Certificates", "Investment Proofs", "Audit Report (if applicable)"]'::jsonb, 'https://www.incometax.gov.in/', 'a0000001-0000-0000-0000-000000000006', 0.95, 'verified', now()),

  ('b0000001-0000-0000-0000-000000000008', 'Trade License', 'Local Business Requirements', 'Municipal trade license required to carry on business in a municipal area.', 'Municipal Corporation/Municipality', 'Local', 'Annual renewal', '{"requires": "physical_location", "business_types": ["all"]}'::jsonb, '["Identity Proof", "Address Proof", "Property Documents", "Business Registration", "Photographs", "NOC from Fire Department (if applicable)"]'::jsonb, 'https://www.india.gov.in/', 'a0000001-0000-0000-0000-000000000010', 0.85, 'verified', now()),

  ('b0000001-0000-0000-0000-000000000009', 'Udyam/MSME Registration', 'Business Registration', 'Free online registration for Micro, Small and Medium Enterprises under the MSME Development Act.', 'Ministry of MSME', 'Central', 'One-time', '{"business_types": ["all"], "recommended": true}'::jsonb, '["Aadhaar Card", "PAN Card", "Business Details"]'::jsonb, 'https://udyamregistration.gov.in/', 'a0000001-0000-0000-0000-000000000008', 0.90, 'verified', now()),

  ('b0000001-0000-0000-0000-000000000010', 'Professional Tax Registration', 'Tax', 'State-level tax on persons earning income from profession, trade, or employment. Employers must register and deduct from employee salaries.', 'State Revenue Department', 'State', 'Monthly/Annual', '{"requires": "has_employees", "states_applicable": ["Karnataka", "Maharashtra", "Gujarat", "West Bengal", "Andhra Pradesh", "Telangana", "Tamil Nadu", "Madhya Pradesh", "Odisha", "Kerala", "Assam", "Meghalaya", "Tripura", "Jharkhand", "Bihar", "Chhattisgarh", "Sikkim"]}'::jsonb, '["PAN Card", "Business Registration", "Employee Salary Details", "Address Proof"]'::jsonb, 'https://www.india.gov.in/', 'a0000001-0000-0000-0000-000000000011', 0.85, 'verified', now()),

  ('b0000001-0000-0000-0000-000000000011', 'Import Export Code (IEC)', 'Import & Export', 'Mandatory 10-digit code from DGFT for businesses engaged in import or export of goods and services.', 'DGFT', 'Central', 'One-time (annual update)', '{"requires": "import_export"}'::jsonb, '["PAN Card", "Aadhaar Card", "Bank Certificate", "Business Registration", "Address Proof"]'::jsonb, 'https://www.dgft.gov.in/', 'a0000001-0000-0000-0000-000000000012', 0.95, 'verified', now()),

  ('b0000001-0000-0000-0000-000000000012', 'Fire Safety NOC', 'Local Business Requirements', 'No Objection Certificate from the Fire Department for commercial establishments, especially those with public access.', 'State Fire Department', 'State/Local', 'One-time (renewal on modification)', '{"requires": "physical_location", "recommended_for": ["Restaurant/Food", "Manufacturing", "Hospitality", "Healthcare/Clinic"]}'::jsonb, '["Building Plan", "Fire Safety Equipment Details", "Electrical Safety Certificate", "Occupancy Certificate"]'::jsonb, 'https://www.india.gov.in/', 'a0000001-0000-0000-0000-000000000010', 0.80, 'verified', now()),

  ('b0000001-0000-0000-0000-000000000013', 'Signage/Hoarding License', 'Local Business Requirements', 'Permission from local municipal body for business signage, nameboards, and hoardings.', 'Municipal Corporation/Municipality', 'Local', 'Annual', '{"requires": "physical_location"}'::jsonb, '["Business Registration", "Property Documents", "Signage Design/Dimensions", "Photographs"]'::jsonb, 'https://www.india.gov.in/', 'a0000001-0000-0000-0000-000000000010', 0.75, 'unverified', now()),

  ('b0000001-0000-0000-0000-000000000014', 'Environmental Clearance/Consent to Operate', 'Environment', 'Consent to Establish and Consent to Operate from State Pollution Control Board for manufacturing and polluting industries.', 'State Pollution Control Board', 'State', 'Periodic renewal (1-5 years)', '{"requires_any": ["manufacturing", "generates_waste", "uses_hazardous_materials"], "industries": ["Manufacturing", "Agriculture/Food Processing"]}'::jsonb, '["Project Report", "Environmental Impact Assessment", "Factory Plan", "Process Flow Diagram", "Waste Management Plan", "Water/Air Pollution Control Details"]'::jsonb, 'https://cpcb.nic.in/', 'a0000001-0000-0000-0000-000000000009', 0.85, 'verified', now()),

  ('b0000001-0000-0000-0000-000000000015', 'Company Annual Return (MCA)', 'Business Registration', 'Annual filing with the Registrar of Companies including annual return and financial statements.', 'Ministry of Corporate Affairs', 'Central', 'Annual', '{"business_types": ["Private Limited", "Public Limited", "One Person Company", "Section 8 Company"]}'::jsonb, '["Financial Statements", "Board Resolutions", "Director Details", "Shareholder Details", "Auditor Report", "Digital Signature Certificate"]'::jsonb, 'https://www.mca.gov.in/', 'a0000001-0000-0000-0000-000000000002', 0.95, 'verified', now()),

  ('b0000001-0000-0000-0000-000000000016', 'FSSAI Annual Return Filing', 'Food & Restaurant', 'Annual return filing with FSSAI by May 31 of each year for all food license/registration holders.', 'FSSAI', 'Central', 'Annual (by May 31)', '{"requires": "handles_food"}'::jsonb, '["FSSAI License", "Annual Production/Sale Details", "Food Testing Reports", "Employee Medical Fitness Certificates"]'::jsonb, 'https://www.fssai.gov.in/', 'a0000001-0000-0000-0000-000000000003', 0.90, 'verified', now()),

  ('b0000001-0000-0000-0000-000000000017', 'Eating House / Health Trade License', 'Food & Restaurant', 'License from local municipal authority for operating a food establishment, restaurant, or eating house.', 'Municipal Health Department', 'Local', 'Annual renewal', '{"requires": "handles_food", "requires_also": "physical_location"}'::jsonb, '["FSSAI License", "Business Registration", "Property Documents", "Health Inspection Certificate", "Water Test Report", "Pest Control Certificate"]'::jsonb, 'https://www.india.gov.in/', 'a0000001-0000-0000-0000-000000000010', 0.80, 'verified', now());
