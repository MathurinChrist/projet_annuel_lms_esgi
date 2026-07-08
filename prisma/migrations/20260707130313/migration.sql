/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `completed` on the `Enrollment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Enrollment` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `type` on the `Lesson` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "Module" DROP CONSTRAINT "Module_courseId_fkey";

-- DropIndex
DROP INDEX "Course_slug_key";

-- DropIndex
DROP INDEX "Lesson_slug_key";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "categoryId",
DROP COLUMN "slug",
DROP COLUMN "thumbnail",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Enrollment" DROP COLUMN "completed",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "order",
DROP COLUMN "slug",
DROP COLUMN "updatedAt",
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "bio";

-- DropTable
DROP TABLE "Category";

-- DropEnum
DROP TYPE "LessonType";

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
