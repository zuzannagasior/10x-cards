-- Migration: Initial Schema Creation
-- Description: Creates the core tables for the 10xCards application including flashcards,
-- generation sessions and error logs with proper constraints, indexes and RLS policies.
-- Tables: flashcards, generation_sessions, generation_session_error_logs

-- Create generation_sessions table
create table generation_sessions (
    id serial primary key,
    user_id uuid not null references auth.users(id),
    model varchar(100) not null,
    generated_count integer not null,
    rejected_count integer,
    source_text_hash varchar(64) not null,
    created_at timestamp not null default now()
);

-- Create index on generation_sessions.user_id
create index idx_generation_sessions_user_id on generation_sessions(user_id);

-- Enable RLS on generation_sessions table
alter table generation_sessions enable row level security;

-- Create flashcards table
create table flashcards (
    id serial primary key,
    user_id uuid not null references auth.users(id),
    generation_id integer references generation_sessions(id),
    front varchar(200) not null,
    back varchar(500) not null,
    source varchar(20) not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    constraint chk_front_length check (char_length(front) <= 200),
    constraint chk_back_length check (char_length(back) <= 500),
    constraint chk_source_values check (source in ('manual', 'ai', 'ai-edited'))
);

-- Create indexes on flashcards
create index idx_flashcards_user_id on flashcards(user_id);
create index idx_flashcards_generation_id on flashcards(generation_id);

-- Create updated_at trigger for flashcards
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_flashcards_updated_at
    before update on flashcards
    for each row
    execute function update_updated_at_column();

-- Enable RLS on flashcards table
alter table flashcards enable row level security;

-- Create generation_session_error_logs table
create table generation_session_error_logs (
    id serial primary key,
    user_id uuid not null references auth.users(id),
    source_text_hash varchar(64) not null,
    error_code varchar(50) not null,
    error_message text not null,
    created_at timestamp not null default now()
);

-- Create index on generation_session_error_logs.user_id
create index idx_generation_session_error_logs_user_id on generation_session_error_logs(user_id);

-- Enable RLS on generation_session_error_logs table
alter table generation_session_error_logs enable row level security;

-- Create RLS policies for generation_sessions table
create policy "Users can view own generation sessions"
    on generation_sessions for select
    using (auth.uid() = user_id);

create policy "Users can create own generation sessions"
    on generation_sessions for insert
    with check (auth.uid() = user_id);

create policy "Users can update own generation sessions"
    on generation_sessions for update
    using (auth.uid() = user_id);

create policy "Users can delete own generation sessions"
    on generation_sessions for delete
    using (auth.uid() = user_id);

-- Create RLS policies for flashcards table
create policy "Users can view own flashcards"
    on flashcards for select
    using (auth.uid() = user_id);

create policy "Users can create own flashcards"
    on flashcards for insert
    with check (auth.uid() = user_id);

create policy "Users can update own flashcards"
    on flashcards for update
    using (auth.uid() = user_id);

create policy "Users can delete own flashcards"
    on flashcards for delete
    using (auth.uid() = user_id);

-- Create RLS policies for generation_session_error_logs table
create policy "Users can view own error logs"
    on generation_session_error_logs for select
    using (auth.uid() = user_id);

create policy "Users can create own error logs"
    on generation_session_error_logs for insert
    with check (auth.uid() = user_id);

create policy "Users can delete own error logs"
    on generation_session_error_logs for delete
    using (auth.uid() = user_id); 