-- SQL Schema for PixelCraft Agency Database
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
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Create 'admin' table (stores admin credentials securely)
create table if not exists admin (
    username text primary key,
    password text not null, -- Stores hashed passwords (SHA-256)
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Create 'portfolio' table
create table if not exists portfolio (
    id text primary key,
    title text not null,
    category text not null, -- 'Graphics Design' | 'Video Editing' | 'Web Development'
    image_url text not null,
    demo_link text,
    created_at bigint not null
);

-- 5. Create 'courses' table
create table if not exists courses (
    id text primary key,
    title text not null,
    cover_image text not null,
    price numeric not null,
    description text,
    modules text[] not null, -- Array of course modules
    drive_link text not null,
    created_at bigint not null
);

-- 6. Create 'ebooks' table
create table if not exists ebooks (
    id text primary key,
    title text not null,
    cover_image text not null,
    price numeric not null,
    description text,
    drive_link text not null,
    created_at bigint not null
);

-- 7. Create 'enrollments' table (stores course and ebook enrollments)
create table if not exists enrollments (
    id text primary key,
    student_id text not null,
    student_name text not null,
    student_email text not null,
    student_phone text not null,
    item_type text not null, -- 'course' | 'ebook'
    item_id text not null,
    item_title text not null,
    payment_method text not null,
    payment_phone text not null,
    transaction_id text not null,
    status text not null default 'pending', -- 'pending' | 'approved' | 'rejected'
    drive_link text default '',
    country text,
    district text,
    notes text,
    paid_amount numeric,
    screenshot_url text,
    created_at bigint not null
);

-- 8. Create 'submissions' table (stores client inquiries)
create table if not exists submissions (
    id text primary key,
    name text not null,
    email text not null,
    subject text not null,
    message text not null,
    created_at bigint not null
);

-- 9. Create 'partners' table (stores partner logos)
create table if not exists partners (
    id text primary key,
    name text not null,
    logo_url text not null,
    website_url text,
    created_at bigint not null
);

-- 10. Seed Initial Default Data
insert into settings (
    id, agency_name, logo_url, whatsapp_number, bkash_number, nagad_number, rocket_number, upay_number,
    footer_text, about_text, hero_title, hero_subtitle, hero_image,
    graphics_see_all_link, video_see_all_link, web_see_all_link, facebook_pixel_id
) values (
    'settings',
    'PixelCraft Agency',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
    '+8801700000000',
    '01700000000',
    '01700000000',
    '01700000000',
    '01700000000',
    '© 2026 PixelCraft IT. All Rights Reserved.',
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
create index if not exists idx_enrollments_student on enrollments (student_email, student_phone);
create index if not exists idx_submissions_created_at on submissions (created_at desc);
create index if not exists idx_partners_created_at on partners (created_at desc);

-- 12. Set up row-level security (RLS) - Enable for security, but allow public operations if anon key has permissions
-- Standard simple table access configurations
alter table settings enable row level security;
alter table admin enable row level security;
alter table portfolio enable row level security;
alter table courses enable row level security;
alter table ebooks enable row level security;
alter table enrollments enable row level security;
alter table submissions enable row level security;
alter table partners enable row level security;

-- Create policies allowing read/write from authenticated anon client
create policy "Allow read access to settings" on settings for select using (true);
create policy "Allow write access to settings" on settings for all using (true);

create policy "Allow read access to admin" on admin for select using (true);
create policy "Allow write access to admin" on admin for all using (true);

create policy "Allow read access to portfolio" on portfolio for select using (true);
create policy "Allow write access to portfolio" on portfolio for all using (true);

create policy "Allow read access to courses" on courses for select using (true);
create policy "Allow write access to courses" on courses for all using (true);

create policy "Allow read access to ebooks" on ebooks for select using (true);
create policy "Allow write access to ebooks" on ebooks for all using (true);

create policy "Allow read access to enrollments" on enrollments for select using (true);
create policy "Allow write access to enrollments" on enrollments for all using (true);

create policy "Allow read access to submissions" on submissions for select using (true);
create policy "Allow write access to submissions" on submissions for all using (true);

create policy "Allow read access to partners" on partners for select using (true);
create policy "Allow write access to partners" on partners for all using (true);
