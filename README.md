Here’s the translation of your text to English:  

---

# Portfolio V4  
# Tutorial: Running the Project  

Here’s a simple guide to run this project.  

## Prerequisites  

Ensure that you have already installed:  
- **Node.js**  
---

## Steps to Run the Project  

1. **Install all dependencies:**  

   ```bash  
   npm install  
   ```  
   Or use:  

   ```bash  
   npm install --legacy-peer-deps  
   ```  

2. **Run the project:**  

   ```bash  
   npm run dev  
   ```
   
## Creating a Production Build  

To create a production-ready build:  

1. Run the build command:  

   ```bash  
   npm run build  
   ```  

2. The build files will be saved in the `dist` folder. You can upload this folder to your hosting server.  

---

## Notes  

If you encounter issues while running the project, ensure that:  
- Node.js is correctly installed.  
- You’re in the correct project directory.  
- All dependencies are installed without errors.  

---

## Environment Variables (Supabase)

Create a `.env` file based on `.env.example` and fill with your Supabase project credentials:

```bash
VITE_SUPABASE_URL=https://fukwqchnqhvtdcebdzab.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_9tnkU8l7Q055GFJgRsb4zw_z3mco425
```

Restart the dev server after editing `.env`.

---

## App Usage

- The app uses hash-based routing. Main paths:
  - Home: `/#home` (default)
  - Admin: `/#admin`
  - Project detail: `/#project/:id`

- Admin login:
  - Username: `ali`
  - Password: `ali123`

In Admin you can manage:
- Projects (CRUD + image upload)
- Certificates (CRUD + image upload)
- About photo (upload/replace/delete)
- About summary text (edit/save/delete)
- About CV link (edit/save/delete)

---

## Supabase Setup

1) Create project in Supabase and get URL + anon key.

2) Storage bucket
- Create bucket named `profile-images` and set it to Public.

3) Tables and schemas (SQL)

```sql
-- projects
create table if not exists public.projects (
  id bigserial primary key,
  "Title" text,
  "Description" text,
  "Link" text,
  "Github" text,
  "TechStack" text[],
  "Features" text[],
  "Img" text,
  created_at timestamp with time zone default now()
);

-- certificates
create table if not exists public.certificates (
  id bigserial primary key,
  "Img" text,
  created_at timestamp with time zone default now()
);

-- portfolio comments
create table if not exists public.portfolio_comments (
  id bigserial primary key,
  content text,
  user_name text,
  profile_image text,
  created_at timestamp with time zone default now(),
  is_pinned boolean default false
);
```

4) Row Level Security (RLS) policies

Enable RLS for tables (in Table editor > Security). Then add policies. Example permissive public policies:

```sql
-- projects
create policy if not exists "public select projects" on public.projects for select using (true);
create policy if not exists "public insert projects" on public.projects for insert with check (true);
create policy if not exists "public update projects" on public.projects for update using (true) with check (true);
create policy if not exists "public delete projects" on public.projects for delete using (true);

-- certificates
create policy if not exists "public select certificates" on public.certificates for select using (true);
create policy if not exists "public insert certificates" on public.certificates for insert with check (true);
create policy if not exists "public delete certificates" on public.certificates for delete using (true);

-- portfolio_comments
create policy if not exists "public select comments" on public.portfolio_comments for select using (true);
create policy if not exists "public insert comments" on public.portfolio_comments for insert with check (true);
create policy if not exists "public delete comments" on public.portfolio_comments for delete using (true);
```

5) Storage RLS policies

Storage objects already use RLS. Add policies for the `profile-images` bucket. You can choose broad policies for the whole bucket or restrict to folders. Example policies only for the `about/` folder (photo, summary, cv link):

```sql
-- READ
create policy if not exists "public read about" on storage.objects for select
using (bucket_id = 'profile-images' and name like 'about/%');

-- CREATE
create policy if not exists "public upload about" on storage.objects for insert
with check (bucket_id = 'profile-images' and name like 'about/%');

-- UPDATE
create policy if not exists "public update about" on storage.objects for update
using (bucket_id = 'profile-images' and name like 'about/%')
with check (bucket_id = 'profile-images' and name like 'about/%');

-- DELETE
create policy if not exists "public delete about" on storage.objects for delete
using (bucket_id = 'profile-images' and name like 'about/%');
```

If you want to allow uploads for project and certificate images too (recommended), add similar policies for `projects/%` and `certificates/%`, or create broad policies with `bucket_id = 'profile-images'`.

---

## Run and Build

Development server:
```bash
npm install
npm run dev
```

Production build:
```bash
npm run build
```
Artifacts will be in `dist/`.

---

## Troubleshooting

- 400 StorageApiError with "violates row-level security policy": add the Storage policies above.
- Changes to About not visible: hard refresh or ensure `profile-images` bucket is Public; Admin bumps a cache key so About should update instantly.
