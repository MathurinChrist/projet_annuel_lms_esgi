-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "hasCertificate" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true;
