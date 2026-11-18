import { redirect } from "next/navigation";
import { SavingsGoalsManager } from "@/components/management/SavingsGoalsManager";
import { getCurrentUser } from "@/lib/supabase/server";
import { getSavingsGoals } from "@/services/saving.service";

export default async function TargetTabunganPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const goals = await getSavingsGoals(user.id);

  return (
    <div className="mx-auto max-w-360 space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Rencana masa depan</p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">Target tabungan</h1>
        <p className="mt-1.5 text-sm text-muted">Buat tujuan, pantau progres, dan catat setoranmu.</p>
      </div>
      <SavingsGoalsManager goals={goals} />
    </div>
  );
}
