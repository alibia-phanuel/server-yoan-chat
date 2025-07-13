"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = require("../middleware/upload");
const Whatsapp_API_1 = require("../controllers/Whatsapp_API");
const router = (0, express_1.Router)();
/**
 * Route pour envoyer un message texte sur WhatsApp
 */
router.post("/send-text", Whatsapp_API_1.sendTextMessages);
/**
 * Route pour envoyer un message Media sur WhatsApp
 */
router.post("/send-template", Whatsapp_API_1.sendTemplateWhatsAppMessages);
/**
 * Route pour envoyer un message template sur WhatsApp
 */
router.post("/send-media", upload_1.upload.array("media", 10), Whatsapp_API_1.handleSendMediaMessage); // 📌 Nouvelle route pour envoyer un média
/**
 * Route pour Demarrer le Webhook
 */
router.get("/webhook", Whatsapp_API_1.webhook);
router.post("/webhook", Whatsapp_API_1.webhookPostback);
router.get("/messages", Whatsapp_API_1.getAllConversations);
router.get("/:participantOneId/:participantTwoId", Whatsapp_API_1.getMessagesForConversation);
exports.default = router;
