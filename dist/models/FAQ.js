"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const User_1 = __importDefault(require("./User")); // Import du modèle User pour la relation
class FAQ extends sequelize_1.Model {
}
FAQ.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    question: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    answer: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    createdBy: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
    },
}, { sequelize: db_1.default, tableName: "faqs" });
// Relation : Une FAQ est ajoutée par un user (admin/employé)
FAQ.belongsTo(User_1.default, { foreignKey: "createdBy", as: "creator" });
exports.default = FAQ;
