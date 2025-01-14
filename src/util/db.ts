import { Pool } from 'pg';
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/node-postgres";

const client = new Pool({
  connectionString: process.env.DATABASE_URL,
});


export const db = drizzle(client, { schema });