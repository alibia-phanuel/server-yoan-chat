import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import Conversation from "./Conversation";

class Message extends Model {
  public id!: number;
  public senderId!: string;
  public messageType!: "text" | "image" | "text+image";
  public content!: string | null;
  public imagePath?: string | null;
  public isRead!: boolean;
  public timestamp!: Date;
  public conversationId!: number;
  public whatsappNumber!: string;
}

Message.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    senderId: { type: DataTypes.STRING, allowNull: false },
    messageType: {
      type: DataTypes.ENUM("text", "image", "text+image"),
      allowNull: false,
    },
    content: { type: DataTypes.TEXT, allowNull: true },
    imagePath: { type: DataTypes.STRING, allowNull: true },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    conversationId: { type: DataTypes.INTEGER, allowNull: false },
    whatsappNumber: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    modelName: "Message",
    tableName: "Messages",
    timestamps: false,
  }
);

// Association
Message.belongsTo(Conversation, { foreignKey: "conversationId" });
Conversation.hasMany(Message, {
  foreignKey: "conversationId",
  onDelete: "CASCADE",
});

export default Message;
