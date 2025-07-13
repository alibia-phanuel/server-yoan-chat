// import { RequestHandler, Router } from "express";
// import { upload } from "../middleware/upload";
// import {
//   sendTemplateWhatsAppMessages,
//   sendTextMessages,
//   handleSendMediaMessage,
//   webhook,
//   webhookPostback,
//   getAllConversations,
//   getMessagesForConversation,
// } from "../controllers/Whatsapp_API";
// const router = Router();

// /**
//  * Route pour envoyer un message Media sur WhatsApp
//  */
// router.post("/send-template", sendTemplateWhatsAppMessages);
// /**
//  * Route pour envoyer un message template sur WhatsApp
//  */
// router.post(
//   "/send-media",
//   upload.array("media", 10),
//   handleSendMediaMessage as unknown as RequestHandler
// ); // 📌 Nouvelle route pour envoyer un média
// /**
//  * Route pour Demarrer le Webhook
//  */
// /**
//  * Route pour envoyer un message texte sur WhatsApp
//  */
// router.post("/send-text", sendTextMessages);
// router.get("/webhook", webhook);
// router.post("/webhook", webhookPostback);
// router.get("/messages", getAllConversations);
// router.get("/:participantOneId/:participantTwoId", getMessagesForConversation);
// export default router;
