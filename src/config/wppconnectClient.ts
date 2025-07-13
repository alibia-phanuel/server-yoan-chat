import * as wppconnect from "@wppconnect-team/wppconnect";
import { NewProduct, ProductElement } from "../models";
import { io } from "../index";
import { Op } from "sequelize";
import FAQ from "../models/FAQ";
import { handleIncomingProductMessage } from "./utils/handleIncomingProductMessage";

const baseUrl = "https://chat-boot-92e040193633.herokuapp.com";
let clientInstance: any;
let isInitializing = false;

// Fonction simple de similarité (inclusion partielle)
const isSimilar = (source: string, target: string): boolean => {
  const normalizedSource = source.toLowerCase();
  const normalizedTarget = target.toLowerCase();
  return (
    normalizedSource.includes(normalizedTarget) ||
    normalizedTarget.includes(normalizedSource)
  );
};

const humanSleep = async () => {
  const delay = Math.floor(Math.random() * 2500) + 1500;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export const initializeWppClient = async () => {
  if (clientInstance) {
    console.log("✅ Client WhatsApp déjà initialisé");
    return clientInstance;
  }

  if (isInitializing) {
    console.log("⏳ Initialisation déjà en cours...");
    return null;
  }

  try {
    isInitializing = true;
    console.log("🔄 Démarrage de l'initialisation du client WhatsApp...");

    const create =
      (wppconnect as any).create ?? (wppconnect as any).default?.create;

    clientInstance = await create({
      session: "default",
      catchQR: (base64Qr: string) => {
        console.log("QR Code reçu, envoi via Socket.IO...");
        const cleanBase64 = base64Qr.replace("data:image/png;base64,", "");
        io.emit("qrCode", cleanBase64);
      },
      statusFind: (statusSession: string) => {
        console.log("Status Session: ", statusSession);
        io.emit("status", statusSession);
      },
      headless: true,
      devtools: false,
      useChrome: true,
      debug: false,
      logQR: true,
      browserWS: "",
      browserArgs: ["--no-sandbox"],
      puppeteerOptions: {
        args: ["--no-sandbox"],
      },
    });

    console.log("✅ WPPConnect client prêt.");
    isInitializing = false;

    clientInstance.onStateChange((state: string) => {
      console.log("📱 État du client WhatsApp:", state);
      if (state === "DISCONNECTED") {
        console.log("🔄 Tentative de reconnexion...");
        setTimeout(() => {
          initializeWppClient().catch(console.error);
        }, 5000);
      }
    });
    clientInstance.onMessage(async (message: any) => {
      console.log("📩 Nouveau message reçu :", message.from, message.body);
      if (!message.body || typeof message.body !== "string") {
        console.log("📭 Message sans texte, ignoré.");
        return;
      }

      const lowerContent = message.body.toLowerCase();
      const senderId = message.from;

      try {
        let foundAutoResponse = false;

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
          {
            keyword: "catalogue",
            response:
              "Voici le lien vers notre catalogue complet : https://chat-boot-92e040193633.herokuapp.com",
          },
          {
            keyword: "retour",
            response:
              "Vous pouvez retourner un produit sous 14 jours, selon notre politique de retour.",
          },
          {
            keyword: "paiement",
            response:
              "Nous acceptons les paiements par carte bancaire, PayPal, et virement bancaire.",
          },
        ];

        for (const item of keywordResponses) {
          if (lowerContent.includes(item.keyword)) {
            await humanSleep();
            await clientInstance.reply(senderId, item.response, message.id);
            console.log("🤖 Réponse statique envoyée !");
            foundAutoResponse = true;
            break;
          }
        }

        if (foundAutoResponse) return;

        const faq = await FAQ.findOne({ where: { question: lowerContent } });
        if (faq) {
          await humanSleep();
          await clientInstance.reply(senderId, faq.answer, message.id);
          console.log("🤖 Réponse FAQ envoyée !");
          return;
        }

        if (message.body.includes("fb.me")) {
          await handleIncomingProductMessage(
            message.body,
            senderId,
            clientInstance
          );
          console.log("📎 Lien Facebook traité.");
          return;
        }
        console.log(NewProduct);
        const allProducts = await NewProduct.findAll({
          attributes: ["keyword"],
        });
        let matchedProductId: string | null = null;

        for (const product of allProducts) {
          if (product.keyword && isSimilar(lowerContent, product.keyword)) {
            matchedProductId = product.keyword;
            break;
          }
        }

        if (!matchedProductId) return;

        const product = await NewProduct.findOne({
          where: { id: matchedProductId },
          include: [{ model: ProductElement, as: "elements" }],
        });

        if (!product || !product.elements || product.elements.length === 0) {
          await clientInstance.reply(
            senderId,
            "❌ Produit introuvable ou vide.",
            message.id
          );
          return;
        }

        const sortedElements = product.elements.sort(
          (a: any, b: any) => a.order - b.order
        );

        for (const element of sortedElements) {
          await humanSleep();
          if (element.type === "text") {
            await clientInstance.reply(
              senderId,
              element.content || "",
              message.id
            );
          } else if (element.type === "image" && element.imageUrl) {
            const fullImageUrl = element.imageUrl.startsWith("/")
              ? `${baseUrl}${element.imageUrl}`
              : `${baseUrl}/${element.imageUrl}`;

            await clientInstance.sendImage(
              senderId,
              fullImageUrl,
              "image.jpg",
              element.caption || ""
            );
          }
        }
      } catch (err) {
        console.error("❌ Erreur lors du traitement automatique :", err);
      }
    });

    return clientInstance;
  } catch (error) {
    console.error("❌ Erreur d'initialisation du client WPPConnect :", error);
    isInitializing = false;
    throw error;
  }
};

// Fonction pour réinitialiser le client
export const resetWppClient = async () => {
  if (clientInstance) {
    try {
      await clientInstance.close();
      clientInstance = null;
      console.log("✅ Client WhatsApp fermé");
    } catch (error) {
      console.error("❌ Erreur lors de la fermeture du client :", error);
    }
  }
  return initializeWppClient();
};
