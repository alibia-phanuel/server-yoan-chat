"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db")); // Assure-toi d'avoir une config Sequelize
class User extends sequelize_1.Model {
}
User.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    uuid: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
    },
    name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    email: { type: sequelize_1.DataTypes.STRING, allowNull: false, unique: true },
    password: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    role: { type: sequelize_1.DataTypes.ENUM("admin", "employee"), allowNull: false },
    createdBy: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
    },
    profilePicture: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true, // Facultatif, car un utilisateur peut ne pas avoir de photo
    },
}, { sequelize: db_1.default, tableName: "users" });
exports.default = User;
