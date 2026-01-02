import type { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  integer,
  primaryKey,
  uniqueIndex,
  foreignKey,
  serial,
  boolean,
  index,
  jsonb,
} from 'drizzle-orm/pg-core';



export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 255 }),
  name: text('name'),

  // Existing fields
  linkedinInfo: text('linkedinInfo'),
  goals: text('goals'),
  profilemetrics: text('profilemetrics'),
  strengths: text('strengths'),
  interests: text('interests'),

  // ✅ New fields
  linkedinURL: text('linkedinURL'),
  FacebookURL: text('FacebookURL'),
  phone: text('phone'),
  referral_code: text('referral_code'), // ✅ Add this line

  // Google OAuth fields
  googleId: varchar('googleId', { length: 255 }),
  avatarUrl: text('avatarUrl'),
  provider: varchar('provider', { length: 50 }),

  // Anonymous identity fields
  anonymous_username: varchar('anonymous_username', { length: 50 }),
  anonymous_avatar: varchar('anonymous_avatar', { length: 255 }),

  flaggedChatExpiresAt: timestamp('flaggedChatExpiresAt'),
  createdAt: timestamp('createdAt'),

  // Daily message limit tracking
  dailyMessageCount: integer('dailyMessageCount').default(0),
  lastMessageResetDate: timestamp('lastMessageResetDate'),

  // Interview tracking fields
  lastInterviewDate: timestamp('lastInterviewDate'),
  interviewCount: integer('interviewCount').default(0),

  // LinkedIn-style professional fields
  headline: text('headline'),
  education: jsonb('education'),
  experience: jsonb('experience'),
  professional_skills: jsonb('professional_skills'),
  certifications: jsonb('certifications'),

  // Role field for user permissions
  role: varchar('role', { length: 50 }).default('user'), // 'user', 'recruiter', 'admin', etc.

  // Student status field
  student_status: varchar('student_status', { length: 20 }), // 'student' or 'alumni'
});//a

export type User = InferSelectModel<typeof user>;

export const archiveCard = pgTable('archive_card', {
  id: serial('id').primaryKey(), // Auto-increment
  name: text('name'),
  phone: text('phone'),
  matchPercentage: text('match_percentage'),
  desc: text('description'),
  email: text('email'),
}, (table) => ({
  uniqueIdEmail: uniqueIndex('archivecard_id_email_idx').on(table.id, table.email),
}));

export type ArchiveCard = InferSelectModel<typeof archiveCard>;

export const premuser = pgTable('premuser', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  fullName: varchar('full_name', { length: 128 }).notNull(),
  emailAddress: varchar('email_address', { length: 128 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 32 }),
  paragraphInterest: text('paragraph_interest'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type PremUser = InferSelectModel<typeof premuser>;


export const apiUser = pgTable('apiuser', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  fullName: varchar('full_name', { length: 128 }).notNull(),
  email_address: varchar('email_address', { length: 128 }).notNull(),
  phone_number: varchar('phone_number', { length: 32 }),
  orgName: text('org_name'),
  work: text('work'),
  benefits: text('benefits'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type apiUser = InferSelectModel<typeof apiUser>;



export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
});

export type Chat = InferSelectModel<typeof chat>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://github.com/vercel/ai-chatbot/blob/main/docs/04-migrate-to-parts.md
export const messageDeprecated = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  content: json('content').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type MessageDeprecated = InferSelectModel<typeof messageDeprecated>;

export const message = pgTable('Message_v2', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  parts: json('parts').notNull(),
  attachments: json('attachments').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://github.com/vercel/ai-chatbot/blob/main/docs/04-migrate-to-parts.md
export const voteDeprecated = pgTable(
  'Vote',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => messageDeprecated.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type VoteDeprecated = InferSelectModel<typeof voteDeprecated>;

export const vote = pgTable(
  'Vote_v2',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    kind: varchar('text', { enum: ['text', 'code', 'image', 'sheet'] })
      .notNull()
      .default('text'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  },
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export type Suggestion = InferSelectModel<typeof suggestion>;

// Connection table for managing user connections
export const connection = pgTable('connection', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  sender_id: uuid('sender_id')
    .notNull()
    .references(() => user.id),
  receiver_id: uuid('receiver_id')
    .notNull()
    .references(() => user.id),
  status: varchar('status', { enum: ['pending', 'accepted', 'rejected'] })
    .notNull()
    .default('pending'),
  message: text('message'), // Optional message with connection request
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  // Prevent duplicate connection requests
  uniqueConnection: uniqueIndex('unique_connection_idx').on(table.sender_id, table.receiver_id),
}));

export type Connection = InferSelectModel<typeof connection>;

// Notification table for user notifications
export const notification = pgTable('notification', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => user.id),
  type: varchar('type', { enum: ['connection_request', 'connection_accepted', 'connection_rejected'] })
    .notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  related_user_id: uuid('related_user_id')
    .references(() => user.id), // ID of the user who triggered the notification
  related_connection_id: uuid('related_connection_id')
    .references(() => connection.id),
  is_read: boolean('is_read').notNull().default(false),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export type Notification = InferSelectModel<typeof notification>;

// User messages table for direct messaging between connected users
export const userMessage = pgTable('user_messages', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  sender_id: uuid('sender_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  receiver_id: uuid('receiver_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  is_read: boolean('is_read').notNull().default(false),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  // Index for faster queries
  senderReceiverIdx: index('idx_user_messages_sender_receiver').on(table.sender_id, table.receiver_id),
  receiverSenderIdx: index('idx_user_messages_receiver_sender').on(table.receiver_id, table.sender_id),
  createdAtIdx: index('idx_user_messages_created_at').on(table.created_at),
}));

export type UserMessage = InferSelectModel<typeof userMessage>;

export const passwordResetToken = pgTable('password_reset_tokens', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => user.id),
  token: varchar('token', { length: 255 }).notNull(),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export type PasswordResetToken = InferSelectModel<typeof passwordResetToken>;

// Anonymous posts table for the anonymous chat feed
export const anonymousPost = pgTable('anonymous_post', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => user.id),
  content: text('content').notNull(),
  image_url: text('image_url'), // Optional image URL for posts
  is_anonymous: boolean('is_anonymous').notNull().default(true),
  company_name: text('company_name'), // Optional company name for context
  industry: text('industry'), // Optional industry for context
  topic: varchar('topic', { enum: ['company_culture', 'workplace_issues', 'career_advice', 'general'] }).notNull().default('general'),
  likes_count: integer('likes_count').notNull().default(0),
  comments_count: integer('comments_count').notNull().default(0),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Anonymous comments table
export const anonymousComment = pgTable('anonymous_comment', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  post_id: uuid('post_id').notNull().references(() => anonymousPost.id, { onDelete: 'cascade' }),
  user_id: uuid('user_id').notNull().references(() => user.id),
  content: text('content').notNull(),
  is_anonymous: boolean('is_anonymous').notNull().default(true),
  likes_count: integer('likes_count').notNull().default(0),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Anonymous post likes table
export const anonymousPostLike = pgTable('anonymous_post_like', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  post_id: uuid('post_id').notNull().references(() => anonymousPost.id, { onDelete: 'cascade' }),
  user_id: uuid('user_id').notNull().references(() => user.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  // Prevent duplicate likes from same user on same post
  uniquePostLike: uniqueIndex('unique_post_like_idx').on(table.post_id, table.user_id),
}));

// Anonymous comment likes table
export const anonymousCommentLike = pgTable('anonymous_comment_like', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  comment_id: uuid('comment_id').notNull().references(() => anonymousComment.id, { onDelete: 'cascade' }),
  user_id: uuid('user_id').notNull().references(() => user.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  // Prevent duplicate likes from same user on same comment
  uniqueCommentLike: uniqueIndex('unique_comment_like_idx').on(table.comment_id, table.user_id),
}));

// Type exports for anonymous tables
export type AnonymousPost = InferSelectModel<typeof anonymousPost>;
export type AnonymousComment = InferSelectModel<typeof anonymousComment>;
export type AnonymousPostLike = InferSelectModel<typeof anonymousPostLike>;
export type AnonymousCommentLike = InferSelectModel<typeof anonymousCommentLike>;

// Skill Assessment Tables
export const skills = pgTable('skills', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});

export type Skill = InferSelectModel<typeof skills>;

export const skillQuestions = pgTable('skill_questions', {
  id: serial('id').primaryKey(),
  skillId: integer('skill_id').notNull().references(() => skills.id),
  question: text('question').notNull(),
  options: json('options').notNull(), // Array of 4 strings
  correctIndex: integer('correct_index').notNull(), // 0-3
});

export type SkillQuestion = InferSelectModel<typeof skillQuestions>;

export const skillAttempts = pgTable('skill_attempts', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => user.id),
  skillId: integer('skill_id').notNull().references(() => skills.id),
  score: integer('score').notNull(),
  total: integer('total').notNull(),
  selectedAnswers: json('selected_answers').notNull(), // Array of integers
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type SkillAttempt = InferSelectModel<typeof skillAttempts>;

export const jobApplication = pgTable('job_applications', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  jobId: varchar('job_id', { length: 64 }).notNull(),
  name: text('name').notNull(),
  email: varchar('email', { length: 128 }).notNull(),
  coverLetter: text('cover_letter').notNull(),
  cvFileUrl: text('cv_file_url'), // S3 URL for uploaded CV file
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  feedback: text('feedback'),
  withdrawn: boolean('withdrawn').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Interview Rounds Table
export const interviewRounds = pgTable('interview_rounds', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  applicationId: uuid('application_id').notNull().references(() => jobApplication.id, { onDelete: 'cascade' }),
  roundNumber: integer('round_number').notNull(),
  roundType: varchar('round_type', { length: 50 }).notNull(), // 'phone_screening', 'job_assessment', 'hr', 'final'
  scheduledDate: timestamp('scheduled_date'),
  completedDate: timestamp('completed_date'),
  interviewerName: varchar('interviewer_name', { length: 255 }),
  interviewerEmail: varchar('interviewer_email', { length: 255 }),
  notes: text('notes'),
  status: varchar('status', { length: 50 }).notNull().default('scheduled'), // 'scheduled', 'completed', 'cancelled', 'rescheduled'
  feedback: text('feedback'),
  score: integer('score'), // 1-10 rating
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  applicationIdIdx: index('idx_interview_rounds_application_id').on(table.applicationId),
  statusIdx: index('idx_interview_rounds_status').on(table.status),
}));

export const job = pgTable('jobs', {
  job_id: varchar('job_id', { length: 32 }).primaryKey(),
  job_title: text('job_title'),
  employer_name: text('employer_name'),
  employer_logo: text('employer_logo'),
  job_city: text('job_city'),
  job_state: text('job_state'),
  job_country: text('job_country'),
  job_posted_at_datetime_utc: timestamp('job_posted_at_datetime_utc'),
  job_apply_link: text('job_apply_link'),
  job_employment_type: text('job_employment_type'),
  job_description: text('job_description'),
  job_is_remote: boolean('job_is_remote'),
  job_min_salary: text('job_min_salary'), // Use text for NUMERIC for now, or use decimal if supported
  job_max_salary: text('job_max_salary'),
  job_salary_period: text('job_salary_period'),
  searchedat: timestamp('searchedat'),
  // New fields for internal job postings
  posted_by: varchar('posted_by', { length: 50 }), // 'alumni', 'career_team', 'external'
  posted_by_user_id: uuid('posted_by_user_id').references(() => user.id), // For alumni posts
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export type Job = InferSelectModel<typeof job>;

// Remote Jobs Table for MENA region
export const remoteJobs = pgTable('remote_jobs', {
  job_id: varchar('job_id', { length: 32 }).primaryKey(),
  job_title: text('job_title'),
  employer_name: text('employer_name'),
  employer_logo: text('employer_logo'),
  job_city: text('job_city'),
  job_state: text('job_state'),
  job_country: text('job_country'),
  job_posted_at_datetime_utc: timestamp('job_posted_at_datetime_utc'),
  job_apply_link: text('job_apply_link'),
  job_employment_type: text('job_employment_type'),
  job_description: text('job_description'),
  job_is_remote: boolean('job_is_remote').notNull().default(true),
  job_min_salary: text('job_min_salary'),
  job_max_salary: text('job_max_salary'),
  job_salary_period: text('job_salary_period'),
  searchedat: timestamp('searchedat'),
  posted_by: varchar('posted_by', { length: 50 }), // 'alumni', 'career_team', 'external'
  posted_by_user_id: uuid('posted_by_user_id').references(() => user.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export type RemoteJob = InferSelectModel<typeof remoteJobs>;

// Part-time Jobs Table for India
export const partTimeJobs = pgTable('part_time_jobs', {
  job_id: varchar('job_id', { length: 32 }).primaryKey(),
  job_title: text('job_title'),
  employer_name: text('employer_name'),
  employer_logo: text('employer_logo'),
  job_city: text('job_city'),
  job_state: text('job_state'),
  job_country: text('job_country'),
  job_posted_at_datetime_utc: timestamp('job_posted_at_datetime_utc'),
  job_apply_link: text('job_apply_link'),
  job_employment_type: text('job_employment_type').default('Part-time'),
  job_description: text('job_description'),
  job_is_remote: boolean('job_is_remote'),
  job_min_salary: text('job_min_salary'),
  job_max_salary: text('job_max_salary'),
  job_salary_period: text('job_salary_period'),
  searchedat: timestamp('searchedat'),
  posted_by: varchar('posted_by', { length: 50 }), // 'alumni', 'career_team', 'external'
  posted_by_user_id: uuid('posted_by_user_id').references(() => user.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export type PartTimeJob = InferSelectModel<typeof partTimeJobs>;

// Community Tables
export const communities = pgTable('communities', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  banner_image: varchar('banner_image', { length: 500 }),
  created_by: uuid('created_by').references(() => user.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const communityMemberships = pgTable('community_memberships', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  community_id: uuid('community_id').notNull().references(() => communities.id, { onDelete: 'cascade' }),
  user_id: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).notNull(), // 'pending' | 'approved'
  joined_at: timestamp('joined_at').notNull().defaultNow(),
});

export const communityPosts = pgTable('community_posts', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  community_id: uuid('community_id').notNull().references(() => communities.id, { onDelete: 'cascade' }),
  user_id: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'event' | 'update'
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export type Community = InferSelectModel<typeof communities>;
export type CommunityMembership = InferSelectModel<typeof communityMemberships>;
export type CommunityPost = InferSelectModel<typeof communityPosts>;

// Admin Dashboard Activity Tracking Tables
export const userActivityLogs = pgTable('user_activity_logs', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  action_type: varchar('action_type', { length: 50 }).notNull(),
  action_category: varchar('action_category', { length: 30 }).notNull(),
  resource_type: varchar('resource_type', { length: 30 }),
  resource_id: varchar('resource_id', { length: 100 }),
  metadata: json('metadata'),
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  session_id: varchar('session_id', { length: 100 }),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const userSessions = pgTable('user_sessions', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  session_token: varchar('session_token', { length: 255 }).notNull().unique(),
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  device_type: varchar('device_type', { length: 20 }),
  browser: varchar('browser', { length: 50 }),
  os: varchar('os', { length: 50 }),
  started_at: timestamp('started_at').notNull().defaultNow(),
  last_activity_at: timestamp('last_activity_at').notNull().defaultNow(),
  ended_at: timestamp('ended_at'),
  is_active: boolean('is_active').notNull().default(true),
});

export const pageViews = pgTable('page_views', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  user_id: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }),
  session_id: uuid('session_id').references(() => userSessions.id, { onDelete: 'cascade' }),
  page_path: varchar('page_path', { length: 255 }).notNull(),
  page_title: varchar('page_title', { length: 255 }),
  referrer: varchar('referrer', { length: 500 }),
  time_on_page: integer('time_on_page'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const featureUsage = pgTable('feature_usage', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  feature_name: varchar('feature_name', { length: 50 }).notNull(),
  action: varchar('action', { length: 50 }).notNull(),
  metadata: json('metadata'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const activityCategories = pgTable('activity_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 30 }).notNull().unique(),
  description: text('description'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const activityTypes = pgTable('activity_types', {
  id: serial('id').primaryKey(),
  category_id: integer('category_id').references(() => activityCategories.id),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  is_tracked: boolean('is_tracked').notNull().default(true),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const dailyActivitySummaries = pgTable('daily_activity_summaries', {
  id: serial('id').primaryKey(),
  date: timestamp('date').notNull().unique(),
  total_users_active: integer('total_users_active').notNull().default(0),
  total_sessions: integer('total_sessions').notNull().default(0),
  total_page_views: integer('total_page_views').notNull().default(0),
  total_actions: integer('total_actions').notNull().default(0),
  new_registrations: integer('new_registrations').notNull().default(0),
  new_connections: integer('new_connections').notNull().default(0),
  new_posts: integer('new_posts').notNull().default(0),
  new_job_applications: integer('new_job_applications').notNull().default(0),
  new_skill_attempts: integer('new_skill_attempts').notNull().default(0),
  new_community_joins: integer('new_community_joins').notNull().default(0),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Uploads Table (Resumes / Cover Letters)
export const uploads = pgTable('uploads', {
  id: serial('id').primaryKey(),
  userEmail: text('user_email').notNull(),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type').notNull(), // 'cv' or 'cover-letter'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type JobApplication = InferSelectModel<typeof jobApplication>;
export type InterviewRound = InferSelectModel<typeof interviewRounds>;
export type Upload = InferSelectModel<typeof uploads>;
export type UserActivityLog = InferSelectModel<typeof userActivityLogs>;
export type UserSession = InferSelectModel<typeof userSessions>;
export type PageView = InferSelectModel<typeof pageViews>;
export type FeatureUsage = InferSelectModel<typeof featureUsage>;
export type ActivityCategory = InferSelectModel<typeof activityCategories>;
export type ActivityType = InferSelectModel<typeof activityTypes>;
export type DailyActivitySummary = InferSelectModel<typeof dailyActivitySummaries>;

// Weekly Calendar Blocks
export const userCalendarBlocks = pgTable('user_calendar_blocks', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  weekStartDate: timestamp('week_start_date').notNull(), // Monday of the week
  dayOfWeek: integer('day_of_week').notNull(), // 0=Monday, 6=Sunday
  startTime: varchar('start_time', { length: 8 }).notNull(), // Format: "HH:MM:SS"
  endTime: varchar('end_time', { length: 8 }).notNull(), // Format: "HH:MM:SS"
  isBlocked: boolean('is_blocked').default(true).notNull(), // true = blocked, false = available
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueBlock: uniqueIndex('unique_calendar_block').on(
    table.userId,
    table.weekStartDate,
    table.dayOfWeek,
    table.startTime,
    table.endTime
  ),
  userWeekIdx: index('idx_calendar_blocks_user_week').on(table.userId, table.weekStartDate),
}));

export type UserCalendarBlock = InferSelectModel<typeof userCalendarBlocks>;

// Daily Interview Tracking Table
export const dailyInterviews = pgTable('daily_interviews', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  interviewDate: timestamp('interview_date').notNull(), // Date of the interview (date only, time ignored)
  category: varchar('category', { length: 50 }), // Interview category (behavioral, technical, etc.)
  completedAt: timestamp('completed_at'), // When the interview was completed (null if in progress)
  isCompleted: boolean('is_completed').notNull().default(false), // Whether the interview is completed
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  // Ensure one interview per user per day (only for completed interviews)
  uniqueUserDate: uniqueIndex('unique_user_interview_date').on(table.userId, table.interviewDate),
  userIdIdx: index('idx_daily_interviews_user_id').on(table.userId),
  interviewDateIdx: index('idx_daily_interviews_date').on(table.interviewDate),
  isCompletedIdx: index('idx_daily_interviews_completed').on(table.isCompleted),
}));

export type DailyInterview = InferSelectModel<typeof dailyInterviews>;

// Interview Progress Table - tracks answers and progress for in-progress interviews
export const interviewProgress = pgTable('interview_progress', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  dailyInterviewId: uuid('daily_interview_id').notNull().references(() => dailyInterviews.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  category: varchar('category', { length: 50 }).notNull(), // Interview category
  questionId: integer('question_id').notNull(), // Question ID from the category
  question: text('question').notNull(), // Question text
  answer: text('answer').notNull(), // User's answer
  aiFeedback: text('ai_feedback'), // AI feedback if available
  answeredAt: timestamp('answered_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  // Ensure one answer per question per interview
  uniqueInterviewQuestion: uniqueIndex('unique_interview_question').on(table.dailyInterviewId, table.questionId),
  dailyInterviewIdx: index('idx_interview_progress_daily_interview').on(table.dailyInterviewId),
  userIdIdx: index('idx_interview_progress_user_id').on(table.userId),
}));

export type InterviewProgress = InferSelectModel<typeof interviewProgress>;

