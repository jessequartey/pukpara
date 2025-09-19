import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/server/db/schema';

const db = drizzle(process.env.DATABASE_URL || "", {schema});

