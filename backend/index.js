import express from "express";
import sql from "mssql";
//import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ✅ SQL SERVER CONFIG
const config = {
  user: "sa",
  password: "YouAreCaughtSayHelloToMyASS",   
  server: "123.108.43.250",
  port: 14330,                 
  database: "Money2Me",
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

// ✅ CONNECT TO DATABASE
sql.connect(config)
  .then(() => console.log("✅ SQL Server Connected"))
  .catch(err => console.log("❌ DB Error:", err));


// ✅ SAMPLE API GET SMCUsers
// app.get("/user", async (req, res) => {
//   try {
//     const result = await sql.query("SELECT * from userdetails order by UserID");
//     res.json(result.recordset);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.post("/adduser", async (req, res) => {
//   try {
//     const { UserName, Password } = req.body;

//     if (!UserName || !Password) {
//       return res.status(400).json({ message: "All fields required" });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(Password, 10);

//     const request = new sql.Request();

//     await request
//       .input("UserName", sql.VarChar, UserName)
//       .input("Password", sql.NVarChar, hashedPassword)
//       .query(`INSERT INTO SMCUsers (FullName, Password, IsActive, CreatedAt) VALUES (@UserName, @Password, 1, GETDATE())`);

//     res.status(201).json({ message: "User Added Successfully" });

//   } catch (err) {
//     if (err.number === 2627) {
//       return res.status(400).json({ message: "Username already exists" });
//     }

//     res.status(500).json({ error: err.message });
//   }
// });

// app.get("/css", async (req, res) => {
//   try {
//     const result = await sql.query("SELECT * from userdetails36 where userno = 12");
//     res.json(result.recordset);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// ================= SIGNUP =================
app.post("/signup", async (req, res) => {
  try {
    const { fullName, password } = req.body;

    // ✅ Validation
    if (!fullName || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be 6+ chars" });
    }

    const pool = await sql.connect(config);

    // Check existing user
    const existingUser = await pool.request()
      .input("FullName", sql.NVarChar, fullName)
      .query(`SELECT UserId FROM SMCUsers WHERE FullName = @FullName`);

    if (existingUser.recordset.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    // 🔐 Hash password
    //const hashedPassword = await bcrypt.hash(password, 10);

    // Insert
    await pool.request()
      .input("FullName", sql.NVarChar, fullName)
      .input("Password", sql.NVarChar, password) // Store plain password (not recommended)
      .query(`
        INSERT INTO SMCUsers (FullName, Password, IsActive, CreatedAt)
        VALUES (@FullName, @Password, 1, GETDATE())
      `);

    res.status(201).json({ message: "User created successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// ================= LOGIN =================
app.post("/login", async (req, res) => {
  try {
    const { fullName, password } = req.body;

    if (!fullName || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const pool = await sql.connect(config);

    const result = await pool.request()
      .input("FullName", sql.NVarChar, fullName)
      .query(`SELECT * FROM SMCUsers WHERE FullName = @FullName AND IsActive = 1`);

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔐 Compare password
    //const isMatch = await bcrypt.compare(password, user.Password);

    if (password !== user.Password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔑 Generate JWT
    const token = jwt.sign(
      { userId: user.UserId, fullName: user.FullName },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        userId: user.UserId,
        fullName: user.FullName
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// ================= PROTECTED ROUTE =================
app.get("/profile", verifyToken, (req, res) => {
  res.json({ message: "Protected data", user: req.user });
});

// ================= UPDATE PASSWORD =================
app.put("/update-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { userId } = req.user;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new passwords are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const pool = await sql.connect(config);

    const userResult = await pool.request()
      .input("UserId", sql.Int, userId)
      .query(`SELECT Password FROM SMCusers WHERE UserId = @UserId AND IsActive = 1`);

    const user = userResult.recordset[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //const match = await bcrypt.compare(currentPassword, user.Password);
    if (currentPassword !== user.Password) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    //const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.request()
      .input("UserId", sql.Int, userId)
      .input("NewPassword", sql.NVarChar, newPassword) // Store plain password (not recommended)
      .query(`UPDATE SMCusers SET Password = @NewPassword WHERE UserId = @UserId`);

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

function verifyToken(req, res, next) {
  const bearer = req.headers["authorization"];

  if (!bearer) return res.sendStatus(403);

  const token = bearer.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);

    req.user = decoded;
    next();
  });
}

app.post("/api/cuid-limit", async (req, res) => {
  try {
    const { partyCode } = req.body;

    if (!partyCode) {
      return res.status(400).json({ message: "PartyCode is required" });
    }

    const pool = await sql.connect(config);

    const result = await pool.request()
      .input("PartyCode", sql.VarChar, partyCode)
      .execute("sp_GetAvailableCuidLimit_ByPartyCode");

    res.json({
      success: true,
      data: result.recordset[0],
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on ${process.env.PORT}`)
);
