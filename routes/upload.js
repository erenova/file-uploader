const { Router } = require("express");
const requireAuth = require("../middleware/requireAuth");
const { handleUpload } = require("../controller/upload");
const { upload, handleMulterError } = require("../middleware/multerConfig");

const router = Router();

router.post(
  "/upload",
  requireAuth,
  upload.array("files"),
  handleMulterError,
  handleUpload,
);

module.exports = router;
