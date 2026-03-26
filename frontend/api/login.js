import sql from "mssql";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getPool } from "./_db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { fullName, password } = req.body;

  if (!fullName || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const pool = await getPool();

    const result = await pool.request()
      .input("FullName", sql.NVarChar, fullName)
      .query(`SELECT * FROM SMCusers WHERE FullName = @FullName AND IsActive = 1`);

    const user = result.recordset[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.UserId, fullName: user.FullName },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: { userId: user.UserId, fullName: user.FullName }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
