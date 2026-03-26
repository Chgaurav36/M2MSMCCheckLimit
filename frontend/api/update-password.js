import sql from "mssql";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getPool } from "./_db";

function verifyToken(req) {
  const auth = req.headers.authorization || "";
  const token = auth.split(" ")[1];
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current and new passwords are required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters" });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("UserId", sql.Int, user.userId)
      .query(`SELECT Password FROM SMCusers WHERE UserId = @UserId AND IsActive = 1`);

    const foundUser = result.recordset[0];
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, foundUser.Password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.request()
      .input("UserId", sql.Int, user.userId)
      .input("NewPassword", sql.NVarChar, hashedPassword)
      .query(`UPDATE SMCusers SET Password = @NewPassword WHERE UserId = @UserId`);

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
