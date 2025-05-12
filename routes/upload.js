const { Router } = require("express");
const requireAuth = require("../middleware/requireAuth");
const multer = require("multer");
const { handleUpload } = require("../controller/upload");
const path = require("path");
const fs = require("fs");

const router = Router();

// File size constants
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_FILES = 10;

const storage = multer.diskStorage({
  destination: "uploads/", // Temporary storage
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5, // Maximum 5 files
  },
});

// Error handling middleware for multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: `File too large. Maximum size is ${
          MAX_FILE_SIZE / (1024 * 1024)
        }MB`,
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        error: `Too many files. Maximum is ${MAX_FILES} files`,
      });
    }
    return res.status(400).json({ error: err.message });
  }
  next(err);
};

router.post("/upload", requireAuth, upload.array("files"), handleUpload);

module.exports = router;
