-- Google OAuth Migration Script
-- Add Google OAuth fields to the User table

-- Add Google OAuth fields
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "googleId" varchar(255);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" text;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "provider" varchar(50);

-- Create index on googleId for faster lookups
CREATE INDEX IF NOT EXISTS "User_googleId_idx" ON "User"("googleId");

-- Add unique constraint on googleId to prevent duplicates
-- Note: This is optional and depends on your business logic
-- ALTER TABLE "User" ADD CONSTRAINT "User_googleId_unique" UNIQUE("googleId");

-- Update existing users to have provider as 'credentials' if they have a password
UPDATE "User" SET "provider" = 'credentials' WHERE "password" IS NOT NULL AND "provider" IS NULL;

-- Add comment to document the new fields
COMMENT ON COLUMN "User"."googleId" IS 'Google OAuth user ID';
COMMENT ON COLUMN "User"."avatarUrl" IS 'User avatar URL from Google OAuth';
COMMENT ON COLUMN "User"."provider" IS 'Authentication provider (credentials, google, etc.)'; 