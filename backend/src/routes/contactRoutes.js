import express from "express";
import {
  createContact,
  getAllContacts,
  toggleReadStatus,
  deleteContact,
} from "../controllers/contactController.js";
import { verifyAdminToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/", createContact);

// Protected Admin Routes
router.get("/", verifyAdminToken, getAllContacts);
router.patch("/:id/read", verifyAdminToken, toggleReadStatus);
router.delete("/:id", verifyAdminToken, deleteContact);

export default router;
