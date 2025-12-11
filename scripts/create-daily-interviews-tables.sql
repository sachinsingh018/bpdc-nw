-- Create daily_interviews table for tracking daily interview limits
-- This ensures users can only do one interview per day

CREATE TABLE IF NOT EXISTS public.daily_interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    interview_date TIMESTAMP NOT NULL,
    category VARCHAR(50),
    completed_at TIMESTAMP, -- NULL if in progress
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create unique index to ensure one interview per user per day
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_interview_date 
ON public.daily_interviews(user_id, interview_date);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_interviews_user_id 
ON public.daily_interviews(user_id);

CREATE INDEX IF NOT EXISTS idx_daily_interviews_date 
ON public.daily_interviews(interview_date);

CREATE INDEX IF NOT EXISTS idx_daily_interviews_completed 
ON public.daily_interviews(is_completed);

-- Add comment to table
COMMENT ON TABLE public.daily_interviews IS 'Tracks daily interview completions to enforce one interview per day limit';

-- Create interview_progress table for tracking answers and progress
CREATE TABLE IF NOT EXISTS public.interview_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_interview_id UUID NOT NULL REFERENCES public.daily_interviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    question_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    ai_feedback TEXT,
    answered_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create unique index to ensure one answer per question per interview
CREATE UNIQUE INDEX IF NOT EXISTS unique_interview_question 
ON public.interview_progress(daily_interview_id, question_id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_interview_progress_daily_interview 
ON public.interview_progress(daily_interview_id);

CREATE INDEX IF NOT EXISTS idx_interview_progress_user_id 
ON public.interview_progress(user_id);

-- Add comment to table
COMMENT ON TABLE public.interview_progress IS 'Tracks individual question answers and progress for in-progress interviews';


