const prisma = require("../utils/db");
const path = require("path");
const supabase = require("../utils/supabase");
const fs = require("fs");
const fsPromises = require("fs/promises");

async function handleUpload(req, res) {
  try {
    const files = req.files;
    const folderId = req.body.folderId === "" ? null : req.body.folderId;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const savedFiles = await Promise.all(
      files.map(async (file) => {
        try {
          const filename = Date.now() + "-" + file.originalname;
          const fileBuffer = await fsPromises.readFile(file.path);

          // Upload to Supabase
          const { data, error } = await supabase.storage
            .from(process.env.SUPABASE_BUCKET)
            .upload(`uploads/${filename}`, fileBuffer, {
              contentType: file.mimetype,
              cacheControl: "3600",
              upsert: false,
            });

          if (error) throw error;

          // Get the public URL
          const {
            data: { publicUrl },
          } = supabase.storage
            .from(process.env.SUPABASE_BUCKET)
            .getPublicUrl(`uploads/${filename}`);

          // Save to database
          const savedFile = await prisma.file.create({
            data: {
              name: file.originalname,
              size: file.size,
              url: publicUrl,
              mimeType: file.mimetype,
              uploadedById: req.user.id,
              folderId: folderId,
            },
          });

          // Clean up temporary file
          await fsPromises.unlink(file.path);

          return savedFile;
        } catch (error) {
          // Clean up temporary file in case of error
          await fsPromises.unlink(file.path).catch(console.error);
          throw error;
        }
      }),
    );

    res.json({ success: true, files: savedFiles });
  } catch (err) {
    console.error("Upload failed:", err);
    // Clean up any temporary files in case of error
    if (req.files) {
      await Promise.all(
        req.files.map((file) =>
          fsPromises.unlink(file.path).catch(console.error),
        ),
      );
    }
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
}

module.exports = { handleUpload };
