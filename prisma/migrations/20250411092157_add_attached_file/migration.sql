-- CreateTable
CREATE TABLE "attached_file" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(128) NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "mime" VARCHAR(128) NOT NULL,
    "is_image" BOOLEAN NOT NULL,
    "md5" VARCHAR(256) NOT NULL,
    "thumbnail" VARCHAR(128) NOT NULL,
    "thumbnail_width" INTEGER NOT NULL,
    "thumbnail_height" INTEGER NOT NULL,

    CONSTRAINT "attached_file_pkey" PRIMARY KEY ("id")
);
