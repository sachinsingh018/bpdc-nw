-- Anonymous Feed Database Migration
-- This migration adds tables for anonymous posts, comments, and likes

-- Create anonymous_post table
CREATE TABLE IF NOT EXISTS "anonymous_post" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "User"("id"),
    "content" text NOT NULL,
    "is_anonymous" boolean NOT NULL DEFAULT true,
    "company_name" text,
    "industry" text,
    "topic" varchar NOT NULL DEFAULT 'general' CHECK ("topic" IN ('company_culture', 'workplace_issues', 'career_advice', 'general')),
    "likes_count" integer NOT NULL DEFAULT 0,
    "comments_count" integer NOT NULL DEFAULT 0,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Create anonymous_comment table
CREATE TABLE IF NOT EXISTS "anonymous_comment" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "post_id" uuid NOT NULL REFERENCES "anonymous_post"("id") ON DELETE CASCADE,
    "user_id" uuid NOT NULL REFERENCES "User"("id"),
    "content" text NOT NULL,
    "is_anonymous" boolean NOT NULL DEFAULT true,
    "likes_count" integer NOT NULL DEFAULT 0,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Create anonymous_post_like table
CREATE TABLE IF NOT EXISTS "anonymous_post_like" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "post_id" uuid NOT NULL REFERENCES "anonymous_post"("id") ON DELETE CASCADE,
    "user_id" uuid NOT NULL REFERENCES "User"("id"),
    "created_at" timestamp NOT NULL DEFAULT now(),
    UNIQUE("post_id", "user_id")
);

-- Create anonymous_comment_like table
CREATE TABLE IF NOT EXISTS "anonymous_comment_like" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "comment_id" uuid NOT NULL REFERENCES "anonymous_comment"("id") ON DELETE CASCADE,
    "user_id" uuid NOT NULL REFERENCES "User"("id"),
    "created_at" timestamp NOT NULL DEFAULT now(),
    UNIQUE("comment_id", "user_id")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "anonymous_post_user_id_idx" ON "anonymous_post"("user_id");
CREATE INDEX IF NOT EXISTS "anonymous_post_created_at_idx" ON "anonymous_post"("created_at");
CREATE INDEX IF NOT EXISTS "anonymous_post_topic_idx" ON "anonymous_post"("topic");
CREATE INDEX IF NOT EXISTS "anonymous_comment_post_id_idx" ON "anonymous_comment"("post_id");
CREATE INDEX IF NOT EXISTS "anonymous_comment_user_id_idx" ON "anonymous_comment"("user_id");
CREATE INDEX IF NOT EXISTS "anonymous_comment_created_at_idx" ON "anonymous_comment"("created_at");
CREATE INDEX IF NOT EXISTS "anonymous_post_like_post_id_idx" ON "anonymous_post_like"("post_id");
CREATE INDEX IF NOT EXISTS "anonymous_post_like_user_id_idx" ON "anonymous_post_like"("user_id");
CREATE INDEX IF NOT EXISTS "anonymous_comment_like_comment_id_idx" ON "anonymous_comment_like"("comment_id");
CREATE INDEX IF NOT EXISTS "anonymous_comment_like_user_id_idx" ON "anonymous_comment_like"("user_id");

-- Add comments for documentation
COMMENT ON TABLE "anonymous_post" IS 'Stores anonymous posts for the anonymous chat feed';
COMMENT ON TABLE "anonymous_comment" IS 'Stores comments on anonymous posts';
COMMENT ON TABLE "anonymous_post_like" IS 'Stores user likes on anonymous posts';
COMMENT ON TABLE "anonymous_comment_like" IS 'Stores user likes on anonymous comments'; 