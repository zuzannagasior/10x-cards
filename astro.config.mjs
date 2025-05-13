// @ts-check
import { defineConfig, envField } from "astro/config";

import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  integrations: [react(), sitemap()],
  server: {
    port: 3000,
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
      // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
      alias: import.meta.env.PROD
        ? {
            "react-dom/server": "react-dom/server.edge",
          }
        : {},
    },
  },
  experimental: {
    session: true,
  },
  env: {
    schema: {
      SUPABASE_URL: envField.string({ context: "server", access: "public" }),
      SUPABASE_KEY: envField.string({ context: "server", access: "secret" }),
      OPENROUTER_API_KEY: envField.string({ context: "server", access: "secret" }),
      OPENROUTER_BASE_URL: envField.string({ context: "server", access: "public" }),
    },
  },
});
