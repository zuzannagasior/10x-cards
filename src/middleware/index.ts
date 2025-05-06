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

export const onRequest = defineMiddleware(async ({ cookies, url, request, redirect, locals }, next) => {
  // Create Headers object with cookie from request
  const headers = new Headers(request.headers);

  // Create Supabase instance with proper cookie handling
  const supabase = createSupabaseServerInstance({
    cookies,
    headers,
  });

  // Set supabase instance in locals for use in API routes
  locals.supabase = supabase;

  // Get user data with secure verification on Supabase Auth server
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Error getting user:", error.message);
  }

  // If user is authenticated, set user data in locals
  if (data.user) {
    locals.user = {
      id: data.user.id,
      email: data.user.email || null,
    };

    // If authenticated user tries to access public paths, redirect to /generate
    if (PUBLIC_PATHS.includes(url.pathname)) {
      return redirect("/generate");
    }

    return next();
  }

  // If path requires authentication and user is not authenticated, redirect to login
  if (!PUBLIC_PATHS.includes(url.pathname)) {
    return redirect("/login");
  }

  return next();
});
