import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 30,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
});

pool.on("connect", () => {
  console.log("Database connected successfully.");
});

pool.on("error", (err) => {
  console.log("Database pool error: " + err.message);
});

pool.on("remove", () => {
  console.log("A client has been removed from the pool.");
});

export default pool;
