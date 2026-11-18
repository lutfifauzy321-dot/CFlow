-- Migration: Tambah kolom bukti_url untuk struk/nota/bukti transaksi
alter table public.transactions add column if not exists bukti_url text;

