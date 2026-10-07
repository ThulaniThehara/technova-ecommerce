import { defineConfig } from "prisma/config";

// Prisma 7 does not load .env on its own. Next.js does, but the Prisma CLI
// (migrate, seed, studio) runs outside Next, so load it here. On Vercel there
// is no .env file - variables come from the dashboard - hence the try/catch.
try {
  process.loadEnvFile(".env");
} catch {}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations need a direct (non-pooled) Neon connection when available;
    // the app itself uses DATABASE_URL at runtime (see lib/prisma.ts).
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
