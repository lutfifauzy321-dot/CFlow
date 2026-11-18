export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string;
          nama: string;
          email: string;
          avatar_url: string | null;
          created_at: string;
        },
        {
          id: string;
          nama: string;
          email: string;
          avatar_url?: string | null;
          created_at?: string;
        }
      >;
      categories: Table<
        {
          id: string;
          user_id: string;
          nama: string;
          tipe: "masuk" | "keluar";
          ikon: string;
          warna: string;
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          nama: string;
          tipe: "masuk" | "keluar";
          ikon?: string;
          warna?: string;
          created_at?: string;
        }
      >;
      transactions: Table<
        {
          id: string;
          user_id: string;
          category_id: string;
          tanggal: string;
          keterangan: string;
          tipe: "masuk" | "keluar";
          nominal: number;
          bukti_url?: string | null;
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          category_id: string;
          tanggal: string;
          keterangan: string;
          tipe: "masuk" | "keluar";
          nominal: number;
          bukti_url?: string | null;
          created_at?: string;
        }
      >;
      budgets: Table<
        {
          id: string;
          user_id: string;
          category_id: string;
          bulan: string;
          limit_nominal: number;
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          category_id: string;
          bulan: string;
          limit_nominal: number;
          created_at?: string;
        }
      >;
      savings_goals: Table<
        {
          id: string;
          user_id: string;
          nama: string;
          target_nominal: number;
          terkumpul: number;
          deadline: string;
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          nama: string;
          target_nominal: number;
          terkumpul?: number;
          deadline: string;
          created_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      get_dashboard_summary: {
        Args: { bulan: string };
        Returns: {
          total_saldo: number;
          total_pemasukan: number;
          total_pengeluaran: number;
          saldo_perubahan_persen: number | null;
          pemasukan_perubahan_persen: number | null;
          pengeluaran_perubahan_persen: number | null;
        }[];
      };
      add_saving_contribution: {
        Args: { p_goal_id: string; p_amount: number };
        Returns: {
          id: string;
          user_id: string;
          nama: string;
          target_nominal: number;
          terkumpul: number;
          deadline: string;
          created_at: string;
        };
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
