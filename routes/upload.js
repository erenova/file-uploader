const { Router } = require("express");

const router = Router();
const multer = require("multer");
const upload = multer({
  dest: "uploads/",
});

router.post("/upload", upload.array("files"), (req, res) => {
  console.log("Uploaded files:", req.files);
});

module.exports = router;
