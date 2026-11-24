import { redirect } from "next/navigation";
import { SettingsManager } from "@/components/management/SettingsManager";
import { createClient, getCurrentProfile, getCurrentUser } from "@/lib/supabase/server";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function PengaturanPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const [profile, transactionsCountResult, categoriesCountResult] =
    await Promise.all([
      getCurrentProfile(user.id),
      supabase
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("categories")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

  const profileData = {
    id: user.id,
    email: profile?.email || user.email || "",
    nama:
      profile?.nama ||
      (typeof user.email === "string" ? user.email.split("@")[0] : "Pengguna"),
    avatarUrl: profile?.avatar_url ?? null,
  };

  const stats = {
    totalTransactions: transactionsCountResult.count ?? 0,
    totalCategories: categoriesCountResult.count ?? 0,
  };

  const rawTab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const initialTab =
    rawTab === "security" || rawTab === "preferences" ? rawTab : "profile";

  return (
    <div className="mx-auto max-w-360">
      <SettingsManager user={profileData} stats={stats} initialTab={initialTab} />
    </div>
  );
}
