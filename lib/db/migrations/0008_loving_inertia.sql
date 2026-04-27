CREATE TABLE IF NOT EXISTS "daily_interviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"interview_date" timestamp NOT NULL,
	"category" varchar(50),
	"completed_at" timestamp,
	"is_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interview_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"daily_interview_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"category" varchar(50) NOT NULL,
	"question_id" integer NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"ai_feedback" text,
	"answered_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interview_rounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"round_number" integer NOT NULL,
	"round_type" varchar(50) NOT NULL,
	"scheduled_date" timestamp,
	"completed_date" timestamp,
	"interviewer_name" varchar(255),
	"interviewer_email" varchar(255),
	"notes" text,
	"status" varchar(50) DEFAULT 'scheduled' NOT NULL,
	"feedback" text,
	"score" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"source" varchar(50) DEFAULT 'landing-page',
	"subscribed_at" timestamp DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "part_time_jobs" (
	"job_id" varchar(32) PRIMARY KEY NOT NULL,
	"job_title" text,
	"employer_name" text,
	"employer_logo" text,
	"job_city" text,
	"job_state" text,
	"job_country" text,
	"job_posted_at_datetime_utc" timestamp,
	"job_apply_link" text,
	"job_employment_type" text DEFAULT 'Part-time',
	"job_description" text,
	"job_is_remote" boolean,
	"job_min_salary" text,
	"job_max_salary" text,
	"job_salary_period" text,
	"searchedat" timestamp,
	"posted_by" varchar(50),
	"posted_by_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_calendar_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"week_start_date" timestamp NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" varchar(8) NOT NULL,
	"end_time" varchar(8) NOT NULL,
	"is_blocked" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_applications" ALTER COLUMN "status" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "anonymous_post" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "job_applications" ADD COLUMN "cv_file_url" text;--> statement-breakpoint
ALTER TABLE "job_applications" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "dailyMessageCount" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "lastMessageResetDate" timestamp;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "headline" text;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "education" jsonb;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "experience" jsonb;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "professional_skills" jsonb;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "certifications" jsonb;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "role" varchar(50) DEFAULT 'user';--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "student_status" varchar(20);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "initial_password_plain" varchar(255);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "daily_interviews" ADD CONSTRAINT "daily_interviews_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interview_progress" ADD CONSTRAINT "interview_progress_daily_interview_id_daily_interviews_id_fk" FOREIGN KEY ("daily_interview_id") REFERENCES "public"."daily_interviews"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interview_progress" ADD CONSTRAINT "interview_progress_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interview_rounds" ADD CONSTRAINT "interview_rounds_application_id_job_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."job_applications"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "part_time_jobs" ADD CONSTRAINT "part_time_jobs_posted_by_user_id_User_id_fk" FOREIGN KEY ("posted_by_user_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_calendar_blocks" ADD CONSTRAINT "user_calendar_blocks_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_user_interview_date" ON "daily_interviews" USING btree ("user_id","interview_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_daily_interviews_user_id" ON "daily_interviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_daily_interviews_date" ON "daily_interviews" USING btree ("interview_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_daily_interviews_completed" ON "daily_interviews" USING btree ("is_completed");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_interview_question" ON "interview_progress" USING btree ("daily_interview_id","question_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_interview_progress_daily_interview" ON "interview_progress" USING btree ("daily_interview_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_interview_progress_user_id" ON "interview_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_interview_rounds_application_id" ON "interview_rounds" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_interview_rounds_status" ON "interview_rounds" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_calendar_block" ON "user_calendar_blocks" USING btree ("user_id","week_start_date","day_of_week","start_time","end_time");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_calendar_blocks_user_week" ON "user_calendar_blocks" USING btree ("user_id","week_start_date");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "communities" ADD CONSTRAINT "communities_created_by_User_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
