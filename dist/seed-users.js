"use strict";
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
var queries_1 = require("./lib/db/queries");
var randomNames = [
    'Alice Smith', 'Bob Johnson', 'Charlie Lee', 'Diana Patel', 'Ethan Kim',
    'Fiona Chen', 'George Brown', 'Hannah Wilson', 'Ivan Garcia', 'Julia Rossi',
    'Kevin Wang', 'Laura Martinez', 'Mike Anderson', 'Nina Singh', 'Oscar Lopez',
    'Priya Gupta', 'Quentin Dubois', 'Rita Müller', 'Samir Ali', 'Tina Novak'
];
var industries = [
    'technology', 'finance', 'healthcare', 'education', 'marketing', 'consulting', 'real estate', 'media', 'logistics', 'tourism'
];
var strengths = [
    'leadership', 'communication', 'problem-solving', 'teamwork', 'creativity', 'adaptability', 'project management', 'data analysis', 'sales', 'networking'
];
var interests = [
    'startups', 'AI', 'blockchain', 'sustainability', 'fintech', 'travel', 'sports', 'music', 'reading', 'mentoring'
];
var goals = [
    'grow my network', 'find a mentor', 'explore new industries', 'build a startup', 'learn new skills', 'advance my career', 'find investment', 'collaborate on projects', 'share knowledge', 'discover opportunities'
];
function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function seed() {
    return __awaiter(this, void 0, void 0, function () {
        var i, name_1, email, password, linkedinInfo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < 15)) return [3 /*break*/, 4];
                    name_1 = randomNames[i % randomNames.length];
                    email = "user".concat(i + 2, "@example.com");
                    password = 'Password123!';
                    linkedinInfo = "".concat(name_1, " is a professional in ").concat(randomFrom(industries), " with strengths in ").concat(randomFrom(strengths), ". Interested in ").concat(randomFrom(interests), ".");
                    return [4 /*yield*/, (0, queries_1.createUser)({
                            name: name_1,
                            email: email,
                            password: password,
                            linkedinInfo: linkedinInfo,
                            goals: randomFrom(goals),
                            strengths: randomFrom(strengths),
                            interests: randomFrom(interests),
                        })];
                case 2:
                    _a.sent();
                    console.log("Seeded user: ".concat(name_1, " (").concat(email, ")"));
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    });
}
seed().catch(function (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
});
