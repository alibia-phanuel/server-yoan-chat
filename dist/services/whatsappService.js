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
exports.replyMessage = exports.sendMediaMessage = exports.sendTextMessage = exports.sendTemplateWhatsAppMessage = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const Token = process.env.ACCESS_TOKEN;
const idPhoneNumber = process.env.WHATSAPP_PHONE_ID;
const url = `https://graph.facebook.com/v22.0/${idPhoneNumber}/messages`;
/**
 * Envoie un message WhatsApp basé sur un template prédéfini.
 */
const sendTemplateWhatsAppMessage = (to, templateName) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!url || !Token || !to) {
        console.error("❌ Erreur : URL, Token ou numéro du destinataire manquant !");
        return;
    }
    try {
        const response = yield axios_1.default.post(url, {
            messaging_product: "whatsapp",
            to,
            type: "template",
            template: {
                name: templateName, // Ex: "hello_world"
                language: { code: "en_US" },
            },
        }, {
            headers: {
                Authorization: `Bearer ${Token}`,
                "Content-Type": "application/json",
            },
        });
        console.log("✅ Template message envoyé avec succès :", response.data);
        return response.data;
    }
    catch (error) {
        console.error("❌ Erreur lors de l'envoi du message :", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
    }
});
exports.sendTemplateWhatsAppMessage = sendTemplateWhatsAppMessage;
/**
 * Envoie un message texte simple via WhatsApp API.
 */
const sendTextMessage = (to, message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!url || !Token || !to) {
        console.error("❌ Erreur : URL, Token ou destinataire manquant !");
        return;
    }
    try {
        const response = yield axios_1.default.post(url, {
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: { body: message },
        }, {
            headers: {
                Authorization: `Bearer ${Token}`,
                "Content-Type": "application/json",
            },
        });
        console.log("✅ Message texte envoyé avec succès :", response.data);
        return response.data;
    }
    catch (error) {
        console.error("❌ Erreur lors de l'envoi du message :", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
    }
});
exports.sendTextMessage = sendTextMessage;
const sendMediaMessage = (to, link, caption) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const response = yield axios_1.default.post(url, {
            messaging_product: "whatsapp",
            to,
            type: "image",
            image: {
                link,
                caption: caption || "ceci est une images",
            },
        }, {
            headers: {
                Authorization: `Bearer ${Token}`,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    }
    catch (error) {
        console.error("Erreur lors de l'envoi du média:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        throw new Error("Échec de l'envoi du message média.");
    }
});
exports.sendMediaMessage = sendMediaMessage;
/**
 * Répond à un message WhatsApp en citant un message existant.
 */
const replyMessage = (to, body, messageId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const response = yield axios_1.default.post(url, {
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: { body },
            context: { message_id: messageId },
        }, {
            headers: {
                Authorization: `Bearer ${Token}`,
                "Content-Type": "application/json",
            },
        });
        console.log("✅ Réponse envoyée avec succès :", response.data);
        return response.data;
    }
    catch (error) {
        console.error("❌ Erreur lors de l'envoi de la réponse :", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
    }
});
exports.replyMessage = replyMessage;
