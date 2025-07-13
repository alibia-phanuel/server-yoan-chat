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
exports.getMessagesForConversation = exports.getAllConversations = exports.webhookPostback = exports.webhook = exports.handleSendMediaMessage = exports.sendTextMessages = exports.sendTemplateWhatsAppMessages = void 0;
const downloadImageFromWhatsapp_1 = require("../middleware/downloadImageFromWhatsapp");
const dotenv_1 = __importDefault(require("dotenv"));
const baseImageUrl = "https://3ee6-154-126-169-74.ngrok-free.app";
// Charger les variables d'environnement
dotenv_1.default.config();
const whatsappService_1 = require("../services/whatsappService");
const Sms_1 = __importDefault(require("../models/Sms"));
const Conversation_1 = __importDefault(require("../models/Conversation"));
require("../models/associations"); // Importez les associations après les modèles
const sequelize_1 = require("sequelize");
const FAQ_1 = __importDefault(require("../models/FAQ"));
const handleIncomingProductMessage_1 = require("../services/handleIncomingProductMessage");
const WEBHOOK_VERIFY_TOKEN = "my-verify-token";
/**
 * Envoie un message template WhatsApp
 */
const sendTemplateWhatsAppMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { to, templateName } = req.body;
    if (!to || !templateName) {
        res
            .status(400)
            .json({ error: "Le numéro et le nom du template sont requis !" });
        return;
    }
    try {
        const response = yield (0, whatsappService_1.sendTemplateWhatsAppMessage)(to, templateName);
        res.status(200).json({ success: true, data: response });
    }
    catch (error) {
        res.status(500).json({ error: "Échec de l'envoi du message template." });
    }
});
exports.sendTemplateWhatsAppMessages = sendTemplateWhatsAppMessages;
/**
 * Envoie un message texte WhatsApp
 */
const sendTextMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { to, message, conversationId, senderId, whatsappNumber } = req.body;
    // Vérification des données reçues
    if (!to || !message || !conversationId || !senderId || !whatsappNumber) {
        res.status(400).json({ error: "Toutes les données sont nécessaires." });
        return;
    }
    try {
        // 1. Enregistrement du message dans la base de données
        const newMessage = yield Sms_1.default.create({
            senderId,
            messageType: "text",
            content: message,
            conversationId,
            whatsappNumber,
            isRead: false, // à ajuster selon la logique
            timestamp: new Date(),
        });
        // 2. Envoi du message via l'API WhatsApp
        const response = yield (0, whatsappService_1.sendTextMessage)(to, message);
        // 3. Mise à jour de la conversation avec le dernier message
        yield Conversation_1.default.update({
            lastMessage: message,
            lastMessageTimestamp: new Date(),
        }, {
            where: { id: conversationId },
        });
        res.status(200).json({
            success: true,
            data: response,
            savedMessage: newMessage,
        });
    }
    catch (error) {
        console.error("Erreur d'envoi ou de sauvegarde du message :", error);
        res.status(500).json({ error: "Échec de l'envoi ou de la sauvegarde." });
    }
});
exports.sendTextMessages = sendTextMessages;
/**
 * Envoie un message média via WhatsApp
 */
const handleSendMediaMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { caption, senderId, whatsappNumber, conversationId } = req.body;
    console.log(caption, senderId, whatsappNumber, conversationId);
    console.log("Données reçues :", {
        caption,
        senderId,
        whatsappNumber,
        conversationId,
    });
    const files = req.files;
    console.log("Fichiers reçus :", files.map((file) => ({
        originalname: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
    })));
    // Validation des champs requis
    if (!senderId || !whatsappNumber || !conversationId) {
        res.status(400).json({ error: "Champs obligatoires manquants" });
        return;
    }
    const responses = [];
    try {
        // Envoyer chaque image une par une via WhatsApp
        if (files === null || files === void 0 ? void 0 : files.length) {
            for (const file of files) {
                const imageUrl = encodeURI(`https://240e-2c0f-2a80-36-6710-40dd-591c-7f02-fc0f.ngrok-free.app/images/messages/${file.filename}`);
                // Ajouter caption uniquement si nécessaire
                const messageCaption = caption && files.length === 1 ? caption : null;
                // Envoyer via l'API WhatsApp Cloud
                yield (0, whatsappService_1.sendMediaMessage)(whatsappNumber, imageUrl, messageCaption);
                // Enregistrer dans la base
                const savedMessage = yield Sms_1.default.create({
                    senderId,
                    messageType: messageCaption ? "text+image" : "image",
                    content: messageCaption || null,
                    imagePath: imageUrl,
                    isRead: false,
                    conversationId,
                    whatsappNumber,
                });
                responses.push(savedMessage);
            }
        }
        // Si aucun fichier mais un message texte seul
        if (!(files === null || files === void 0 ? void 0 : files.length) && caption) {
            const textMessage = yield Sms_1.default.create({
                senderId,
                messageType: "text",
                content: caption,
                imagePath: null,
                isRead: false,
                conversationId,
                whatsappNumber,
            });
            responses.push(textMessage);
        }
        res.status(200).json({ success: true, messages: responses });
    }
    catch (error) {
        console.error("Erreur lors de l'envoi des médias :", error);
        res.status(500).json({ error: "Erreur lors de l'envoi." });
    }
});
exports.handleSendMediaMessage = handleSendMediaMessage;
/**
 *
 */
const webhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const mode = req.query["hub.mode"];
    const challenge = req.query["hub.challenge"];
    const token = req.query["hub.verify_token"];
    if (mode && token === WEBHOOK_VERIFY_TOKEN) {
        res.status(200).send(challenge);
    }
    else {
        res.sendStatus(403);
    }
});
exports.webhook = webhook;
const webhookPostback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const { entry } = req.body;
        if (!(entry === null || entry === void 0 ? void 0 : entry.length) || !((_a = entry[0].changes) === null || _a === void 0 ? void 0 : _a.length)) {
            res.status(400).send("Invalid Request");
            return;
        }
        const messages = (_b = entry[0].changes[0].value.messages) === null || _b === void 0 ? void 0 : _b[0];
        const whatsappNumber = process.env.WHATSAPP_NUMBER;
        if (!whatsappNumber) {
            console.error("❌ Numéro WhatsApp non défini dans le fichier .env !");
            res.sendStatus(500);
            return;
        }
        if (messages) {
            const senderId = messages.from;
            const messageType = messages.type;
            let content = "";
            let imagePath = "";
            if (messageType === "text") {
                content = ((_c = messages.text) === null || _c === void 0 ? void 0 : _c.body) || "";
            }
            else if (messageType === "image") {
                const mediaId = (_d = messages.image) === null || _d === void 0 ? void 0 : _d.id;
                if (mediaId) {
                    try {
                        imagePath = yield (0, downloadImageFromWhatsapp_1.downloadImageFromWhatsapp)(mediaId);
                    }
                    catch (err) {
                        console.error("❌ Erreur lors du téléchargement de l'image :", err);
                    }
                }
                content = ((_e = messages.image) === null || _e === void 0 ? void 0 : _e.caption) || "";
            }
            // 🔥 Intégration de la détection des liens Facebook
            if (messageType === "text" && content.includes("fb.me")) {
                yield (0, handleIncomingProductMessage_1.handleIncomingProductMessage)(content, senderId);
            }
            // === Conversation ===
            let conversation = yield Conversation_1.default.findOne({
                where: {
                    participantOneId: senderId,
                    participantTwoId: whatsappNumber,
                },
            });
            if (!conversation) {
                conversation = yield Conversation_1.default.create({
                    participantOneId: senderId,
                    participantTwoId: whatsappNumber,
                    lastMessage: content,
                    lastMessageTimestamp: new Date(),
                });
            }
            yield Sms_1.default.create({
                senderId,
                whatsappNumber,
                messageType,
                content,
                imagePath,
                isRead: false,
                timestamp: new Date(),
                conversationId: conversation.id,
            });
            yield conversation.update({
                lastMessage: content,
                lastMessageTimestamp: new Date(),
            });
            // === AUTOMATIC RESPONSE SYSTEM ===
            if (messageType === "text" && content) {
                const lowerContent = content.toLowerCase();
                let foundAutoResponse = false;
                // 🔹 FAQ
                const faqs = yield FAQ_1.default.findAll();
                for (const faq of faqs) {
                    const question = faq.getDataValue("question").toLowerCase();
                    if (lowerContent.includes(question)) {
                        const answer = faq.getDataValue("answer");
                        yield (0, whatsappService_1.sendTextMessage)(senderId, answer);
                        yield Sms_1.default.create({
                            senderId: whatsappNumber,
                            whatsappNumber,
                            messageType: "text",
                            content: answer,
                            imagePath: "",
                            isRead: true,
                            timestamp: new Date(),
                            conversationId: conversation.id,
                        });
                        yield conversation.update({
                            lastMessage: answer,
                            lastMessageTimestamp: new Date(),
                        });
                        foundAutoResponse = true;
                        break;
                    }
                }
                // 🔹 Mots-clés simples
                if (!foundAutoResponse) {
                    const keywordResponses = [
                        {
                            keyword: "prix",
                            response: "Pour connaître les prix, veuillez consulter notre catalogue ou préciser le produit souhaité.",
                        },
                        {
                            keyword: "commande",
                            response: "Pour passer une commande, envoyez le nom du produit et la quantité.",
                        },
                        {
                            keyword: "livraison",
                            response: "Nos délais de livraison varient entre 24h et 48h.",
                        },
                    ];
                    for (const item of keywordResponses) {
                        if (lowerContent.includes(item.keyword)) {
                            yield (0, whatsappService_1.sendTextMessage)(senderId, item.response);
                            yield Sms_1.default.create({
                                senderId: whatsappNumber,
                                whatsappNumber,
                                messageType: "text",
                                content: item.response,
                                imagePath: "",
                                isRead: true,
                                timestamp: new Date(),
                                conversationId: conversation.id,
                            });
                            yield conversation.update({
                                lastMessage: item.response,
                                lastMessageTimestamp: new Date(),
                            });
                            foundAutoResponse = true;
                            break;
                        }
                    }
                }
                // 🔹 Fallback
                if (!foundAutoResponse) {
                    console.log("💬 Aucun message automatique trouvé. Réponse humaine nécessaire.");
                }
            }
            console.log(`\n✅ MESSAGE REÇU :
📩 ID Message: ${messages.id}
👤 From: ${senderId}
💬 Type: ${messageType}
📝 Contenu: ${content}
🖼️ Image: ${imagePath || "Aucune"}
📌 Conversation ID: ${conversation.id}
      `);
        }
        res.status(200).send("EVENT_RECEIVED");
    }
    catch (error) {
        console.error("❌ Erreur dans le webhook:", error);
        res.status(500).send("Internal Server Error");
    }
});
exports.webhookPostback = webhookPostback;
const getAllConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conversations = yield Conversation_1.default.findAll({
            order: [["lastMessageTimestamp", "DESC"]],
            include: [
                {
                    model: Sms_1.default,
                    attributes: ["content", "messageType", "timestamp"],
                    limit: 1,
                    order: [["timestamp", "DESC"]],
                },
            ],
        });
        res.status(200).json(conversations);
        return;
    }
    catch (error) {
        console.error("❌ Erreur lors de la récupération des conversations :", error);
        res.status(500).json({ error: "Erreur serveur." });
        return;
    }
});
exports.getAllConversations = getAllConversations;
const getMessagesForConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { participantOneId, participantTwoId } = req.params;
    try {
        const conversation = yield Conversation_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    {
                        participantOneId,
                        participantTwoId,
                    },
                    {
                        participantOneId: participantTwoId,
                        participantTwoId: participantOneId,
                    },
                ],
            },
        });
        if (!conversation) {
            res.status(404).json({ message: "❌ Conversation non trouvée." });
            return;
        }
        const messages = yield Sms_1.default.findAll({
            where: { conversationId: conversation.id },
            order: [["timestamp", "ASC"]],
        });
        res.status(200).json(messages);
        return;
    }
    catch (err) {
        console.error("Erreur route messages:", err);
        res.status(500).json({ message: "Erreur serveur" });
        return;
    }
});
exports.getMessagesForConversation = getMessagesForConversation;
