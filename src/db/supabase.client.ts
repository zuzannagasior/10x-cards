import { SUPABASE_KEY, SUPABASE_URL } from "astro:env/server";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";
const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
