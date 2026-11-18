import { redirect } from "next/navigation";
import { SettingsManager } from "@/components/management/SettingsManager";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export default async function PengaturanPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const [profileResult, transactionsCountResult, categoriesCountResult] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("nama, email")
        .eq("id", user.id)
        .maybeSingle(),
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
    email: profileResult.data?.email || user.email || "",
    nama:
      profileResult.data?.nama ||
      (typeof user.email === "string" ? user.email.split("@")[0] : "David"),
  };

  const stats = {
    totalTransactions: transactionsCountResult.count ?? 0,
    totalCategories: categoriesCountResult.count ?? 0,
  };

  return (
    <div className="mx-auto max-w-360">
      <SettingsManager user={profileData} stats={stats} />
    </div>
  );
}
