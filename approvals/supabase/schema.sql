-- Creneau Hospitality approvals: database, security rules and file storage.
-- Run this once in Supabase: SQL Editor > New query > paste > Run.

-- ---------------------------------------------------------------- people
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  full_name  text not null default '',
  role       text not null check (role in ('admin','approver','finance')),
  created_at timestamptz not null default now()
);

-- Returns the signed-in person's role. Used by every rule below.
create or replace function public.my_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

alter table public.profiles enable row level security;
drop policy if exists "read own profile or admin reads all" on public.profiles;
create policy "read own profile or admin reads all" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.my_role() = 'admin');
-- No insert/update/delete policies: only the admin-users function (service role) changes people.

-- -------------------------------------------------------------- requests
create table if not exists public.requests (
  id              uuid primary key default gen_random_uuid(),
  ref             text,
  kind            text not null check (kind in ('opex','hr')),
  venue_id        text not null check (venue_id in ('mm-ar','cargo','lpb','bbc','mm-ds')),
  title           text not null,
  description     text,
  hr_type         text check (hr_type in ('New Hire','Promotion','VISA Renewal')),
  amount          numeric(12,2),
  status          text not null default 'pending' check (status in ('pending','approved','changes','rejected')),
  comment         text,
  files           jsonb not null default '[]'::jsonb,   -- [{path,name,type,size}] in the private bucket
  history         jsonb not null default '[]'::jsonb,
  created_by      uuid not null default auth.uid() references auth.users (id),
  created_by_name text,
  decided_by      uuid,
  decided_by_name text,
  decided_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint opex_needs_amount check (kind <> 'opex' or amount > 0),
  constraint hr_needs_type check (kind <> 'hr' or hr_type is not null)
);
create index if not exists requests_status_idx on public.requests (status, created_at desc);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
drop trigger if exists requests_touch on public.requests;
create trigger requests_touch before update on public.requests
  for each row execute function public.touch_updated_at();

alter table public.requests enable row level security;

drop policy if exists "read requests" on public.requests;
create policy "read requests" on public.requests for select to authenticated
  using (
    public.my_role() in ('admin','approver')
    or (public.my_role() = 'finance' and status = 'approved')   -- Finance only ever sees approved
  );

drop policy if exists "admin submits" on public.requests;
create policy "admin submits" on public.requests for insert to authenticated
  with check (public.my_role() = 'admin' and status = 'pending' and created_by = auth.uid());

drop policy if exists "admin edits open requests" on public.requests;
create policy "admin edits open requests" on public.requests for update to authenticated
  using (public.my_role() = 'admin' and status in ('pending','changes','rejected'))
  with check (public.my_role() = 'admin' and status = 'pending');   -- an admin can never approve

drop policy if exists "admin withdraws pending" on public.requests;
create policy "admin withdraws pending" on public.requests for delete to authenticated
  using (public.my_role() = 'admin' and status = 'pending');

-- The approver decides only through this function, so they cannot alter amounts or details.
create or replace function public.decide_request(p_id uuid, p_status text, p_comment text default null)
returns void language plpgsql security definer set search_path = public as $$
declare
  r  public.requests;
  nm text;
  ts bigint := (extract(epoch from now()) * 1000)::bigint;
begin
  if public.my_role() <> 'approver' then
    raise exception 'Only the approver can decide requests';
  end if;
  select * into r from public.requests where id = p_id for update;
  if not found then raise exception 'Request not found'; end if;
  select coalesce(nullif(full_name, ''), email) into nm from public.profiles where id = auth.uid();

  if p_status in ('approved','changes','rejected') then
    if r.status <> 'pending' then raise exception 'This request is no longer pending'; end if;
    if p_status <> 'approved' and coalesce(trim(p_comment), '') = '' then
      raise exception 'A note is required';
    end if;
    update public.requests set
      status = p_status,
      comment = case when p_status = 'approved' then null else trim(p_comment) end,
      decided_by = auth.uid(), decided_by_name = nm, decided_at = now(),
      history = history || jsonb_build_array(jsonb_build_object(
        't', ts, 'by', auth.uid(), 'by_name', nm,
        'a', case p_status when 'approved' then 'approved' when 'changes' then 'changes requested' else 'rejected' end,
        'n', coalesce(trim(p_comment), '')))
    where id = p_id;
  elsif p_status = 'pending' then   -- undo your own approval
    if r.status <> 'approved' or r.decided_by is distinct from auth.uid() then
      raise exception 'Only your own approval can be undone';
    end if;
    update public.requests set
      status = 'pending', comment = null, decided_by = null, decided_by_name = null, decided_at = null,
      history = history || jsonb_build_array(jsonb_build_object('t', ts, 'by', auth.uid(), 'by_name', nm, 'a', 'approval undone', 'n', ''))
    where id = p_id;
  else
    raise exception 'Invalid status';
  end if;
end $$;
revoke all on function public.decide_request(uuid, text, text) from public, anon;
grant execute on function public.decide_request(uuid, text, text) to authenticated;

-- Live updates in the browser.
do $$ begin
  alter publication supabase_realtime add table public.requests;
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------- file storage
insert into storage.buckets (id, name, public, file_size_limit)
values ('request-files', 'request-files', false, 20971520)   -- private, 20 MB per file
on conflict (id) do nothing;

drop policy if exists "admin uploads files" on storage.objects;
create policy "admin uploads files" on storage.objects for insert to authenticated
  with check (bucket_id = 'request-files' and public.my_role() = 'admin');

drop policy if exists "admin deletes files" on storage.objects;
create policy "admin deletes files" on storage.objects for delete to authenticated
  using (bucket_id = 'request-files' and public.my_role() = 'admin');

drop policy if exists "read files" on storage.objects;
create policy "read files" on storage.objects for select to authenticated
  using (
    bucket_id = 'request-files' and (
      public.my_role() in ('admin','approver')
      or (public.my_role() = 'finance' and exists (
            select 1 from public.requests r
            where r.status = 'approved'
              and exists (select 1 from jsonb_array_elements(r.files) f where f ->> 'path' = storage.objects.name)))
    )
  );

-- ------------------------------------------------------- first admin (Dries)
-- 1) Create Dries in Authentication > Users > Add user (tick "Auto Confirm User").
-- 2) Then run this line once:
-- insert into public.profiles (id, email, full_name, role)
-- select id, email, 'Dries Vande Velde', 'admin' from auth.users where email = 'dries@creneau.com';
