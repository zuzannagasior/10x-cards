import type { Database } from "../../src/db/database.types";
import { test as teardown } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

teardown("cleanup database", async () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY || !process.env.E2E_USERNAME_ID) {
    console.error("Missing required environment variables!");
    return;
  }

  const supabase = createClient<Database>(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  try {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      email: process.env.E2E_USERNAME!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      password: process.env.E2E_PASSWORD!,
    });

    if (signInError) {
      throw signInError;
    }

    const userId = process.env.E2E_USERNAME_ID;
    // Now try to delete the data
    const { error: flashcardsError } = await supabase.from("flashcards").delete().eq("user_id", userId);

    if (flashcardsError) {
      throw flashcardsError;
    }

    const { error: generationSessionsError } = await supabase
      .from("generation_sessions")
      .delete()
      .eq("user_id", userId);

    if (generationSessionsError) {
      throw generationSessionsError;
    }

    const { error: errorLogsError } = await supabase
      .from("generation_session_error_logs")
      .delete()
      .eq("user_id", userId);

    if (errorLogsError) {
      throw errorLogsError;
    }
  } catch (error) {
    console.error("Error during database cleanup:", error);
  }
});
