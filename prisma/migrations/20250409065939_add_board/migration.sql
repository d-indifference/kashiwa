-- CreateEnum
CREATE TYPE "FileAttachmentMode" AS ENUM ('STRICT', 'OPTIONAL', 'FORBIDDEN');

-- CreateTable
CREATE TABLE "board" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "url" VARCHAR(64) NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "post_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_settings" (
    "id" UUID NOT NULL,
    "allow_posting" BOOLEAN NOT NULL,
    "strict_anonymity" BOOLEAN NOT NULL,
    "thread_file_attachment_mode" "FileAttachmentMode" NOT NULL,
    "reply_file_attachment_mode" "FileAttachmentMode" NOT NULL,
    "delay_after_thread" INTEGER NOT NULL,
    "delay_after_reply" INTEGER NOT NULL,
    "min_file_size" INTEGER NOT NULL,
    "max_file_size" INTEGER NOT NULL,
    "allow_markdown" BOOLEAN NOT NULL,
    "allow_tripcodes" BOOLEAN NOT NULL,
    "max_threads_on_board" INTEGER NOT NULL,
    "bump_limit" INTEGER NOT NULL,
    "max_string_field_size" INTEGER NOT NULL,
    "max_comment_size" INTEGER NOT NULL,
    "default_poster_name" VARCHAR(256) NOT NULL,
    "default_moderator_name" VARCHAR(256) NOT NULL,
    "enable_captcha" BOOLEAN NOT NULL,
    "is_captcha_case_sensetive" BOOLEAN NOT NULL,
    "allowed_file_types" JSONB NOT NULL,
    "rules" TEXT NOT NULL,

    CONSTRAINT "board_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "board_url_key" ON "board"("url");

-- AddForeignKey
ALTER TABLE "board_settings" ADD CONSTRAINT "board_settings_id_fkey" FOREIGN KEY ("id") REFERENCES "board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
