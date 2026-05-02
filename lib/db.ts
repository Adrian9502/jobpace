import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const isDev = process.env.NODE_ENV !== "production";

const connectionString = isDev
  ? process.env.DATABASE_URL_LOCAL
  : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Database URL is not defined in environment variables.");
}

export const pool = new Pool({
  connectionString,
  ssl: isDev
    ? false
    : {
        rejectUnauthorized: true,
      },
});

export const db = drizzle(pool, { schema });

export default pool;
