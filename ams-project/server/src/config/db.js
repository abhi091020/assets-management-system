//src\config\db.js
import sql from "mssql";
import "dotenv/config";

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_CERT === "true",
    enableArithAbort: true,
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
};

let pool;

export const connectDB = async () => {
  try {
    pool = await sql.connect(config);
    console.log("✅ MSSQL Connected Successfully");
    return pool;
  } catch (err) {
    console.error("❌ DB Connection Failed:", err.message);
    process.exit(1);
  }
};

export const getPool = () => {
  if (!pool) throw new Error("DB not initialized");
  return pool;
};

export { sql };
