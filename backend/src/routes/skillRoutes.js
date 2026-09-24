import express from "express";
import { getAllSkills, createSkill, toggleFeaturedSkill, deleteSkill } from "../controllers/skillController.js";
import { verifyAdminToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllSkills);

// Protected Admin Routes
router.post("/", verifyAdminToken, createSkill);
router.patch("/:id/featured", verifyAdminToken, toggleFeaturedSkill);
router.delete("/:id", verifyAdminToken, deleteSkill);

export default router;
