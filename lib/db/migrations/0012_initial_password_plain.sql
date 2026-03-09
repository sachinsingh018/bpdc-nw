-- Add column to store plain password for one-time distribution (e.g. bulk CSV import).
-- Use to pull credentials and share with users; consider clearing after distribution.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS initial_password_plain VARCHAR(255);
