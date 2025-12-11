# Database Schema Description

## Overview
This is a PostgreSQL database schema for a professional networking and career development platform built with Drizzle ORM. The database supports user management, networking features, job applications, skill assessments, communities, anonymous posting, AI chat functionality, and comprehensive activity tracking.

## Database Technology
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Naming Convention**: Mixed (some tables use PascalCase, others use snake_case)

---

## Core Tables

### 1. User Table (`User`)
**Primary table for all user accounts**

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `email` (VARCHAR(64), NOT NULL, Unique identifier)
- `password` (VARCHAR(255), Optional - for email/password auth)
- `name` (TEXT, Optional)
- `linkedinInfo` (TEXT, Optional - LinkedIn profile data)
- `goals` (TEXT, Optional - User career goals)
- `profilemetrics` (TEXT, Optional - Profile metrics)
- `strengths` (TEXT, Optional - User strengths)
- `interests` (TEXT, Optional - User interests)
- `linkedinURL` (TEXT, Optional)
- `FacebookURL` (TEXT, Optional)
- `phone` (TEXT, Optional)
- `referral_code` (TEXT, Optional - Referral code)
- `googleId` (VARCHAR(255), Optional - Google OAuth ID)
- `avatarUrl` (TEXT, Optional)
- `provider` (VARCHAR(50), Optional - OAuth provider)
- `anonymous_username` (VARCHAR(50), Optional - For anonymous features)
- `anonymous_avatar` (VARCHAR(255), Optional)
- `flaggedChatExpiresAt` (TIMESTAMP, Optional - Chat flag expiration)
- `createdAt` (TIMESTAMP, Optional)
- `dailyMessageCount` (INTEGER, Default: 0 - Daily AI chat message limit tracking)
- `lastMessageResetDate` (TIMESTAMP, Optional - Last reset date for message count)
- `lastInterviewDate` (TIMESTAMP, Optional)
- `interviewCount` (INTEGER, Default: 0)
- `headline` (TEXT, Optional - Professional headline)
- `education` (JSONB, Optional - Education history)
- `experience` (JSONB, Optional - Work experience)
- `professional_skills` (JSONB, Optional - Skills list)
- `certifications` (JSONB, Optional - Certifications)
- `role` (VARCHAR(50), Default: 'user' - User role: 'user', 'recruiter', 'admin', etc.)

**Business Logic:**
- Daily message limit: 7 messages per day (enforced via `dailyMessageCount` and `lastMessageResetDate`)
- Supports both email/password and Google OAuth authentication
- Profile data stored as comma-separated strings or JSONB for complex structures

---

### 2. Chat Table (`Chat`)
**AI chat conversations**

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `createdAt` (TIMESTAMP, NOT NULL)
- `title` (TEXT, NOT NULL)
- `userId` (UUID, NOT NULL, Foreign Key → User.id)
- `visibility` (VARCHAR, Enum: 'public' | 'private', Default: 'private')

**Relationships:**
- One-to-many with `Message_v2` table
- One-to-many with `Vote_v2` table

---

### 3. Message Tables

#### 3a. Message_v2 (`Message_v2`) - **ACTIVE**
**Current message format for AI chats**

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `chatId` (UUID, NOT NULL, Foreign Key → Chat.id)
- `role` (VARCHAR, NOT NULL - Message role)
- `parts` (JSON, NOT NULL - Message parts)
- `attachments` (JSON, NOT NULL - Attachments)
- `createdAt` (TIMESTAMP, NOT NULL)

#### 3b. Message (`Message`) - **DEPRECATED**
**Old message format (deprecated, for migration purposes)**

**Fields:**
- `id` (UUID, Primary Key)
- `chatId` (UUID, NOT NULL, Foreign Key → Chat.id)
- `role` (VARCHAR, NOT NULL)
- `content` (JSON, NOT NULL)
- `createdAt` (TIMESTAMP, NOT NULL)

---

### 4. Vote Tables

#### 4a. Vote_v2 (`Vote_v2`) - **ACTIVE**
**Message voting for current message format**

**Fields:**
- `chatId` (UUID, NOT NULL, Foreign Key → Chat.id, Composite Primary Key)
- `messageId` (UUID, NOT NULL, Foreign Key → Message_v2.id, Composite Primary Key)
- `isUpvoted` (BOOLEAN, NOT NULL)

#### 4b. Vote (`Vote`) - **DEPRECATED**
**Old vote format (deprecated)**

**Fields:**
- `chatId` (UUID, NOT NULL, Foreign Key → Chat.id, Composite Primary Key)
- `messageId` (UUID, NOT NULL, Foreign Key → Message.id, Composite Primary Key)
- `isUpvoted` (BOOLEAN, NOT NULL)

---

### 5. Document Table (`Document`)
**Documents/artifacts created by users**

**Fields:**
- `id` (UUID, NOT NULL, Composite Primary Key with createdAt)
- `createdAt` (TIMESTAMP, NOT NULL, Composite Primary Key)
- `title` (TEXT, NOT NULL)
- `content` (TEXT, Optional)
- `kind` (VARCHAR, Enum: 'text' | 'code' | 'image' | 'sheet', Default: 'text')
- `userId` (UUID, NOT NULL, Foreign Key → User.id)

**Relationships:**
- One-to-many with `Suggestion` table (via composite foreign key)

---

### 6. Suggestion Table (`Suggestion`)
**Document suggestions/edits**

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `documentId` (UUID, NOT NULL, Foreign Key → Document.id)
- `documentCreatedAt` (TIMESTAMP, NOT NULL, Foreign Key → Document.createdAt)
- `originalText` (TEXT, NOT NULL)
- `suggestedText` (TEXT, NOT NULL)
- `description` (TEXT, Optional)
- `isResolved` (BOOLEAN, Default: false)
- `userId` (UUID, NOT NULL, Foreign Key → User.id)
- `createdAt` (TIMESTAMP, NOT NULL)

**Relationships:**
- Foreign key to Document table (composite: documentId + documentCreatedAt)

---

## Networking & Social Features

### 7. Connection Table (`connection`)
**User connection requests and relationships**

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `sender_id` (UUID, NOT NULL, Foreign Key → User.id)
- `receiver_id` (UUID, NOT NULL, Foreign Key → User.id)
- `status` (VARCHAR, Enum: 'pending' | 'accepted' | 'rejected', Default: 'pending')
- `message` (TEXT, Optional - Connection request message)
- `created_at` (TIMESTAMP, NOT NULL, Default: NOW())
- `updated_at` (TIMESTAMP, NOT NULL, Default: NOW())

**Constraints:**
- Unique index on (sender_id, receiver_id) to prevent duplicate requests

**Business Logic:**
- Connections are bidirectional (can query by either sender_id or receiver_id)
- Only accepted connections allow direct messaging

---

### 8. Notification Table (`notification`)
**User notifications**

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `user_id` (UUID, NOT NULL, Foreign Key → User.id)
- `type` (VARCHAR, Enum: 'connection_request' | 'connection_accepted' | 'connection_rejected')
- `title` (TEXT, NOT NULL)
- `message` (TEXT, NOT NULL)
- `related_user_id` (UUID, Optional, Foreign Key → User.id)
- `related_connection_id` (UUID, Optional, Foreign Key → connection.id)
- `is_read` (BOOLEAN, Default: false)
- `created_at` (TIMESTAMP, NOT NULL, Default: NOW())

**Business Logic:**
- Notifications filtered to show only pending connections or general notifications

---

### 9. User Messages Table (`user_messages`)
**Direct messages between connected users**

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `sender_id` (UUID, NOT NULL, Foreign Key → User.id, CASCADE DELETE)
- `receiver_id` (UUID, NOT NULL, Foreign Key → User.id, CASCADE DELETE)
- `message` (TEXT, NOT NULL)
- `is_read` (BOOLEAN, Default: false)
- `created_at` (TIMESTAMP, NOT NULL, Default: NOW())
- `updated_at` (TIMESTAMP, NOT NULL, Default: NOW())

**Indexes:**
- Index on (sender_id, receiver_id)
- Index on (receiver_id, sender_id)
- Index on created_at

**Business Logic:**
- Users must be connected (status='accepted') to send messages
- Messages are bidirectional (can query by either sender or receiver)

---

## Authentication & Security

### 10. Password Reset Tokens Table (`password_reset_tokens`)
**Password reset token management**

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `user_id` (UUID, NOT NULL, Foreign Key → User.id)
- `token` (VARCHAR(255), NOT NULL)
- `expires_at` (TIMESTAMP, NOT NULL)
- `created_at` (TIMESTAMP, NOT NULL, Default: NOW())

---

## Anonymous Features

### 11. Anonymous Post Table (`anonymous_post`)
**Anonymous posts/feed**

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `user_id` (UUID, NOT NULL, Foreign Key → User.id)
- `content` (TEXT, NOT NULL)
- `image_url` (TEXT, Optional)
- `is_anonymous` (BOOLEAN, Default: true)
- `company_name` (TEXT, Optional)
- `industry` (TEXT, Optional)
- `topic` (VARCHAR, Enum: 'company_culture' | 'workplace_issues' | 'career_advice' | 'general', Default: 'general')
- `likes_count` (INTEGER, Default: 0)
- `comments_count` (INTEGER, Default: 0)
- `created_at` (TIMESTAMP, NOT NULL, Default: NOW())
- `updated_at` (TIMESTAMP, NOT NULL, Default: NOW())

---

### 12. Anonymous Comment Table (`anonymous_comment`)
**Comments on anonymous posts**

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `post_id` (UUID, NOT NULL, Foreign Key → anonymous_post.id, CASCADE DELETE)
- `user_id` (UUID, NOT NULL, Foreign Key → User.id)
- `content` (TEXT, NOT NULL)
- `is_anonymous` (BOOLEAN, Default: true)
- `likes_count` (INTEGER, Default: 0)
- `created_at` (TIMESTAMP, NOT NULL, Default: NOW())
- `updated_at` (TIMESTAMP, NOT NULL, Default: NOW())

---

### 13. Anonymous Post Like Table (`anonymous_post_like`)
**Likes on anonymous posts**

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `post_id` (UUID, NOT NULL, Foreign Key → anonymous_post.id, CASCADE DELETE)
- `user_id` (UUID, NOT NULL, Foreign Key → User.id)
- `created_at` (TIMESTAMP, NOT NULL, Default: NOW())

**Constraints:**
- Unique index on (post_id, user_id) to prevent duplicate likes

---

### 14. Anonymous Comment Like Table (`anonymous_comment_like`)
**Likes on anonymous comments**

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `comment_id` (UUID, NOT NULL, Foreign Key → anonymous_comment.id, CASCADE DELETE)
- `user_id` (UUID, NOT NULL, Foreign Key → User.id)
- `created_at` (TIMESTAMP, NOT NULL, Default: NOW())

**Constraints:**
- Unique index on (comment_id, user_id) to prevent duplicate likes

---

## Skill Assessment System

### 15. Skills Table (`skills`)
**Available skills for assessment**

**Fields:**
- `id` (SERIAL, Primary Key)
- `name` (VARCHAR(255), NOT NULL)

---

### 16. Skill Questions Table (`skill_questions`)
**Questions for each skill**

**Fields:**
- `id` (SERIAL, Primary Key)
- `skillId` (INTEGER, NOT NULL, Foreign Key → skills.id)
- `question` (TEXT, NOT NULL)
- `options` (JSON, NOT NULL - Array of 4 strings)
- `correctIndex` (INTEGER, NOT NULL - 0-3, index of correct answer)

---

### 17. Skill Attempts Table (`skill_attempts`)
**User skill assessment attempts**

**Fields:**
- `id` (SERIAL, Primary Key)
- `userId` (UUID, NOT NULL, Foreign Key → User.id)
- `skillId` (INTEGER, NOT NULL, Foreign Key → skills.id)
- `score` (INTEGER, NOT NULL)
- `total` (INTEGER, NOT NULL)
- `selectedAnswers` (JSON, NOT NULL - Array of integers)
- `createdAt` (TIMESTAMP, NOT NULL, Default: NOW())

**Business Logic:**
- Best score per skill is tracked (calculated in application layer)

---

## Job Application System

### 18. Job Application Table (`job_applications`)
**Job applications submitted by users**

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `jobId` (VARCHAR(64), NOT NULL - References job.job_id)
- `name` (TEXT, NOT NULL)
- `email` (VARCHAR(128), NOT NULL)
- `coverLetter` (TEXT, NOT NULL)
- `cvFileUrl` (TEXT, Optional - S3 URL for uploaded CV)
- `status` (VARCHAR(50), Default: 'pending')
- `feedback` (TEXT, Optional)
- `withdrawn` (BOOLEAN, Default: false)
- `createdAt` (TIMESTAMP, NOT NULL, Default: NOW())
- `updatedAt` (TIMESTAMP, NOT NULL, Default: NOW())

**Relationships:**
- One-to-many with `interview_rounds` table

---

### 19. Interview Rounds Table (`interview_rounds`)
**Interview rounds for job applications**

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `applicationId` (UUID, NOT NULL, Foreign Key → job_applications.id, CASCADE DELETE)
- `roundNumber` (INTEGER, NOT NULL)
- `roundType` (VARCHAR(50), NOT NULL - 'phone_screening', 'job_assessment', 'hr', 'final')
- `scheduledDate` (TIMESTAMP, Optional)
- `completedDate` (TIMESTAMP, Optional)
- `interviewerName` (VARCHAR(255), Optional)
- `interviewerEmail` (VARCHAR(255), Optional)
- `notes` (TEXT, Optional)
- `status` (VARCHAR(50), Default: 'scheduled' - 'scheduled', 'completed', 'cancelled', 'rescheduled')
- `feedback` (TEXT, Optional)
- `score` (INTEGER, Optional - 1-10 rating)
- `createdAt` (TIMESTAMP, NOT NULL, Default: NOW())
- `updatedAt` (TIMESTAMP, NOT NULL, Default: NOW())

**Indexes:**
- Index on applicationId
- Index on status

---

## Job Postings

### 20. Jobs Table (`jobs`)
**General job postings**

**Fields:**
- `job_id` (VARCHAR(32), Primary Key)
- `job_title` (TEXT, Optional)
- `employer_name` (TEXT, Optional)
- `employer_logo` (TEXT, Optional)
- `job_city` (TEXT, Optional)
- `job_state` (TEXT, Optional)
- `job_country` (TEXT, Optional)
- `job_posted_at_datetime_utc` (TIMESTAMP, Optional)
- `job_apply_link` (TEXT, Optional)
- `job_employment_type` (TEXT, Optional)
- `job_description` (TEXT, Optional)
- `job_is_remote` (BOOLEAN, Optional)
- `job_min_salary` (TEXT, Optional - Stored as text)
- `job_max_salary` (TEXT, Optional - Stored as text)
- `job_salary_period` (TEXT, Optional)
- `searchedat` (TIMESTAMP, Optional)
- `posted_by` (VARCHAR(50), Optional - 'alumni', 'career_team', 'external')
- `posted_by_user_id` (UUID, Optional, Foreign Key → User.id)
- `created_at` (TIMESTAMP, NOT NULL, Default: NOW())

---

### 21. Remote Jobs Table (`remote_jobs`)
**Remote job postings (MENA region)**

**Fields:**
- Same structure as `jobs` table
- `job_is_remote` (BOOLEAN, NOT NULL, Default: true)
- All other fields identical to `jobs` table

---

### 22. Part-time Jobs Table (`part_time_jobs`)
**Part-time job postings (India)**

**Fields:**
- Same structure as `jobs` table
- `job_employment_type` (TEXT, Default: 'Part-time')
- All other fields identical to `jobs` table

---

## Community System

### 23. Communities Table (`communities`)
**User communities/groups**

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `name` (VARCHAR(255), NOT NULL)
- `description` (TEXT, Optional)
- `banner_image` (VARCHAR(500), Optional)
- `created_by` (UUID, Optional, Foreign Key → User.id, CASCADE DELETE)
- `created_at` (TIMESTAMP, NOT NULL, Default: NOW())

---

### 24. Community Memberships Table (`community_memberships`)
**User memberships in communities**

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `community_id` (UUID, NOT NULL, Foreign Key → communities.id, CASCADE DELETE)
- `user_id` (UUID, NOT NULL, Foreign Key → User.id, CASCADE DELETE)
- `status` (VARCHAR(20), NOT NULL - 'pending' | 'approved')
- `joined_at` (TIMESTAMP, NOT NULL, Default: NOW())

---

### 25. Community Posts Table (`community_posts`)
**Posts within communities**

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `community_id` (UUID, NOT NULL, Foreign Key → communities.id, CASCADE DELETE)
- `user_id` (UUID, NOT NULL, Foreign Key → User.id, CASCADE DELETE)
- `content` (TEXT, NOT NULL)
- `type` (VARCHAR(20), NOT NULL - 'event' | 'update')
- `created_at` (TIMESTAMP, NOT NULL, Default: NOW())

---

## Activity Tracking & Analytics

### 26. User Activity Logs Table (`user_activity_logs`)
**Detailed user activity tracking**

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `user_id` (UUID, NOT NULL, Foreign Key → User.id, CASCADE DELETE)
- `action_type` (VARCHAR(50), NOT NULL)
- `action_category` (VARCHAR(30), NOT NULL)
- `resource_type` (VARCHAR(30), Optional)
- `resource_id` (VARCHAR(100), Optional)
- `metadata` (JSON, Optional)
- `ip_address` (TEXT, Optional)
- `user_agent` (TEXT, Optional)
- `session_id` (VARCHAR(100), Optional)
- `created_at` (TIMESTAMP, NOT NULL, Default: NOW())

---

### 27. User Sessions Table (`user_sessions`)
**User session tracking**

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `user_id` (UUID, NOT NULL, Foreign Key → User.id, CASCADE DELETE)
- `session_token` (VARCHAR(255), NOT NULL, UNIQUE)
- `ip_address` (TEXT, Optional)
- `user_agent` (TEXT, Optional)
- `device_type` (VARCHAR(20), Optional)
- `browser` (VARCHAR(50), Optional)
- `os` (VARCHAR(50), Optional)
- `started_at` (TIMESTAMP, NOT NULL, Default: NOW())
- `last_activity_at` (TIMESTAMP, NOT NULL, Default: NOW())
- `ended_at` (TIMESTAMP, Optional)
- `is_active` (BOOLEAN, Default: true)

---

### 28. Page Views Table (`page_views`)
**Page view tracking**

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `user_id` (UUID, Optional, Foreign Key → User.id, CASCADE DELETE)
- `session_id` (UUID, Optional, Foreign Key → user_sessions.id, CASCADE DELETE)
- `page_path` (VARCHAR(255), NOT NULL)
- `page_title` (VARCHAR(255), Optional)
- `referrer` (VARCHAR(500), Optional)
- `time_on_page` (INTEGER, Optional - seconds)
- `created_at` (TIMESTAMP, NOT NULL, Default: NOW())

---

### 29. Feature Usage Table (`feature_usage`)
**Feature usage tracking**

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `user_id` (UUID, NOT NULL, Foreign Key → User.id, CASCADE DELETE)
- `feature_name` (VARCHAR(50), NOT NULL)
- `action` (VARCHAR(50), NOT NULL)
- `metadata` (JSON, Optional)
- `created_at` (TIMESTAMP, NOT NULL, Default: NOW())

---

### 30. Activity Categories Table (`activity_categories`)
**Categories for activity types**

**Fields:**
- `id` (SERIAL, Primary Key)
- `name` (VARCHAR(30), NOT NULL, UNIQUE)
- `description` (TEXT, Optional)
- `created_at` (TIMESTAMP, NOT NULL, Default: NOW())

---

### 31. Activity Types Table (`activity_types`)
**Specific activity types**

**Fields:**
- `id` (SERIAL, Primary Key)
- `category_id` (INTEGER, Optional, Foreign Key → activity_categories.id)
- `name` (VARCHAR(50), NOT NULL, UNIQUE)
- `description` (TEXT, Optional)
- `is_tracked` (BOOLEAN, Default: true)
- `created_at` (TIMESTAMP, NOT NULL, Default: NOW())

---

### 32. Daily Activity Summaries Table (`daily_activity_summaries`)
**Aggregated daily activity metrics**

**Fields:**
- `id` (SERIAL, Primary Key)
- `date` (TIMESTAMP, NOT NULL, UNIQUE)
- `total_users_active` (INTEGER, Default: 0)
- `total_sessions` (INTEGER, Default: 0)
- `total_page_views` (INTEGER, Default: 0)
- `total_actions` (INTEGER, Default: 0)
- `new_registrations` (INTEGER, Default: 0)
- `new_connections` (INTEGER, Default: 0)
- `new_posts` (INTEGER, Default: 0)
- `new_job_applications` (INTEGER, Default: 0)
- `new_skill_attempts` (INTEGER, Default: 0)
- `new_community_joins` (INTEGER, Default: 0)
- `created_at` (TIMESTAMP, NOT NULL, Default: NOW())
- `updated_at` (TIMESTAMP, NOT NULL, Default: NOW())

---

## File Management

### 33. Uploads Table (`uploads`)
**File uploads (CVs, cover letters)**

**Fields:**
- `id` (SERIAL, Primary Key)
- `userEmail` (TEXT, NOT NULL)
- `fileUrl` (TEXT, NOT NULL)
- `fileType` (TEXT, NOT NULL - 'cv' or 'cover-letter')
- `createdAt` (TIMESTAMP, NOT NULL, Default: NOW())

---

## Calendar & Interview Scheduling

### 34. User Calendar Blocks Table (`user_calendar_blocks`)
**Weekly calendar availability blocks**

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `userId` (UUID, NOT NULL, Foreign Key → User.id, CASCADE DELETE)
- `weekStartDate` (TIMESTAMP, NOT NULL - Monday of the week)
- `dayOfWeek` (INTEGER, NOT NULL - 0=Monday, 6=Sunday)
- `startTime` (VARCHAR(8), NOT NULL - Format: "HH:MM:SS")
- `endTime` (VARCHAR(8), NOT NULL - Format: "HH:MM:SS")
- `isBlocked` (BOOLEAN, Default: true, NOT NULL - true=blocked, false=available)
- `createdAt` (TIMESTAMP, NOT NULL, Default: NOW())
- `updatedAt` (TIMESTAMP, NOT NULL, Default: NOW())

**Constraints:**
- Unique index on (userId, weekStartDate, dayOfWeek, startTime, endTime)
- Index on (userId, weekStartDate)

---

### 35. Daily Interviews Table (`daily_interviews`)
**Daily interview tracking**

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `userId` (UUID, NOT NULL, Foreign Key → User.id, CASCADE DELETE)
- `interviewDate` (TIMESTAMP, NOT NULL - Date only, time ignored)
- `category` (VARCHAR(50), Optional - Interview category: behavioral, technical, etc.)
- `completedAt` (TIMESTAMP, Optional - When interview was completed)
- `isCompleted` (BOOLEAN, Default: false, NOT NULL)
- `createdAt` (TIMESTAMP, NOT NULL, Default: NOW())
- `updatedAt` (TIMESTAMP, NOT NULL, Default: NOW())

**Constraints:**
- Unique index on (userId, interviewDate) - ensures one interview per user per day
- Index on userId
- Index on interviewDate
- Index on isCompleted

---

### 36. Interview Progress Table (`interview_progress`)
**Tracks answers and progress for in-progress interviews**

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `dailyInterviewId` (UUID, NOT NULL, Foreign Key → daily_interviews.id, CASCADE DELETE)
- `userId` (UUID, NOT NULL, Foreign Key → User.id, CASCADE DELETE)
- `category` (VARCHAR(50), NOT NULL - Interview category)
- `questionId` (INTEGER, NOT NULL - Question ID from category)
- `question` (TEXT, NOT NULL - Question text)
- `answer` (TEXT, NOT NULL - User's answer)
- `aiFeedback` (TEXT, Optional - AI feedback)
- `answeredAt` (TIMESTAMP, NOT NULL, Default: NOW())
- `createdAt` (TIMESTAMP, NOT NULL, Default: NOW())

**Constraints:**
- Unique index on (dailyInterviewId, questionId) - ensures one answer per question per interview
- Index on dailyInterviewId
- Index on userId

---

## Supporting Tables

### 37. Archive Card Table (`archive_card`)
**Archived user cards**

**Fields:**
- `id` (SERIAL, Primary Key)
- `name` (TEXT, Optional)
- `phone` (TEXT, Optional)
- `matchPercentage` (TEXT, Optional)
- `desc` (TEXT, Optional - description)
- `email` (TEXT, Optional)

**Constraints:**
- Unique index on (id, email)

---

### 38. Premuser Table (`premuser`)
**Premium user registrations**

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `fullName` (VARCHAR(128), NOT NULL)
- `emailAddress` (VARCHAR(128), NOT NULL)
- `phoneNumber` (VARCHAR(32), Optional)
- `paragraphInterest` (TEXT, Optional)
- `createdAt` (TIMESTAMP, NOT NULL, Default: NOW())

---

### 39. API User Table (`apiuser`)
**API user registrations**

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `fullName` (VARCHAR(128), NOT NULL)
- `email_address` (VARCHAR(128), NOT NULL)
- `phone_number` (VARCHAR(32), Optional)
- `orgName` (TEXT, Optional)
- `work` (TEXT, Optional)
- `benefits` (TEXT, Optional)
- `createdAt` (TIMESTAMP, NOT NULL, Default: NOW())

---

## Key Relationships Summary

1. **User** is the central table with many relationships:
   - One-to-many: Chat, Document, Connection (as sender/receiver), Notification, UserMessage, JobApplication, etc.

2. **Chat → Message_v2 → Vote_v2**: Hierarchical relationship for AI chat

3. **Connection**: Bidirectional relationship between users (sender_id ↔ receiver_id)

4. **Job Application → Interview Rounds**: One application can have multiple interview rounds

5. **Community → Community Memberships → Community Posts**: Hierarchical community structure

6. **Skills → Skill Questions → Skill Attempts**: Skill assessment hierarchy

7. **Anonymous Post → Anonymous Comment → Anonymous Comment Like**: Anonymous posting hierarchy

8. **User Sessions → Page Views**: Session tracking relationship

---

## Important Business Rules

1. **Daily Message Limit**: Users limited to 7 AI chat messages per day (tracked via `dailyMessageCount`)

2. **Connection Messaging**: Users can only send direct messages if they have an accepted connection

3. **Interview Tracking**: One interview per user per day (enforced via unique constraint)

4. **Job Posting Types**: Three separate tables for different job types (jobs, remote_jobs, part_time_jobs) with similar structures

5. **Cascade Deletes**: Many relationships use CASCADE DELETE (user_messages, community tables, anonymous tables, etc.)

6. **Deprecated Tables**: Message and Vote tables have deprecated versions (Message, Vote) and active versions (Message_v2, Vote_v2)

7. **Composite Keys**: Document table uses composite primary key (id + createdAt), Suggestion references it with composite foreign key

8. **Unique Constraints**: 
   - Connection: (sender_id, receiver_id)
   - Calendar blocks: (userId, weekStartDate, dayOfWeek, startTime, endTime)
   - Daily interviews: (userId, interviewDate)
   - Like tables: (post_id, user_id) and (comment_id, user_id)

---

## Indexes

Key indexes for performance:
- User messages: (sender_id, receiver_id), (receiver_id, sender_id), created_at
- Interview rounds: applicationId, status
- Calendar blocks: (userId, weekStartDate)
- Daily interviews: userId, interviewDate, isCompleted
- Interview progress: dailyInterviewId, userId

---

## Data Types Notes

- **UUID**: Used for most primary keys and foreign keys
- **SERIAL**: Used for auto-incrementing IDs (skills, skill_questions, etc.)
- **TEXT**: Used for variable-length text fields
- **VARCHAR**: Used with length constraints for fixed-length text
- **JSON/JSONB**: Used for structured data (education, experience, skills, metadata)
- **TIMESTAMP**: Used for all date/time fields
- **BOOLEAN**: Used for flags and status indicators
- **INTEGER**: Used for counts, scores, and numeric values

---

## Migration Notes

- The schema uses Drizzle ORM with PostgreSQL
- Some tables have deprecated versions (Message, Vote) that should be migrated to v2 versions
- The schema supports both email/password and OAuth authentication
- Profile data can be stored as comma-separated strings or JSONB depending on the field




