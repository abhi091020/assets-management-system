// src/middleware/upload.middleware.js
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Helper ────────────────────────────────────────────────────────────────────
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// ── Asset photos (existing) ───────────────────────────────────────────────────
// __dirname = server/src/middleware → ../../../uploads = project-root/uploads
const assetPhotoDir = path.join(__dirname, "../../../uploads/asset-photos");
ensureDir(assetPhotoDir);

const assetPhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, assetPhotoDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const assetFileFilter = (req, file, cb) => {
  const allowed = [".jpg", ".jpeg", ".png", ".pdf"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error("Only JPG, JPEG, PNG, and PDF files are allowed."), false);
};

const upload = multer({
  storage: assetPhotoStorage,
  fileFilter: assetFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

export default upload;

// ── Profile photos (new) ──────────────────────────────────────────────────────
const profilePhotoDir = path.join(__dirname, "../../../uploads/profile-photos");
ensureDir(profilePhotoDir);

const profilePhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, profilePhotoDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // user-{id}-{timestamp}.ext — easy to identify per user
    const userId = req.user?.id || "unknown";
    cb(null, `user-${userId}-${Date.now()}${ext}`);
  },
});

const profileFileFilter = (req, file, cb) => {
  const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else
    cb(
      new Error("Only JPG, JPEG, PNG, GIF, and WEBP files are allowed."),
      false,
    );
};

export const uploadProfilePhoto = multer({
  storage: profilePhotoStorage,
  fileFilter: profileFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});
