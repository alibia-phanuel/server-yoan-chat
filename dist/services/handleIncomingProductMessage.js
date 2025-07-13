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
exports.handleIncomingProductMessage = void 0;
const processFacebookLink_1 = __importDefault(require("./processFacebookLink"));
const whatsappService_1 = require("./whatsappService");
const Product_1 = __importDefault(require("../models/Product"));
const ImageProduct_1 = __importDefault(require("../models/ImageProduct"));
const getProductIdFromPages_1 = __importDefault(require("./getProductIdFromPages"));
const Sms_1 = __importDefault(require("../models/Sms"));
const Conversation_1 = __importDefault(require("../models/Conversation"));
// Base URL pour accéder aux images via ngrok
const baseImageUrl = "https://3ee6-154-126-169-74.ngrok-free.app";
const baseImageUrl2 = "https://3ee6-154-126-169-74.ngrok-free.app";
const handleIncomingProductMessage = (message, senderPhone) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const result = yield (0, processFacebookLink_1.default)(message);
        if (!result) {
            yield (0, whatsappService_1.sendTextMessage)(senderPhone, "Désolé, je n'ai pas pu traiter ce lien.");
            return;
        }
        const { formattedId } = result;
        const productId = yield (0, getProductIdFromPages_1.default)(formattedId);
        if (productId) {
            console.log("ID du produit :", productId);
        }
        else {
            console.log("Produit introuvable sur les deux pages.");
        }
        // Recherche du produit en base de données par le champ keyword
        const product = yield Product_1.default.findOne({
            where: { keyword: productId || "" },
            include: [{ model: ImageProduct_1.default, as: "images" }],
        });
        if (!product) {
            yield (0, whatsappService_1.sendTextMessage)(senderPhone, "Produit introuvable pour ce lien.");
            return;
        }
        // console.log(typeof imagePath, imagePath);
        // const imageUrl = imagePath ? `${baseImageUrl}${imagePath}` : null;
        const linkOnWa = ` ${baseImageUrl}${(_c = (_b = (_a = product.images) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.dataValues) === null || _c === void 0 ? void 0 : _c.imageUrl}`; // Exemple : "/uploads/images/nomImage.jpg"}
        const deliveryFee = product.deliveryFee || "Non spécifié";
        const extraQuestion = product.extraQuestion || "";
        // Petite fonction de pause
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        // 1. Envoyer l'image du produit avec les frais de livraison
        if (linkOnWa) {
            console.log("LINK TO SEN IMAGE ON WA:", linkOnWa);
            yield (0, whatsappService_1.sendMediaMessage)(senderPhone, linkOnWa, `Frais de livraison : ${deliveryFee}`);
            // Enregistrer dans la base
            yield Sms_1.default.create({
                senderId: "+15551443267",
                messageType: "text+image",
                content: `Frais de livraison : ${deliveryFee} FCFA` || null,
                imagePath: `${baseImageUrl2}${(_f = (_e = (_d = product.images) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.dataValues) === null || _f === void 0 ? void 0 : _f.imageUrl}`,
                isRead: false,
                conversationId: 1,
                whatsappNumber: senderPhone,
            });
            // ⏳ Attendre 500ms avant d'envoyer le prochain message
            yield sleep(1000);
        }
        // 2. Envoyer la question supplémentaire
        if (extraQuestion) {
            yield sleep(1000);
            yield (0, whatsappService_1.sendTextMessage)(senderPhone, extraQuestion);
            // Enregistrer dans la base
            yield sleep(1000);
            yield Sms_1.default.create({
                senderId: "+15551443267",
                messageType: "text",
                content: extraQuestion || null,
                imagePath: "",
                isRead: false,
                conversationId: 1,
                whatsappNumber: senderPhone,
            });
            yield Conversation_1.default.update({
                lastMessage: extraQuestion,
                lastMessageTimestamp: new Date(),
            }, {
                where: { id: 1 },
            });
        }
    }
    catch (error) {
        console.error("Erreur lors du traitement du message :", error.message);
        yield (0, whatsappService_1.sendTextMessage)(senderPhone, "Une erreur est survenue. Veuillez réessayer.");
    }
});
exports.handleIncomingProductMessage = handleIncomingProductMessage;
