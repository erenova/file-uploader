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
  destination: "public/uploads/",
  filename: (req, file, cb) => {
    // Check if file with this name already exists
    let filename = file.originalname;
    const ext = path.extname(filename);
    const basename = path.basename(filename, ext);

    // If file exists, append a counter
    let counter = 1;
    while (fs.existsSync(path.join("public/uploads/", filename))) {
      filename = `${basename} (${counter})${ext}`;
      counter++;
    }

    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE, // 100MB limit
    files: MAX_FILES,
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

router.post(
  "/upload",
  requireAuth,
  (req, res, next) => {
    upload.array("file", MAX_FILES)(req, res, (err) => {
      if (err) {
        handleMulterError(err, req, res, next);
      } else {
        next();
      }
    });
  },
  handleUpload,
);

module.exports = router;
