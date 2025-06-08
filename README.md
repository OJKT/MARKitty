# MarKitty Cover Sheet Generator

A professional cover sheet generator for assignments, built with Next.js, TypeScript, Supabase, and shadcn/ui.

## Features

- 🔒 Google Authentication via Supabase
- 📝 Free Mode and Logged-In Mode
- 📄 Support for .docx and .pdf templates
- 🔄 Auto-fill form with saved data
- 💾 Save defaults for logged-in users
- 👀 Live preview
- 📤 Export to PDF and DOCX

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Supabase project at https://supabase.com

4. Create the following tables in your Supabase database:

   ```sql
   -- Create profiles table
   create table profiles (
     id uuid references auth.users on delete cascade,
     learner_name text,
     default_declaration text,
     last_template_path text,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     primary key (id)
   );

   -- Create templates table
   create table templates (
     id uuid default uuid_generate_v4() primary key,
     user_id uuid references auth.users on delete cascade,
     name text not null,
     file_path text not null,
     file_type text not null check (file_type in ('docx', 'pdf')),
     created_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   -- Enable Row Level Security
   alter table profiles enable row level security;
   alter table templates enable row level security;

   -- Create policies
   create policy "Users can read own profile" on profiles
     for select using (auth.uid() = id);

   create policy "Users can update own profile" on profiles
     for update using (auth.uid() = id);

   create policy "Users can read own templates" on templates
     for select using (auth.uid() = user_id);

   create policy "Users can insert own templates" on templates
     for insert with check (auth.uid() = user_id);
   ```

5. Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Toggle between Free Mode and Logged-In Mode
2. In Logged-In Mode, sign in with Google
3. Upload a template file (.docx or .pdf)
4. Fill in the form fields
5. Preview the result
6. Export to your desired format

## Technologies Used

- Next.js 14
- TypeScript
- Supabase (Auth & Database)
- shadcn/ui
- Tailwind CSS
- docx (for DOCX processing)
- pdf-lib (for PDF processing)
- React Dropzone

## License

MIT 