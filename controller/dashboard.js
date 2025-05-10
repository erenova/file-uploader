const prisma = require("../utils/db");
const getFolderBreadcrumb = require("../utils/folderBreadcrumb");

async function getDashboard(req, res) {
  const folderId = req.params.folderId || null;
  const userId = req.user.id;
  const breadcrumb = folderId
    ? await getFolderBreadcrumb(prisma, folderId)
    : [];
  // Get folders inside current folder
  const folders = await prisma.folder.findMany({
    where: {
      createdById: userId,
      parentFolderId: folderId,
    },
    include: {
      files: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get files inside current folder
  const fileWhere = {
    uploadedById: userId,
  };

  if (folderId) {
    fileWhere.folderId = folderId;
  }

  const files = await prisma.file.findMany({
    where: fileWhere,
    orderBy: {
      uploadedAt: "desc",
    },
  });

  res.render("dashboard", {
    folders,
    files,
    currentFolderId: folderId,
    user: req.user,
    breadcrumb,
  });
}

module.exports = { getDashboard };
