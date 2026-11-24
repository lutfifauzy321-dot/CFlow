import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { getCurrentProfile, getCurrentUser } from "@/lib/supabase/server";

export async function UserCard() {
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await getCurrentProfile(user.id);

  const name =
    profile?.nama ||
    (typeof user.email === "string" && user.email.split("@")[0]) ||
    "Pengguna";
  const email = profile?.email || user.email || "";
  const avatarUrl = profile?.avatar_url;

  const initials =
    name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "CF";

  return (
    <div className="flex items-center gap-3 px-1 py-1">
      {avatarUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={avatarUrl}
          alt={name}
          className="size-9.5 shrink-0 rounded-full object-cover border border-white/30 shadow-xs"
        />
      ) : (
        <div className="grid size-9.5 shrink-0 place-items-center rounded-full bg-white/20 text-xs font-bold tracking-tight text-white border border-white/20 shadow-xs">
          {initials}
        </div>
      )}

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
