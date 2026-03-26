import sql from "mssql";
import bcrypt from "bcrypt";
import { getPool } from "./_db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { fullName, password } = req.body;

  if (!fullName || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be 6+ chars" });
  }

  try {
    const pool = await getPool();

    const existingUser = await pool.request()
      .input("FullName", sql.NVarChar, fullName)
      .query(`SELECT UserId FROM SMCusers WHERE FullName = @FullName`);

    if (existingUser.recordset.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.request()
      .input("FullName", sql.NVarChar, fullName)
      .input("Password", sql.NVarChar, hashedPassword)
      .query(`INSERT INTO SMCusers (FullName, Password, IsActive, CreatedAt) VALUES (@FullName, @Password, 1, GETDATE())`);

    return res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
