import { drizzle } from "drizzle-orm/neon-http";

const dbURL = process.env.DATABASE_URL;

if (!dbURL) {
  // biome-ignore lint/suspicious/noConsole: <necessary>
  console.error("No database URL");
}

export const db = drizzle(dbURL as string);
