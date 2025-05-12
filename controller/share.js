const prisma = require("../utils/db");

// Helper function for artificial delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function createShare(req, res) {
  try {
    const { type, resourceId, expiresInDays } = req.body;

    if (!type || !resourceId) {
      return res
        .status(400)
        .json({ error: "Must provide type and resourceId" });
    }

    if (!["file", "folder"].includes(type)) {
      return res.status(400).json({ error: "Invalid resource type" });
    }

    // Calculate expiration date if provided
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    // Create the share with the appropriate relation
    const share = await prisma.share.create({
      data: {
        expiresAt,
        createdById: req.user.id,
        ...(type === "file"
          ? { fileId: resourceId }
          : { folderId: resourceId }),
      },
      include: {
        file: true,
        folder: {
          include: {
            files: true,
            subfolders: true,
          },
        },
      },
    });

    res.json({ success: true, share });
  } catch (error) {
    console.error("Share creation failed:", error);
    res.status(500).json({ error: "Failed to create share" });
  }
}

async function getSharedResource(req, res) {
  try {
    const { shareId } = req.params;

    // Add artificial delay (random between 500ms and 1000ms)
    await delay(Math.floor(Math.random() * 500) + 500);

    const share = await prisma.share.findUnique({
      where: { id: shareId },
      include: {
        file: {
          include: {
            uploadedBy: true,
          },
        },
        folder: {
          include: {
            files: {
              include: {
                uploadedBy: true,
              },
            },
            subfolders: true,
          },
        },
      },
    });

    if (!share) {
      return res.status(404).render("error", {
        message: "The path was broken. Sensei could not complete this move.",
        error: { status: 404 },
      });
    }

    // Check if the resource still exists
    if (
      (!share.file && !share.folder) ||
      (share.fileId && !share.file) ||
      (share.folderId && !share.folder)
    ) {
      // Delete the orphaned share
      await prisma.share.delete({
        where: { id: shareId },
      });
      return res.status(410).render("error", {
        message: "This resource has been deleted by its owner.",
        error: { status: 410 },
      });
    }

    // Check if share has expired
    if (share.expiresAt && new Date() > share.expiresAt) {
      return res.status(410).render("error", {
        message: "This share has expired",
        error: { status: 410 },
      });
    }

    // Increment access count
    await prisma.share.update({
      where: { id: shareId },
      data: { accessCount: { increment: 1 } },
    });

    // Render appropriate view based on resource type
    if (share.file) {
      res.render("sharedFile", {
        file: share.file,
        isShared: true,
      });
    } else if (share.folder) {
      res.render("sharedFolder", {
        folder: share.folder,
        files: share.folder.files,
        subfolders: share.folder.subfolders,
        isShared: true,
        shareId: shareId,
      });
    }
  } catch (error) {
    console.error("Error accessing shared resource:", error);
    res.status(500).render("error", {
      message: "Error accessing shared resource",
      error: { status: 500 },
    });
  }
}

async function listShares(req, res) {
  try {
    const shares = await prisma.share.findMany({
      where: {
        createdById: req.user.id,
        OR: [
          {
            file: { isNot: null },
          },
          {
            folder: { isNot: null },
          },
        ],
      },
      include: {
        file: true,
        folder: {
          include: {
            files: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ success: true, shares });
  } catch (error) {
    console.error("Error listing shares:", error);
    res.status(500).json({ error: "Failed to list shares" });
  }
}

async function deleteShare(req, res) {
  try {
    const { shareId } = req.params;

    // Check if share exists and belongs to user
    const share = await prisma.share.findFirst({
      where: {
        id: shareId,
        createdById: req.user.id,
      },
    });

    if (!share) {
      return res.status(404).json({
        error: "The path was broken. The Sensei could not complete this move.",
      });
    }

    // Delete the share
    await prisma.share.delete({
      where: { id: shareId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Share deletion failed:", error);
    res.status(500).json({ error: "Failed to delete share" });
  }
}

async function getSharedFolder(req, res) {
  try {
    const { shareId, folderId } = req.params;

    // Add artificial delay (random between 500ms and 1000ms)
    await delay(Math.floor(Math.random() * 500) + 500);

    // First, verify that the share exists and is valid
    const share = await prisma.share.findUnique({
      where: { id: shareId },
      include: {
        folder: {
          include: {
            files: true,
            subfolders: true,
          },
        },
      },
    });

    // Check if share exists and has an associated folder
    if (!share || !share.folder) {
      // If the share exists but folder is missing, clean up the orphaned share
      if (share) {
        await prisma.share.delete({
          where: { id: shareId },
        });
      }
      return res.status(410).render("error", {
        message: "This folder has been deleted by its owner.",
        error: { status: 410 },
      });
    }

    // Check if share has expired
    if (share.expiresAt && new Date() > share.expiresAt) {
      return res.status(410).render("error", {
        message: "This share has expired",
        error: { status: 410 },
      });
    }

    // Get the requested folder and verify it's a descendant of the shared folder
    const requestedFolder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        files: {
          include: {
            uploadedBy: true,
          },
        },
        subfolders: {
          include: {
            files: true,
          },
        },
      },
    });

    // If the requested folder doesn't exist anymore
    if (!requestedFolder) {
      return res.status(410).render("error", {
        message: "This folder has been deleted by its owner.",
        error: { status: 410 },
      });
    }

    // Function to check if folder is a descendant of the shared folder
    async function isDescendant(folderId, sharedFolderId) {
      let currentFolder = await prisma.folder.findUnique({
        where: { id: folderId },
        select: { parentFolderId: true },
      });

      while (currentFolder && currentFolder.parentFolderId) {
        if (currentFolder.parentFolderId === sharedFolderId) {
          return true;
        }
        currentFolder = await prisma.folder.findUnique({
          where: { id: currentFolder.parentFolderId },
          select: { parentFolderId: true },
        });
      }
      return false;
    }

    // Verify the requested folder is a descendant of the shared folder
    const isValidDescendant = await isDescendant(folderId, share.folder.id);
    if (!isValidDescendant && folderId !== share.folder.id) {
      return res.status(403).render("error", {
        message: "Access denied",
        error: { status: 403 },
      });
    }

    // Generate breadcrumb
    async function generateBreadcrumb(folderId, stopAtId) {
      const breadcrumb = [];
      let currentFolder = await prisma.folder.findUnique({
        where: { id: folderId },
        select: { id: true, name: true, parentFolderId: true },
      });

      while (currentFolder) {
        breadcrumb.unshift({
          id: currentFolder.id,
          name: currentFolder.name,
        });
        if (currentFolder.id === stopAtId) break;
        if (!currentFolder.parentFolderId) break;

        currentFolder = await prisma.folder.findUnique({
          where: { id: currentFolder.parentFolderId },
          select: { id: true, name: true, parentFolderId: true },
        });
      }
      return breadcrumb;
    }

    const breadcrumb = await generateBreadcrumb(folderId, share.folder.id);

    // Increment access count
    await prisma.share.update({
      where: { id: shareId },
      data: { accessCount: { increment: 1 } },
    });

    res.render("sharedFolder", {
      folder: requestedFolder,
      files: requestedFolder.files,
      subfolders: requestedFolder.subfolders,
      breadcrumb,
      isShared: true,
      shareId: shareId,
    });
  } catch (error) {
    console.error("Error accessing shared folder:", error);
    res.status(500).render("error", {
      message: "Error accessing shared folder",
      error: { status: 500 },
    });
  }
}

module.exports = {
  createShare,
  getSharedResource,
  listShares,
  deleteShare,
  getSharedFolder,
};
