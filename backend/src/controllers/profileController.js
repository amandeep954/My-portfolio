import { getPool } from "../config/db.js";
import { getS3PresignedUrl } from "../config/s3.js";

const DEFAULT_PROFILE = {
  profile_photo: "https://amandeep-portfolio-assets.s3.ap-south-1.amazonaws.com/profile/profile-photo.png",
  location: "Ghaziabad, Uttar Pradesh",
  email: "amandeep954h@gmail.com",
  phone: "+91 9548690146",
  resume_url: "https://amandeep-portfolio-assets.s3.ap-south-1.amazonaws.com/resume/Aman_Deep_Resume.pdf",
};

export async function getProfileSettings(req, res) {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM profile_settings WHERE id = 1");

    const row = rows.length > 0 ? rows[0] : DEFAULT_PROFILE;
    const profile_photo = await getS3PresignedUrl(row.profile_photo || DEFAULT_PROFILE.profile_photo);
    const resume_url = await getS3PresignedUrl(row.resume_url || DEFAULT_PROFILE.resume_url);

    return res.json({
      profile_photo,
      location: row.location || DEFAULT_PROFILE.location,
      email: row.email || DEFAULT_PROFILE.email,
      phone: row.phone || DEFAULT_PROFILE.phone,
      resume_url,
    });
  } catch (error) {
    console.error("Error fetching profile settings:", error.message);
    const profile_photo = await getS3PresignedUrl(DEFAULT_PROFILE.profile_photo);
    const resume_url = await getS3PresignedUrl(DEFAULT_PROFILE.resume_url);
    return res.json({ ...DEFAULT_PROFILE, profile_photo, resume_url });
  }
}

export async function updateProfileSettings(req, res) {
  try {
    const pool = getPool();
    const { profile_photo, location, email, phone, resume_url } = req.body;

    // Fetch existing settings
    const [existing] = await pool.query("SELECT * FROM profile_settings WHERE id = 1");
    const current = existing.length > 0 ? existing[0] : DEFAULT_PROFILE;

    const newPhoto = profile_photo !== undefined ? profile_photo : current.profile_photo;
    const newLocation = location !== undefined ? location : current.location;
    const newEmail = email !== undefined ? email : current.email;
    const newPhone = phone !== undefined ? phone : current.phone;
    const newResume = resume_url !== undefined ? resume_url : current.resume_url;

    if (existing.length === 0) {
      await pool.query(
        `INSERT INTO profile_settings (id, profile_photo, location, email, phone, resume_url)
         VALUES (1, ?, ?, ?, ?, ?)`,
        [newPhoto, newLocation, newEmail, newPhone, newResume]
      );
    } else {
      await pool.query(
        `UPDATE profile_settings
         SET profile_photo = ?, location = ?, email = ?, phone = ?, resume_url = ?
         WHERE id = 1`,
        [newPhoto, newLocation, newEmail, newPhone, newResume]
      );
    }

    console.log("[MySQL Profile Updated]", { newPhoto, newLocation, newEmail, newPhone, newResume });

    return res.json({
      message: "Profile settings updated in MySQL database successfully!",
      profile: {
        profile_photo: newPhoto,
        location: newLocation,
        email: newEmail,
        phone: newPhone,
        resume_url: newResume,
      },
    });
  } catch (error) {
    console.error("Error updating profile settings:", error.message);
    return res.status(500).json({ error: "Failed to update profile settings in database." });
  }
}
