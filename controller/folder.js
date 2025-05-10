const prisma = require("../utils/db");

async function createFolder(req, res) {
  const { folderName, parentFolderId } = req.body;
  const userId = req.user.id;

  try {
    await prisma.folder.create({
      data: {
        name: folderName,
        createdById: userId,
        parentFolderId: parentFolderId || null,
      },
    });

    res.redirect(req.get("referer")); // Refresh current page to show new folder
  } catch (err) {
    console.error("Error creating folder:", err);
    res.status(500).send("Something went wrong");
  }
}

async function renameFolder(req, res) {
  const { id } = req.params;
  const { name } = req.body;

  try {
    await prisma.folder.update({
      where: { id },
      data: { name },
    });
    res.redirect(req.get("referer"));
  } catch (error) {
    res.redirect(req.get("referer"));
  }
}

async function deleteFolder(req, res) {
  const { id } = req.params;

  try {
    await prisma.folder.delete({ where: { id } });
    res.redirect(req.get("referer"));
  } catch (err) {
    res.status(500).send("Could not delete folder.");
  }
}

async function moveFolder(req, res) {
  const { id } = req.params;
  const { targetFolderId } = req.body;

  try {
    // Check if target folder exists and user has access
    const targetFolder = targetFolderId
      ? await prisma.folder.findUnique({
          where: { id: targetFolderId },
          select: { createdById: true },
        })
      : null;

    if (
      targetFolderId &&
      (!targetFolder || targetFolder.createdById !== req.user.id)
    ) {
      return res.status(403).json({ error: "Access denied to target folder" });
    }

    // Check if source folder exists and user has access
    const sourceFolder = await prisma.folder.findUnique({
      where: { id },
      select: { createdById: true },
    });

    if (!sourceFolder || sourceFolder.createdById !== req.user.id) {
      return res.status(403).json({ error: "Access denied to source folder" });
    }

    // Move the folder
    await prisma.folder.update({
      where: { id },
      data: { parentFolderId: targetFolderId },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Error moving folder:", err);
    res.status(500).json({ error: "Failed to move folder" });
  }
}

module.exports = {
  createFolder,
  renameFolder,
  deleteFolder,
  moveFolder,
};
