-- SQL Schema for PixelCraft Agency Database
-- Copy and paste this into the Supabase SQL Editor (https://supabase.com) to initialize your tables!
-- WARNING: This will drop existing tables and recreate them with the correct columns matching the application.

-- 1. Enable required extensions
create extension if not exists "uuid-ossp";

-- Drop existing tables to ensure clean schema sync
drop table if exists settings cascade;
drop table if exists admin cascade;
drop table if exists portfolio cascade;
drop table if exists courses cascade;
drop table if exists ebooks cascade;
drop table if exists enrollments cascade;
drop table if exists submissions cascade;
drop table if exists partners cascade;

-- 2. Create 'settings' table (stores site configuration parameters)
create table settings (
    id text primary key default 'settings',
    agency_name text not null,
    logo_url text,
    favicon_url text,
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
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create 'admin' table (stores hashed credentials for panel entry)
create table admin (
    username text primary key,
    password text not null, -- SHA-256 hashed password
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create 'portfolio' table (stores showcase agency items)
create table portfolio (
    id text primary key,
    title text not null,
    category text not null, -- 'Graphics Design' | 'Video Editing' | 'Web Development'
    image_url text not null,
    demo_link text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create 'courses' table (stores details of available courses)
create table courses (
    id text primary key,
    title text not null,
    cover_image text not null,
    price numeric not null,
    description text,
    modules text[] default '{}'::text[], -- Array of course modules
    drive_link text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create 'ebooks' table (stores details of available ebooks)
create table ebooks (
    id text primary key,
    title text not null,
    cover_image text not null,
    price numeric not null,
    description text,
    drive_link text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Create 'enrollments' table (stores digital course/ebook student purchase receipts)
create table enrollments (
    id text primary key,
    student_id text not null,
    student_name text not null,
    student_email text not null,
    student_phone text not null,
    item_type text not null, -- 'course' | 'ebook'
    item_id text not null,
    item_title text not null,
    payment_method text not null, -- 'bKash' | 'Nagad' | 'Rocket' | 'Upay'
    payment_phone text not null,
    transaction_id text unique not null,
    status text not null default 'pending', -- 'pending' | 'approved' | 'rejected'
    drive_link text default '',
    country text,
    district text,
    notes text,
    paid_amount numeric,
    screenshot_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Create 'submissions' table (stores contact form client inquiries)
create table submissions (
    id text primary key,
    name text not null,
    email text not null,
    subject text not null,
    message text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Create 'partners' table (stores brand and client logos for site display)
create table partners (
    id text primary key,
    name text not null,
    logo_url text not null,
    website_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Seed Initial Default Data
insert into settings (
    id, agency_name, logo_url, favicon_url, whatsapp_number, bkash_number, nagad_number, rocket_number, upay_number,
    footer_text, about_text, hero_title, hero_subtitle, hero_image,
    graphics_see_all_link, video_see_all_link, web_see_all_link, facebook_pixel_id
) values (
    'settings',
    'B2Bfiy Institute',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=32&q=80',
    '+8801700000000',
    '01700000000',
    '01700000000',
    '01700000000',
    '01700000000',
    '© 2026 B2Bfiy Institute. All Rights Reserved.',
    'We are a premium digital agency specializing in UI/UX Design, high-impact Video Editing, and Full-Stack Web Development.',
    'Elevate Your Brand with Premium Digital Solutions',
    'Empower your business with elite graphics design, stunning high-converting video editing, and modern robust web development. Learn from our pro courses and premium ebooks.',
    'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80',
    '#', '#', '#', ''
) on conflict (id) do nothing;

-- Seed default admin credentials (username: admin, password: hashed version of admin1)
-- SHA-256 for 'admin1' is: e1c3d10c85025d2e057cb044ec5e2d1d07c0f18836eb32b350e3ebfb0d87948e
insert into admin (username, password) values (
    'admin',
    'e1c3d10c85025d2e057cb044ec5e2d1d07c0f18836eb32b350e3ebfb0d87948e'
) on conflict (username) do nothing;

-- 11. Create helper indexes for super-fast lookups
create index if not exists idx_portfolio_created_at on portfolio (created_at desc);
create index if not exists idx_courses_created_at on courses (created_at desc);
create index if not exists idx_ebooks_created_at on ebooks (created_at desc);
create index if not exists idx_enrollments_created_at on enrollments (created_at desc);
create index if not exists idx_submissions_created_at on submissions (created_at desc);
create index if not exists idx_partners_created_at on partners (created_at desc);

-- 12. Set Row Level Security (RLS)
alter table settings enable row level security;
alter table admin enable row level security;
alter table portfolio enable row level security;
alter table courses enable row level security;
alter table ebooks enable row level security;
alter table enrollments enable row level security;
alter table submissions enable row level security;
alter table partners enable row level security;

-- Create simple public policies allowing public read and write operations
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
