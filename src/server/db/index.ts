/** biome-ignore-all lint/performance/noNamespaceImport: <neccessary> */
import { neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@/server/db/schema";

neonConfig.webSocketConstructor = ws;

export const db = drizzle({
  connection: process.env.DATABASE_URL || "",
  ws,
  schema,
});
