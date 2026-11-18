import { createClient } from "@/lib/supabase/server";
import type { SavingsGoal } from "@/types";

export async function getSavingsGoals(userId: string) {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("savings_goals")
		.select("id, nama, target_nominal, terkumpul, deadline")
		.eq("user_id", userId)
		.order("deadline", { ascending: true });

	if (error) throw new Error("Target tabungan gagal dimuat.");

	return (data ?? []) as SavingsGoal[];
}
