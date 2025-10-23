-- Message System Migration
-- This creates the necessary tables for user-to-user messaging

-- Create messages table
CREATE TABLE IF NOT EXISTS user_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_messages_sender_receiver ON user_messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_receiver_sender ON user_messages(receiver_id, sender_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_created_at ON user_messages(created_at);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_messages_updated_at 
    BEFORE UPDATE ON user_messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add a constraint to ensure users can only message connected users
-- (This will be enforced at the application level for better performance) 