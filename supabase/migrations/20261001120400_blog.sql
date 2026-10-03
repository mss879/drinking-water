-- =============================================================================
-- LUSAKO · 5/7 · Blog
-- -----------------------------------------------------------------------------
-- Blog posts written in the admin's rich-text editor (stored as Tiptap JSON) and
-- a public storage bucket for their images. Anyone can read a post once it is
-- published and its publish time has passed (so posts can be scheduled); only
-- admins can see drafts or write.
--
-- Needs 1/7 (admin access). Safe to run more than once.
-- =============================================================================

create table if not exists public.blog_posts (
  id              uuid primary key default gen_random_uuid(),
  title           text not null default '' check (char_length(title) <= 200),
  slug            text not null unique
                  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  -- Slugs this post was published under before; their URLs redirect here.
  previous_slugs  text[] not null default '{}',
  excerpt         text check (excerpt is null or char_length(excerpt) <= 400),
  content         jsonb not null default '{"type": "doc", "content": []}'::jsonb,
  cover_url       text,
  cover_alt       text check (cover_alt is null or char_length(cover_alt) <= 300),
  cover_width     integer check (cover_width is null or cover_width > 0),
  cover_height    integer check (cover_height is null or cover_height > 0),
  category        text check (category is null or char_length(category) <= 60),
  author_name     text not null default 'LUSAKO Team' check (char_length(author_name) between 1 and 80),
  status          text not null default 'draft' check (status in ('draft', 'published')),
  published_at    timestamptz,
  featured        boolean not null default false,
  seo_title       text check (seo_title is null or char_length(seo_title) <= 120),
  seo_description text check (seo_description is null or char_length(seo_description) <= 300),
  reading_minutes integer not null default 1 check (reading_minutes between 1 and 600),
  created_by      uuid default auth.uid() references auth.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint blog_posts_published_dated check (status = 'draft' or published_at is not null)
);

comment on table public.blog_posts is 'Blog posts. content is a Tiptap (ProseMirror) JSON document.';

create index if not exists blog_posts_published_idx on public.blog_posts (status, published_at desc);
create index if not exists blog_posts_previous_slugs_idx on public.blog_posts using gin (previous_slugs);
create index if not exists blog_posts_created_by_idx on public.blog_posts (created_by);

-- Publishing without a date publishes now; renaming a published post keeps its old URL alive.
create or replace function private.blog_post_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;

  if tg_op = 'UPDATE' and new.slug is distinct from old.slug and old.status = 'published' then
    new.previous_slugs := array(
      select distinct prior
      from unnest(array_append(new.previous_slugs, old.slug)) as prior
      where prior <> new.slug
    );
  end if;

  return new;
end;
$$;

revoke execute on function private.blog_post_fields() from public, anon, authenticated;

drop trigger if exists blog_posts_fields on public.blog_posts;
create trigger blog_posts_fields
  before insert or update on public.blog_posts
  for each row execute function private.blog_post_fields();

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function private.set_updated_at();

alter table public.blog_posts enable row level security;

grant select on table public.blog_posts to anon, authenticated;
grant insert, update, delete on table public.blog_posts to authenticated;

drop policy if exists "Anyone can read published posts" on public.blog_posts;
create policy "Anyone can read published posts"
  on public.blog_posts for select
  to anon, authenticated
  using (status = 'published' and published_at <= now());

drop policy if exists "Admins read every post" on public.blog_posts;
create policy "Admins read every post"
  on public.blog_posts for select
  to authenticated
  using ((select private.is_admin()));

drop policy if exists "Admins add posts" on public.blog_posts;
create policy "Admins add posts"
  on public.blog_posts for insert
  to authenticated
  with check ((select private.is_admin()));

drop policy if exists "Admins update posts" on public.blog_posts;
create policy "Admins update posts"
  on public.blog_posts for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

drop policy if exists "Admins delete posts" on public.blog_posts;
create policy "Admins delete posts"
  on public.blog_posts for delete
  to authenticated
  using ((select private.is_admin()));

-- ------------------------------------------------------------- images ----
-- A public bucket: anyone can view the images (they appear on the public blog), only
-- admins can upload, replace or delete them. Files go in <post id>/<random id>.<ext>.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-images',
  'blog-images',
  true,
  8388608, -- 8 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins upload blog images" on storage.objects;
create policy "Admins upload blog images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'blog-images' and (select private.is_admin()));

drop policy if exists "Admins update blog images" on storage.objects;
create policy "Admins update blog images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'blog-images' and (select private.is_admin()))
  with check (bucket_id = 'blog-images' and (select private.is_admin()));

drop policy if exists "Admins delete blog images" on storage.objects;
create policy "Admins delete blog images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'blog-images' and (select private.is_admin()));

drop policy if exists "Admins list blog images" on storage.objects;
create policy "Admins list blog images"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'blog-images' and (select private.is_admin()));
