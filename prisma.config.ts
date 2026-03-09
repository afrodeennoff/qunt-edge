import "dotenv/config";
import { defineConfig } from "prisma/config";

const rawUrl =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  "postgresql://postgres:postgres@localhost:5432/postgres";

// Strip potential quotes that might have been added in .env or environmental overrides
const databaseUrl = rawUrl.replace(/^"(.*)"$/, '$1');

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // `prisma generate` does not require a live DB connection; keep installs reproducible.
    url: databaseUrl,
  },
  //   experimental: {
  //     externalTables: true,
  //   },
  //   tables: {
  //     external: ["public.users"],
  //   },
  //   enums: {
  //     external: ["public.role"],
  //   },
});
