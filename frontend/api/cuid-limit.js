import sql from "mssql";
import { getPool } from "./_db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { partyCode } = req.body;

  if (!partyCode) {
    return res.status(400).json({ message: "PartyCode is required" });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("PartyCode", sql.VarChar, partyCode)
      .execute("sp_GetAvailableCuidLimit_ByPartyCode");

    return res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}
