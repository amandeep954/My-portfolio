import express from "express";
import { login, getMe } from "../controllers/authController.js";
import { verifyAdminToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.get("/me", verifyAdminToken, getMe);

export default router;
