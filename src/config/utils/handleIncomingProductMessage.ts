import wppconnect from "@wppconnect-team/wppconnect";
import type { Whatsapp } from "@wppconnect-team/wppconnect";
import processFacebookLink from "../../services/processFacebookLink";
import { NewProduct, ProductElement } from "../../models";
import getProductIdFromPages from "../../services/getProductIdFromPages";
const baseImageUrl = "https://chat-boot-92e040193633.herokuapp.com"; // 🔁 Remplace par ton vrai chemin
// Fonction pour délai aléatoire entre 1.5s et 4s
const humanSleep = async () => {
  const delay = Math.floor(Math.random() * 2500) + 1500; // entre 1500ms et 4000ms
  return new Promise((resolve) => setTimeout(resolve, delay));
};

// Fonction principale
export const handleIncomingProductMessage = async (
  message: string,
  senderPhone: string,
  client: Whatsapp // instance wppconnect
) => {
  try {
    // 1. Extraire l'identifiant depuis le lien Facebook
    const result = await processFacebookLink(message);

    if (!result) {
      await client.sendText(
        senderPhone,
        "Désolé, je n'ai pas pu traiter ce lien. Assurez-vous qu'il est correct."
      );
      return;
    }

    const { formattedId } = result;
    const productId = await getProductIdFromPages(formattedId);

    if (!productId) {
      console.log("Produit introuvable sur les deux pages.");
      await client.sendText(
        senderPhone,
        "Le produit associé à ce lien est introuvable."
      );
      return;
    }

    console.log("ID du produit :", productId);

    // 1. Recherche du produit par ID uniquement
    const product = await NewProduct.findOne({
      where: { id: productId },
      include: [{ model: ProductElement, as: "elements" }],
    });

    if (!product) {
      await humanSleep();
      await client.sendText(
        senderPhone,
        "❌ Produit introuvable pour cet identifiant."
      );
      return;
    }

    const elements = product.elements || [];
    const sortedElements = elements.sort((a: any, b: any) => a.order - b.order);

    // 2. Envoi progressif des éléments avec comportement humain
    for (const element of sortedElements) {
      await humanSleep();

      if (element.type === "image" && element.imageUrl) {
        const imageLink = `${baseImageUrl}${element.imageUrl}`;
        await client.sendImage(
          senderPhone,
          imageLink,
          "produit.jpg",
          element.caption || ""
        );
      } else if (element.type === "text" && element.content) {
        await client.sendText(senderPhone, element.content);
      }
    }

    // 3. Message final après un dernier délai
    await humanSleep();
    await client.sendText(senderPhone, "Souhaitez-vous passer commande ?");
  } catch (error: any) {
    console.error("❌ Erreur lors du traitement du message :", error.message);
    await client.sendText(
      senderPhone,
      "Une erreur est survenue. Veuillez réessayer plus tard."
    );
  }
};
