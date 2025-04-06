-- Drop existing tables if they exist (in reverse order of dependencies)
drop table if exists public.user_points cascade;
drop table if exists public.user_badges cascade;
drop table if exists public.quiz_results cascade;
drop table if exists public.bookings cascade;
drop table if exists public.museums cascade;
drop table if exists public.profiles cascade;

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create VISITOR table
create table public.visitor (
    visitor_id uuid default uuid_generate_v4() primary key,
    name text not null,
    email text unique not null,
    password text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create ADMIN table
create table public.admin (
    admin_id uuid default uuid_generate_v4() primary key,
    name text not null,
    email text unique not null,
    role text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create TICKET table
create table public.ticket (
    ticket_id uuid default uuid_generate_v4() primary key,
    visitor_id uuid references public.visitor(visitor_id) on delete cascade not null,
    date date not null,
    time time not null,
    payment_status text not null default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create CHATBOT table
create table public.chatbot (
    chatbot_id uuid default uuid_generate_v4() primary key,
    visitor_id uuid references public.visitor(visitor_id) on delete cascade not null,
    query text not null,
    response text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create QUIZ table
create table public.quiz (
    quiz_id uuid default uuid_generate_v4() primary key,
    title text not null,
    description text,
    admin_id uuid references public.admin(admin_id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create REWARD table
create table public.reward (
    reward_id uuid default uuid_generate_v4() primary key,
    name text not null,
    criteria text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create MUSEUM_LISTING table
create table public.museum_listing (
    listing_id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    admin_id uuid references public.admin(admin_id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create functions for updating timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create triggers for updating timestamps
create trigger handle_visitor_updated_at
    before update on public.visitor
    for each row
    execute function public.handle_updated_at();

create trigger handle_admin_updated_at
    before update on public.admin
    for each row
    execute function public.handle_updated_at();

create trigger handle_ticket_updated_at
    before update on public.ticket
    for each row
    execute function public.handle_updated_at();

create trigger handle_quiz_updated_at
    before update on public.quiz
    for each row
    execute function public.handle_updated_at();

create trigger handle_museum_listing_updated_at
    before update on public.museum_listing
    for each row
    execute function public.handle_updated_at();

-- Enable RLS on all tables
alter table public.visitor enable row level security;
alter table public.admin enable row level security;
alter table public.ticket enable row level security;
alter table public.chatbot enable row level security;
alter table public.quiz enable row level security;
alter table public.reward enable row level security;
alter table public.museum_listing enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Anyone can register as a visitor" on public.visitor;
drop policy if exists "Users can view their own visitor profile" on public.visitor;
drop policy if exists "Users can update their own visitor profile" on public.visitor;
drop policy if exists "Anyone can register as an admin" on public.admin;
drop policy if exists "Admins can view their own profile" on public.admin;
drop policy if exists "Admins can update their own profile" on public.admin;

-- Create new policies that work with our custom auth
create policy "Enable all operations for visitors"
    on public.visitor
    for all
    using (true)
    with check (true);

create policy "Enable all operations for admins"
    on public.admin
    for all
    using (true)
    with check (true);

-- Update other table policies to use simpler checks
create policy "Enable all ticket operations"
    on public.ticket
    for all
    using (true)
    with check (true);

create policy "Enable all chatbot operations"
    on public.chatbot
    for all
    using (true)
    with check (true);

create policy "Enable all quiz operations"
    on public.quiz
    for all
    using (true)
    with check (true);

create policy "Enable all museum listing operations"
    on public.museum_listing
    for all
    using (true)
    with check (true); 