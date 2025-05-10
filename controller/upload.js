const prisma = require("../utils/db");
const path = require("path");

async function handleUpload(req, res) {
  try {
    const files = req.files;
    const folderId = req.body.folderId === "" ? null : req.body.folderId;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const savedFiles = await Promise.all(
      files.map((file) =>
        prisma.file.create({
          data: {
            name: file.originalname,
            size: file.size,
            url: path.join("/uploads", file.filename),
            mimeType: file.mimetype,
            uploadedById: req.user.id,
            folderId: folderId,
          },
        }),
      ),
    );
    console.log("savedFiles ", savedFiles);
    res.json({ success: true, files: savedFiles });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
}

module.exports = { handleUpload };
