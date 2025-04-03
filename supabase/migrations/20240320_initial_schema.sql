-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create users table (extends Supabase auth.users)
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    name text,
    email text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create museums table
create table public.museums (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    location text not null,
    opening_hours text,
    ticket_price decimal(10,2),
    image_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create bookings table
create table public.bookings (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    museum_id uuid references public.museums(id) on delete cascade not null,
    date date not null,
    time time not null,
    number_of_tickets integer not null,
    total_amount decimal(10,2) not null,
    status text not null default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create quiz_results table
create table public.quiz_results (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    quiz_id uuid not null,
    score decimal(5,2) not null,
    completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_badges table
create table public.user_badges (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    badge_type text not null,
    badge_level text not null,
    awarded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_points table
create table public.user_points (
    user_id uuid references public.profiles(id) on delete cascade primary key,
    points integer not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table public.profiles enable row level security;
alter table public.museums enable row level security;
alter table public.bookings enable row level security;
alter table public.quiz_results enable row level security;
alter table public.user_badges enable row level security;
alter table public.user_points enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = id);

-- Museums policies
create policy "Anyone can view museums"
    on public.museums for select
    using (true);

-- Bookings policies
create policy "Users can view their own bookings"
    on public.bookings for select
    using (auth.uid() = user_id);

create policy "Users can create bookings"
    on public.bookings for insert
    with check (auth.uid() = user_id);

-- Quiz results policies
create policy "Users can view their own quiz results"
    on public.quiz_results for select
    using (auth.uid() = user_id);

create policy "Users can insert their own quiz results"
    on public.quiz_results for insert
    with check (auth.uid() = user_id);

-- User badges policies
create policy "Users can view their own badges"
    on public.user_badges for select
    using (auth.uid() = user_id);

-- User points policies
create policy "Users can view their own points"
    on public.user_points for select
    using (auth.uid() = user_id);

-- Create functions for updating timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create triggers for updating timestamps
create trigger handle_profiles_updated_at
    before update on public.profiles
    for each row
    execute function public.handle_updated_at();

create trigger handle_museums_updated_at
    before update on public.museums
    for each row
    execute function public.handle_updated_at();

create trigger handle_bookings_updated_at
    before update on public.bookings
    for each row
    execute function public.handle_updated_at();

create trigger handle_user_points_updated_at
    before update on public.user_points
    for each row
    execute function public.handle_updated_at(); 