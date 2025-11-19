-- Create indexes for friends search and recommendations
-- Full-text search index for user search
CREATE INDEX IF NOT EXISTS "idx_user_search_fts" ON "User" 
USING gin(to_tsvector('english',
    coalesce("name",'') || ' ' ||
    coalesce("linkedinInfo",'') || ' ' ||
    coalesce("goals",'') || ' ' ||
    coalesce("strengths",'') || ' ' ||
    coalesce("interests",'') || ' ' ||
    coalesce("profilemetrics",'') || ' ' ||
    coalesce("headline",'')
));

-- Index on email for faster lookups
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"("email");

-- Index on createdAt for recommendations ordering
CREATE INDEX IF NOT EXISTS "idx_user_created_at" ON "User"("createdAt");

-- Index on connection table for faster status checks
CREATE INDEX IF NOT EXISTS "idx_connection_sender_receiver" ON "connection"("sender_id", "receiver_id");
CREATE INDEX IF NOT EXISTS "idx_connection_receiver_sender" ON "connection"("receiver_id", "sender_id");
CREATE INDEX IF NOT EXISTS "idx_connection_status" ON "connection"("status");

-- Composite index for connection lookups
CREATE INDEX IF NOT EXISTS "idx_connection_lookup" ON "connection"("sender_id", "receiver_id", "status");

