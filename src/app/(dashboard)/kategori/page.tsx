import { redirect } from "next/navigation";
import { CategoryManager } from "@/components/management/CategoryManager";
import { getCurrentUser } from "@/lib/supabase/server";
import { getCategories } from "@/services/category.service";

export default async function KategoriPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const categories = await getCategories(user.id);

  return (
    <div className="mx-auto max-w-360 space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Pengelompokan transaksi</p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">Kategori</h1>
        <p className="mt-1.5 text-sm text-muted">Sesuaikan kategori untuk mencatat arus uangmu.</p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
