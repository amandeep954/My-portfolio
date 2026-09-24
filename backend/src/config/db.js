import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "portfolio_db";
const DB_PORT = parseInt(process.env.DB_PORT || "3306", 10);

let pool;

export async function initDB() {
  try {
    // 1. Ensure database exists (attempt CREATE DATABASE if permissions allow)
    try {
      const tempConnection = await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        port: DB_PORT,
        connectTimeout: 10000,
      });

      await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
      await tempConnection.end();
    } catch (createErr) {
      // If DB does not exist on local setup, try creating without DB name selected
      try {
        const rootConnection = await mysql.createConnection({
          host: DB_HOST,
          user: DB_USER,
          password: DB_PASSWORD,
          port: DB_PORT,
          connectTimeout: 10000,
        });
        await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
        await rootConnection.end();
      } catch (e) {
        console.warn(`[MySQL DB Check] Note: Connecting to database "${DB_NAME}".`);
      }
    }

    // 2. Create the main connection pool pointing to DB_NAME
    pool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000,
    });

    console.log(`[MySQL] Connected to database "${DB_NAME}" at ${DB_HOST}:${DB_PORT}.`);

    // 3. Auto-Create Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        tags TEXT,
        desc_text TEXT,
        image VARCHAR(500),
        live_link VARCHAR(500),
        github_link VARCHAR(500),
        likes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(100) DEFAULT 'General',
        proficiency INT DEFAULT 80,
        is_featured BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Auto-Migration for existing skills table
    try {
      await pool.query("ALTER TABLE skills ADD COLUMN is_featured BOOLEAN DEFAULT TRUE;");
    } catch (migErr) {
      // Column already exists, ignore error
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS profile_settings (
        id INT PRIMARY KEY DEFAULT 1,
        profile_photo VARCHAR(500),
        location VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(100),
        resume_url VARCHAR(500),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Seed initial profile row if empty
    const [profRows] = await pool.query("SELECT * FROM profile_settings WHERE id = 1");
    if (profRows.length === 0) {
      await pool.query(`
        INSERT INTO profile_settings (id, profile_photo, location, email, phone, resume_url)
        VALUES (1, 'https://amandeep-portfolio-assets.s3.ap-south-1.amazonaws.com/profile/profile-photo.png', 'Ghaziabad, Uttar Pradesh', 'amandeep954h@gmail.com', '+91 9548690146', 'https://amandeep-portfolio-assets.s3.ap-south-1.amazonaws.com/resume/Aman_Deep_Resume.pdf')
      `);
      console.log("[MySQL Seed] AWS S3 Cloud profile_settings row created.");
    }

    // 4. Seed/Update Admin User
    const adminUser = (process.env.ADMIN_USERNAME || "admin").trim();
    const adminPass = (process.env.ADMIN_PASSWORD || "admin123").trim();
    const hashedPassword = await bcrypt.hash(adminPass, 10);

    const [existingUsers] = await pool.query(
      "SELECT * FROM users WHERE LOWER(username) = LOWER(?)",
      [adminUser]
    );

    if (existingUsers.length === 0) {
      await pool.query(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [adminUser, hashedPassword]
      );
      console.log(`[MySQL Seed] Admin user created: username="${adminUser}"`);
    } else {
      await pool.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedPassword, existingUsers[0].id]
      );
      console.log(`[MySQL Seed] Admin user "${adminUser}" credentials updated.`);
    }

    // 5. Seed Initial Projects if empty
    const [projectRows] = await pool.query("SELECT * FROM projects LIMIT 1");
    if (projectRows.length === 0) {
      const initialProjects = [
        {
          name: "PackagingBazaar",
          subtitle: "Packaging Products Marketplace",
          tags: JSON.stringify(["React", "Tailwind CSS", "E-commerce", "UI/UX", "Responsive"]),
          desc_text: "Created a polished packaging marketplace with product browsing, category navigation, and responsive layouts for seamless buyer engagement.",
          image: "images/projects/packagingbazaar.png",
          live_link: "https://packagingbazaar.co.in/",
          github_link: "https://github.com/amandeep954/PackagingBazaar",
        },
        {
          name: "Airbnb Clone",
          subtitle: "Full-Stack Web Application",
          tags: JSON.stringify(["MongoDB", "Express.js", "Node.js", "EJS", "MVC", "Authentication"]),
          desc_text: "Engineered a full-stack listings and reviews application with complete CRUD flows, secure user authentication, role-based authorization, MVC architecture, responsive pages, and robust server-side validation.",
          image: "images/projects/airbnb-clone.png",
          live_link: "https://airbnb-n49p.onrender.com/listings",
          github_link: "https://github.com/amandeep954/airbnb-fullstack-clone",
        },
        {
          name: "WebRTC Video Call Application",
          subtitle: "Real-Time P2P Communication",
          tags: JSON.stringify(["MERN", "WebRTC", "Socket.io", "Node.js", "React"]),
          desc_text: "Built a real-time peer-to-peer video calling app using WebRTC and Socket.io signaling, with optimized media streams, connection states, and stable low-latency audio-video communication.",
          image: "images/projects/webrtc-video-call.png",
          live_link: "https://webrtc-frontend-9scg.onrender.com/",
          github_link: "https://github.com/amandeep954/MERN-WebRTC-Call",
        },
        {
          name: "Zerodha Clone",
          subtitle: "Trading Platform UI",
          tags: JSON.stringify(["React", "CSS", "State Management", "Component Architecture"]),
          desc_text: "Developed an interactive React frontend clone of the Zerodha trading dashboard, recreating financial layouts with clean UI patterns, reusable components, and efficient rendering.",
          image: "images/projects/zerodha-clone.png",
          live_link: "https://zerodha-frontend-gfs1.onrender.com/",
          github_link: "https://github.com/amandeep954/amandeep954-zerodha-clone",
        },
        {
          name: "TaskFlow",
          subtitle: "Task Management Dashboard",
          tags: JSON.stringify(["React", "Tailwind CSS", "Node.js", "Express", "MongoDB", "JWT"]),
          desc_text: "Launched a secure task management dashboard with user authentication, responsive workflows, CRUD task boards, and polished UI for organizing work and tracking progress.",
          image: "images/projects/TaskFlow.png",
          live_link: "https://taskflow-client-0400.onrender.com/",
          github_link: "https://github.com/amandeep954/taskflow",
        },
      ];

      for (const p of initialProjects) {
        await pool.query(
          `INSERT INTO projects (name, subtitle, tags, desc_text, image, live_link, github_link) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [p.name, p.subtitle, p.tags, p.desc_text, p.image, p.live_link, p.github_link]
        );
      }
      console.log(`[MySQL Seed] ${initialProjects.length} initial projects seeded.`);
    }

    // 6. Seed Initial Skills if empty
    const [skillRows] = await pool.query("SELECT * FROM skills LIMIT 1");
    if (skillRows.length === 0) {
      const initialSkills = [
        { name: "HTML5", category: "Frontend", proficiency: 95 },
        { name: "CSS3", category: "Frontend", proficiency: 90 },
        { name: "JavaScript ES6+", category: "Frontend", proficiency: 90 },
        { name: "React", category: "Frontend", proficiency: 88 },
        { name: "Tailwind CSS", category: "Frontend", proficiency: 92 },
        { name: "Node.js", category: "Backend", proficiency: 85 },
        { name: "Express.js", category: "Backend", proficiency: 85 },
        { name: "MongoDB", category: "Backend", proficiency: 80 },
        { name: "MySQL", category: "Backend", proficiency: 85 },
        { name: "Git & GitHub", category: "Tools", proficiency: 88 },
        { name: "Socket.io", category: "Backend", proficiency: 80 },
        { name: "WebRTC", category: "Backend", proficiency: 75 },
      ];

      for (const s of initialSkills) {
        await pool.query(
          "INSERT INTO skills (name, category, proficiency) VALUES (?, ?, ?)",
          [s.name, s.category, s.proficiency]
        );
      }
      console.log(`[MySQL Seed] ${initialSkills.length} initial skills seeded.`);
    }

    return pool;
  } catch (error) {
    console.error("[MySQL Error] Failed to initialize database:", error.message);
    throw error;
  }
}

export function getPool() {
  if (!pool) {
    throw new Error("Database pool has not been initialized. Call initDB() first.");
  }
  return pool;
}
