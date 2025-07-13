"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Charger les variables d'environnement
// Définir les variables avec valeurs par défaut pour XAMPP
const DB_NAME = process.env.DB_NAME || "chat_database";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "root"; // Vide pour XAMPP
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || "3306"; // Port MySQL par défaut pour XAMPP
const NODE_ENV = process.env.NODE_ENV || "development";
// Initialiser Sequelize
const sequelize = new sequelize_1.Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    dialect: "mysql",
    logging: false, // Désactiver les logs SQL
});
// Tester la connexion
sequelize
    .authenticate()
    .then(() => console.log("✅ Connexion à MySQL réussie !"))
    .catch((error) => console.error("❌ Erreur de connexion à MySQL :", error));
// Exporter l'instance Sequelize
exports.default = sequelize;
