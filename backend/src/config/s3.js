import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function getS3PresignedUrl(urlOrKey) {
  if (!urlOrKey || typeof urlOrKey !== "string") return urlOrKey || "";

  const bucketName = process.env.AWS_BUCKET_NAME;
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  if (!accessKey || !bucketName) return urlOrKey;

  // If already signed, return as is
  if (urlOrKey.includes("X-Amz-Signature=")) return urlOrKey;

  let key = "";
  if (urlOrKey.includes(".amazonaws.com/")) {
    key = urlOrKey.split(".amazonaws.com/")[1];
  } else if (!urlOrKey.startsWith("http://") && !urlOrKey.startsWith("https://")) {
    key = urlOrKey;
  }

  if (!key) return urlOrKey;

  const cleanKey = key.split("?")[0];
  try {
    const command = new GetObjectCommand({ Bucket: bucketName, Key: cleanKey });
    const presigned = await getSignedUrl(s3Client, command, { expiresIn: 604800 });
    return presigned;
  } catch (err) {
    console.warn("[S3 Presigned Error]", err.message);
    return urlOrKey;
  }
}
