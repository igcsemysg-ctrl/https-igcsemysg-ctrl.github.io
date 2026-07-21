create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_board text default 'Cambridge IGCSE',
  preferred_subject text default 'Mathematics',
  created_at timestamptz not null default now()
);

create table if not exists public.topic_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  board text not null,
  subject text not null,
  topic text not null,
  mastery integer not null default 0 check (mastery between 0 and 100),
  attempts integer not null default 0,
  correct_answers integer not null default 0,
  last_studied_at timestamptz not null default now(),
  unique(user_id, board, subject, topic)
);

create table if not exists public.study_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  board text,
  subject text,
  topic text,
  score numeric,
  duration_seconds integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.topic_progress enable row level security;
alter table public.study_events enable row level security;
revoke all on public.profiles, public.topic_progress, public.study_events from anon;
grant select, insert, update, delete on public.profiles, public.topic_progress, public.study_events to authenticated;

create policy "profiles select own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles update own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "progress select own" on public.topic_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy "progress insert own" on public.topic_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "progress update own" on public.topic_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "progress delete own" on public.topic_progress for delete to authenticated using ((select auth.uid()) = user_id);
create policy "events select own" on public.study_events for select to authenticated using ((select auth.uid()) = user_id);
create policy "events insert own" on public.study_events for insert to authenticated with check ((select auth.uid()) = user_id);

create table if not exists public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  window_started_at timestamptz not null,
  request_count integer not null default 0,
  primary key (user_id, window_started_at)
);

create table if not exists public.security_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  request_id uuid not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.student_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  learning_style text not null default 'worked_examples' check (learning_style in ('worked_examples','visual','socratic','concise','detailed')),
  explanation_depth text not null default 'balanced' check (explanation_depth in ('brief','balanced','deep')),
  tutor_tone text not null default 'encouraging' check (tutor_tone in ('encouraging','direct','formal')),
  weekly_goal_minutes integer not null default 180 check (weekly_goal_minutes between 30 and 2000),
  academic_goal text not null default '',
  multi_model_mode boolean not null default false,
  provider_consent_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.student_preferences add column if not exists multi_model_mode boolean not null default false;
alter table public.student_preferences add column if not exists provider_consent_at timestamptz;

create table if not exists public.tutor_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  board text not null,
  subject text not null,
  title text not null default 'New learning session',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tutor_messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.tutor_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null check (char_length(content) between 1 and 6000),
  created_at timestamptz not null default now()
);

create table if not exists public.learning_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  board text not null,
  subject text not null,
  topic text not null,
  insight_type text not null check (insight_type in ('misconception','strength','preference','goal')),
  summary text not null check (char_length(summary) between 1 and 500),
  confidence numeric not null default 0.5 check (confidence between 0 and 1),
  evidence_count integer not null default 1,
  last_observed_at timestamptz not null default now(),
  unique(user_id, board, subject, topic, insight_type, summary)
);

alter table public.ai_usage enable row level security;
alter table public.security_events enable row level security;
alter table public.student_preferences enable row level security;
alter table public.tutor_conversations enable row level security;
alter table public.tutor_messages enable row level security;
alter table public.learning_insights enable row level security;
revoke all on public.ai_usage, public.security_events from anon, authenticated;
revoke all on public.student_preferences, public.tutor_conversations, public.tutor_messages, public.learning_insights from anon;
grant select, insert, update, delete on public.student_preferences, public.tutor_conversations, public.tutor_messages, public.learning_insights to authenticated;

create policy "preferences own" on public.student_preferences for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "conversations own" on public.tutor_conversations for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "messages own" on public.tutor_messages for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "insights own" on public.learning_insights for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create index if not exists tutor_conversations_user_updated_idx on public.tutor_conversations(user_id, updated_at desc);
create index if not exists tutor_messages_conversation_created_idx on public.tutor_messages(conversation_id, created_at desc);
create index if not exists learning_insights_user_subject_idx on public.learning_insights(user_id, board, subject, last_observed_at desc);

create or replace function public.consume_ai_quota(max_requests integer default 20)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  bucket timestamptz := date_trunc('hour', now());
  current_count integer;
begin
  if uid is null then return false; end if;
  insert into public.ai_usage(user_id, window_started_at, request_count)
  values(uid, bucket, 1)
  on conflict(user_id, window_started_at)
  do update set request_count = public.ai_usage.request_count + 1
  returning request_count into current_count;
  return current_count <= least(greatest(max_requests, 1), 100);
end; $$;

revoke all on function public.consume_ai_quota(integer) from public, anon;
grant execute on function public.consume_ai_quota(integer) to authenticated;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, display_name)
  values(new.id, left(coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)),80));
  insert into public.student_preferences(user_id) values(new.id);
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
