const path = require("path");
const fs = require("fs/promises");
const prisma = require("../utils/db");
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
    // First get the file details from the database
    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Delete from Supabase storage
    const storagePath = `uploads/${new URL(file.url).pathname
      .split("/")
      .pop()}`;
    console.log("Deleting from Supabase:", storagePath);

    const { error: supabaseError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .remove([storagePath]);

    if (supabaseError) {
      console.error("Supabase deletion error:", supabaseError);
      return res
        .status(500)
        .json({ error: "Could not delete file from storage" });
    }

    // Delete from database
    await prisma.file.delete({ where: { id } });

    res.json({ success: true });
  } catch (err) {
    console.error("File deletion error:", err);
    res.status(500).json({ error: "Could not delete file" });
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

async function downloadFile(req, res) {
  const { id } = req.params;

  try {
    const file = await prisma.file.findUnique({
      where: { id },
      select: {
        name: true,
        url: true,
        mimeType: true,
        uploadedById: true,
      },
    });

    if (!file) {
      return res.status(404).send("File not found");
    }

    // Get the file from Supabase
    const supabase = require("../utils/supabase");
    const bucketPath = new URL(file.url).pathname.split("/").pop();
    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .download(`uploads/${bucketPath}`);

    if (error) {
      console.error("Supabase download error:", error);
      return res.status(500).send("Error downloading file");
    }

    // Set content type
    res.setHeader("Content-Type", file.mimeType);

    // Check if this is a preview request (for image tags) or a download request
    const isPreview =
      req.query.preview === "true" && file.mimeType.startsWith("image/");

    if (!isPreview) {
      // Force download with proper filename
      const encodedFilename = encodeURIComponent(file.name).replace(
        /['()]/g,
        escape,
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename*=UTF-8''${encodedFilename}`,
      );
    }

    // Cache control headers
    if (isPreview) {
      // Allow browser to cache preview images
      res.setHeader("Cache-Control", "public, max-age=3600");
    } else {
      // No caching for downloads
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }

    // Stream the file to the response
    const buffer = Buffer.from(await data.arrayBuffer());
    res.send(buffer);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).send("Error downloading file");
  }
}

module.exports = {
  deleteFile,
  renameFile,
  getFileDetails,
  moveFile,
  downloadFile,
};
