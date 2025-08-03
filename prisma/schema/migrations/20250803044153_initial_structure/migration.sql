-- CreateEnum
CREATE TYPE "public"."LiveInputType" AS ENUM ('ingest', 'return');

-- CreateEnum
CREATE TYPE "public"."LiveInputStatus" AS ENUM ('connected', 'disconnected');

-- CreateTable
CREATE TABLE "public"."live_input" (
    "id" TEXT NOT NULL,
    "cloudflareId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "public"."LiveInputType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ingestWebrtcUrl" TEXT NOT NULL,
    "playbackWebrtcUrl" TEXT NOT NULL,
    "status" "public"."LiveInputStatus" NOT NULL DEFAULT 'disconnected',

    CONSTRAINT "live_input_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."talent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageId" TEXT,
    "imageUrl" TEXT,

    CONSTRAINT "talent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."location" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."block" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "ingestLiveInputId" TEXT,
    "playbackLiveInputId" TEXT,
    "locationId" TEXT,

    CONSTRAINT "block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_BlockToTalent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BlockToTalent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "live_input_cloudflareId_key" ON "public"."live_input"("cloudflareId");

-- CreateIndex
CREATE UNIQUE INDEX "live_input_ingestWebrtcUrl_key" ON "public"."live_input"("ingestWebrtcUrl");

-- CreateIndex
CREATE UNIQUE INDEX "live_input_playbackWebrtcUrl_key" ON "public"."live_input"("playbackWebrtcUrl");

-- CreateIndex
CREATE UNIQUE INDEX "live_input_type_name_key" ON "public"."live_input"("type", "name");

-- CreateIndex
CREATE UNIQUE INDEX "talent_name_key" ON "public"."talent"("name");

-- CreateIndex
CREATE UNIQUE INDEX "location_name_key" ON "public"."location"("name");

-- CreateIndex
CREATE INDEX "_BlockToTalent_B_index" ON "public"."_BlockToTalent"("B");

-- AddForeignKey
ALTER TABLE "public"."block" ADD CONSTRAINT "block_ingestLiveInputId_fkey" FOREIGN KEY ("ingestLiveInputId") REFERENCES "public"."live_input"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."block" ADD CONSTRAINT "block_playbackLiveInputId_fkey" FOREIGN KEY ("playbackLiveInputId") REFERENCES "public"."live_input"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."block" ADD CONSTRAINT "block_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_BlockToTalent" ADD CONSTRAINT "_BlockToTalent_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_BlockToTalent" ADD CONSTRAINT "_BlockToTalent_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."talent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
