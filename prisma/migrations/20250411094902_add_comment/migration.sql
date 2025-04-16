-- CreateTable
CREATE TABLE "comment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "board_id" UUID NOT NULL,
    "num" BIGINT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "ip" VARCHAR(64) NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "tripcode" VARCHAR(256),
    "subject" VARCHAR(256),
    "comment" TEXT NOT NULL,
    "password" VARCHAR(8) NOT NULL,
    "last_hit" TIMESTAMP(3),
    "attached_file_id" UUID,
    "parent_id" UUID,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "comment_board_id_num_key" ON "comment"("board_id", "num");

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_attached_file_id_fkey" FOREIGN KEY ("attached_file_id") REFERENCES "attached_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
