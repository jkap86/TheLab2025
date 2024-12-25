import { Pool } from "pg";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://postgres:password123@localhost:5432/postgres",
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
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

pool.on("acquire", () => {
  console.log("A client has been acquired from the pool.");
});

pool.on("release", () => {
  console.log("A client has been released from the pool.");
});

pool.on("remove", () => {
  console.log("A client has been removed from the pool.");
});

export default pool;
