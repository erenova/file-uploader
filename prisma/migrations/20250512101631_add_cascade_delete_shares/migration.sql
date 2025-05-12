-- DropForeignKey
ALTER TABLE "Share" DROP CONSTRAINT "Share_fileId_fkey";

-- DropForeignKey
ALTER TABLE "Share" DROP CONSTRAINT "Share_folderId_fkey";

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
