import express from "express";
import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
  likeProject,
} from "../controllers/projectController.js";
import { verifyAdminToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllProjects);
router.post("/:id/like", likeProject);

// Protected Admin Routes
router.post("/", verifyAdminToken, createProject);
router.put("/:id", verifyAdminToken, updateProject);
router.delete("/:id", verifyAdminToken, deleteProject);

export default router;
