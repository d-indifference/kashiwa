-- AlterTable
ALTER TABLE "board_settings" ADD COLUMN     "allow_oekaki_replies" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allow_oekaki_threads" BOOLEAN NOT NULL DEFAULT false;
