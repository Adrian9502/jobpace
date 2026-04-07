import { Pool } from "pg";

const isDev = process.env.NODE_ENV !== "production";

// Use local DB if in dev mode, otherwise use production DB
// might need to start docker with `docker-compose up` for local development to work, and ensure .env.local is properly set up with DATABASE_URL_LOCAL
const connectionString = isDev
  ? process.env.DATABASE_URL_LOCAL
  : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Database URL is not defined in environment variables.");
}

const pool = new Pool({
  connectionString,
  ssl: isDev ? false : { rejectUnauthorized: false }, // SSL only for production
});

export default pool;
