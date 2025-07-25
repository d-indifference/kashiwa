/*
  Warnings:

  - Added the required column `board_id` to the `attached_file` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "attached_file" ADD COLUMN     "board_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "attached_file" ADD CONSTRAINT "attached_file_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "board"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
