import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit ne lit pas .env.local tout seul.
config({ path: ".env.local" });

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "postgres://placeholder" },
});
