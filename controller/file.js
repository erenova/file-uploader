const path = require("path");
const fs = require("fs/promises");
const prisma = require("../utils/db"); // assuming this is your prisma client
const supabase = require("../utils/supabase");

async function renameFile(req, res) {
  const { id } = req.params;
  const { name } = req.body;

  try {
    await prisma.file.update({
      where: { id },
      data: { name },
    });
    res.redirect(req.get("referer"));
  } catch (error) {
    res.redirect(req.get("referer"));
  }
}

async function deleteFile(req, res) {
  const { id } = req.params;

  try {
    // Find the file in the database
    const file = await prisma.file.findUnique({ where: { id } });

    if (!file) {
      return res.status(404).send("File not found.");
    }

    // Delete the file from Supabase Storage
    const { error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .remove([`uploads/${path.basename(file.url)}`]);

    if (error) {
      console.error("Error deleting file from Supabase:", error);
    }

    // Delete the file from the database
    await prisma.file.delete({ where: { id } });

    res.redirect(req.get("referer"));
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).send("Could not delete file.");
  }
}

async function getFileDetails(req, res) {
  const { id } = req.params;

  try {
    const file = await prisma.file.findUnique({
      where: { id },
      include: {
        uploadedBy: true,
      },
    });

    if (!file) {
      return res.status(404).send("File not found");
    }

    res.render("fileDetails", { file });
  } catch (error) {
    res.status(500).send("Error retrieving file details");
  }
}

async function moveFile(req, res) {
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

    // Check if source file exists and user has access
    const sourceFile = await prisma.file.findUnique({
      where: { id },
      select: { uploadedById: true },
    });

    if (!sourceFile || sourceFile.uploadedById !== req.user.id) {
      return res.status(403).json({ error: "Access denied to file" });
    }

    // Move the file
    await prisma.file.update({
      where: { id },
      data: { folderId: targetFolderId },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Error moving file:", err);
    res.status(500).json({ error: "Failed to move file" });
  }
}

module.exports = {
  deleteFile,
  renameFile,
  getFileDetails,
  moveFile,
};
