export const SUPABASE_SQL_SCHEMA = `-- SQL Schema for PixelCraft Agency Database
-- Copy and paste this into the Supabase SQL Editor (https://supabase.com) to initialize your tables!

-- 1. Enable any required extensions
create extension if not exists "uuid-ossp";

-- 2. Create 'settings' table (stores site configuration parameters)
create table if not exists settings (
    id text primary key default 'settings',
    agency_name text not null,
    logo_url text,
    whatsapp_number text,
    bkash_number text,
    nagad_number text,
    rocket_number text,
    upay_number text,
    footer_text text,
    about_text text,
    hero_title text,
    hero_subtitle text,
    hero_image text,
    graphics_see_all_link text,
    video_see_all_link text,
    web_see_all_link text,
    facebook_pixel_id text,
    google_analytics_id text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create 'admin' table (stores hashed credentials for panel entry)
create table if not exists admin (
    id uuid primary key default gen_random_uuid(),
    username text unique not null,
    password text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create 'portfolio' table (stores showcase agency items)
create table if not exists portfolio (
    id text primary key,
    title text not null,
    category text not null check (category in ('Graphics Design', 'Video Editing', 'Web Development')),
    image_url text not null,
    demo_link text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create 'courses' table (stores details of available courses)
create table if not exists courses (
    id text primary key,
    title text not null,
    price numeric not null,
    regular_price numeric,
    image_url text not null,
    drive_link text not null,
    features text[] default '{}'::text[],
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create 'ebooks' table (stores details of available ebooks)
create table if not exists ebooks (
    id text primary key,
    title text not null,
    price numeric not null,
    regular_price numeric,
    image_url text not null,
    drive_link text not null,
    features text[] default '{}'::text[],
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Create 'enrollments' table (stores digital course/ebook student purchase receipts)
create table if not exists enrollments (
    id text primary key,
    student_name text not null,
    student_email text not null,
    student_phone text not null,
    item_id text not null,
    item_title text not null,
    item_type text not null check (item_type in ('course', 'ebook')),
    price numeric not null,
    payment_method text not null,
    sender_number text not null,
    transaction_id text unique not null,
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    drive_link text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Create 'submissions' table (stores contact form client inquiries)
create table if not exists submissions (
    id text primary key,
    name text not null,
    email text not null,
    phone text not null,
    message text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Create 'partners' table (stores brand and client logos for site display)
create table if not exists partners (
    id text primary key,
    name text not null,
    logo_url text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Set Row Level Security (RLS) to public for easy configuration (can be hardened later)
alter table settings enable row level security;
alter table admin enable row level security;
alter table portfolio enable row level security;
alter table courses enable row level security;
alter table ebooks enable row level security;
alter table enrollments enable row level security;
alter table submissions enable row level security;
alter table partners enable row level security;

-- Create simple public policies (allows read/write by any client in this prototype)
create policy "Allow public read settings" on settings for select using (true);
create policy "Allow public insert settings" on settings for insert with check (true);
create policy "Allow public update settings" on settings for update using (true);

create policy "Allow public read admin" on admin for select using (true);
create policy "Allow public insert admin" on admin for insert with check (true);
create policy "Allow public update admin" on admin for update using (true);

create policy "Allow public read portfolio" on portfolio for select using (true);
create policy "Allow public insert portfolio" on portfolio for insert with check (true);
create policy "Allow public update portfolio" on portfolio for update using (true);
create policy "Allow public delete portfolio" on portfolio for delete using (true);

create policy "Allow public read courses" on courses for select using (true);
create policy "Allow public insert courses" on courses for insert with check (true);
create policy "Allow public update courses" on courses for update using (true);
create policy "Allow public delete courses" on courses for delete using (true);

create policy "Allow public read ebooks" on ebooks for select using (true);
create policy "Allow public insert ebooks" on ebooks for insert with check (true);
create policy "Allow public update ebooks" on ebooks for update using (true);
create policy "Allow public delete ebooks" on ebooks for delete using (true);

create policy "Allow public read enrollments" on enrollments for select using (true);
create policy "Allow public insert enrollments" on enrollments for insert with check (true);
create policy "Allow public update enrollments" on enrollments for update using (true);
create policy "Allow public delete enrollments" on enrollments for delete using (true);

create policy "Allow public read submissions" on submissions for select using (true);
create policy "Allow public insert submissions" on submissions for insert with check (true);
create policy "Allow public update submissions" on submissions for update using (true);
create policy "Allow public delete submissions" on submissions for delete using (true);

create policy "Allow public read partners" on partners for select using (true);
create policy "Allow public insert partners" on partners for insert with check (true);
create policy "Allow public update partners" on partners for update using (true);
create policy "Allow public delete partners" on partners for delete using (true);
`;
