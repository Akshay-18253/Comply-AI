-- ComplyAI Database Migration
-- Complete schema for Supabase PostgreSQL

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- ============================================
-- PROFILES
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  preferred_language text default 'English',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- BUSINESSES
-- ============================================
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  business_name text not null,
  owner_name text,
  business_type text not null check (business_type in (
    'Sole Proprietorship', 'Partnership', 'LLP', 'Private Limited',
    'Public Limited', 'One Person Company', 'Trust', 'Society',
    'Section 8 Company', 'HUF', 'Other'
  )),
  industry text not null,
  description text,
  state text not null,
  city text,
  district text,
  pincode text,
  annual_turnover numeric,
  employee_count integer default 0,
  business_start_date date,
  gst_registered boolean default false,
  import_export boolean default false,
  online_business boolean default false,
  physical_location boolean default true,
  handles_food boolean default false,
  handles_personal_data boolean default false,
  uses_machinery boolean default false,
  uses_hazardous_materials boolean default false,
  generates_waste boolean default false,
  uses_contract_workers boolean default false,
  registration_status text default 'Registered',
  number_of_locations integer default 1,
  onboarding_completed boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_businesses_owner on public.businesses(owner_id);

-- ============================================
-- SOURCES
-- ============================================
create table public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  authority text,
  domain text,
  url text not null,
  category text,
  content text,
  content_hash text,
  last_fetched_at timestamptz,
  last_verified_at timestamptz,
  status text default 'Active' check (status in ('Active', 'Inactive', 'Error', 'Pending')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- COMPLIANCE REQUIREMENTS
-- ============================================
create table public.compliance_requirements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text not null,
  authority text,
  jurisdiction text,
  frequency text,
  applicability_rules jsonb not null default '{}'::jsonb,
  required_documents jsonb not null default '[]'::jsonb,
  official_source_url text,
  source_id uuid references public.sources(id) on delete set null,
  confidence numeric check (confidence >= 0 and confidence <= 1),
  verification_status text default 'unverified' check (verification_status in ('verified', 'unverified', 'needs_review', 'outdated')),
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- BUSINESS COMPLIANCE
-- ============================================
create table public.business_compliance (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  requirement_id uuid not null references public.compliance_requirements(id) on delete cascade,
  status text not null default 'Not Started' check (status in (
    'Not Started', 'In Progress', 'Documents Pending', 'Ready to File',
    'Completed', 'Not Applicable', 'Needs Verification', 'Overdue'
  )),
  priority text default 'Medium' check (priority in ('Low', 'Medium', 'High', 'Critical')),
  applicability_reason text,
  ai_explanation text,
  confidence numeric check (confidence >= 0 and confidence <= 1),
  due_date date,
  renewal_date date,
  completed_at timestamptz,
  next_action text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(business_id, requirement_id)
);

create index idx_bc_business on public.business_compliance(business_id);
create index idx_bc_due_date on public.business_compliance(due_date);
create index idx_bc_status on public.business_compliance(status);

-- ============================================
-- DOCUMENTS
-- ============================================
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  uploaded_by uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  mime_type text not null check (mime_type in (
    'application/pdf', 'image/png', 'image/jpg', 'image/jpeg'
  )),
  file_size bigint,
  document_type text,
  extracted_text text,
  analysis jsonb default '{}'::jsonb,
  issue_date date,
  expiry_date date,
  verification_status text default 'Needs Review' check (verification_status in (
    'Verified', 'Needs Review', 'Rejected', 'Expired'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_documents_business on public.documents(business_id);

-- ============================================
-- COMPLIANCE DOCUMENTS (junction)
-- ============================================
create table public.compliance_documents (
  id uuid primary key default gen_random_uuid(),
  business_compliance_id uuid not null references public.business_compliance(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  required boolean default true,
  status text default 'Pending' check (status in ('Pending', 'Uploaded', 'Verified', 'Rejected')),
  created_at timestamptz not null default now(),
  unique(business_compliance_id, document_id)
);

-- ============================================
-- KNOWLEDGE CHUNKS
-- ============================================
create table public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  title text,
  content text not null,
  metadata jsonb default '{}'::jsonb,
  embedding vector(768),
  created_at timestamptz not null default now()
);

create index idx_kc_source on public.knowledge_chunks(source_id);

-- ============================================
-- AGENT RUNS
-- ============================================
create table public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  workflow_type text not null,
  status text not null default 'Running' check (status in ('Running', 'Completed', 'Failed', 'Cancelled')),
  input jsonb not null default '{}'::jsonb,
  output jsonb default '{}'::jsonb,
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index idx_ar_business on public.agent_runs(business_id);

-- ============================================
-- AGENT STEPS
-- ============================================
create table public.agent_steps (
  id uuid primary key default gen_random_uuid(),
  agent_run_id uuid not null references public.agent_runs(id) on delete cascade,
  agent_name text not null,
  step_order integer not null,
  status text not null default 'Waiting' check (status in (
    'Waiting', 'Running', 'Completed', 'Needs Review', 'Failed'
  )),
  input jsonb default '{}'::jsonb,
  output jsonb default '{}'::jsonb,
  reasoning_summary text,
  tool_used text,
  started_at timestamptz,
  completed_at timestamptz
);

create index idx_as_run on public.agent_steps(agent_run_id);

-- ============================================
-- ACTIONS
-- ============================================
create table public.actions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  business_compliance_id uuid references public.business_compliance(id) on delete cascade,
  title text not null,
  description text,
  priority text default 'Medium' check (priority in ('Low', 'Medium', 'High', 'Critical')),
  due_date date,
  status text default 'Pending' check (status in ('Pending', 'In Progress', 'Completed', 'Skipped')),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  type text not null check (type in (
    'deadline', 'overdue', 'document_expiry', 'missing_document',
    'regulatory_change', 'action_required', 'system', 'compliance_update'
  )),
  title text not null,
  message text not null,
  severity text default 'Info' check (severity in ('Info', 'Warning', 'Critical', 'Success')),
  read boolean default false,
  scheduled_for timestamptz,
  created_at timestamptz not null default now()
);

create index idx_notif_user on public.notifications(user_id);
create index idx_notif_scheduled on public.notifications(scheduled_for);

-- ============================================
-- REGULATORY CHANGES
-- ============================================
create table public.regulatory_changes (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  title text not null,
  summary text not null,
  previous_content_hash text,
  new_content_hash text,
  affected_categories jsonb default '[]'::jsonb,
  affected_requirements jsonb default '[]'::jsonb,
  severity text default 'Medium' check (severity in ('Low', 'Medium', 'High', 'Critical')),
  detected_at timestamptz not null default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Profiles RLS
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Businesses RLS
alter table public.businesses enable row level security;
create policy "Users can view own businesses" on public.businesses for select using (auth.uid() = owner_id);
create policy "Users can insert own businesses" on public.businesses for insert with check (auth.uid() = owner_id);
create policy "Users can update own businesses" on public.businesses for update using (auth.uid() = owner_id);
create policy "Users can delete own businesses" on public.businesses for delete using (auth.uid() = owner_id);

-- Business Compliance RLS
alter table public.business_compliance enable row level security;
create policy "Users can view own compliance" on public.business_compliance
  for select using (
    exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
  );
create policy "Users can insert own compliance" on public.business_compliance
  for insert with check (
    exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
  );
create policy "Users can update own compliance" on public.business_compliance
  for update using (
    exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
  );

-- Documents RLS
alter table public.documents enable row level security;
create policy "Users can view own documents" on public.documents
  for select using (auth.uid() = uploaded_by);
create policy "Users can insert own documents" on public.documents
  for insert with check (auth.uid() = uploaded_by);
create policy "Users can update own documents" on public.documents
  for update using (auth.uid() = uploaded_by);
create policy "Users can delete own documents" on public.documents
  for delete using (auth.uid() = uploaded_by);

-- Compliance Documents RLS
alter table public.compliance_documents enable row level security;
create policy "Users can view own compliance docs" on public.compliance_documents
  for select using (
    exists (
      select 1 from public.business_compliance bc
      join public.businesses b on b.id = bc.business_id
      where bc.id = business_compliance_id and b.owner_id = auth.uid()
    )
  );
create policy "Users can insert own compliance docs" on public.compliance_documents
  for insert with check (
    exists (
      select 1 from public.business_compliance bc
      join public.businesses b on b.id = bc.business_id
      where bc.id = business_compliance_id and b.owner_id = auth.uid()
    )
  );

-- Sources RLS (readable by all authenticated users)
alter table public.sources enable row level security;
create policy "Authenticated users can view sources" on public.sources
  for select using (auth.role() = 'authenticated');

-- Compliance Requirements RLS (readable by all authenticated users)
alter table public.compliance_requirements enable row level security;
create policy "Authenticated users can view requirements" on public.compliance_requirements
  for select using (auth.role() = 'authenticated');

-- Knowledge Chunks RLS (readable by all authenticated users)
alter table public.knowledge_chunks enable row level security;
create policy "Authenticated users can view knowledge" on public.knowledge_chunks
  for select using (auth.role() = 'authenticated');

-- Agent Runs RLS
alter table public.agent_runs enable row level security;
create policy "Users can view own agent runs" on public.agent_runs
  for select using (auth.uid() = user_id);
create policy "Users can insert own agent runs" on public.agent_runs
  for insert with check (auth.uid() = user_id);

-- Agent Steps RLS
alter table public.agent_steps enable row level security;
create policy "Users can view own agent steps" on public.agent_steps
  for select using (
    exists (select 1 from public.agent_runs where id = agent_run_id and user_id = auth.uid())
  );

-- Actions RLS
alter table public.actions enable row level security;
create policy "Users can view own actions" on public.actions
  for select using (
    exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
  );
create policy "Users can insert own actions" on public.actions
  for insert with check (
    exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
  );
create policy "Users can update own actions" on public.actions
  for update using (
    exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
  );

-- Notifications RLS
alter table public.notifications enable row level security;
create policy "Users can view own notifications" on public.notifications
  for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- Regulatory Changes RLS (readable by all authenticated)
alter table public.regulatory_changes enable row level security;
create policy "Authenticated users can view regulatory changes" on public.regulatory_changes
  for select using (auth.role() = 'authenticated');

-- ============================================
-- STORAGE
-- ============================================
insert into storage.buckets (id, name, public) values ('documents', 'documents', false);

create policy "Users can upload own documents" on storage.objects
  for insert with check (
    bucket_id = 'documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own documents" on storage.objects
  for select using (
    bucket_id = 'documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own documents" on storage.objects
  for delete using (
    bucket_id = 'documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- TRIGGERS for updated_at
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profile_updated before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger on_business_updated before update on public.businesses
  for each row execute procedure public.handle_updated_at();

create trigger on_compliance_req_updated before update on public.compliance_requirements
  for each row execute procedure public.handle_updated_at();

create trigger on_business_compliance_updated before update on public.business_compliance
  for each row execute procedure public.handle_updated_at();

create trigger on_document_updated before update on public.documents
  for each row execute procedure public.handle_updated_at();

create trigger on_source_updated before update on public.sources
  for each row execute procedure public.handle_updated_at();

-- ============================================
-- AUTO-CREATE PROFILE on user signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- VECTOR SIMILARITY SEARCH FUNCTION
-- ============================================
create or replace function match_knowledge_chunks(
  query_embedding vector(768),
  match_threshold float default 0.5,
  match_count int default 10
)
returns table (
  id uuid,
  source_id uuid,
  title text,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    kc.id,
    kc.source_id,
    kc.title,
    kc.content,
    kc.metadata,
    1 - (kc.embedding <=> query_embedding) as similarity
  from public.knowledge_chunks kc
  where 1 - (kc.embedding <=> query_embedding) > match_threshold
  order by kc.embedding <=> query_embedding
  limit match_count;
$$;
