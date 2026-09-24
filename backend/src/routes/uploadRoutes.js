import express from "express";
import multer from "multer";
import { uploadFileToS3 } from "../controllers/uploadController.js";
import { verifyAdminToken } from "../middleware/auth.js";

const router = express.Router();

// Multer memory storage configuration
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max file size
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PNG, JPG, WEBP, and PDF files are allowed."));
    }
  },
});

// Reusable POST /api/upload route
router.post("/", verifyAdminToken, upload.single("file"), uploadFileToS3);

export default router;
