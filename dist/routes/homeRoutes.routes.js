"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const homeController_1 = require("../controllers/homeController");
const router = express_1.default.Router();
// Route pour afficher la page d'accueil
router.get("/", homeController_1.getHomePage);
exports.default = router;
