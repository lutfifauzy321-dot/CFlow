import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";
import { DASHBOARD_PATHS } from "@/lib/constants";

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Variabel Supabase belum dikonfigurasi.");
  }

  const isAuthPage =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/register";
  const isDashboardPage = DASHBOARD_PATHS.some(
    (path) =>
      request.nextUrl.pathname === path ||
      request.nextUrl.pathname.startsWith(`${path}/`),
  );

  // Fast check: If user visits a dashboard page and has no Supabase auth cookies,
  // redirect immediately to login without waiting for an external Supabase round-trip.
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.includes("-auth-token") || c.name.startsWith("sb-"),
  );

  if (!hasAuthCookie && isDashboardPage) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(loginUrl);
  }

  const requestHeaders = new Headers(request.headers);
  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (user) {
    requestHeaders.set("x-user-id", user.id);
    requestHeaders.set("x-user-email", user.email ?? "");

    const newResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    response.cookies.getAll().forEach((cookie) => {
      newResponse.cookies.set(cookie);
    });

    response = newResponse;
  }

  if (!user && isDashboardPage) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthPage) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}
