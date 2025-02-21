/*
  Warnings:

  - You are about to drop the column `publishDate` on the `Book` table. All the data in the column will be lost.
  - Added the required column `attributes` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Book" DROP COLUMN "publishDate",
ADD COLUMN     "attributes" JSONB NOT NULL;
