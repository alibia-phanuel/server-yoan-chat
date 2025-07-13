"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const User_1 = __importDefault(require("./User"));
// Modèle Product avec Sequelize + TypeScript
class Product extends sequelize_1.Model {
}
Product.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    uuid: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    keyword: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    price: { type: sequelize_1.DataTypes.FLOAT, allowNull: false },
    deliveryFee: { type: sequelize_1.DataTypes.FLOAT, allowNull: false },
    extraQuestion: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    createdBy: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
    },
}, {
    sequelize: db_1.default,
    tableName: "products",
});
Product.belongsTo(User_1.default, { foreignKey: "createdBy", as: "creator" });
exports.default = Product;
