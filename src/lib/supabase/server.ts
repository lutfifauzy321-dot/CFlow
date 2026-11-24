import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import type { Database } from "@/types/database.types";

export const createClient = cache(async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Variabel Supabase belum dikonfigurasi.");
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies; middleware refreshes the session.
        }
      },
    },
  });
});

export type AuthUser = {
  id: string;
  email: string;
};

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  try {
    const headerList = await headers();
    const userId = headerList.get("x-user-id");
    const userEmail = headerList.get("x-user-email");
    if (userId) {
      return { id: userId, email: userEmail ?? "" };
    }
  } catch {
    // If headers() is called outside request context
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  return { id: user.id, email: user.email ?? "" };
});

export const getCurrentProfile = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("nama, email, avatar_url")
    .eq("id", userId)
    .maybeSingle();
  return data;
});
