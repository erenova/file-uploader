const { Router } = require("express");
const requireAuth = require("../middleware/requireAuth");
const {
  createShare,
  getSharedResource,
  listShares,
  deleteShare,
  getSharedFolder,
} = require("../controller/share");

const router = Router();

// Create a new share for a file or folder
router.post("/create", requireAuth, createShare);

// Get a shared resource by UUID
router.get("/:shareId", getSharedResource);

// Get contents of a nested folder within a shared folder
router.get("/:shareId/folder/:folderId", getSharedFolder);

// List all shares for the current user
router.get("/list", requireAuth, listShares);

// Delete a share
router.delete("/:shareId", requireAuth, deleteShare);

module.exports = router;
