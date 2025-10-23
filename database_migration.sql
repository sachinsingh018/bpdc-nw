-- Admin Dashboard Activity Tracking Tables
-- Run these SQL queries to create the required tables

-- 1. User Activity Logs Table
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    action_category VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Sessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. Page Views Table
CREATE TABLE IF NOT EXISTS page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255),
    page_path VARCHAR(500) NOT NULL,
    page_title VARCHAR(255),
    referrer VARCHAR(500),
    time_on_page INTEGER, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Feature Usage Table
CREATE TABLE IF NOT EXISTS feature_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Activity Categories Table (for reference)
CREATE TABLE IF NOT EXISTS activity_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Activity Types Table (for reference)
CREATE TABLE IF NOT EXISTS activity_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_name VARCHAR(100) UNIQUE NOT NULL,
    category_id UUID REFERENCES activity_categories(id),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Daily Activity Summary Table (for performance)
CREATE TABLE IF NOT EXISTS daily_activity_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_date DATE NOT NULL,
    total_users INTEGER DEFAULT 0,
    total_actions INTEGER DEFAULT 0,
    auth_actions INTEGER DEFAULT 0,
    social_actions INTEGER DEFAULT 0,
    content_actions INTEGER DEFAULT 0,
    job_actions INTEGER DEFAULT 0,
    community_actions INTEGER DEFAULT 0,
    skills_actions INTEGER DEFAULT 0,
    messaging_actions INTEGER DEFAULT 0,
    search_actions INTEGER DEFAULT 0,
    navigation_actions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(activity_date)
);

-- Insert default activity categories
INSERT INTO activity_categories (category_name, description) VALUES
    ('authentication', 'User login, logout, registration'),
    ('social', 'Social interactions, connections, messaging'),
    ('content', 'Content creation, editing, viewing'),
    ('communities', 'Community interactions, joining, posting'),
    ('jobs', 'Job board activities, posting, applying'),
    ('skills', 'Skill assessments, badges, learning'),
    ('messaging', 'Direct messaging, notifications'),
    ('search', 'Search functionality usage'),
    ('navigation', 'Page navigation, menu usage')
ON CONFLICT (category_name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_category ON user_activity_logs(action_category);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_type ON user_activity_logs(action_type);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON user_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);

CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(page_path);

CREATE INDEX IF NOT EXISTS idx_feature_usage_user_id ON feature_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_feature ON feature_usage(feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_usage_created_at ON feature_usage(created_at);

CREATE INDEX IF NOT EXISTS idx_daily_summary_date ON daily_activity_summary(activity_date);

-- Create a view for easy querying of recent activity
CREATE OR REPLACE VIEW recent_activity_view AS
SELECT 
    ual.id,
    ual.user_id,
    ual.action_type,
    ual.action_category,
    ual.resource_type,
    ual.resource_id,
    ual.metadata,
    ual.created_at,
    u.email,
    u.name
FROM user_activity_logs ual
LEFT JOIN "user" u ON ual.user_id = u.id
ORDER BY ual.created_at DESC;

-- Create a view for user engagement metrics
CREATE OR REPLACE VIEW user_engagement_view AS
SELECT 
    u.id,
    u.email,
    u.name,
    u."createdAt" as registered_at,
    COUNT(DISTINCT ual.id) as total_actions,
    COUNT(DISTINCT us.id) as total_sessions,
    COUNT(DISTINCT pv.id) as total_page_views,
    MAX(ual.created_at) as last_activity,
    COUNT(DISTINCT CASE WHEN ual.action_category = 'social' THEN ual.id END) as social_actions,
    COUNT(DISTINCT CASE WHEN ual.action_category = 'content' THEN ual.id END) as content_actions,
    COUNT(DISTINCT CASE WHEN ual.action_category = 'jobs' THEN ual.id END) as job_actions
FROM "user" u
LEFT JOIN user_activity_logs ual ON u.id = ual.user_id
LEFT JOIN user_sessions us ON u.id = us.user_id
LEFT JOIN page_views pv ON u.id = pv.user_id
GROUP BY u.id, u.email, u.name, u."createdAt";

-- Sample data insertion (optional - for testing)
INSERT INTO user_activity_logs (user_id, action_type, action_category, resource_type, resource_id, metadata, ip_address, user_agent, session_id) VALUES
    ('test-user-1', 'login', 'authentication', 'user', 'test-user-1', '{"method": "email"}', '127.0.0.1', 'Mozilla/5.0 (Test Browser)', 'test-session-1'),
    ('test-user-1', 'view_job_board', 'jobs', 'page', 'job-board', '{"page": "job-board"}', '127.0.0.1', 'Mozilla/5.0 (Test Browser)', 'test-session-1'),
    ('test-user-2', 'post_job', 'jobs', 'job', 'job-1', '{"category": "alumni"}', '127.0.0.1', 'Mozilla/5.0 (Test Browser)', 'test-session-2')
ON CONFLICT DO NOTHING;

INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, device_type, browser, os) VALUES
    ('test-user-1', 'test-session-1', '127.0.0.1', 'Mozilla/5.0 (Test Browser)', 'desktop', 'chrome', 'windows'),
    ('test-user-2', 'test-session-2', '127.0.0.1', 'Mozilla/5.0 (Test Browser)', 'mobile', 'safari', 'ios')
ON CONFLICT DO NOTHING;

INSERT INTO page_views (user_id, session_id, page_path, page_title, referrer, time_on_page) VALUES
    ('test-user-1', 'test-session-1', '/job-board', 'Job Board', '/', 120),
    ('test-user-2', 'test-session-2', '/admin/dashboard', 'Admin Dashboard', '/job-board', 300)
ON CONFLICT DO NOTHING;

INSERT INTO feature_usage (user_id, feature_name, action, metadata) VALUES
    ('test-user-1', 'job_board', 'view', '{"category": "all"}'),
    ('test-user-2', 'job_posting', 'create', '{"category": "alumni"}')
ON CONFLICT DO NOTHING; 