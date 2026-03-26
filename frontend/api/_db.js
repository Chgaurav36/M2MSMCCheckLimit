import sql from "mssql";

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: Number(process.env.DB_PORT || 1433),
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

let poolPromise;

export function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(config).then((pool) => {
      console.log("✅ SQL Server Connected (serverless)");
      return pool;
    }).catch((err) => {
      console.error("🔴 DB connection error", err);
      throw err;
    });
  }
  return poolPromise;
}
