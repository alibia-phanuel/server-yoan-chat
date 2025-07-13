"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const Conversation_1 = __importDefault(require("./Conversation"));
class Message extends sequelize_1.Model {
}
Message.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    senderId: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    messageType: {
        type: sequelize_1.DataTypes.ENUM("text", "image", "text+image"),
        allowNull: false,
    },
    content: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    imagePath: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    isRead: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
    timestamp: { type: sequelize_1.DataTypes.DATE, defaultValue: sequelize_1.DataTypes.NOW },
    conversationId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    whatsappNumber: { type: sequelize_1.DataTypes.STRING, allowNull: false },
}, {
    sequelize: db_1.default,
    modelName: "Message",
    tableName: "Messages",
    timestamps: false,
});
// Association
Message.belongsTo(Conversation_1.default, { foreignKey: "conversationId" });
Conversation_1.default.hasMany(Message, {
    foreignKey: "conversationId",
    onDelete: "CASCADE",
});
exports.default = Message;
