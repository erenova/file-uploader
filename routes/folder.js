const express = require("express");
const router = express.Router();
const folder = require("../controller/folder");
const requireAuth = require("../middleware/requireAuth");

router.post("/folder/create", requireAuth, folder.createFolder);
router.post("/folder/rename/:id", requireAuth, folder.renameFolder);
router.post("/folder/delete/:id", requireAuth, folder.deleteFolder);
router.post("/folder/move/:id", requireAuth, folder.moveFolder);

module.exports = router;
