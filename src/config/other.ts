export const handleIncomingMessage = async (
    message: any,
    client: wppconnect.Whatsapp
  ) => {
    const lowerContent = message.body.toLowerCase();
  
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
      // 1. Récupérer tous les produits (id et name)
      const allProducts = await NewProduct.findAll({
        attributes: ["id", "name"],
      });
  
      // 2. Chercher un produit correspondant (id ou name)
      let matchedProductId: string | null = null;
  
      for (const product of allProducts) {
        if (
          (product.name && isSimilar(lowerContent, product.name)) ||
          (product.id && isSimilar(lowerContent, product.id))
        ) {
          matchedProductId = product.id;
          break;
        }
      }
  
      if (!matchedProductId) {
        return; // Aucun produit reconnu
      }
  
      // 3. Récupération du produit et de ses éléments
      const product = await NewProduct.findOne({
        where: { id: matchedProductId },
        include: [
          {
            model: ProductElement,
            as: "elements",
          },
        ],
      });
  
      if (!product || !product.elements || product.elements.length === 0) {
        await client.sendText(message.from, "❌ Produit introuvable ou vide.");
        return;
      }
  
      // 4. Trier les éléments par ordre
      const sortedElements = product.elements.sort(
        (a: any, b: any) => a.order - b.order
      );
  
      // 5. Envoyer les messages dans l’ordre
      for (const element of sortedElements) {
        if (element.type === "text") {
          await client.sendText(message.from, element.content || "");
        } else if (element.type === "image" && element.imageUrl) {
          await client.sendImage(
            message.from,
            element.imageUrl,
            "image.jpg",
            element.caption || ""
          );
        }
      }
    } catch (error) {
      console.error("❌ Erreur:", error);
      await client.sendText(message.from, "❌ Une erreur est survenue.");
    }
  };
  