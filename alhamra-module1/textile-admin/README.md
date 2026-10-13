# Al-Hamra Textile — Module 1: System Administration

The Module 1 front-end is built with **Next.js 14 + Tailwind**. It uses **Supabase** for the database and logins, and deploys on **Vercel**.

**Screens:** Log in, Dashboard, Users (create, edit, deactivate/reactivate, assign role and department), Departments (add, edit), Processing Targets (target hours for each stage), Roles & Permissions (view only), Log out.

---

## 1. Set up Supabase (about 5 minutes)

1. Create a project at https://supabase.com. Save the database password somewhere safe.
2. Open **SQL Editor → New query**. Paste in all of `supabase/schema.sql`, then click **Run**.
   This creates the tables, the security rules, the 5 roles, the permission matrix, 6 departments and 5 production stages.
3. Create your own admin login: go to **Authentication → Users → Add user → Create new user**.
   Enter your email and a password, and tick **Auto Confirm User**.
4. Open `supabase/create_first_admin.sql`. Change the email (and name) to yours, then **Run** it in the SQL Editor.
5. Go to **Project Settings → API** and copy these 3 values:
   - Project URL
   - `anon` `public` key
   - `service_role` key (this one is secret)

## 2. Run it on your computer (optional)

```bash
cp .env.example .env.local   # paste the 3 values into this file
npm install
npm run dev                  # open http://localhost:3000
```

## 3. Deploy to Vercel

1. Push this folder to a GitHub repository.
2. At https://vercel.com, click **Add New → Project** and import that repository. Vercel detects that it's a Next.js app.
3. Under **Environment Variables**, add:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key |

4. Click **Deploy**. Then open the URL Vercel gives you and log in with the admin account from step 1.

---

## How it works

- **Logins:** Supabase Auth stores passwords as hashes. The `public.users` table holds each person's name, role, department and active status.
- **Creating or deactivating a user** runs on the server, inside Next.js server actions. That's where the service-role key is used, so it never reaches the browser. A deactivated user is also banned in Supabase Auth, so they can't log in.
- **Security:** Row Level Security is turned on for every table. Any logged-in user can read the data, but only an active **System Admin** can change it.
- **Other roles:** only the admin area exists in Module 1. Anyone else who logs in sees a "your screens are coming in the next module" page.
- **Processing targets** are stored in `production_stages.target_duration_hrs`. Module 3 will compare actual stage times against them to flag delays.

## Project layout

```
app/login              login page
app/(admin)/dashboard  overview
app/(admin)/users      user management
app/(admin)/departments
app/(admin)/targets    processing targets
app/(admin)/roles      roles & permissions matrix
app/(admin)/actions.ts all create/update logic (server-side, admin-checked)
supabase/*.sql         database schema + seed + first-admin script
```
