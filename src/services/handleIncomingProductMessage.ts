// import processFacebookLink from "../config/utils/processFacebookLink";
// import { sendTextMessage, sendMediaMessage } from "./whatsappService";
// // import Product from "../models/Product";
// // import ImageProduct from "../models/ImageProduct";
// import getProductIdFromPages from "./getProductIdFromPages";

// import { extractLink } from "../config/utils/extractLink";
// // Base URL pour accéder aux images via ngrok
// const baseImageUrl = "https://2bc4-143-105-152-187.ngrok-free.app";
// const baseImageUrl2 = "https://2bc4-143-105-152-187.ngrok-free.app";

// export const handleIncomingProductMessage = async (
//   message: string,
//   senderPhone: string
// ) => {
//   try {
//     const link = await extractLink(message);
//     const result = await processFacebookLink(message);

//     if (!result) {
//       await sendTextMessage(
//         senderPhone,
//         "Désolé, je n'ai pas pu traiter ce lien."
//       );
//       return;
//     }

//     const { formattedId } = result;
//     const productId = await getProductIdFromPages(formattedId);

//     if (productId) {
//       console.log("ID du produit :", productId);
//     } else {
//       console.log("Produit introuvable sur les deux pages.");
//     }

//     // Recherche du produit en base de données par le champ keyword
//     const product = await Product.findOne({
//       where: { keyword: productId || "" },
//       include: [{ model: ImageProduct, as: "images" }],
//     });

//     if (!product) {
//       await sendTextMessage(senderPhone, "Produit introuvable pour ce lien.");
//       return;
//     }

//     // console.log(typeof imagePath, imagePath);
//     // const imageUrl = imagePath ? `${baseImageUrl}${imagePath}` : null;
//     const linkOnWa = ` ${baseImageUrl}${product.images?.[0]?.dataValues?.imageUrl}`; // Exemple : "/uploads/images/nomImage.jpg"}
//     const deliveryFee = product.deliveryFee || "Non spécifié";
//     const extraQuestion = product.extraQuestion || "";

//     // Petite fonction de pause
//     const sleep = (ms: number) =>
//       new Promise((resolve) => setTimeout(resolve, ms));

//     // 1. Envoyer l'image du produit avec les frais de livraison
//     if (linkOnWa) {
//       console.log("LINK TO SEN IMAGE ON WA:", linkOnWa);
//       await sendMediaMessage(
//         senderPhone,
//         linkOnWa,
//         `Frais de livraison : ${deliveryFee}`
//       );

//       // Enregistrer dans la base
//       // await Message.create({
//       //   senderId: "+15551443267",
//       //   messageType: "text+image",
//       //   content: `Frais de livraison : ${deliveryFee} FCFA` || null,
//       //   imagePath: `${baseImageUrl2}${product.images?.[0]?.dataValues?.imageUrl}`,
//       //   isRead: false,
//       //   conversationId: 1,
//       //   whatsappNumber: senderPhone,
//       // });

//       // ⏳ Attendre 500ms avant d'envoyer le prochain message
//       await sleep(1000);
//     }

//     // 2. Envoyer la question supplémentaire
//     if (extraQuestion) {
//       await sleep(1000);
//       await sendTextMessage(senderPhone, extraQuestion);
//       // Enregistrer dans la base
//       await sleep(1000);
//       // await Message.create({
//       //   senderId: "+15551443267",
//       //   messageType: "text",
//       //   content: extraQuestion || null,
//       //   imagePath: "",
//       //   isRead: false,
//       //   conversationId: 1,
//       //   whatsappNumber: senderPhone,
//       // });
//       // await Conversation.update(
//       //   {
//       //     lastMessage: extraQuestion,
//       //     lastMessageTimestamp: new Date(),
//       //   },
//       //   {
//       //     where: { id: 1 },
//       //   }
//       // );
//     }
//   } catch (error: any) {
//     console.error("Erreur lors du traitement du message :", error.message);
//     await sendTextMessage(
//       senderPhone,
//       "Une erreur est survenue. Veuillez réessayer."
//     );
//   }
// };
