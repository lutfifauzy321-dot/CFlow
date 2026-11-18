import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export async function UserCard() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("nama, email")
    .eq("id", user.id)
    .maybeSingle();

  const name =
    profile?.nama ||
    (typeof user.email === "string" && user.email.split("@")[0]) ||
    "David Arnoldio";
  const email = profile?.email || user.email || "david@email.com";

  // Initials (e.g., "DA")
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "DA";

  return (
    <div className="flex items-center gap-3 px-1 py-1">
      {/* Avatar Pill matching mockup */}
      <div className="grid size-9.5 shrink-0 place-items-center rounded-full bg-white/20 text-xs font-bold tracking-tight text-white border border-white/20 shadow-xs">
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white leading-tight">
          {name}
        </p>
        <p className="truncate text-xs text-purple-200/70">{email}</p>
      </div>

      <form action={logoutAction}>
        <button
          type="submit"
          aria-label="Keluar"
          title="Keluar"
          className="grid size-8 shrink-0 place-items-center rounded-lg text-purple-200/70 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut size={16} />
        </button>
      </form>
    </div>
  );
}
