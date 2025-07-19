-- AlterTable
ALTER TABLE "ban" ADD COLUMN     "board_id" UUID;

-- AddForeignKey
ALTER TABLE "ban" ADD CONSTRAINT "ban_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "board"("id") ON DELETE SET NULL ON UPDATE CASCADE;
