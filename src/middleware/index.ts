import { defineMiddleware } from "astro:middleware";

import { createSupabaseServerInstance } from "../db/supabase.server";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/reset-password",
  "/forgot-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
  "/api/auth/forgot-password",
];

export const onRequest = defineMiddleware(async ({ cookies, url, redirect, locals }, next) => {
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: new Headers({ cookie: cookies.toString() }),
  });

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Set supabase instance in locals for use in API routes
  locals.supabase = supabase;

  if (user) {
    locals.user = {
      id: user.id,
      email: user.email,
    };
  } else if (!PUBLIC_PATHS.includes(url.pathname)) {
    return redirect("/login");
  }

  return next();
});
