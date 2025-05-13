import { SUPABASE_KEY, SUPABASE_URL } from "astro:env/server";

import { createServerClient } from "@supabase/ssr";

import type { AstroCookies } from "astro";
import type { Database } from "./database.types";
import type { SupabaseClient } from "../db/supabase.client";
function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  if (!cookieHeader) return [];

  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

export const createSupabaseServerInstance = (context: {
  cookies: AstroCookies;
  headers: Headers;
}): SupabaseClient<Database> => {
  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        const cookieHeader = context.headers.get("cookie") || "";
        return parseCookieHeader(cookieHeader);
      },
      setAll(cookies) {
        cookies.forEach(({ name, value, options }) => {
          context.cookies.set(name, value, {
            path: "/",
            ...options,
            // Always set httpOnly, secure and sameSite for security
            httpOnly: true,
            secure: true,
            sameSite: "lax",
          });
        });
      },
    },
  });

  return supabase;
};
