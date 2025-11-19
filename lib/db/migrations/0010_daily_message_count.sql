-- Add daily message count tracking fields to User table
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "dailyMessageCount" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "lastMessageResetDate" TIMESTAMP;

-- Create index for faster queries on email and reset date
CREATE INDEX IF NOT EXISTS "idx_user_daily_message_reset" ON "User"("lastMessageResetDate");

