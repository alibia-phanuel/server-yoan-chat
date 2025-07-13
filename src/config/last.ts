import * as wppconnect from "@wppconnect-team/wppconnect";
import FAQ from "../models/FAQ";
import Product from "../models/Product";
import ImageProduct from "../models/ImageProduct";
import { handleIncomingProductMessage } from "./utils/handleIncomingProductMessage";

let clientInstance: any;
const baseImageUrl2 = "https://chat-boot-92e040193633.herokuapp.com";
export const initializeWppClient = async () => {
  if (clientInstance) return clientInstance;

  try {
    const create =
      (wppconnect as any).create ?? (wppconnect as any).default?.create;

    clientInstance = await create({
      session: "default",
    });

    console.log("✅ WPPConnect client prêt.");
    // 🔐 QR Code listener APRÈS création

    console.log("✅ WPPConnect client prêt.");
    clientInstance.onMessage(async (message: any) => {
      console.log("📩 Nouveau message reçu :");
      console.log("De :", message.from);
      console.log("Contenu :", message.body);
      const lowerContent = message.body.toLowerCase();
      const content = message.body;
      const senderId = message.from;

      // 🔁 Répondre automatiquement
      try {
        let foundAutoResponse = false;

        // 1. Réponses pré-configurées
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
              "Voici le lien vers notre catalogue complet : https://exemple.com/catalogue",
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
            await clientInstance.sendText(senderId, item.response);
            console.log("🤖 Réponse statique envoyée !");
            foundAutoResponse = true;
            break;
          }
        }

        if (foundAutoResponse) return;

        // 2. Réponse FAQ
        const faq = await FAQ.findOne({ where: { question: lowerContent } });

        if (faq) {
          await clientInstance.sendText(senderId, faq.answer);
          console.log("🤖 Réponse FAQ envoyée !");
          return;
        }

        // 🔗 2.5 Traitement lien Facebook
        if (content.includes("fb.me")) {
          await handleIncomingProductMessage(content, senderId, clientInstance);
          console.log("📎 Lien Facebook traité.");
          return;
        }

        // 3. Réponse produit avec image
        const allProducts = await Product.findAll({
          include: [{ model: ImageProduct, as: "images" }],
        });

        const matchedProduct = allProducts.find((product) =>
          lowerContent.includes(product.getDataValue("keyword").toLowerCase())
        );

        if (matchedProduct) {
          const productName = matchedProduct.getDataValue("name");
          const price = matchedProduct.getDataValue("price");
          const deliveryFee = matchedProduct.getDataValue("deliveryFee");
          const extraQuestion = matchedProduct.getDataValue("extraQuestion");
          const imageUrl = matchedProduct.images?.[0]?.dataValues?.imageUrl
            ? `${baseImageUrl2}${matchedProduct.images[0].dataValues.imageUrl}`
            : null;

          const responseCaption = `📦 *${productName}* est disponible à *${price} FCFA* + *${deliveryFee} FCFA* de livraison.`;
          const questions = extraQuestion
            ? `❓ ${extraQuestion}\n\nSouhaitez-vous passer commande ?`
            : `Souhaitez-vous passer commande ?`;

          if (imageUrl) {
            await clientInstance.sendImage(
              senderId,
              imageUrl,
              "image.jpg",
              responseCaption
            );
            await clientInstance.sendText(senderId, questions);
          } else {
            await clientInstance.sendText(
              senderId,
              `${responseCaption}\n\n${questions}`
            );
          }

          console.log("🛒 Réponse produit envoyée !");
          foundAutoResponse = true;
        }

        if (!foundAutoResponse) {
          console.log("💬 Aucun message automatique trouvé.");
        }
      } catch (err) {
        console.error("❌ Erreur lors du traitement automatique :", err);
      }
    });

    return clientInstance;
  } catch (error) {
    console.error("❌ Erreur d'initialisation du client WPPConnect :", error);
    throw error;
  }
};
