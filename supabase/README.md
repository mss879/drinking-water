# Supabase — the website's backend

The admin at **/admin** (dashboard, inquiries, CRM pipeline, web analytics, and the Website section: products, parts,
client logos, photos, contact details and the blog) runs on Supabase: its database, sign-in and file storage. The public
website keeps working without it; forms then go to `LEAD_WEBHOOK_URL` (or the server log), the blog shows an empty
state and every page shows the built-in content from `content/`.

## Set it up (about 10 minutes)

1. **Create a project** at [supabase.com](https://supabase.com) (or open the client's). For Sri Lanka, choose the
   Mumbai (`ap-south-1`) or Singapore region. Use the Pro plan for the live site: free projects pause after a week
   without activity.
2. **Run the migrations.** In the dashboard, open **SQL Editor** and run each file in `migrations/` **in order**:

   | File | Adds |
   | --- | --- |
   | `20261001120000_admin_access.sql` | the admin list and the shared access check |
   | `20261001120100_inquiries.sql` | inquiries from the website's forms (live updates for the unread badge) |
   | `20261001120200_crm.sql` | pipeline stages (New Leads fixed first), leads and their timeline |
   | `20261001120300_web_analytics.sql` | visits, page views, events, Web Vitals and the report functions |
   | `20261001120400_blog.sql` | blog posts and the public `blog-images` storage bucket |
   | `20261001120500_dashboard.sql` | the dashboard's summary function |
   | `20261003120000_website_content.sql` | the Website section: products, parts, client logos, settings (contact, social, photos, AMC prices) and the public `site-media` bucket, starting from what the website shows |

   Each file can safely be run again. If you use the Supabase CLI instead, `supabase db push` applies them in order.
3. **Create the admin account.** Authentication → Users → **Add user** → email and password, tick
   **Auto Confirm User**.
4. **Make it an admin.** Put that email in `setup-admin.sql` (where it says `you@example.com`) and run it in the SQL
   editor. It answers with the email it added. Run it again with another email to add more admins. To remove one:
   `delete from public.admin_users where email = 'their@email';`
5. **Close public sign-ups (recommended).** Authentication → Sign In / Providers → turn off **Allow new users to sign
   up**. Only admin-listed accounts can see anything anyway, but there's no reason to let strangers create accounts.
6. **Connect the website.** Project Settings → API Keys, then set these in `.env.local` and in the hosting
   provider's environment settings, and redeploy:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_…
   SUPABASE_SECRET_KEY=sb_secret_…        # server only
   ```

7. Sign in at **/admin/login**. `/admin/setup` shows what's still missing if something isn't connected.

## How access works

- Every table has row level security. Admins (the `admin_users` list) can read and change everything; anyone else,
  signed in or not, sees nothing, except what the website shows publicly: published blog posts, published products,
  parts and logos, and the site settings (contact details, social links, photos and AMC prices).
- The website writes inquiries and analytics from the server with the secret key; browsers never write to the
  database directly. Visitors get no account and no cookie.
- Since mid-2026 Supabase no longer grants new tables to the API roles automatically, so the migrations grant exactly
  what each role needs.

## Changing the schema later

Don't edit a migration that has already run (re-running `create table if not exists` won't add new columns).
Add a new file instead, named with a later timestamp, e.g. `20261101090000_add_lead_tags.sql`, using
`alter table … add column if not exists …`. Then update `lib/supabase/types.ts`, or regenerate it with
`npx supabase gen types typescript --project-id <project-ref> --schema public > lib/supabase/types.ts`.

## Keeping analytics small

Visit data grows with traffic. **Web analytics → Keep visit data for…** deletes visits older than 6, 12, 13 or 24
months. To do it automatically, enable the `pg_cron` extension and schedule
`select public.analytics_purge(now() - interval '13 months');` weekly (see the comment in the analytics migration).

## Where the data goes from the site

| What | Where |
| --- | --- |
| Form submissions | `app/actions/leads.ts` → `inquiries`, then `LEAD_WEBHOOK_URL` if set |
| Visits, clicks, Web Vitals | `components/analytics/tracker.tsx` → `/api/visit` → `analytics_ingest()` |
| Blog | `lib/blog/queries.ts` (cached; refreshed when a post is saved) |
| Products, parts, logos, photos, contact details, AMC prices | `lib/cms/content.ts` (cached under the `cms` tag; refreshed whenever the admin saves; falls back to `content/`) |
