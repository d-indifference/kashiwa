-- AlterTable
ALTER TABLE "attached_file" ALTER COLUMN "width" DROP NOT NULL,
ALTER COLUMN "height" DROP NOT NULL,
ALTER COLUMN "thumbnail" DROP NOT NULL,
ALTER COLUMN "thumbnail_width" DROP NOT NULL,
ALTER COLUMN "thumbnail_height" DROP NOT NULL;
