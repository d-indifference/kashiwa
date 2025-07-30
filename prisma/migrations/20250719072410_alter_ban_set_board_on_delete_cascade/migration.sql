-- DropForeignKey
ALTER TABLE "ban" DROP CONSTRAINT "ban_board_id_fkey";

-- AddForeignKey
ALTER TABLE "ban" ADD CONSTRAINT "ban_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
