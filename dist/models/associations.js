"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = exports.Conversation = void 0;
const Conversation_1 = __importDefault(require("./Conversation"));
exports.Conversation = Conversation_1.default;
const Sms_1 = __importDefault(require("./Sms"));
exports.Message = Sms_1.default;
// Relations
Sms_1.default.belongsTo(Conversation_1.default, {
    foreignKey: "conversationId",
    as: "conversation",
});
Conversation_1.default.hasMany(Sms_1.default, {
    foreignKey: "conversationId",
    as: "messages",
    onDelete: "CASCADE",
});
