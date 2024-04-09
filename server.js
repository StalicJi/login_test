const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
// const fs = require("fs");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
const port = 3010;

app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});

const pool = new Pool({
  user: process.env.POOL_USER,
  host: "localhost",
  database: process.env.DATABASE_NAME,
  password: process.env.POOL_PASSWORD,
  port: 5432,
});

// // 创建日志文件
// const logFileStream = fs.createWriteStream("server.log", { flags: "a" });

// // 重定向 console 输出到日志文件
// console.log = (message) => {
//   logFileStream.write(`${new Date().toISOString()} - ${message}\n`);
//   process.stdout.write(`${new Date().toISOString()} - ${message}\n`);
// };

// app.post("/users", async (req, res) => {
//   try {
//     const { rows } = await pool.query("SELECT * FROM user_info");
//     res.json(rows);
//   } catch (err) {
//     console.error("Error executing query", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

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

    const currentDate = new Date().toLocaleString("zh-TW", {
      timeZone: "Asia/Taipei",
    });
    const result = await pool.query(
      "INSERT INTO user_info (user_id, username, email, password, login_count, lock_time) VALUES (CONCAT($1::text, $2::text), $1, $2, $3, $4, $5)",
      [username, emailAddress, password, 0, currentDate]
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
    // console.log(result);

    if (result.rows.length === 0) {
      res.json({ message: "NoAccount" });
      console.log(`(登入異常) 找不到用戶/IP: ${req.ip}`);
      return;
    }
    const user = result.rows[0];
    if (password !== user.password) {
      const updatedCount = user.login_count + 1;
      if (updatedCount === 3) {
        const currentDate = new Date().toLocaleString("zh-TW", {
          timeZone: "Asia/Taipei",
        });
        await pool.query(
          "UPDATE user_info SET login_count = $1, lock_time = $2 WHERE email = $3",
          [updatedCount, currentDate, emailAddress]
        );
        setTimeout(async () => {
          await pool.query(
            "UPDATE user_info SET login_count = 0 WHERE email = $1",
            [emailAddress]
          );
        }, 10000); //後台鎖10秒
      } else {
        await pool.query(
          "UPDATE user_info SET login_count = $1 WHERE email = $2",
          [updatedCount, emailAddress]
        );
      }
      res.json({ message: "WrongPSW", login_count: updatedCount });
      console.log(`(登入異常) 密碼錯誤/IP: ${req.ip}`);
      return;
    }

    res
      .status(200)
      .json({ username: result.rows[0].username, userStatus: "1" });
    await pool.query("UPDATE user_info SET login_count = 0 WHERE email = $1", [
      emailAddress,
    ]);
    console.log(`用戶 ${result.rows[0].email} 登入/IP: ${req.ip}`);
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
