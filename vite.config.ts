import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: { preset: "vercel" },
  vite: {
    base: "/",
    server: { allowedHosts: ["demo.sourapps.com", "localhost", "127.0.0.1"] },
    preview: { allowedHosts: ["demo.sourapps.com", "localhost", "127.0.0.1"] },
  },
});
