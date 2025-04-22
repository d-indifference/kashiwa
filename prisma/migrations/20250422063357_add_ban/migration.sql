-- CreateTable
CREATE TABLE "ban" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" VARCHAR(64) NOT NULL,
    "till" TIMESTAMP(3) NOT NULL,
    "reason" VARCHAR(512) NOT NULL,
    "user_id" UUID,

    CONSTRAINT "ban_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ban" ADD CONSTRAINT "ban_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
