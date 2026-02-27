-- DropForeignKey
ALTER TABLE "URL" DROP CONSTRAINT "URL_user_id_fkey";

-- AlterTable
ALTER TABLE "URL" ALTER COLUMN "user_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Clicks" (
    "id" TEXT NOT NULL,
    "url_id" INTEGER NOT NULL,
    "referer" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "ip" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Clicks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "URL" ADD CONSTRAINT "URL_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clicks" ADD CONSTRAINT "Clicks_url_id_fkey" FOREIGN KEY ("url_id") REFERENCES "URL"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
