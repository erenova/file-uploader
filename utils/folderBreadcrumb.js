// utils/folderBreadcrumb.js
const getFolderBreadcrumb = async (prisma, folderId) => {
  const trail = [];

  let currentId = folderId;

  while (currentId) {
    const folder = await prisma.folder.findUnique({
      where: { id: currentId },
      select: { id: true, name: true, parentFolderId: true },
    });

    if (!folder) break;

    trail.unshift({
      id: folder.id,
      name: folder.name,
    });

    currentId = folder.parentFolderId;
  }

  return trail;
};

module.exports = getFolderBreadcrumb;
