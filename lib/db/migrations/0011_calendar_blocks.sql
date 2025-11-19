-- Weekly Calendar Blocks Table
CREATE TABLE IF NOT EXISTS user_calendar_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL, -- Monday of the week
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Monday, 6=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_blocked BOOLEAN DEFAULT true, -- true = blocked, false = available
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, week_start_date, day_of_week, start_time, end_time)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_calendar_blocks_user_week ON user_calendar_blocks(user_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_calendar_blocks_user_week_day ON user_calendar_blocks(user_id, week_start_date, day_of_week);

-- Add time_zone and working_hours to User table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'time_zone') THEN
        ALTER TABLE "User" ADD COLUMN time_zone VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'working_hours') THEN
        ALTER TABLE "User" ADD COLUMN working_hours VARCHAR(20); -- Format: "09:00-17:00"
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'last_calendar_reset') THEN
        ALTER TABLE "User" ADD COLUMN last_calendar_reset TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

