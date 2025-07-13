"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadImageFromWhatsapp = void 0;
const axios_1 = __importDefault(require("axios"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid"); // ✅ Importation correcte
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const downloadImageFromWhatsapp = (mediaId) => __awaiter(void 0, void 0, void 0, function* () {
    const token = process.env.ACCESS_TOKEN;
    if (!token) {
        throw new Error("❌ Le token WhatsApp est undefined !");
    }
    try {
        // Étape 1 : Obtenir l'URL du fichier
        const mediaRes = yield axios_1.default.get(`https://graph.facebook.com/v22.0/${mediaId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const mediaUrl = mediaRes.data.url;
        // Étape 2 : Télécharger l’image
        const imageRes = yield axios_1.default.get(mediaUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            responseType: "arraybuffer",
        });
        // Étape 3 : Sauvegarder localement
        const fileName = `${(0, uuid_1.v4)()}.jpg`;
        const imagePath = path_1.default.join("public/images/messages", fileName);
        fs_1.default.writeFileSync(imagePath, imageRes.data);
        return `/images/messages/${fileName}`;
    }
    catch (error) {
        console.error("❌ Erreur lors du téléchargement de l'image :", error.message);
        throw error;
    }
});
exports.downloadImageFromWhatsapp = downloadImageFromWhatsapp;
