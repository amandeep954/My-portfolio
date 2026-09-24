import nodemailer from "nodemailer";
import { getPool } from "../config/db.js";

// Helper function to create Nodemailer transporter
function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass || pass === "your-gmail-app-password") {
    console.warn("[Nodemailer] SMTP credentials missing in .env (EMAIL_USER / EMAIL_PASS). Skipping email dispatch.");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587
    auth: {
      user,
      pass,
    },
  });
}

export async function createContact(req, res) {
  try {
    const { name, email, message } = req.body;

    // 1. Validation check
    if (!name || !name.trim() || !email || !email.trim() || !message || !message.trim()) {
      return res.status(400).json({ error: "All fields (name, email, message) are required." });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanMessage = message.trim();

    // 2. Save message into MySQL database
    const pool = getPool();
    const [result] = await pool.query(
      "INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)",
      [cleanName, cleanEmail, cleanMessage]
    );

    // Also mirror to contact_messages table if exists
    try {
      await pool.query(
        "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
        [cleanName, cleanEmail, cleanMessage]
      );
    } catch (e) {
      // Ignore if table mirroring fails
    }

    // 3. Send Emails via Nodemailer
    const transporter = getTransporter();

    if (transporter) {
      // Email 1: Auto-Reply to the Visitor
      const userMailOptions = {
        from: `"Aman Deep Portfolio" <${process.env.EMAIL_USER}>`,
        to: cleanEmail,
        subject: `Thank you for contacting me, ${cleanName}!`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #ff5c5c;">Hello ${cleanName},</h2>
            <p>Thank you for reaching out through my portfolio website!</p>
            <p>I have received your message and will review it promptly. Here is a copy of your inquiry:</p>
            <blockquote style="background: #eee; padding: 12px; border-left: 4px solid #ff5c5c; margin: 16px 0;">
              "${cleanMessage}"
            </blockquote>
            <p>Best regards,<br/><strong>Aman Deep</strong><br/>MERN Stack Developer</p>
          </div>
        `,
      };

      // Email 2: Alert Notification to Portfolio Owner (Admin)
      const adminMailOptions = {
        from: `"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `🚨 New Inquiry from ${cleanName} (${cleanEmail})`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px;">
            <h3 style="color: #2b2b2b;">New Contact Form Submission</h3>
            <p><strong>Name:</strong> ${cleanName}</p>
            <p><strong>Email:</strong> <a href="mailto:${cleanEmail}">${cleanEmail}</a></p>
            <p><strong>Message:</strong></p>
            <div style="background: #f4f4f4; padding: 15px; border-radius: 6px; font-size: 14px; line-height: 1.6;">
              ${cleanMessage}
            </div>
            <p style="font-size: 12px; color: #777; margin-top: 15px;">Saved into MySQL database under Message ID #${result.insertId}</p>
          </div>
        `,
      };

      // Dispatch both emails in parallel without blocking client response
      Promise.all([
        transporter.sendMail(userMailOptions),
        transporter.sendMail(adminMailOptions),
      ])
        .then(() => console.log(`[Nodemailer] Successfully dispatched auto-reply to ${cleanEmail} & alert to ${process.env.EMAIL_USER}`))
        .catch((err) => console.error("[Nodemailer Error] Failed to send emails:", err.message));
    }

    return res.status(201).json({
      message: "Message sent successfully!",
      contactId: result.insertId,
    });
  } catch (error) {
    console.error("createContact error:", error);
    return res.status(500).json({ error: "Failed to submit message." });
  }
}

export async function getAllContacts(req, res) {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM contacts ORDER BY id DESC");
    return res.json(rows);
  } catch (error) {
    console.error("getAllContacts error:", error);
    return res.status(500).json({ error: "Failed to fetch messages." });
  }
}

export async function toggleReadStatus(req, res) {
  try {
    const { id } = req.params;
    const pool = getPool();
    await pool.query("UPDATE contacts SET is_read = NOT is_read WHERE id = ?", [id]);
    return res.json({ message: "Read status updated" });
  } catch (error) {
    console.error("toggleReadStatus error:", error);
    return res.status(500).json({ error: "Failed to update message status." });
  }
}

export async function deleteContact(req, res) {
  try {
    const { id } = req.params;
    const pool = getPool();
    await pool.query("DELETE FROM contacts WHERE id = ?", [id]);
    return res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("deleteContact error:", error);
    return res.status(500).json({ error: "Failed to delete message." });
  }
}
