-- AlterTable
ALTER TABLE "public"."live_input" ALTER COLUMN "type" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."webhook" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT NOT NULL,
    "notificationUrl" TEXT NOT NULL,
    "secret" TEXT NOT NULL,

    CONSTRAINT "webhook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webhook_accountId_key" ON "public"."webhook"("accountId");
