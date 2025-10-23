"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notification = exports.connection = exports.suggestion = exports.document = exports.vote = exports.voteDeprecated = exports.message = exports.messageDeprecated = exports.chat = exports.apiUser = exports.premuser = exports.archiveCard = exports.user = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
exports.user = (0, pg_core_1.pgTable)('User', {
    id: (0, pg_core_1.uuid)('id').primaryKey().notNull().defaultRandom(),
    email: (0, pg_core_1.varchar)('email', { length: 64 }).notNull(),
    password: (0, pg_core_1.varchar)('password', { length: 64 }),
    name: (0, pg_core_1.text)('name'),
    // Existing fields
    linkedinInfo: (0, pg_core_1.text)('linkedinInfo'),
    goals: (0, pg_core_1.text)('goals'),
    profilemetrics: (0, pg_core_1.text)('profilemetrics'),
    strengths: (0, pg_core_1.text)('strengths'),
    interests: (0, pg_core_1.text)('interests'),
    // ✅ New fields
    linkedinURL: (0, pg_core_1.text)('linkedinURL'),
    FacebookURL: (0, pg_core_1.text)('FacebookURL'),
    phone: (0, pg_core_1.text)('phone'),
    referral_code: (0, pg_core_1.text)('referral_code'), // ✅ Add this line
    flaggedChatExpiresAt: (0, pg_core_1.timestamp)('flaggedChatExpiresAt'),
    createdAt: (0, pg_core_1.timestamp)('createdAt')
});
exports.archiveCard = (0, pg_core_1.pgTable)('archive_card', {
    id: (0, pg_core_1.serial)('id').primaryKey(), // Auto-increment
    name: (0, pg_core_1.text)('name'),
    phone: (0, pg_core_1.text)('phone'),
    matchPercentage: (0, pg_core_1.text)('match_percentage'),
    desc: (0, pg_core_1.text)('description'),
    email: (0, pg_core_1.text)('email'),
}, function (table) { return ({
    uniqueIdEmail: (0, pg_core_1.uniqueIndex)('archivecard_id_email_idx').on(table.id, table.email),
}); });
exports.premuser = (0, pg_core_1.pgTable)('premuser', {
    id: (0, pg_core_1.uuid)('id').primaryKey().notNull().defaultRandom(),
    fullName: (0, pg_core_1.varchar)('full_name', { length: 128 }).notNull(),
    emailAddress: (0, pg_core_1.varchar)('email_address', { length: 128 }).notNull(),
    phoneNumber: (0, pg_core_1.varchar)('phone_number', { length: 32 }),
    paragraphInterest: (0, pg_core_1.text)('paragraph_interest'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.apiUser = (0, pg_core_1.pgTable)('apiuser', {
    id: (0, pg_core_1.uuid)('id').primaryKey().notNull().defaultRandom(),
    fullName: (0, pg_core_1.varchar)('full_name', { length: 128 }).notNull(),
    email_address: (0, pg_core_1.varchar)('email_address', { length: 128 }).notNull(),
    phone_number: (0, pg_core_1.varchar)('phone_number', { length: 32 }),
    orgName: (0, pg_core_1.text)('org_name'),
    work: (0, pg_core_1.text)('work'),
    benefits: (0, pg_core_1.text)('benefits'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.chat = (0, pg_core_1.pgTable)('Chat', {
    id: (0, pg_core_1.uuid)('id').primaryKey().notNull().defaultRandom(),
    createdAt: (0, pg_core_1.timestamp)('createdAt').notNull(),
    title: (0, pg_core_1.text)('title').notNull(),
    userId: (0, pg_core_1.uuid)('userId')
        .notNull()
        .references(function () { return exports.user.id; }),
    visibility: (0, pg_core_1.varchar)('visibility', { enum: ['public', 'private'] })
        .notNull()
        .default('private'),
});
// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://github.com/vercel/ai-chatbot/blob/main/docs/04-migrate-to-parts.md
exports.messageDeprecated = (0, pg_core_1.pgTable)('Message', {
    id: (0, pg_core_1.uuid)('id').primaryKey().notNull().defaultRandom(),
    chatId: (0, pg_core_1.uuid)('chatId')
        .notNull()
        .references(function () { return exports.chat.id; }),
    role: (0, pg_core_1.varchar)('role').notNull(),
    content: (0, pg_core_1.json)('content').notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt').notNull(),
});
exports.message = (0, pg_core_1.pgTable)('Message_v2', {
    id: (0, pg_core_1.uuid)('id').primaryKey().notNull().defaultRandom(),
    chatId: (0, pg_core_1.uuid)('chatId')
        .notNull()
        .references(function () { return exports.chat.id; }),
    role: (0, pg_core_1.varchar)('role').notNull(),
    parts: (0, pg_core_1.json)('parts').notNull(),
    attachments: (0, pg_core_1.json)('attachments').notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt').notNull(),
});
// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://github.com/vercel/ai-chatbot/blob/main/docs/04-migrate-to-parts.md
exports.voteDeprecated = (0, pg_core_1.pgTable)('Vote', {
    chatId: (0, pg_core_1.uuid)('chatId')
        .notNull()
        .references(function () { return exports.chat.id; }),
    messageId: (0, pg_core_1.uuid)('messageId')
        .notNull()
        .references(function () { return exports.messageDeprecated.id; }),
    isUpvoted: (0, pg_core_1.boolean)('isUpvoted').notNull(),
}, function (table) {
    return {
        pk: (0, pg_core_1.primaryKey)({ columns: [table.chatId, table.messageId] }),
    };
});
exports.vote = (0, pg_core_1.pgTable)('Vote_v2', {
    chatId: (0, pg_core_1.uuid)('chatId')
        .notNull()
        .references(function () { return exports.chat.id; }),
    messageId: (0, pg_core_1.uuid)('messageId')
        .notNull()
        .references(function () { return exports.message.id; }),
    isUpvoted: (0, pg_core_1.boolean)('isUpvoted').notNull(),
}, function (table) {
    return {
        pk: (0, pg_core_1.primaryKey)({ columns: [table.chatId, table.messageId] }),
    };
});
exports.document = (0, pg_core_1.pgTable)('Document', {
    id: (0, pg_core_1.uuid)('id').notNull().defaultRandom(),
    createdAt: (0, pg_core_1.timestamp)('createdAt').notNull(),
    title: (0, pg_core_1.text)('title').notNull(),
    content: (0, pg_core_1.text)('content'),
    kind: (0, pg_core_1.varchar)('text', { enum: ['text', 'code', 'image', 'sheet'] })
        .notNull()
        .default('text'),
    userId: (0, pg_core_1.uuid)('userId')
        .notNull()
        .references(function () { return exports.user.id; }),
}, function (table) {
    return {
        pk: (0, pg_core_1.primaryKey)({ columns: [table.id, table.createdAt] }),
    };
});
exports.suggestion = (0, pg_core_1.pgTable)('Suggestion', {
    id: (0, pg_core_1.uuid)('id').notNull().defaultRandom(),
    documentId: (0, pg_core_1.uuid)('documentId').notNull(),
    documentCreatedAt: (0, pg_core_1.timestamp)('documentCreatedAt').notNull(),
    originalText: (0, pg_core_1.text)('originalText').notNull(),
    suggestedText: (0, pg_core_1.text)('suggestedText').notNull(),
    description: (0, pg_core_1.text)('description'),
    isResolved: (0, pg_core_1.boolean)('isResolved').notNull().default(false),
    userId: (0, pg_core_1.uuid)('userId')
        .notNull()
        .references(function () { return exports.user.id; }),
    createdAt: (0, pg_core_1.timestamp)('createdAt').notNull(),
}, function (table) { return ({
    pk: (0, pg_core_1.primaryKey)({ columns: [table.id] }),
    documentRef: (0, pg_core_1.foreignKey)({
        columns: [table.documentId, table.documentCreatedAt],
        foreignColumns: [exports.document.id, exports.document.createdAt],
    }),
}); });
// Connection table for managing user connections
exports.connection = (0, pg_core_1.pgTable)('connection', {
    id: (0, pg_core_1.uuid)('id').primaryKey().notNull().defaultRandom(),
    sender_id: (0, pg_core_1.uuid)('sender_id')
        .notNull()
        .references(function () { return exports.user.id; }),
    receiver_id: (0, pg_core_1.uuid)('receiver_id')
        .notNull()
        .references(function () { return exports.user.id; }),
    status: (0, pg_core_1.varchar)('status', { enum: ['pending', 'accepted', 'rejected'] })
        .notNull()
        .default('pending'),
    message: (0, pg_core_1.text)('message'), // Optional message with connection request
    created_at: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, function (table) { return ({
    // Prevent duplicate connection requests
    uniqueConnection: (0, pg_core_1.uniqueIndex)('unique_connection_idx').on(table.sender_id, table.receiver_id),
}); });
// Notification table for user notifications
exports.notification = (0, pg_core_1.pgTable)('notification', {
    id: (0, pg_core_1.uuid)('id').primaryKey().notNull().defaultRandom(),
    user_id: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(function () { return exports.user.id; }),
    type: (0, pg_core_1.varchar)('type', { enum: ['connection_request', 'connection_accepted', 'connection_rejected'] })
        .notNull(),
    title: (0, pg_core_1.text)('title').notNull(),
    message: (0, pg_core_1.text)('message').notNull(),
    related_user_id: (0, pg_core_1.uuid)('related_user_id')
        .references(function () { return exports.user.id; }), // ID of the user who triggered the notification
    related_connection_id: (0, pg_core_1.uuid)('related_connection_id')
        .references(function () { return exports.connection.id; }),
    is_read: (0, pg_core_1.boolean)('is_read').notNull().default(false),
    created_at: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
