import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../config/s3.js";
import path from "path";
import fs from "fs";

export async function uploadFileToS3(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const file = req.file;
    const { category, oldKey, oldUrl } = req.body;
    const accessKey = process.env.AWS_ACCESS_KEY_ID;
    const bucketName = process.env.AWS_BUCKET_NAME;
    const region = process.env.AWS_REGION || "us-east-1";

    const cleanOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");

    // Deterministic Anti-Duplicate S3 Keys
    let fileKey = "";
    if (category === "resume" || file.mimetype === "application/pdf") {
      fileKey = "resume/Aman_Deep_Resume.pdf";
    } else if (category === "profile") {
      fileKey = `profile/${cleanOriginalName}`;
    } else if (category === "project") {
      fileKey = `projects/${cleanOriginalName}`;
    } else {
      fileKey = `uploads/${cleanOriginalName}`;
    }

    // Delete old S3 file if oldKey/oldUrl is passed and different
    if (accessKey && bucketName && (oldKey || oldUrl)) {
      try {
        let keyToDelete = oldKey;
        if (!keyToDelete && oldUrl && oldUrl.includes("amazonaws.com/")) {
          keyToDelete = oldUrl.split("amazonaws.com/")[1];
        }
        if (keyToDelete && keyToDelete !== fileKey) {
          const deleteCmd = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: keyToDelete,
          });
          await s3Client.send(deleteCmd);
          console.log(`[S3 Anti-Duplicate Delete] Deleted old file key: ${keyToDelete}`);
        }
      } catch (delErr) {
        console.warn("[S3 Delete Warning] Could not delete old file:", delErr.message);
      }
    }

    // Upload / Overwrite to AWS S3 bucket
    if (accessKey && accessKey !== "your_aws_access_key_id" && bucketName) {
      const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3Client.send(putCommand);

      // Generate long-lived presigned URL (7 days max)
      let presignedUrl = "";
      try {
        const getCommand = new GetObjectCommand({
          Bucket: bucketName,
          Key: fileKey,
        });
        presignedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 604800 });
      } catch (err) {
        console.warn("Presigned URL generation warning:", err.message);
      }

      const standardPublicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;
      const finalUrl = presignedUrl || standardPublicUrl;

      console.log(`[S3 Upload Success - Overwrite Protected] File: ${fileKey}`);

      return res.status(200).json({
        message: "File uploaded to AWS S3 successfully!",
        fileUrl: finalUrl,
        standardUrl: standardPublicUrl,
        key: fileKey,
      });
    }

    // Fallback Mode: Store file locally
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const localFileName = cleanOriginalName;
    const localFilePath = path.join(uploadsDir, localFileName);
    fs.writeFileSync(localFilePath, file.buffer);

    const localUrl = `/uploads/${localFileName}`;
    console.log(`[Local Upload Fallback] Saved to: ${localUrl}`);

    return res.status(200).json({
      message: "File saved to local storage.",
      fileUrl: localUrl,
      key: localFileName,
    });
  } catch (error) {
    console.error("S3 Upload Controller Error:", error);
    return res.status(500).json({ error: "Failed to upload file to S3." });
  }
}
