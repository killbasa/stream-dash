-- AlterEnum
ALTER TYPE "public"."LiveInputStatus" ADD VALUE 'errored';

-- AlterTable
ALTER TABLE "public"."live_input" ALTER COLUMN "status" DROP NOT NULL;
