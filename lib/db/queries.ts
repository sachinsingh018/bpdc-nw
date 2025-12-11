import { genSaltSync, hashSync, hash } from 'bcrypt-ts';
import { and, asc, desc, eq, gt, gte, inArray, ne, or, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });
import type { ArchiveCard } from '@/lib/db/schema';
import {
  user,
  chat,
  document,
  suggestion,
  message,
  vote,
  archiveCard,
  connection,
  notification,
  passwordResetToken,
  userMessage,
  premuser,
  apiUser,
  jobApplication,
  skills,
  skillQuestions,
  skillAttempts,
  communities,
  communityMemberships,
  communityPosts,
  type User,
  type Suggestion,
  type DBMessage,
  type Connection,
  type Notification,
  job,
  type Job,
  type Skill,
  type SkillQuestion,
  type SkillAttempt,
  type Community,
  type CommunityMembership,
  type CommunityPost,
  remoteJobs,
  type RemoteJob,
  partTimeJobs,
  type PartTimeJob
} from './schema';
import type { ArtifactKind } from '@/components/artifact';
import { TimestampFsp } from 'drizzle-orm/mysql-core';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

import { getBpdcPostgresClient } from './connection';

// Create postgres client connected to bpdc database
const client = getBpdcPostgresClient();
export const db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error('Failed to get user from database');
    throw error;
  }
}

export async function getUserById(userId: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.id, userId));
  } catch (error) {
    console.error('Failed to get user by ID from database');
    throw error;
  }
}

export async function getFlaggedChatExpiry(email: string): Promise<Date | null> {
  try {
    const [result] = await db
      .select({ flaggedChatExpiresAt: user.flaggedChatExpiresAt })
      .from(user)
      .where(eq(user.email, email));

    return result?.flaggedChatExpiresAt ?? null;
  } catch (error) {
    console.error('❌ Failed to get flaggedChatExpiresAt:', error);
    throw error;
  }
}

// export async function createUser(name: string, email: string, password: string, linkedinInfo?: string | null) {
//   const salt = genSaltSync(10);
//   const hash = hashSync(password, salt);

//   try {
//     return await db.insert(user).values({
//       name,
//       email,
//       password: hash,
//       linkedinInfo,
//     });
//   } catch (error) {
//     console.error('Failed to create user in database:', error);
//     throw error;
//   }
// }
export async function createUser({
  name,
  email,
  password,
  linkedinInfo,
  goals,
  profilemetrics,
  strengths,
  interests,
  linkedinURL,
  FacebookURL,
  phone,
  createdAt, // ✅ accept it here
  referral_code, // ✅ Add this line
  role // ✅ Add role parameter

}: {
  name: string;
  email: string;
  password: string;
  linkedinInfo?: string | null;
  goals?: string;
  profilemetrics?: string;
  strengths?: string;
  interests?: string;
  linkedinURL?: string;
  FacebookURL?: string;
  phone?: string;
  createdAt?: Date; // ✅ make it optional if you want
  referral_code?: string; // ✅ Add this line too
  role?: string; // ✅ Add role parameter


}) {//a
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  try {
    return await db.insert(user).values({
      name,
      email,
      password: hash,
      linkedinInfo,
      goals,
      profilemetrics,
      strengths,
      interests,
      linkedinURL,
      FacebookURL,
      phone,
      referral_code,
      createdAt, // ✅ insert it
      role, // ✅ insert role
    });
  } catch (error) {
    console.error('Failed to create user in database:', error);
    throw error;
  }
}

// Google OAuth functions
export async function createGoogleUser({
  email,
  name,
  googleId,
  avatarUrl,
  provider,
  linkedinInfo,
  goals,
  profilemetrics,
  strengths,
  interests,
  linkedinURL,
  phone,
  referral_code,
}: {
  email: string;
  name: string;
  googleId: string;
  avatarUrl: string;
  provider: string;
  linkedinInfo?: string;
  goals?: string;
  profilemetrics?: string;
  strengths?: string;
  interests?: string;
  linkedinURL?: string;
  phone?: string;
  referral_code?: string;
}) {
  try {
    return await db.insert(user).values({
      email,
      name,
      googleId,
      avatarUrl,
      provider,
      linkedinInfo,
      goals,
      profilemetrics,
      strengths,
      interests,
      linkedinURL,
      phone,
      referral_code,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to create Google user in database:', error);
    throw error;
  }
}

export async function getUserByGoogleId(googleId: string): Promise<User | null> {
  try {
    const users = await db.select().from(user).where(eq(user.googleId, googleId));
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Failed to get user by Google ID:', error);
    throw error;
  }
}

export async function updateGoogleUser({
  email,
  name,
  linkedinInfo,
  goals,
  profilemetrics,
  strengths,
  interests,
  linkedinURL,
  phone,
  referral_code,
}: {
  email: string;
  name: string;
  linkedinInfo?: string;
  goals?: string;
  profilemetrics?: string;
  strengths?: string;
  interests?: string;
  linkedinURL?: string;
  phone?: string;
  referral_code?: string;
}) {
  try {
    return await db
      .update(user)
      .set({
        name,
        linkedinInfo,
        goals,
        profilemetrics,
        strengths,
        interests,
        linkedinURL,
        phone,
        referral_code,
      })
      .where(eq(user.email, email));
  } catch (error) {
    console.error('Failed to update Google user in database:', error);
    throw error;
  }
}

// 🔍 Get top 50 users (excluding current)
export async function getTop50UsersExcluding(email: string) {
  try {
    return await db
      .select()
      .from(user)
      .where(ne(user.email, email))
      .limit(50);
  } catch (error) {
    console.error('❌ Failed to fetch users for AI search:', error);
    throw error;
  }
}

// 🔍 Get all users for matching engine
export async function getAllUsers() {
  try {
    return await db
      .select()
      .from(user);
  } catch (error) {
    console.error('❌ Failed to fetch all users for matching:', error);
    throw error;
  }
}

/**
 * Get users with connection statuses in a single optimized query
 * This replaces multiple API calls with one efficient database query
 */
export async function getUsersWithConnectionStatuses(
  currentUserId: string,
  userIds: string[]
): Promise<Record<string, string>> {
  try {
    if (userIds.length === 0) return {};

    // Use Drizzle's inArray for better compatibility
    const connections = await db
      .select({
        otherUserId: sql<string>`CASE 
          WHEN ${connection.sender_id} = ${currentUserId} THEN ${connection.receiver_id}
          ELSE ${connection.sender_id}
        END`,
        status: connection.status,
      })
      .from(connection)
      .where(
        and(
          or(
            eq(connection.sender_id, currentUserId),
            eq(connection.receiver_id, currentUserId)
          ),
          or(
            inArray(connection.sender_id, userIds),
            inArray(connection.receiver_id, userIds)
          )
        )
      );
    const statuses: Record<string, string> = {};

    connections.forEach((conn: any) => {
      statuses[conn.otherUserId] = conn.status;
    });

    return statuses;
  } catch (error) {
    console.error('❌ Failed to get users with connection statuses:', error);
    return {};
  }
}

/**
 * Get recommended users based on profile matching with PostgreSQL
 * Uses full-text search and excludes existing connections
 */
export async function getRecommendedUsers(
  currentUserEmail: string,
  limit: number = 10,
  randomize: boolean = true
) {
  try {
    const [currentUser] = await getUser(currentUserEmail);
    if (!currentUser) return [];

    // Build search terms from user profile for matching
    const searchTerms = [
      currentUser.strengths || '',
      currentUser.interests || '',
      currentUser.goals || '',
      currentUser.headline || '',
    ].filter(Boolean).join(' ');

    // Get users excluding current user and existing connections
    // Use full-text search if user has profile data, otherwise random/top users
    if (searchTerms && !randomize) {
      const query = sql`
        SELECT u.*,
          ts_rank(
            to_tsvector('english',
              coalesce(u."name",'') || ' ' ||
              coalesce(u."linkedinInfo",'') || ' ' ||
              coalesce(u."goals",'') || ' ' ||
              coalesce(u."strengths",'') || ' ' ||
              coalesce(u."interests",'') || ' ' ||
              coalesce(u."profilemetrics",'') || ' ' ||
              coalesce(u."headline",'')
            ),
            plainto_tsquery('english', ${searchTerms})
          ) AS match_score
        FROM "User" u
        WHERE u."email" != ${currentUserEmail}
          AND u."id" NOT IN (
            SELECT CASE 
              WHEN c."sender_id" = ${currentUser.id} THEN c."receiver_id"
              ELSE c."sender_id"
            END
            FROM "connection" c
            WHERE (c."sender_id" = ${currentUser.id} OR c."receiver_id" = ${currentUser.id})
              AND c."status" IN ('accepted', 'pending')
          )
        ORDER BY match_score DESC, u."createdAt" DESC
        LIMIT ${limit}
      `;
      return await db.execute(query);
    } else {
      // Random or top users by creation date
      const query = sql`
        SELECT u.*
        FROM "User" u
        WHERE u."email" != ${currentUserEmail}
          AND u."id" NOT IN (
            SELECT CASE 
              WHEN c."sender_id" = ${currentUser.id} THEN c."receiver_id"
              ELSE c."sender_id"
            END
            FROM "connection" c
            WHERE (c."sender_id" = ${currentUser.id} OR c."receiver_id" = ${currentUser.id})
              AND c."status" IN ('accepted', 'pending')
          )
        ORDER BY ${randomize ? sql`RANDOM()` : sql`u."createdAt" DESC`}
        LIMIT ${limit}
      `;
      return await db.execute(query);
    }
  } catch (error) {
    console.error('❌ Failed to get recommended users:', error);
    // Fallback to simple query
    return await db
      .select()
      .from(user)
      .where(ne(user.email, currentUserEmail))
      .orderBy(desc(user.createdAt))
      .limit(limit);
  }
}

export async function getArchiveCardsByEmail(email: string): Promise<ArchiveCard[]> {
  try {
    return await db.select().from(archiveCard).where(eq(archiveCard.email, email));
  } catch (error) {
    console.error('❌ Failed to get archive cards from database:', error);
    throw error;
  }
}

export async function createArchiveCard(
  name: string,
  phone: string,
  matchPercentage: string,
  desc: string,
  email: string
) {
  try {
    console.log('Inserting into archive_card:', {
      name, phone, matchPercentage, desc, email
    });

    const result = await db.insert(archiveCard).values({
      name,
      phone,
      matchPercentage,
      desc,
      email,
    });

    console.log('Insert result:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to insert archive card:', error);
    throw error;
  }
}

export async function updateUserProfile({
  email,
  goals,
  metrics,
  strengths,
  interests,
  linkedinURL,
  FacebookURL,
  phone,
  linkedinInfo,
  flaggedChatExpiresAt,
  anonymous_username,
  anonymous_avatar,
  headline,
  education,
  experience,
  professional_skills,
  certifications,
}: {
  email: string;
  goals?: string[] | string;
  metrics?: string[] | string;
  strengths?: string[] | string;
  interests?: string[] | string;
  linkedinURL?: string;
  FacebookURL?: string;
  phone?: string;
  linkedinInfo?: string;
  flaggedChatExpiresAt?: Date;
  anonymous_username?: string;
  anonymous_avatar?: string;
  headline?: string;
  education?: any;
  experience?: any;
  professional_skills?: any;
  certifications?: any;
}) {
  return await db
    .update(user)
    .set({
      goals: Array.isArray(goals) ? goals.join(',') : goals,
      profilemetrics: Array.isArray(metrics) ? metrics.join(',') : metrics,
      strengths: Array.isArray(strengths) ? strengths.join(',') : strengths,
      interests: Array.isArray(interests) ? interests.join(',') : interests,
      linkedinURL,
      FacebookURL,
      phone,
      linkedinInfo,
      anonymous_username,
      anonymous_avatar,
      headline,
      education,
      experience,
      professional_skills,
      certifications,
    })
    .where(eq(user.email, email));
}


// queries.ts
export async function updateFlaggedChatExpiry(email: string, flaggedChatExpiresAt: Date) {
  return await db
    .update(user)
    .set({ flaggedChatExpiresAt })
    .where(eq(user.email, email));
}

// Daily message limit functions
const DAILY_MESSAGE_LIMIT = 7;

/**
 * Check if the daily message count needs to be reset (new day)
 */
function shouldResetDailyCount(lastResetDate: Date | null): boolean {
  if (!lastResetDate) return true;

  const today = new Date();
  const lastReset = new Date(lastResetDate);

  // Reset if it's a different day
  return (
    today.getFullYear() !== lastReset.getFullYear() ||
    today.getMonth() !== lastReset.getMonth() ||
    today.getDate() !== lastReset.getDate()
  );
}

/**
 * Get current daily message count for a user
 */
export async function getDailyMessageCount(email: string): Promise<{ count: number; canSend: boolean }> {
  try {
    const [result] = await db
      .select({
        dailyMessageCount: user.dailyMessageCount,
        lastMessageResetDate: user.lastMessageResetDate,
      })
      .from(user)
      .where(eq(user.email, email));

    if (!result) {
      return { count: 0, canSend: true };
    }

    // Reset count if it's a new day
    if (shouldResetDailyCount(result.lastMessageResetDate)) {
      await resetDailyMessageCount(email);
      return { count: 0, canSend: true };
    }

    const count = result.dailyMessageCount || 0;
    return {
      count,
      canSend: count < DAILY_MESSAGE_LIMIT
    };
  } catch (error) {
    console.error('❌ Failed to get daily message count:', error);
    // On error, allow sending (fail open)
    return { count: 0, canSend: true };
  }
}

/**
 * Increment daily message count for a user
 */
export async function incrementDailyMessageCount(email: string): Promise<void> {
  try {
    const today = new Date();
    const [currentUser] = await db
      .select({
        dailyMessageCount: user.dailyMessageCount,
        lastMessageResetDate: user.lastMessageResetDate,
      })
      .from(user)
      .where(eq(user.email, email));

    if (!currentUser) {
      console.error('User not found for email:', email);
      return;
    }

    // Reset if it's a new day
    if (shouldResetDailyCount(currentUser.lastMessageResetDate)) {
      await db
        .update(user)
        .set({
          dailyMessageCount: 1,
          lastMessageResetDate: today,
        })
        .where(eq(user.email, email));
    } else {
      // Increment existing count
      await db
        .update(user)
        .set({
          dailyMessageCount: sql`${user.dailyMessageCount} + 1`,
        })
        .where(eq(user.email, email));
    }
  } catch (error) {
    console.error('❌ Failed to increment daily message count:', error);
    throw error;
  }
}

/**
 * Reset daily message count (for a new day)
 */
export async function resetDailyMessageCount(email: string): Promise<void> {
  try {
    await db
      .update(user)
      .set({
        dailyMessageCount: 0,
        lastMessageResetDate: new Date(),
      })
      .where(eq(user.email, email));
  } catch (error) {
    console.error('❌ Failed to reset daily message count:', error);
    throw error;
  }
}


export async function updateLinkedInInfoById(userId: string, linkedinInfo: string) {
  try {
    return await db.update(user)
      .set({ linkedinInfo }) // Update only the linkedinInfo column
      .where(eq(user.id, userId));
  } catch (error) {
    console.error('Failed to update LinkedIn info in database', error);
    throw error;
  }
}

export async function createApiUser({
  fullName,
  email_address,
  phone_number,
  orgName,
  work,
  benefits,
}: {
  fullName: string;
  email_address: string;
  phone_number?: string;
  orgName?: string;
  work?: string;
  benefits?: string;
}) {
  try {
    return await db.insert(apiUser).values({
      fullName,
      email_address,
      phone_number,
      orgName,
      work,
      benefits,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('❌ Failed to create apiUser in database:', error);
    throw error;
  }
}


export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
    });
  } catch (error) {
    console.error('Failed to save chat in database');
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));

    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error('Failed to delete chat by id from database');
    throw error;
  }
}
export async function createPremUser({
  fullName,
  emailAddress,
  phoneNumber,
  paragraphInterest,
}: {
  fullName: string;
  emailAddress: string;
  phoneNumber?: string;
  paragraphInterest?: string;
}) {
  try {
    return await db.insert(premuser).values({
      fullName,
      emailAddress,
      phoneNumber,
      paragraphInterest,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('❌ Failed to create premuser in database:', error);
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error('Failed to get chats by user from database');
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error('Failed to get chat by id from database');
    throw error;
  }
}

export async function saveMessages({
  messages,
}: {
  messages: Array<DBMessage>;
}) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    console.error('Failed to get messages by chat id from database', error);
    throw error;
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === 'up' })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    console.error('Failed to upvote message in database', error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    console.error('Failed to get votes by chat id from database', error);
    throw error;
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db.insert(document).values({
      id,
      title,
      kind,
      content,
      userId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to save document in database');
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)));
  } catch (error) {
    console.error(
      'Failed to delete documents by id after timestamp from database',
    );
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    console.error('Failed to save suggestions in database');
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    console.error(
      'Failed to get suggestions by document version from database',
    );
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    console.error('Failed to get message by id from database');
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
        );
    }
  } catch (error) {
    console.error(
      'Failed to delete messages by id after timestamp from database',
    );
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await db
      .update(chat)
      .set({ visibility })
      .where(eq(chat.id, chatId));
  } catch (error) {
    console.error('Failed to update chat visibility:', error);
    throw error;
  }
}

// Connection-related queries
export async function sendConnectionRequest({
  senderId,
  receiverId,
  message,
}: {
  senderId: string;
  receiverId: string;
  message?: string;
}) {
  try {
    const result = await db.insert(connection).values({
      sender_id: senderId,
      receiver_id: receiverId,
      message,
    }).returning();
    return result;
  } catch (error) {
    console.error('Failed to send connection request:', error);
    throw error;
  }
}

export async function getConnectionRequests(userId: string) {
  try {
    return await db
      .select()
      .from(connection)
      .where(
        and(
          eq(connection.receiver_id, userId),
          eq(connection.status, 'pending')
        )
      )
      .orderBy(desc(connection.created_at));
  } catch (error) {
    console.error('Failed to get connection requests:', error);
    throw error;
  }
}

export async function getAllPendingRequests(userId: string) {
  try {
    console.log('getAllPendingRequests - User ID:', userId);

    const connections = await db
      .select()
      .from(connection)
      .where(
        and(
          eq(connection.status, 'pending'),
          or(
            eq(connection.sender_id, userId),
            eq(connection.receiver_id, userId)
          )
        )
      )
      .orderBy(desc(connection.created_at));

    console.log('getAllPendingRequests - Raw connections from DB:', connections);
    console.log('getAllPendingRequests - Connections count:', connections.length);

    // Populate sender and receiver information
    const populatedConnections = await Promise.all(
      connections.map(async (conn) => {
        console.log('getAllPendingRequests - Processing connection:', conn.id);
        const [sender] = await getUserById(conn.sender_id);
        const [receiver] = await getUserById(conn.receiver_id);

        console.log('getAllPendingRequests - Sender data:', sender);
        console.log('getAllPendingRequests - Receiver data:', receiver);

        return {
          ...conn,
          sender: sender || null,
          receiver: receiver || null,
        };
      })
    );

    console.log('getAllPendingRequests - Final populated connections:', populatedConnections);
    return populatedConnections;
  } catch (error) {
    console.error('Failed to get all pending requests:', error);
    throw error;
  }
}

export async function updateConnectionStatus({
  connectionId,
  status,
}: {
  connectionId: string;
  status: 'accepted' | 'rejected';
}) {
  try {
    console.log('Updating connection status in database:', { connectionId, status });
    const result = await db
      .update(connection)
      .set({
        status,
        updated_at: new Date()
      })
      .where(eq(connection.id, connectionId))
      .returning();
    console.log('Connection status update result:', result);
    return result;
  } catch (error) {
    console.error('Failed to update connection status:', error);
    throw error;
  }
}

export async function getConnections(userId: string) {
  try {
    console.log('=== GET CONNECTIONS DB DEBUG ===');
    console.log('getConnections - User ID:', userId);
    console.log('getConnections - User ID type:', typeof userId);

    // Get accepted connections for this user
    const connections = await db
      .select()
      .from(connection)
      .where(
        and(
          eq(connection.status, 'accepted'),
          or(
            eq(connection.sender_id, userId),
            eq(connection.receiver_id, userId)
          )
        )
      )
      .orderBy(desc(connection.created_at));

    console.log('getConnections - Raw connections from DB:', connections);
    console.log('getConnections - Connections count:', connections.length);

    // Populate sender and receiver information
    const populatedConnections = await Promise.all(
      connections.map(async (conn) => {
        console.log('getConnections - Processing connection:', conn.id);
        const [sender] = await getUserById(conn.sender_id);
        const [receiver] = await getUserById(conn.receiver_id);

        console.log('getConnections - Sender data:', sender);
        console.log('getConnections - Receiver data:', receiver);

        return {
          ...conn,
          sender: sender || null,
          receiver: receiver || null,
        };
      })
    );

    console.log('getConnections - Final populated connections:', populatedConnections);
    return populatedConnections;
  } catch (error) {
    console.error('Failed to get connections:', error);
    throw error;
  }
}

export async function checkConnectionStatus({
  senderId,
  receiverId,
}: {
  senderId: string;
  receiverId: string;
}) {
  try {
    const [result] = await db
      .select()
      .from(connection)
      .where(
        or(
          and(eq(connection.sender_id, senderId), eq(connection.receiver_id, receiverId)),
          and(eq(connection.sender_id, receiverId), eq(connection.receiver_id, senderId))
        )
      );
    return result;
  } catch (error) {
    console.error('Failed to check connection status:', error);
    throw error;
  }
}

export async function getConnectionById(connectionId: string) {
  try {
    const [result] = await db
      .select()
      .from(connection)
      .where(eq(connection.id, connectionId));
    return result;
  } catch (error) {
    console.error('Failed to get connection by ID:', error);
    throw error;
  }
}

// Notification-related queries
export async function createNotification({
  userId,
  type,
  title,
  message,
  relatedUserId,
  relatedConnectionId,
}: {
  userId: string;
  type: 'connection_request' | 'connection_accepted' | 'connection_rejected';
  title: string;
  message: string;
  relatedUserId?: string;
  relatedConnectionId?: string;
}) {
  try {
    return await db.insert(notification).values({
      user_id: userId,
      type,
      title,
      message,
      related_user_id: relatedUserId,
      related_connection_id: relatedConnectionId,
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}

export async function getNotifications(userId: string) {
  try {
    // Get notifications but exclude ones for connections that have already been handled
    const notifications = await db
      .select({
        id: notification.id,
        user_id: notification.user_id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        related_user_id: notification.related_user_id,
        related_connection_id: notification.related_connection_id,
        is_read: notification.is_read,
        created_at: notification.created_at,
        connection_status: connection.status
      })
      .from(notification)
      .leftJoin(connection, eq(notification.related_connection_id, connection.id))
      .where(eq(notification.user_id, userId))
      .orderBy(desc(notification.created_at));

    // Filter out notifications for connections that have been handled (accepted/rejected)
    // Only show notifications for pending connections or notifications without related connections
    const filteredNotifications = notifications.filter(notif =>
      !notif.related_connection_id || // No related connection (general notifications)
      !notif.connection_status || // Connection doesn't exist anymore
      notif.connection_status === 'pending' // Connection is still pending
    );

    return filteredNotifications;
  } catch (error) {
    console.error('Failed to get notifications:', error);
    throw error;
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    return await db
      .update(notification)
      .set({ is_read: true })
      .where(eq(notification.id, notificationId));
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
}

export async function getUnreadNotificationCount(userId: string) {
  try {
    const [result] = await db
      .select({ count: sql`count(*)` })
      .from(notification)
      .where(
        and(
          eq(notification.user_id, userId),
          eq(notification.is_read, false)
        )
      );
    return Number(result?.count) || 0;
  } catch (error) {
    console.error('Failed to get unread notification count:', error);
    throw error;
  }
}

// Create a password reset token
export async function createPasswordResetToken({ userId, token, expiresAt }: { userId: string, token: string, expiresAt: Date }) {
  try {
    return await db.insert(passwordResetToken).values({
      user_id: userId,
      token,
      expires_at: expiresAt,
    });
  } catch (error) {
    console.error('Failed to create password reset token:', error);
    throw error;
  }
}

// Find a password reset token
export async function findPasswordResetToken(token: string) {
  try {
    const [result] = await db.select().from(passwordResetToken).where(eq(passwordResetToken.token, token));
    return result;
  } catch (error) {
    console.error('Failed to find password reset token:', error);
    throw error;
  }
}

// Delete a password reset token
export async function deletePasswordResetToken(token: string) {
  try {
    return await db.delete(passwordResetToken).where(eq(passwordResetToken.token, token));
  } catch (error) {
    console.error('Failed to delete password reset token:', error);
    throw error;
  }
}

export async function updateUserPasswordById(userId: string, newPassword: string) {
  try {
    const hashedPassword = await hash(newPassword, 10);
    return await db
      .update(user)
      .set({ password: hashedPassword })
      .where(eq(user.id, userId));
  } catch (error) {
    console.error('Failed to update user password:', error);
    throw error;
  }
}

// Messaging-related queries
export async function sendUserMessage({
  senderId,
  receiverId,
  message,
}: {
  senderId: string;
  receiverId: string;
  message: string;
}) {
  try {
    // First, verify that the users are connected
    const connection = await checkConnectionStatus({
      senderId,
      receiverId,
    });

    if (!connection || connection.status !== 'accepted') {
      throw new Error('Users must be connected to send messages');
    }

    const result = await db.insert(userMessage).values({
      sender_id: senderId,
      receiver_id: receiverId,
      message,
    }).returning();
    return result;
  } catch (error) {
    console.error('Failed to send user message:', error);
    throw error;
  }
}

export async function getConversationMessages({
  userId1,
  userId2,
  limit = 50,
  offset = 0,
}: {
  userId1: string;
  userId2: string;
  limit?: number;
  offset?: number;
}) {
  try {
    const messages = await db
      .select()
      .from(userMessage)
      .where(
        or(
          and(eq(userMessage.sender_id, userId1), eq(userMessage.receiver_id, userId2)),
          and(eq(userMessage.sender_id, userId2), eq(userMessage.receiver_id, userId1))
        )
      )
      .orderBy(desc(userMessage.created_at))
      .limit(limit)
      .offset(offset);

    // Reverse the order to show oldest first
    return messages.reverse();
  } catch (error) {
    console.error('Failed to get conversation messages:', error);
    throw error;
  }
}

export async function markMessagesAsRead({
  receiverId,
  senderId,
}: {
  receiverId: string;
  senderId: string;
}) {
  try {
    return await db
      .update(userMessage)
      .set({ is_read: true })
      .where(
        and(
          eq(userMessage.receiver_id, receiverId),
          eq(userMessage.sender_id, senderId),
          eq(userMessage.is_read, false)
        )
      );
  } catch (error) {
    console.error('Failed to mark messages as read:', error);
    throw error;
  }
}

export async function getUnreadMessageCount(userId: string) {
  try {
    const [result] = await db
      .select({ count: sql`count(*)` })
      .from(userMessage)
      .where(
        and(
          eq(userMessage.receiver_id, userId),
          eq(userMessage.is_read, false)
        )
      );
    return Number(result?.count) || 0;
  } catch (error) {
    console.error('Failed to get unread message count:', error);
    throw error;
  }
}

export async function getUserConversations(userId: string) {
  try {
    // Get all messages for the user (as sender or receiver)
    const allMessages = await db
      .select()
      .from(userMessage)
      .where(
        or(
          eq(userMessage.sender_id, userId),
          eq(userMessage.receiver_id, userId)
        )
      )
      .orderBy(desc(userMessage.created_at));

    // Group messages by conversation partner and get the latest message for each
    const conversationMap = new Map<string, {
      other_user_id: string;
      last_message: string;
      last_message_time: Date;
      unread_count: number;
    }>();

    allMessages.forEach((message) => {
      const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id;

      if (!conversationMap.has(otherUserId)) {
        // Initialize conversation
        conversationMap.set(otherUserId, {
          other_user_id: otherUserId,
          last_message: message.message,
          last_message_time: message.created_at,
          unread_count: 0,
        });
      }

      const conversation = conversationMap.get(otherUserId);
      if (!conversation) return;

      // Update with latest message
      if (message.created_at > conversation.last_message_time) {
        conversation.last_message = message.message;
        conversation.last_message_time = message.created_at;
      }

      // Count unread messages (only messages sent TO the current user)
      if (message.receiver_id === userId && !message.is_read) {
        conversation.unread_count += 1;
      }
    });

    return Array.from(conversationMap.values());
  } catch (error) {
    console.error('Failed to get user conversations:', error);
    throw error;
  }
}

// Create a job application
export async function createJobApplication({
  jobId,
  name,
  email,
  coverLetter,
  cvFileUrl,
}: {
  jobId: string;
  name: string;
  email: string;
  coverLetter: string;
  cvFileUrl?: string;
}) {
  try {
    return await db.insert(jobApplication).values({
      jobId,
      name,
      email,
      coverLetter,
      cvFileUrl,
    });
  } catch (error) {
    console.error('Failed to create job application:', error);
    throw error;
  }
}

// Fetch job applications by user email
export async function getJobApplicationsByEmail(email: string) {
  try {
    return await db.select().from(jobApplication)
      .where(eq(jobApplication.email, email))
      .orderBy(desc(jobApplication.createdAt));
  } catch (error) {
    console.error('Failed to fetch job applications:', error);
    throw error;
  }
}

// Insert or update a job by job_id
export async function upsertJob(jobData: Job) {
  // Try update first, if not found, insert
  const existing = await db.select().from(job).where(eq(job.job_id, jobData.job_id));
  if (existing.length > 0) {
    await db.update(job).set(jobData).where(eq(job.job_id, jobData.job_id));
    return jobData.job_id;
  } else {
    await db.insert(job).values(jobData);
    return jobData.job_id;
  }
}

// Bulk upsert jobs
export async function upsertJobs(jobs: Job[]) {
  for (const j of jobs) {
    await upsertJob(j);
  }
}

// Get all jobs
export async function getAllJobs(): Promise<Job[]> {
  return await db.select().from(job);
}

// Get job by id
export async function getJobById(jobId: string): Promise<Job | null> {
  const jobs = await db.select().from(job).where(eq(job.job_id, jobId));
  return jobs[0] || null;
}

export async function createJob({
  jobId,
  jobTitle,
  employerName,
  jobCity,
  jobState,
  jobCountry,
  jobApplyLink,
  jobDescription,
  jobEmploymentType,
  jobIsRemote = false,
  jobMinSalary,
  jobMaxSalary,
  jobSalaryPeriod,
  postedBy,
  postedByUserId,
}: {
  jobId: string;
  jobTitle: string;
  employerName: string;
  jobCity?: string;
  jobState?: string;
  jobCountry?: string;
  jobApplyLink: string;
  jobDescription: string;
  jobEmploymentType: string;
  jobIsRemote?: boolean;
  jobMinSalary?: string;
  jobMaxSalary?: string;
  jobSalaryPeriod?: string;
  postedBy: 'alumni' | 'career_team' | 'external';
  postedByUserId?: string;
}): Promise<void> {
  try {
    await db.insert(job).values({
      job_id: jobId,
      job_title: jobTitle,
      employer_name: employerName,
      job_city: jobCity,
      job_state: jobState,
      job_country: jobCountry,
      job_posted_at_datetime_utc: new Date(),
      job_apply_link: jobApplyLink,
      job_employment_type: jobEmploymentType,
      job_description: jobDescription,
      job_is_remote: jobIsRemote,
      job_min_salary: jobMinSalary,
      job_max_salary: jobMaxSalary,
      job_salary_period: jobSalaryPeriod,
      posted_by: postedBy,
      posted_by_user_id: postedByUserId,
      created_at: new Date(), // Set the created_at field
    });
  } catch (error) {
    console.error('Failed to create job:', error);
    throw error;
  }
}

export type { Job } from './schema';

// Remote Jobs Functions
export async function getAllRemoteJobs(): Promise<RemoteJob[]> {
  return await db.select().from(remoteJobs);
}

export async function getRemoteJobById(jobId: string): Promise<RemoteJob | null> {
  const jobs = await db.select().from(remoteJobs).where(eq(remoteJobs.job_id, jobId));
  return jobs[0] || null;
}

export async function createRemoteJob({
  jobId,
  jobTitle,
  employerName,
  jobCity,
  jobState,
  jobCountry,
  jobApplyLink,
  jobDescription,
  jobEmploymentType,
  jobIsRemote = true,
  jobMinSalary,
  jobMaxSalary,
  jobSalaryPeriod,
  postedBy,
  postedByUserId,
}: {
  jobId: string;
  jobTitle: string;
  employerName: string;
  jobCity?: string;
  jobState?: string;
  jobCountry?: string;
  jobApplyLink: string;
  jobDescription: string;
  jobEmploymentType: string;
  jobIsRemote?: boolean;
  jobMinSalary?: string;
  jobMaxSalary?: string;
  jobSalaryPeriod?: string;
  postedBy: 'alumni' | 'career_team' | 'external';
  postedByUserId?: string;
}): Promise<void> {
  try {
    await db.insert(remoteJobs).values({
      job_id: jobId,
      job_title: jobTitle,
      employer_name: employerName,
      job_city: jobCity,
      job_state: jobState,
      job_country: jobCountry,
      job_posted_at_datetime_utc: new Date(),
      job_apply_link: jobApplyLink,
      job_employment_type: jobEmploymentType,
      job_description: jobDescription,
      job_is_remote: jobIsRemote,
      job_min_salary: jobMinSalary,
      job_max_salary: jobMaxSalary,
      job_salary_period: jobSalaryPeriod,
      posted_by: postedBy,
      posted_by_user_id: postedByUserId,
      created_at: new Date(),
    });
  } catch (error) {
    console.error('Failed to create remote job:', error);
    throw error;
  }
}

export async function upsertRemoteJob(jobData: RemoteJob) {
  // Try update first, if not found, insert
  const existing = await db.select().from(remoteJobs).where(eq(remoteJobs.job_id, jobData.job_id));
  if (existing.length > 0) {
    await db.update(remoteJobs).set(jobData).where(eq(remoteJobs.job_id, jobData.job_id));
    return jobData.job_id;
  } else {
    await db.insert(remoteJobs).values(jobData);
    return jobData.job_id;
  }
}

export async function upsertRemoteJobs(jobs: RemoteJob[]) {
  for (const j of jobs) {
    await upsertRemoteJob(j);
  }
}

export type { RemoteJob } from './schema';

// Part-time Jobs Functions
export async function getAllPartTimeJobs(): Promise<PartTimeJob[]> {
  return await db.select().from(partTimeJobs);
}

export async function getPartTimeJobById(jobId: string): Promise<PartTimeJob | null> {
  const jobs = await db.select().from(partTimeJobs).where(eq(partTimeJobs.job_id, jobId));
  return jobs[0] || null;
}

export async function createPartTimeJob({
  jobId,
  jobTitle,
  employerName,
  jobCity,
  jobState,
  jobCountry,
  jobApplyLink,
  jobDescription,
  jobEmploymentType = 'Part-time',
  jobIsRemote = false,
  jobMinSalary,
  jobMaxSalary,
  jobSalaryPeriod,
  postedBy,
  postedByUserId,
}: {
  jobId: string;
  jobTitle: string;
  employerName: string;
  jobCity?: string;
  jobState?: string;
  jobCountry?: string;
  jobApplyLink: string;
  jobDescription: string;
  jobEmploymentType?: string;
  jobIsRemote?: boolean;
  jobMinSalary?: string;
  jobMaxSalary?: string;
  jobSalaryPeriod?: string;
  postedBy: 'alumni' | 'career_team' | 'external';
  postedByUserId?: string;
}): Promise<void> {
  try {
    await db.insert(partTimeJobs).values({
      job_id: jobId,
      job_title: jobTitle,
      employer_name: employerName,
      job_city: jobCity,
      job_state: jobState,
      job_country: jobCountry,
      job_posted_at_datetime_utc: new Date(),
      job_apply_link: jobApplyLink,
      job_employment_type: jobEmploymentType,
      job_description: jobDescription,
      job_is_remote: jobIsRemote,
      job_min_salary: jobMinSalary,
      job_max_salary: jobMaxSalary,
      job_salary_period: jobSalaryPeriod,
      posted_by: postedBy,
      posted_by_user_id: postedByUserId,
      created_at: new Date(),
    });
  } catch (error) {
    console.error('Failed to create part-time job:', error);
    throw error;
  }
}

export async function upsertPartTimeJob(jobData: PartTimeJob) {
  // Try update first, if not found, insert
  const existing = await db.select().from(partTimeJobs).where(eq(partTimeJobs.job_id, jobData.job_id));
  if (existing.length > 0) {
    await db.update(partTimeJobs).set(jobData).where(eq(partTimeJobs.job_id, jobData.job_id));
    return jobData.job_id;
  } else {
    await db.insert(partTimeJobs).values(jobData);
    return jobData.job_id;
  }
}

export async function upsertPartTimeJobs(jobs: PartTimeJob[]) {
  for (const j of jobs) {
    await upsertPartTimeJob(j);
  }
}

export type { PartTimeJob } from './schema';

// Skill Assessment Functions
export async function getAllSkills(): Promise<Skill[]> {
  try {
    return await db.select().from(skills).orderBy(asc(skills.name));
  } catch (error) {
    console.error('Failed to get all skills:', error);
    throw error;
  }
}

export async function getSkillQuestions(skillId: number): Promise<SkillQuestion[]> {
  try {
    return await db
      .select()
      .from(skillQuestions)
      .where(eq(skillQuestions.skillId, skillId))
      .orderBy(sql`RANDOM()`)
      .limit(20);
  } catch (error) {
    console.error('Failed to get skill questions:', error);
    throw error;
  }
}

export async function submitSkillAttempt({
  userId,
  skillId,
  score,
  total,
  selectedAnswers,
}: {
  userId: string;
  skillId: number;
  score: number;
  total: number;
  selectedAnswers: number[];
}): Promise<void> {
  try {
    await db.insert(skillAttempts).values({
      userId,
      skillId,
      score,
      total,
      selectedAnswers,
    });
  } catch (error) {
    console.error('Failed to submit skill attempt:', error);
    throw error;
  }
}

export async function getUserSkillBadges(userId: string): Promise<Array<{ skillName: string; score: number; total: number; percentage: number; createdAt: Date }>> {
  try {
    const results = await db
      .select({
        skillName: skills.name,
        score: skillAttempts.score,
        total: skillAttempts.total,
        createdAt: skillAttempts.createdAt,
      })
      .from(skillAttempts)
      .innerJoin(skills, eq(skillAttempts.skillId, skills.id))
      .where(eq(skillAttempts.userId, userId))
      .orderBy(desc(skillAttempts.createdAt));

    // Group by skill and get the best score for each skill
    const skillMap = new Map<string, { skillName: string; score: number; total: number; percentage: number; createdAt: Date }>();

    results.forEach(result => {
      const percentage = Math.round((result.score / result.total) * 100);
      const existing = skillMap.get(result.skillName);

      // Only keep the best score for each skill
      if (!existing || percentage > existing.percentage) {
        skillMap.set(result.skillName, {
          skillName: result.skillName,
          score: result.score,
          total: result.total,
          percentage,
          createdAt: result.createdAt,
        });
      }
    });

    return Array.from(skillMap.values());
  } catch (error) {
    console.error('Failed to get user skill badges:', error);
    throw error;
  }
}

// Community Queries
export async function getAllCommunities(): Promise<Community[]> {
  try {
    return await db.select().from(communities).orderBy(desc(communities.created_at));
  } catch (error) {
    console.error('Failed to get all communities:', error);
    throw error;
  }
}

export async function getCommunityById(communityId: string): Promise<Community | null> {
  try {
    const results = await db.select().from(communities).where(eq(communities.id, communityId));
    return results[0] || null;
  } catch (error) {
    console.error('Failed to get community by ID:', error);
    throw error;
  }
}

export async function getCommunityMembers(communityId: string): Promise<Array<{ user: User; membership: CommunityMembership }>> {
  try {
    const results = await db
      .select({
        user: user,
        membership: communityMemberships,
      })
      .from(communityMemberships)
      .innerJoin(user, eq(communityMemberships.user_id, user.id))
      .where(eq(communityMemberships.community_id, communityId))
      .orderBy(desc(communityMemberships.joined_at));

    return results;
  } catch (error) {
    console.error('Failed to get community members:', error);
    throw error;
  }
}

export async function getCommunityPosts(communityId: string, limit = 20): Promise<Array<{ post: CommunityPost; user: User }>> {
  try {
    const results = await db
      .select({
        post: communityPosts,
        user: user,
      })
      .from(communityPosts)
      .innerJoin(user, eq(communityPosts.user_id, user.id))
      .where(eq(communityPosts.community_id, communityId))
      .orderBy(desc(communityPosts.created_at))
      .limit(limit);

    return results;
  } catch (error) {
    console.error('Failed to get community posts:', error);
    throw error;
  }
}

export async function getUserCommunityMembership(userId: string, communityId: string): Promise<CommunityMembership | null> {
  try {
    const results = await db
      .select()
      .from(communityMemberships)
      .where(and(eq(communityMemberships.user_id, userId), eq(communityMemberships.community_id, communityId)));

    return results[0] || null;
  } catch (error) {
    console.error('Failed to get user community membership:', error);
    throw error;
  }
}

export async function requestCommunityMembership(userId: string, communityId: string): Promise<void> {
  try {
    await db.insert(communityMemberships).values({
      user_id: userId,
      community_id: communityId,
      status: 'approved',
    });
  } catch (error) {
    console.error('Failed to join community:', error);
    throw error;
  }
}

export async function createCommunityPost({
  communityId,
  userId,
  content,
  type,
}: {
  communityId: string;
  userId: string;
  content: string;
  type: 'event' | 'update';
}): Promise<void> {
  try {
    await db.insert(communityPosts).values({
      community_id: communityId,
      user_id: userId,
      content,
      type,
    });
  } catch (error) {
    console.error('Failed to create community post:', error);
    throw error;
  }
}

export async function createCommunity({
  name,
  description,
  bannerImage,
  createdBy,
}: {
  name: string;
  description?: string | null;
  bannerImage?: string | null;
  createdBy: string;
}): Promise<Community> {
  try {
    const [newCommunity] = await db
      .insert(communities)
      .values({
        name,
        description: description || null,
        banner_image: bannerImage || null,
        created_by: createdBy,
      })
      .returning();
    return newCommunity;
  } catch (error) {
    console.error('Failed to create community:', error);
    throw error;
  }
}

export async function isCommunityAdmin(userId: string, communityId: string): Promise<boolean> {
  try {
    const community = await getCommunityById(communityId);
    return community?.created_by ? community.created_by === userId : false;
  } catch (error) {
    console.error('Failed to check community admin status:', error);
    return false;
  }
}

export async function removeCommunityMember(membershipId: string): Promise<void> {
  try {
    await db.delete(communityMemberships).where(eq(communityMemberships.id, membershipId));
  } catch (error) {
    console.error('Failed to remove community member:', error);
    throw error;
  }
}

export async function deleteCommunityPost(postId: string): Promise<void> {
  try {
    await db.delete(communityPosts).where(eq(communityPosts.id, postId));
  } catch (error) {
    console.error('Failed to delete community post:', error);
    throw error;
  }
}

export async function deleteCommunity(communityId: string): Promise<void> {
  try {
    // Cascade delete will handle memberships and posts
    await db.delete(communities).where(eq(communities.id, communityId));
  } catch (error) {
    console.error('Failed to delete community:', error);
    throw error;
  }
}
