import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { initDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

// API Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/profile", profileRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Server Error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

async function startServer() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`\n==================================================`);
      console.log(`🚀 Portfolio Backend running on http://localhost:${PORT}`);
      console.log(`==================================================\n`);
    });
  } catch (error) {
    console.error("Failed to start server due to database error:", error.message);
    console.log("Server starting without live DB connection for fallback mode...");
    app.listen(PORT, () => {
      console.log(`⚠️ Server running on http://localhost:${PORT} (Database pending)`);
    });
  }
}

startServer();
