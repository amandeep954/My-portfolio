import { getPool } from "../config/db.js";

export async function getAllSkills(req, res) {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM skills ORDER BY is_featured DESC, category ASC, id ASC");
    return res.json(rows);
  } catch (error) {
    console.error("getAllSkills error:", error);
    return res.status(500).json({ error: "Failed to fetch skills." });
  }
}

export async function createSkill(req, res) {
  try {
    const { name, category, proficiency, is_featured } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Skill name is required." });
    }

    const pool = getPool();
    const isFeaturedVal = is_featured !== undefined ? (is_featured ? 1 : 0) : 1;

    const [result] = await pool.query(
      "INSERT INTO skills (name, category, proficiency, is_featured) VALUES (?, ?, ?, ?)",
      [name, category || "General", proficiency || 80, isFeaturedVal]
    );

    return res.status(201).json({
      message: "Skill created successfully",
      skillId: result.insertId,
    });
  } catch (error) {
    console.error("createSkill error:", error);
    return res.status(500).json({ error: "Failed to create skill." });
  }
}

export async function toggleFeaturedSkill(req, res) {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [rows] = await pool.query("SELECT is_featured FROM skills WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Skill not found." });
    }

    const newFeatured = rows[0].is_featured ? 0 : 1;
    await pool.query("UPDATE skills SET is_featured = ? WHERE id = ?", [newFeatured, id]);

    return res.json({ message: "Skill featured status toggled", is_featured: newFeatured });
  } catch (error) {
    console.error("toggleFeaturedSkill error:", error);
    return res.status(500).json({ error: "Failed to toggle skill featured status." });
  }
}

export async function deleteSkill(req, res) {
  try {
    const { id } = req.params;
    const pool = getPool();
    await pool.query("DELETE FROM skills WHERE id = ?", [id]);
    return res.json({ message: "Skill deleted successfully" });
  } catch (error) {
    console.error("deleteSkill error:", error);
    return res.status(500).json({ error: "Failed to delete skill." });
  }
}
