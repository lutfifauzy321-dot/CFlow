export type TransactionType = "masuk" | "keluar";

export interface Category {
  id: string;
  nama: string;
  tipe: TransactionType;
  ikon: string;
  warna: string;
}

export interface Transaction {
  id: string;
  category_id: string;
  tanggal: string;
  keterangan: string;
  tipe: TransactionType;
  nominal: number;
  bukti_url?: string | null;
}

export interface Budget {
  id: string;
  category_id: string;
  bulan: string;
  limit_nominal: number;
}

export interface SavingsGoal {
  id: string;
  nama: string;
  target_nominal: number;
  terkumpul: number;
  deadline: string;
}
