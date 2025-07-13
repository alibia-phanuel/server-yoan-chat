import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class Conversation extends Model {
  public id!: number;
  public participantOneId!: string; // WhatsApp client
  public participantTwoId!: string; // Agent
  public lastMessage?: string;
  public lastMessageTimestamp!: Date;
}

Conversation.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    participantOneId: { type: DataTypes.STRING, allowNull: false },
    participantTwoId: { type: DataTypes.STRING, allowNull: false },
    lastMessage: { type: DataTypes.TEXT, allowNull: true },
    lastMessageTimestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: "Conversation",
    tableName: "Conversations",
    timestamps: false,
  }
);

export default Conversation;
