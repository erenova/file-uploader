-- AlterTable
ALTER TABLE "Share" DROP CONSTRAINT "Share_fileId_fkey",
    DROP CONSTRAINT "Share_folderId_fkey";

-- Add cascade delete constraints
ALTER TABLE "Share" ADD CONSTRAINT "Share_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Share" ADD CONSTRAINT "Share_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
