"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Conversation extends sequelize_1.Model {
}
Conversation.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    participantOneId: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    participantTwoId: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    lastMessage: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    lastMessageTimestamp: { type: sequelize_1.DataTypes.DATE, defaultValue: sequelize_1.DataTypes.NOW },
}, {
    sequelize: db_1.default,
    modelName: "Conversation",
    tableName: "Conversations",
    timestamps: false,
});
exports.default = Conversation;
