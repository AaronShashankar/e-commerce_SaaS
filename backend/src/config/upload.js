import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directories exist
const kycDir = "uploads/kyc";
const storeDir = "uploads/store";
[kycDir, storeDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const imageFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};

const MAX_SIZE = 3 * 1024 * 1024; // 3 MB

export const kycUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, kycDir),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, unique + path.extname(file.originalname).toLowerCase());
    },
  }),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_SIZE },
});

export const storeUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, storeDir),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, unique + path.extname(file.originalname).toLowerCase());
    },
  }),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_SIZE },
});
