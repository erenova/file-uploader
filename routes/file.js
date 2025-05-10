const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const fileController = require("../controller/file");
const prisma = require("../utils/db");

router.post("/file/rename/:id", requireAuth, fileController.renameFile);
router.post("/file/delete/:id", requireAuth, fileController.deleteFile);
router.get("/file/details/:id", async (req, res) => {
  const file = await prisma.file.findUnique({
    where: { id: req.params.id },
    include: { uploadedBy: true, folder: true },
  });

  if (!file) return res.status(404).send("File not found");

  res.render("fileDetails", { file });
});

router.post("/file/move/:id", requireAuth, fileController.moveFile);

module.exports = router;
