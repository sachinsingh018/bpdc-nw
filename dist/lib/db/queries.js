"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.getUser = getUser;
exports.getUserById = getUserById;
exports.getFlaggedChatExpiry = getFlaggedChatExpiry;
exports.createUser = createUser;
exports.getTop50UsersExcluding = getTop50UsersExcluding;
exports.getAllUsers = getAllUsers;
exports.getArchiveCardsByEmail = getArchiveCardsByEmail;
exports.createArchiveCard = createArchiveCard;
exports.updateUserProfile = updateUserProfile;
exports.updateFlaggedChatExpiry = updateFlaggedChatExpiry;
exports.updateLinkedInInfoById = updateLinkedInInfoById;
exports.createApiUser = createApiUser;
exports.saveChat = saveChat;
exports.deleteChatById = deleteChatById;
exports.createPremUser = createPremUser;
exports.getChatsByUserId = getChatsByUserId;
exports.getChatById = getChatById;
exports.saveMessages = saveMessages;
exports.getMessagesByChatId = getMessagesByChatId;
exports.voteMessage = voteMessage;
exports.getVotesByChatId = getVotesByChatId;
exports.saveDocument = saveDocument;
exports.getDocumentsById = getDocumentsById;
exports.getDocumentById = getDocumentById;
exports.deleteDocumentsByIdAfterTimestamp = deleteDocumentsByIdAfterTimestamp;
exports.saveSuggestions = saveSuggestions;
exports.getSuggestionsByDocumentId = getSuggestionsByDocumentId;
exports.getMessageById = getMessageById;
exports.deleteMessagesByChatIdAfterTimestamp = deleteMessagesByChatIdAfterTimestamp;
exports.updateChatVisiblityById = updateChatVisiblityById;
exports.sendConnectionRequest = sendConnectionRequest;
exports.getConnectionRequests = getConnectionRequests;
exports.updateConnectionStatus = updateConnectionStatus;
exports.getConnections = getConnections;
exports.checkConnectionStatus = checkConnectionStatus;
exports.getConnectionById = getConnectionById;
exports.createNotification = createNotification;
exports.getNotifications = getNotifications;
exports.markNotificationAsRead = markNotificationAsRead;
exports.getUnreadNotificationCount = getUnreadNotificationCount;
require("server-only");
var bcrypt_ts_1 = require("bcrypt-ts");
var drizzle_orm_1 = require("drizzle-orm");
var postgres_js_1 = require("drizzle-orm/postgres-js");
var postgres_1 = require("postgres");
var schema_1 = require("./schema"); // <-- Add this line
var schema_2 = require("./schema");
// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle
// biome-ignore lint: Forbidden non-null assertion.
var client = (0, postgres_1.default)(process.env.POSTGRES_URL);
exports.db = (0, postgres_js_1.drizzle)(client);
function getUser(email) {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db.select().from(schema_2.user).where((0, drizzle_orm_1.eq)(schema_2.user.email, email))];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_1 = _a.sent();
                    console.error('Failed to get user from database');
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getUserById(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db.select().from(schema_2.user).where((0, drizzle_orm_1.eq)(schema_2.user.id, userId))];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_2 = _a.sent();
                    console.error('Failed to get user by ID from database');
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getFlaggedChatExpiry(email) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_3;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db
                            .select({ flaggedChatExpiresAt: schema_2.user.flaggedChatExpiresAt })
                            .from(schema_2.user)
                            .where((0, drizzle_orm_1.eq)(schema_2.user.email, email))];
                case 1:
                    result = (_b.sent())[0];
                    return [2 /*return*/, (_a = result === null || result === void 0 ? void 0 : result.flaggedChatExpiresAt) !== null && _a !== void 0 ? _a : null];
                case 2:
                    error_3 = _b.sent();
                    console.error('❌ Failed to get flaggedChatExpiresAt:', error_3);
                    throw error_3;
                case 3: return [2 /*return*/];
            }
        });
    });
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
function createUser(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var salt, hash, error_4;
        var name = _b.name, email = _b.email, password = _b.password, linkedinInfo = _b.linkedinInfo, goals = _b.goals, profilemetrics = _b.profilemetrics, strengths = _b.strengths, interests = _b.interests, linkedinURL = _b.linkedinURL, FacebookURL = _b.FacebookURL, phone = _b.phone, createdAt = _b.createdAt, // ✅ accept it here
        referral_code = _b.referral_code // ✅ Add this line
        ;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    salt = (0, bcrypt_ts_1.genSaltSync)(10);
                    hash = (0, bcrypt_ts_1.hashSync)(password, salt);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, exports.db.insert(schema_2.user).values({
                            name: name,
                            email: email,
                            password: hash,
                            linkedinInfo: linkedinInfo,
                            goals: goals,
                            profilemetrics: profilemetrics,
                            strengths: strengths,
                            interests: interests,
                            linkedinURL: linkedinURL,
                            FacebookURL: FacebookURL,
                            phone: phone,
                            referral_code: referral_code,
                            createdAt: createdAt,
                        })];
                case 2: return [2 /*return*/, _c.sent()];
                case 3:
                    error_4 = _c.sent();
                    console.error('Failed to create user in database:', error_4);
                    throw error_4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
// 🔍 Get top 50 users (excluding current)
function getTop50UsersExcluding(email) {
    return __awaiter(this, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db
                            .select()
                            .from(schema_2.user)
                            .where((0, drizzle_orm_1.ne)(schema_2.user.email, email))
                            .limit(50)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_5 = _a.sent();
                    console.error('❌ Failed to fetch users for AI search:', error_5);
                    throw error_5;
                case 3: return [2 /*return*/];
            }
        });
    });
}
// 🔍 Get all users for matching engine
function getAllUsers() {
    return __awaiter(this, void 0, void 0, function () {
        var error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db
                            .select()
                            .from(schema_2.user)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_6 = _a.sent();
                    console.error('❌ Failed to fetch all users for matching:', error_6);
                    throw error_6;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getArchiveCardsByEmail(email) {
    return __awaiter(this, void 0, void 0, function () {
        var error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db.select().from(schema_2.archiveCard).where((0, drizzle_orm_1.eq)(schema_2.archiveCard.email, email))];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_7 = _a.sent();
                    console.error('❌ Failed to get archive cards from database:', error_7);
                    throw error_7;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function createArchiveCard(name, phone, matchPercentage, desc, email) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log('Inserting into archive_card:', {
                        name: name,
                        phone: phone,
                        matchPercentage: matchPercentage,
                        desc: desc,
                        email: email
                    });
                    return [4 /*yield*/, exports.db.insert(schema_2.archiveCard).values({
                            name: name,
                            phone: phone,
                            matchPercentage: matchPercentage,
                            desc: desc,
                            email: email,
                        })];
                case 1:
                    result = _a.sent();
                    console.log('Insert result:', result);
                    return [2 /*return*/, result];
                case 2:
                    error_8 = _a.sent();
                    console.error('❌ Failed to insert archive card:', error_8);
                    throw error_8;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function updateUserProfile(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var email = _b.email, goals = _b.goals, metrics = _b.metrics, strengths = _b.strengths, interests = _b.interests, linkedinURL = _b.linkedinURL, FacebookURL = _b.FacebookURL, phone = _b.phone, linkedinInfo = _b.linkedinInfo, flaggedChatExpiresAt = _b.flaggedChatExpiresAt;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, exports.db
                        .update(schema_2.user)
                        .set({
                        goals: Array.isArray(goals) ? goals.join(',') : goals,
                        profilemetrics: Array.isArray(metrics) ? metrics.join(',') : metrics,
                        strengths: Array.isArray(strengths) ? strengths.join(',') : strengths,
                        interests: Array.isArray(interests) ? interests.join(',') : interests,
                        linkedinURL: linkedinURL,
                        FacebookURL: FacebookURL,
                        phone: phone,
                        linkedinInfo: linkedinInfo,
                    })
                        .where((0, drizzle_orm_1.eq)(schema_2.user.email, email))];
                case 1: return [2 /*return*/, _c.sent()];
            }
        });
    });
}
// queries.ts
function updateFlaggedChatExpiry(email, flaggedChatExpiresAt) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.db
                        .update(schema_2.user)
                        .set({ flaggedChatExpiresAt: flaggedChatExpiresAt })
                        .where((0, drizzle_orm_1.eq)(schema_2.user.email, email))];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function updateLinkedInInfoById(userId, linkedinInfo) {
    return __awaiter(this, void 0, void 0, function () {
        var error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db.update(schema_2.user)
                            .set({ linkedinInfo: linkedinInfo }) // Update only the linkedinInfo column
                            .where((0, drizzle_orm_1.eq)(schema_2.user.id, userId))];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_9 = _a.sent();
                    console.error('Failed to update LinkedIn info in database', error_9);
                    throw error_9;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function createApiUser(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var error_10;
        var fullName = _b.fullName, email_address = _b.email_address, phone_number = _b.phone_number, orgName = _b.orgName, work = _b.work, benefits = _b.benefits;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db.insert(schema_1.apiUser).values({
                            fullName: fullName,
                            email_address: email_address,
                            phone_number: phone_number,
                            orgName: orgName,
                            work: work,
                            benefits: benefits,
                            createdAt: new Date(),
                        })];
                case 1: return [2 /*return*/, _c.sent()];
                case 2:
                    error_10 = _c.sent();
                    console.error('❌ Failed to create apiUser in database:', error_10);
                    throw error_10;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function saveChat(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var error_11;
        var id = _b.id, userId = _b.userId, title = _b.title;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db.insert(schema_2.chat).values({
                            id: id,
                            createdAt: new Date(),
                            userId: userId,
                            title: title,
                        })];
                case 1: return [2 /*return*/, _c.sent()];
                case 2:
                    error_11 = _c.sent();
                    console.error('Failed to save chat in database');
                    throw error_11;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function deleteChatById(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var error_12;
        var id = _b.id;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, exports.db.delete(schema_2.vote).where((0, drizzle_orm_1.eq)(schema_2.vote.chatId, id))];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, exports.db.delete(schema_2.message).where((0, drizzle_orm_1.eq)(schema_2.message.chatId, id))];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, exports.db.delete(schema_2.chat).where((0, drizzle_orm_1.eq)(schema_2.chat.id, id))];
                case 3: return [2 /*return*/, _c.sent()];
                case 4:
                    error_12 = _c.sent();
                    console.error('Failed to delete chat by id from database');
                    throw error_12;
                case 5: return [2 /*return*/];
            }
        });
    });
}
function createPremUser(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var error_13;
        var fullName = _b.fullName, emailAddress = _b.emailAddress, phoneNumber = _b.phoneNumber, paragraphInterest = _b.paragraphInterest;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db.insert(schema_1.premuser).values({
                            fullName: fullName,
                            emailAddress: emailAddress,
                            phoneNumber: phoneNumber,
                            paragraphInterest: paragraphInterest,
                            createdAt: new Date(),
                        })];
                case 1: return [2 /*return*/, _c.sent()];
                case 2:
                    error_13 = _c.sent();
                    console.error('❌ Failed to create premuser in database:', error_13);
                    throw error_13;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getChatsByUserId(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var error_14;
        var id = _b.id;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db
                            .select()
                            .from(schema_2.chat)
                            .where((0, drizzle_orm_1.eq)(schema_2.chat.userId, id))
                            .orderBy((0, drizzle_orm_1.desc)(schema_2.chat.createdAt))];
                case 1: return [2 /*return*/, _c.sent()];
                case 2:
                    error_14 = _c.sent();
                    console.error('Failed to get chats by user from database');
                    throw error_14;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getChatById(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var selectedChat, error_15;
        var id = _b.id;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db.select().from(schema_2.chat).where((0, drizzle_orm_1.eq)(schema_2.chat.id, id))];
                case 1:
                    selectedChat = (_c.sent())[0];
                    return [2 /*return*/, selectedChat];
                case 2:
                    error_15 = _c.sent();
                    console.error('Failed to get chat by id from database');
                    throw error_15;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function saveMessages(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var error_16;
        var messages = _b.messages;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db.insert(schema_2.message).values(messages)];
                case 1: return [2 /*return*/, _c.sent()];
                case 2:
                    error_16 = _c.sent();
                    console.error('Failed to save messages in database', error_16);
                    throw error_16;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getMessagesByChatId(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var error_17;
        var id = _b.id;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db
                            .select()
                            .from(schema_2.message)
                            .where((0, drizzle_orm_1.eq)(schema_2.message.chatId, id))
                            .orderBy((0, drizzle_orm_1.asc)(schema_2.message.createdAt))];
                case 1: return [2 /*return*/, _c.sent()];
                case 2:
                    error_17 = _c.sent();
                    console.error('Failed to get messages by chat id from database', error_17);
                    throw error_17;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function voteMessage(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var existingVote, error_18;
        var chatId = _b.chatId, messageId = _b.messageId, type = _b.type;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, exports.db
                            .select()
                            .from(schema_2.vote)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_2.vote.messageId, messageId)))];
                case 1:
                    existingVote = (_c.sent())[0];
                    if (!existingVote) return [3 /*break*/, 3];
                    return [4 /*yield*/, exports.db
                            .update(schema_2.vote)
                            .set({ isUpvoted: type === 'up' })
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_2.vote.messageId, messageId), (0, drizzle_orm_1.eq)(schema_2.vote.chatId, chatId)))];
                case 2: return [2 /*return*/, _c.sent()];
                case 3: return [4 /*yield*/, exports.db.insert(schema_2.vote).values({
                        chatId: chatId,
                        messageId: messageId,
                        isUpvoted: type === 'up',
                    })];
                case 4: return [2 /*return*/, _c.sent()];
                case 5:
                    error_18 = _c.sent();
                    console.error('Failed to upvote message in database', error_18);
                    throw error_18;
                case 6: return [2 /*return*/];
            }
        });
    });
}
function getVotesByChatId(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var error_19;
        var id = _b.id;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db.select().from(schema_2.vote).where((0, drizzle_orm_1.eq)(schema_2.vote.chatId, id))];
                case 1: return [2 /*return*/, _c.sent()];
                case 2:
                    error_19 = _c.sent();
                    console.error('Failed to get votes by chat id from database', error_19);
                    throw error_19;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function saveDocument(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var error_20;
        var id = _b.id, title = _b.title, kind = _b.kind, content = _b.content, userId = _b.userId;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db.insert(schema_2.document).values({
                            id: id,
                            title: title,
                            kind: kind,
                            content: content,
                            userId: userId,
                            createdAt: new Date(),
                        })];
                case 1: return [2 /*return*/, _c.sent()];
                case 2:
                    error_20 = _c.sent();
                    console.error('Failed to save document in database');
                    throw error_20;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getDocumentsById(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var documents, error_21;
        var id = _b.id;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db
                            .select()
                            .from(schema_2.document)
                            .where((0, drizzle_orm_1.eq)(schema_2.document.id, id))
                            .orderBy((0, drizzle_orm_1.asc)(schema_2.document.createdAt))];
                case 1:
                    documents = _c.sent();
                    return [2 /*return*/, documents];
                case 2:
                    error_21 = _c.sent();
                    console.error('Failed to get document by id from database');
                    throw error_21;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getDocumentById(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var selectedDocument, error_22;
        var id = _b.id;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db
                            .select()
                            .from(schema_2.document)
                            .where((0, drizzle_orm_1.eq)(schema_2.document.id, id))
                            .orderBy((0, drizzle_orm_1.desc)(schema_2.document.createdAt))];
                case 1:
                    selectedDocument = (_c.sent())[0];
                    return [2 /*return*/, selectedDocument];
                case 2:
                    error_22 = _c.sent();
                    console.error('Failed to get document by id from database');
                    throw error_22;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function deleteDocumentsByIdAfterTimestamp(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var error_23;
        var id = _b.id, timestamp = _b.timestamp;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, exports.db
                            .delete(schema_2.suggestion)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_2.suggestion.documentId, id), (0, drizzle_orm_1.gt)(schema_2.suggestion.documentCreatedAt, timestamp)))];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, exports.db
                            .delete(schema_2.document)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_2.document.id, id), (0, drizzle_orm_1.gt)(schema_2.document.createdAt, timestamp)))];
                case 2: return [2 /*return*/, _c.sent()];
                case 3:
                    error_23 = _c.sent();
                    console.error('Failed to delete documents by id after timestamp from database');
                    throw error_23;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function saveSuggestions(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var error_24;
        var suggestions = _b.suggestions;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db.insert(schema_2.suggestion).values(suggestions)];
                case 1: return [2 /*return*/, _c.sent()];
                case 2:
                    error_24 = _c.sent();
                    console.error('Failed to save suggestions in database');
                    throw error_24;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getSuggestionsByDocumentId(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var error_25;
        var documentId = _b.documentId;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db
                            .select()
                            .from(schema_2.suggestion)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_2.suggestion.documentId, documentId)))];
                case 1: return [2 /*return*/, _c.sent()];
                case 2:
                    error_25 = _c.sent();
                    console.error('Failed to get suggestions by document version from database');
                    throw error_25;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getMessageById(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var error_26;
        var id = _b.id;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db.select().from(schema_2.message).where((0, drizzle_orm_1.eq)(schema_2.message.id, id))];
                case 1: return [2 /*return*/, _c.sent()];
                case 2:
                    error_26 = _c.sent();
                    console.error('Failed to get message by id from database');
                    throw error_26;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function deleteMessagesByChatIdAfterTimestamp(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var messagesToDelete, messageIds, error_27;
        var chatId = _b.chatId, timestamp = _b.timestamp;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, exports.db
                            .select({ id: schema_2.message.id })
                            .from(schema_2.message)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_2.message.chatId, chatId), (0, drizzle_orm_1.gte)(schema_2.message.createdAt, timestamp)))];
                case 1:
                    messagesToDelete = _c.sent();
                    messageIds = messagesToDelete.map(function (message) { return message.id; });
                    if (!(messageIds.length > 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, exports.db
                            .delete(schema_2.vote)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_2.vote.chatId, chatId), (0, drizzle_orm_1.inArray)(schema_2.vote.messageId, messageIds)))];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, exports.db
                            .delete(schema_2.message)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_2.message.chatId, chatId), (0, drizzle_orm_1.inArray)(schema_2.message.id, messageIds)))];
                case 3: return [2 /*return*/, _c.sent()];
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_27 = _c.sent();
                    console.error('Failed to delete messages by id after timestamp from database');
                    throw error_27;
                case 6: return [2 /*return*/];
            }
        });
    });
}
function updateChatVisiblityById(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var error_28;
        var chatId = _b.chatId, visibility = _b.visibility;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db
                            .update(schema_2.chat)
                            .set({ visibility: visibility })
                            .where((0, drizzle_orm_1.eq)(schema_2.chat.id, chatId))];
                case 1: return [2 /*return*/, _c.sent()];
                case 2:
                    error_28 = _c.sent();
                    console.error('Failed to update chat visibility:', error_28);
                    throw error_28;
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Connection-related queries
function sendConnectionRequest(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var result, error_29;
        var senderId = _b.senderId, receiverId = _b.receiverId, message = _b.message;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db.insert(schema_2.connection).values({
                            sender_id: senderId,
                            receiver_id: receiverId,
                            message: message,
                        }).returning()];
                case 1:
                    result = _c.sent();
                    return [2 /*return*/, result];
                case 2:
                    error_29 = _c.sent();
                    console.error('Failed to send connection request:', error_29);
                    throw error_29;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getConnectionRequests(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var error_30;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db
                            .select()
                            .from(schema_2.connection)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_2.connection.receiver_id, userId), (0, drizzle_orm_1.eq)(schema_2.connection.status, 'pending')))
                            .orderBy((0, drizzle_orm_1.desc)(schema_2.connection.created_at))];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_30 = _a.sent();
                    console.error('Failed to get connection requests:', error_30);
                    throw error_30;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function updateConnectionStatus(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var result, error_31;
        var connectionId = _b.connectionId, status = _b.status;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    console.log('Updating connection status in database:', { connectionId: connectionId, status: status });
                    return [4 /*yield*/, exports.db
                            .update(schema_2.connection)
                            .set({
                            status: status,
                            updated_at: new Date()
                        })
                            .where((0, drizzle_orm_1.eq)(schema_2.connection.id, connectionId))
                            .returning()];
                case 1:
                    result = _c.sent();
                    console.log('Connection status update result:', result);
                    return [2 /*return*/, result];
                case 2:
                    error_31 = _c.sent();
                    console.error('Failed to update connection status:', error_31);
                    throw error_31;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getConnections(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var allConnections, acceptedConnections, userConnections, result, error_32;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    console.log('=== GET CONNECTIONS DB DEBUG ===');
                    console.log('getConnections - User ID:', userId);
                    console.log('getConnections - User ID type:', typeof userId);
                    return [4 /*yield*/, exports.db.select().from(schema_2.connection)];
                case 1:
                    allConnections = _a.sent();
                    console.log('getConnections - All connections in DB:', allConnections);
                    console.log('getConnections - All connections count:', allConnections.length);
                    return [4 /*yield*/, exports.db
                            .select()
                            .from(schema_2.connection)
                            .where((0, drizzle_orm_1.eq)(schema_2.connection.status, 'accepted'))];
                case 2:
                    acceptedConnections = _a.sent();
                    console.log('getConnections - All accepted connections:', acceptedConnections);
                    console.log('getConnections - Accepted connections count:', acceptedConnections.length);
                    return [4 /*yield*/, exports.db
                            .select()
                            .from(schema_2.connection)
                            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_2.connection.sender_id, userId), (0, drizzle_orm_1.eq)(schema_2.connection.receiver_id, userId)))];
                case 3:
                    userConnections = _a.sent();
                    console.log('getConnections - All connections for this user:', userConnections);
                    console.log('getConnections - User connections count:', userConnections.length);
                    return [4 /*yield*/, exports.db
                            .select()
                            .from(schema_2.connection)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_2.connection.status, 'accepted'), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_2.connection.sender_id, userId), (0, drizzle_orm_1.eq)(schema_2.connection.receiver_id, userId))))];
                case 4:
                    result = _a.sent();
                    console.log('getConnections - Final query result:', result);
                    console.log('getConnections - Final result count:', result.length);
                    return [2 /*return*/, result];
                case 5:
                    error_32 = _a.sent();
                    console.error('Failed to get connections:', error_32);
                    throw error_32;
                case 6: return [2 /*return*/];
            }
        });
    });
}
function checkConnectionStatus(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var result, error_33;
        var senderId = _b.senderId, receiverId = _b.receiverId;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db
                            .select()
                            .from(schema_2.connection)
                            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_2.connection.sender_id, senderId), (0, drizzle_orm_1.eq)(schema_2.connection.receiver_id, receiverId)), (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_2.connection.sender_id, receiverId), (0, drizzle_orm_1.eq)(schema_2.connection.receiver_id, senderId))))];
                case 1:
                    result = (_c.sent())[0];
                    return [2 /*return*/, result];
                case 2:
                    error_33 = _c.sent();
                    console.error('Failed to check connection status:', error_33);
                    throw error_33;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getConnectionById(connectionId) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_34;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db
                            .select()
                            .from(schema_2.connection)
                            .where((0, drizzle_orm_1.eq)(schema_2.connection.id, connectionId))];
                case 1:
                    result = (_a.sent())[0];
                    return [2 /*return*/, result];
                case 2:
                    error_34 = _a.sent();
                    console.error('Failed to get connection by ID:', error_34);
                    throw error_34;
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Notification-related queries
function createNotification(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var error_35;
        var userId = _b.userId, type = _b.type, title = _b.title, message = _b.message, relatedUserId = _b.relatedUserId, relatedConnectionId = _b.relatedConnectionId;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db.insert(schema_2.notification).values({
                            user_id: userId,
                            type: type,
                            title: title,
                            message: message,
                            related_user_id: relatedUserId,
                            related_connection_id: relatedConnectionId,
                        })];
                case 1: return [2 /*return*/, _c.sent()];
                case 2:
                    error_35 = _c.sent();
                    console.error('Failed to create notification:', error_35);
                    throw error_35;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getNotifications(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var error_36;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db
                            .select()
                            .from(schema_2.notification)
                            .where((0, drizzle_orm_1.eq)(schema_2.notification.user_id, userId))
                            .orderBy((0, drizzle_orm_1.desc)(schema_2.notification.created_at))];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_36 = _a.sent();
                    console.error('Failed to get notifications:', error_36);
                    throw error_36;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function markNotificationAsRead(notificationId) {
    return __awaiter(this, void 0, void 0, function () {
        var error_37;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db
                            .update(schema_2.notification)
                            .set({ is_read: true })
                            .where((0, drizzle_orm_1.eq)(schema_2.notification.id, notificationId))];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_37 = _a.sent();
                    console.error('Failed to mark notification as read:', error_37);
                    throw error_37;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getUnreadNotificationCount(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_38;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exports.db
                            .select({ count: (0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["count(*)"], ["count(*)"]))) })
                            .from(schema_2.notification)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_2.notification.user_id, userId), (0, drizzle_orm_1.eq)(schema_2.notification.is_read, false)))];
                case 1:
                    result = (_a.sent())[0];
                    return [2 /*return*/, Number(result === null || result === void 0 ? void 0 : result.count) || 0];
                case 2:
                    error_38 = _a.sent();
                    console.error('Failed to get unread notification count:', error_38);
                    throw error_38;
                case 3: return [2 /*return*/];
            }
        });
    });
}
var templateObject_1;
