-- CreateTable
CREATE TABLE "URL" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "long_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "URL_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "URL_slug_key" ON "URL"("slug");
