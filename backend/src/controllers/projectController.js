import { getPool } from "../config/db.js";
import { getS3PresignedUrl } from "../config/s3.js";

function parseTags(tagsField) {
  if (!tagsField) return [];
  if (Array.isArray(tagsField)) return tagsField;
  try {
    return JSON.parse(tagsField);
  } catch (e) {
    return tagsField.split(",").map((t) => t.trim());
  }
}

export async function getAllProjects(req, res) {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM projects ORDER BY id DESC");

    const projects = await Promise.all(
      rows.map(async (row) => ({
        id: row.id,
        name: row.name,
        subtitle: row.subtitle,
        tags: parseTags(row.tags),
        desc: row.desc_text,
        image: await getS3PresignedUrl(row.image),
        liveLink: row.live_link,
        githubLink: row.github_link,
        likes: row.likes || 0,
        createdAt: row.created_at,
      }))
    );

    return res.json(projects);
  } catch (error) {
    console.error("getAllProjects error:", error);
    return res.status(500).json({ error: "Failed to fetch projects." });
  }
}

export async function createProject(req, res) {
  try {
    const { name, subtitle, tags, desc, image, liveLink, githubLink } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Project name is required." });
    }

    const pool = getPool();
    const tagsString = JSON.stringify(Array.isArray(tags) ? tags : (tags ? tags.split(",") : []));

    const [result] = await pool.query(
      `INSERT INTO projects (name, subtitle, tags, desc_text, image, live_link, github_link) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, subtitle || "", tagsString, desc || "", image || "", liveLink || "", githubLink || ""]
    );

    return res.status(201).json({
      message: "Project created successfully",
      projectId: result.insertId,
    });
  } catch (error) {
    console.error("createProject error:", error);
    return res.status(500).json({ error: "Failed to create project." });
  }
}

export async function updateProject(req, res) {
  try {
    const { id } = req.params;
    const { name, subtitle, tags, desc, image, liveLink, githubLink } = req.body;

    const pool = getPool();
    const tagsString = JSON.stringify(Array.isArray(tags) ? tags : (tags ? tags.split(",") : []));

    await pool.query(
      `UPDATE projects SET name = ?, subtitle = ?, tags = ?, desc_text = ?, image = ?, live_link = ?, github_link = ? WHERE id = ?`,
      [name, subtitle, tagsString, desc, image, liveLink, githubLink, id]
    );

    return res.json({ message: "Project updated successfully" });
  } catch (error) {
    console.error("updateProject error:", error);
    return res.status(500).json({ error: "Failed to update project." });
  }
}

export async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    const pool = getPool();
    await pool.query("DELETE FROM projects WHERE id = ?", [id]);
    return res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("deleteProject error:", error);
    return res.status(500).json({ error: "Failed to delete project." });
  }
}

export async function likeProject(req, res) {
  try {
    const { id } = req.params;
    const pool = getPool();
    await pool.query("UPDATE projects SET likes = likes + 1 WHERE id = ?", [id]);
    const [rows] = await pool.query("SELECT likes FROM projects WHERE id = ?", [id]);
    const updatedLikes = rows.length > 0 ? rows[0].likes : 0;

    return res.json({ message: "Project liked", likes: updatedLikes });
  } catch (error) {
    console.error("likeProject error:", error);
    return res.status(500).json({ error: "Failed to like project." });
  }
}
