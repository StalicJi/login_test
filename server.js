const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
const port = 3010;

const pool = new Pool({
  user: process.env.POOL_USER,
  host: "localhost",
  database: process.env.DATABASE_NAME,
  password: process.env.POOL_PASSWORD,
  port: 5432,
});

app.post("/users", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM user_info");
    res.json(rows);
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 註冊
app.post("/register", async (req, res) => {
  try {
    const { username, emailAddress, password } = req.body;

    const existingUser = await pool.query(
      "SELECT * FROM user_info WHERE email = $1",
      [emailAddress]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json();
    }

    const result = await pool.query(
      "INSERT INTO user_info (user_id, username, email, password) VALUES (CONCAT($1::text, $2::text), $1, $2, $3)",
      [username, emailAddress, password]
    );

    res.status(201).json({ message: "註冊成功" });
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 登入
app.post("/login", async (req, res) => {
  try {
    const { emailAddress, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM user_info WHERE email = $1",
      [emailAddress]
    );
    console.log(result);

    if (result.rows.length === 0) {
      res.json({ message: "NoAccount" });
      return;
    }
    const user = result.rows[0];
    if (password !== user.password) {
      res.json({ message: "WrongPSW" });
      return;
    }

    res.status(200).json({ message: "Success" });
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
