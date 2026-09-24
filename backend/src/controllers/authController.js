import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getPool } from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "portfolio_secret_key_super_secure_123!";

export async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE LOWER(username) = LOWER(?)",
      [cleanUsername]
    );

    if (rows.length === 0) {
      console.warn(`[Login Failed] User "${cleanUsername}" not found in database.`);
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(cleanPassword, user.password);

    if (!isMatch) {
      console.warn(`[Login Failed] Password mismatch for user "${cleanUsername}".`);
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log(`[Login Success] Admin user "${user.username}" logged in successfully.`);

    return res.json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    console.error("Login controller error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}

export async function getMe(req, res) {
  return res.json({ user: req.user });
}
