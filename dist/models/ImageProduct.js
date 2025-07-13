"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const Product_1 = __importDefault(require("./Product"));
// Modèle ImageProduct avec Sequelize + TypeScript
class ImageProduct extends sequelize_1.Model {
}
ImageProduct.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    productId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "products", key: "id" },
        onDelete: "CASCADE",
    },
    imageUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, { sequelize: db_1.default, tableName: "image_products" });
// Définition des relations
ImageProduct.belongsTo(Product_1.default, { foreignKey: "productId", as: "product" });
Product_1.default.hasMany(ImageProduct, { foreignKey: "productId", as: "images" });
exports.default = ImageProduct;
