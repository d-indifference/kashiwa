/*
  Warnings:

  - Added the required column `has_sage` to the `comment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "comment" ADD COLUMN     "has_sage" BOOLEAN NOT NULL;
