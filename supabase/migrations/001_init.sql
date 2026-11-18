create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nama text not null,
  email text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nama text not null,
  tipe text not null check (tipe in ('masuk', 'keluar')),
  ikon text not null default 'circle-ellipsis',
  warna text not null default '#64748B',
  created_at timestamptz not null default now(),
  unique (id, user_id),
  unique (user_id, nama, tipe)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null,
  tanggal date not null,
  keterangan text not null,
  tipe text not null check (tipe in ('masuk', 'keluar')),
  nominal bigint not null check (nominal > 0),
  created_at timestamptz not null default now(),
  foreign key (category_id, user_id)
    references public.categories (id, user_id) on delete restrict
);

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null,
  bulan date not null check (bulan = date_trunc('month', bulan)::date),
  limit_nominal bigint not null check (limit_nominal > 0),
  created_at timestamptz not null default now(),
  foreign key (category_id, user_id)
    references public.categories (id, user_id) on delete cascade,
  unique (user_id, category_id, bulan)
);

create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nama text not null,
  target_nominal bigint not null check (target_nominal > 0),
  terkumpul bigint not null default 0 check (terkumpul >= 0),
  deadline date not null,
  created_at timestamptz not null default now()
);

create index transactions_user_tanggal_idx
  on public.transactions (user_id, tanggal desc);
create index transactions_user_category_idx
  on public.transactions (user_id, category_id);
create index budgets_user_bulan_idx
  on public.budgets (user_id, bulan);
create index savings_goals_user_idx
  on public.savings_goals (user_id);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_goals enable row level security;

create policy "Pengguna mengelola profil sendiri"
  on public.profiles for all
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Pengguna mengelola kategori sendiri"
  on public.categories for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Pengguna mengelola transaksi sendiri"
  on public.transactions for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Pengguna mengelola anggaran sendiri"
  on public.budgets for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Pengguna mengelola target tabungan sendiri"
  on public.savings_goals for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create function public.seed_default_categories()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.categories (user_id, nama, tipe, ikon, warna)
  values
    (new.id, 'Makanan & Minuman', 'keluar', 'utensils', '#F59E0B'),
    (new.id, 'Transportasi', 'keluar', 'car', '#3B82F6'),
    (new.id, 'Belanja', 'keluar', 'shopping-bag', '#EC4899'),
    (new.id, 'Hiburan', 'keluar', 'clapperboard', '#8B5CF6'),
    (new.id, 'Gaji', 'masuk', 'wallet', '#10B981'),
    (new.id, 'Lainnya', 'keluar', 'circle-ellipsis', '#64748B');

  return new;
end;
$$;

create trigger on_profile_created_seed_categories
  after insert on public.profiles
  for each row execute procedure public.seed_default_categories();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, nama, email, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'nama',
      new.raw_user_meta_data ->> 'full_name',
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'avatar_url'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create function public.get_dashboard_summary(bulan date)
returns table (
  total_saldo bigint,
  total_pemasukan bigint,
  total_pengeluaran bigint,
  saldo_perubahan_persen numeric,
  pemasukan_perubahan_persen numeric,
  pengeluaran_perubahan_persen numeric
)
language plpgsql
stable
security invoker
set search_path = public, pg_temp
as $$
declare
  awal_bulan date := date_trunc('month', $1)::date;
  awal_bulan_sebelumnya date := (date_trunc('month', $1) - interval '1 month')::date;
  awal_bulan_berikutnya date := (date_trunc('month', $1) + interval '1 month')::date;
  saldo_sebelumnya numeric;
  pemasukan_sebelumnya numeric;
  pengeluaran_sebelumnya numeric;
  saldo_saat_ini numeric;
  pemasukan_saat_ini numeric;
  pengeluaran_saat_ini numeric;
begin
  select
    coalesce(sum(t.nominal) filter (
      where t.tipe = 'masuk' and t.tanggal < awal_bulan_berikutnya
    ), 0)
    - coalesce(sum(t.nominal) filter (
      where t.tipe = 'keluar' and t.tanggal < awal_bulan_berikutnya
    ), 0),
    coalesce(sum(t.nominal) filter (
      where t.tipe = 'masuk'
        and t.tanggal >= awal_bulan
        and t.tanggal < awal_bulan_berikutnya
    ), 0),
    coalesce(sum(t.nominal) filter (
      where t.tipe = 'keluar'
        and t.tanggal >= awal_bulan
        and t.tanggal < awal_bulan_berikutnya
    ), 0),
    coalesce(sum(t.nominal) filter (
      where t.tipe = 'masuk' and t.tanggal < awal_bulan
    ), 0)
    - coalesce(sum(t.nominal) filter (
      where t.tipe = 'keluar' and t.tanggal < awal_bulan
    ), 0),
    coalesce(sum(t.nominal) filter (
      where t.tipe = 'masuk'
        and t.tanggal >= awal_bulan_sebelumnya
        and t.tanggal < awal_bulan
    ), 0),
    coalesce(sum(t.nominal) filter (
      where t.tipe = 'keluar'
        and t.tanggal >= awal_bulan_sebelumnya
        and t.tanggal < awal_bulan
    ), 0)
  into
    saldo_saat_ini,
    pemasukan_saat_ini,
    pengeluaran_saat_ini,
    saldo_sebelumnya,
    pemasukan_sebelumnya,
    pengeluaran_sebelumnya
  from public.transactions as t
  where t.user_id = (select auth.uid())
    and t.tanggal < awal_bulan_berikutnya;

  return query
  select
    saldo_saat_ini::bigint,
    pemasukan_saat_ini::bigint,
    pengeluaran_saat_ini::bigint,
    case
      when saldo_sebelumnya = 0 and saldo_saat_ini = 0 then 0
      when saldo_sebelumnya = 0 then null
      else round((saldo_saat_ini - saldo_sebelumnya) * 100 / abs(saldo_sebelumnya), 2)
    end,
    case
      when pemasukan_sebelumnya = 0 and pemasukan_saat_ini = 0 then 0
      when pemasukan_sebelumnya = 0 then null
      else round((pemasukan_saat_ini - pemasukan_sebelumnya) * 100 / pemasukan_sebelumnya, 2)
    end,
    case
      when pengeluaran_sebelumnya = 0 and pengeluaran_saat_ini = 0 then 0
      when pengeluaran_sebelumnya = 0 then null
      else round((pengeluaran_saat_ini - pengeluaran_sebelumnya) * 100 / pengeluaran_sebelumnya, 2)
    end;
end;
$$;

revoke all on function public.get_dashboard_summary(date) from public;
grant execute on function public.get_dashboard_summary(date) to authenticated;
