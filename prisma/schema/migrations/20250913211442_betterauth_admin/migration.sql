/*
  Warnings:

  - You are about to drop the column `scopes` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `webhook` table. All the data in the column will be lost.
  - You are about to drop the column `defaultScopes` on the `whitelist` table. All the data in the column will be lost.
  - Made the column `createdAt` on table `verification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `verification` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."webhook_accountId_key";

-- AlterTable
ALTER TABLE "public"."account" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."session" ADD COLUMN     "impersonatedBy" TEXT,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "scopes",
ADD COLUMN     "banExpires" TIMESTAMP(3),
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "banned" BOOLEAN DEFAULT false,
ALTER COLUMN "emailVerified" SET DEFAULT false,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "role" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."verification" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."webhook" DROP COLUMN "accountId";

-- AlterTable
ALTER TABLE "public"."whitelist" DROP COLUMN "defaultScopes";
