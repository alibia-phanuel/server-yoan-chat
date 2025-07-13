import { Request, Response } from "express";
import { Multer } from "multer";
import dotenv from "dotenv";
import { io } from "../";
dotenv.config();
import { downloadImageFromWhatsapp } from "../middleware/downloadImageFromWhatsapp";
interface MulterRequest extends Request {
  files:
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined; // Le type de 'files' peut être un tableau ou un objet
}
const baseImageUrl2 = "https://2bc4-143-105-152-187.ngrok-free.app";
const baseImageUrl = process.env.REACT_APP_BASE_URL;
// Charger les variables d'environnement
dotenv.config();
import {
  sendTemplateWhatsAppMessage,
  sendTextMessage,
  sendMediaMessage,
} from "../services/whatsappService";
import Message from "../models/Sms";
import Conversation from "../models/Conversation";
import "../models/associations"; // Importez les associations après les modèles
import { Op } from "sequelize";
import FAQ from "../models/FAQ";
import { handleIncomingProductMessage } from "../services/handleIncomingProductMessage";
import Product from "../models/Product";
import ImageProduct from "../models/ImageProduct";

const WEBHOOK_VERIFY_TOKEN = "my-verify-token";

/**
 * Envoie un message template WhatsApp
 */
export const sendTemplateWhatsAppMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { to, templateName } = req.body;

  if (!to || !templateName) {
    res
      .status(400)
      .json({ error: "Le numéro et le nom du template sont requis !" });
    return;
  }

  try {
    const response = await sendTemplateWhatsAppMessage(to, templateName);
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ error: "Échec de l'envoi du message template." });
  }
};

/**
 * Envoie un message texte WhatsApp
 */
export const sendTextMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { to, message, conversationId, senderId, whatsappNumber } = req.body;

  // Vérification des données reçues
  if (!to || !message || !conversationId || !senderId || !whatsappNumber) {
    res.status(400).json({ error: "Toutes les données sont nécessaires." });
    return;
  }

  try {
    // 1. Enregistrement du message dans la base de données
    const newMessage = await Message.create({
      senderId,
      messageType: "text",
      content: message,
      conversationId,
      whatsappNumber,
      isRead: false, // à ajuster selon la logique
      timestamp: new Date(),
    });

    // 2. Envoi du message via l'API WhatsApp
    const response = await sendTextMessage(to, message);

    // 3. Mise à jour de la conversation avec le dernier message
    await Conversation.update(
      {
        lastMessage: message,
        lastMessageTimestamp: new Date(),
      },
      {
        where: { id: conversationId },
      }
    );

    res.status(200).json({
      success: true,
      data: response,
      savedMessage: newMessage,
    });

    io.emit("newMessage", newMessage);
  } catch (error) {
    console.error("Erreur d'envoi ou de sauvegarde du message :", error);

    res.status(500).json({ error: "Échec de l'envoi ou de la sauvegarde." });
  }
};
/**
 * Envoie un message média via WhatsApp
 */

export const handleSendMediaMessage = async (
  req: MulterRequest,
  res: Response
): Promise<void> => {
  const { caption, senderId, whatsappNumber, conversationId } = req.body;
  console.log(caption, senderId, whatsappNumber, conversationId);
  console.log("Données reçues :", {
    caption,
    senderId,
    whatsappNumber,
    conversationId,
  });

  const files = req.files as Express.Multer.File[];

  console.log(
    "Fichiers reçus :",
    files.map((file) => ({
      originalname: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
    }))
  );

  // Validation des champs requis
  if (!senderId || !whatsappNumber || !conversationId) {
    res.status(400).json({ error: "Champs obligatoires manquants" });
    return;
  }

  const responses = [];

  try {
    // Envoyer chaque image une par une via WhatsApp
    if (files?.length) {
      for (const file of files) {
        const imageUrl = encodeURI(
          `${baseImageUrl}/images/messages/${file.filename}`
        );

        // Ajouter caption uniquement si nécessaire
        const messageCaption = caption && files.length === 1 ? caption : null;
        // Envoyer via l'API WhatsApp Cloud
        await sendMediaMessage(whatsappNumber, imageUrl, messageCaption);

        // Enregistrer dans la base
        const savedMessage = await Message.create({
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
      const io = req.app.get("io"); // 🔥 Important
      // Après :
      io.emit("newMessages", responses); // 🟢 Émission groupée
    }

    // Si aucun fichier mais un message texte seul
    if (!files?.length && caption) {
      const textMessage = await Message.create({
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
  } catch (error) {
    console.error("Erreur lors de l'envoi des médias :", error);
    res.status(500).json({ error: "Erreur lors de l'envoi." });
  }
};
/**
 *
 */

export const webhook = async (req: Request, res: Response): Promise<void> => {
  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const token = req.query["hub.verify_token"];
  if (mode && token === WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
};

export const webhookPostback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { entry } = req.body;

    if (!entry?.length || !entry[0].changes?.length) {
      res.status(400).send("Invalid Request");
      return;
    }

    const messages = entry[0].changes[0].value.messages?.[0];
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
        content = messages.text?.body || "";
      } else if (messageType === "image") {
        const mediaId = messages.image?.id;
        if (mediaId) {
          try {
            imagePath = await downloadImageFromWhatsapp(mediaId);
          } catch (err) {
            console.error("❌ Erreur lors du téléchargement de l'image :", err);
          }
        }
        content = messages.image?.caption || "";
      }

      if (messageType === "text" && content.includes("fb.me")) {
        await handleIncomingProductMessage(content, senderId);
      }

      let conversation = await Conversation.findOne({
        where: {
          participantOneId: senderId,
          participantTwoId: whatsappNumber,
        },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participantOneId: senderId,
          participantTwoId: whatsappNumber,
          lastMessage: content,
          lastMessageTimestamp: new Date(),
        });
      }

      await Message.create({
        senderId,
        whatsappNumber,
        messageType,
        content,
        imagePath,
        isRead: false,
        timestamp: new Date(),
        conversationId: conversation.id,
      });
      // 🆕 Emission socket.io en temps réel
      io.emit("new_message", {
        senderId,
        whatsappNumber,
        messageType,
        content,
        imagePath,
        timestamp: new Date(),
        conversationId: conversation.id,
      });
      await conversation.update({
        lastMessage: content,
        lastMessageTimestamp: new Date(),
      });

      if (messageType === "text" && content) {
        const lowerContent = content.toLowerCase();
        let foundAutoResponse = false;
        // 🔹 FAQ
        const faqs = await FAQ.findAll();
        for (const faq of faqs) {
          const question = faq.getDataValue("question").toLowerCase();
          if (lowerContent.includes(question)) {
            const answer = faq.getDataValue("answer");
            await sendTextMessage(senderId, answer);
            // Ne pas créer de nouveau message dans la base de données pour la réponse automatique
            foundAutoResponse = true;
            break;
          }
        }
        // 🔹 Mots-clés simples
        if (!foundAutoResponse) {
          const keywordResponses = [
            {
              keyword: "prix",
              response:
                "Pour connaître les prix, veuillez consulter notre catalogue ou préciser le produit souhaité.",
            },
            {
              keyword: "commande",
              response:
                "Pour passer une commande, envoyez le nom du produit et la quantité.",
            },
            {
              keyword: "livraison",
              response: "Nos délais de livraison varient entre 24h et 48h.",
            },
          ];
          for (const item of keywordResponses) {
            if (lowerContent.includes(item.keyword)) {
              await sendTextMessage(senderId, item.response);
              // Ne pas créer de nouveau message dans la base de données pour la réponse automatique
              foundAutoResponse = true;
              break;
            }
          }
        }
        // 🔹 Fallback
        if (!foundAutoResponse) {
          console.log(
            "💬 Aucun message automatique trouvé. Réponse humaine nécessaire."
          );
        }
      }

      console.log(`\n✅ MESSAGE REÇU :
📩 ID Message: ${messages.id}
👤 From: ${senderId}
💬 Type: ${messageType}
📝 Contenu: ${content}
🖼️ Image: ${imagePath || "Aucune"}
📌 Conversation ID: ${conversation.id}`);
    }

    res.status(200).send("EVENT_RECEIVED");
  } catch (error) {
    console.error("❌ Erreur dans le webhook:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const getAllConversations = async (req: Request, res: Response) => {
  try {
    const conversations = await Conversation.findAll({
      order: [["lastMessageTimestamp", "DESC"]],
      include: [
        {
          model: Message,
          attributes: ["content", "messageType", "timestamp"],
          limit: 1,
          order: [["timestamp", "DESC"]],
        },
      ],
    });

    res.status(200).json(conversations);
    return;
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération des conversations :",
      error
    );
    res.status(500).json({ error: "Erreur serveur." });
    return;
  }
};

export const getMessagesForConversation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { participantOneId, participantTwoId } = req.params;

  try {
    const conversation = await Conversation.findOne({
      where: {
        [Op.or]: [
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

    const messages = await Message.findAll({
      where: { conversationId: conversation.id },
      order: [["timestamp", "ASC"]],
    });

    res.status(200).json(messages);
    return;
  } catch (err) {
    console.error("Erreur route messages:", err);
    res.status(500).json({ message: "Erreur serveur" });
    return;
  }
};
