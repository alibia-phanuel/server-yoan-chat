// import { v4 as uuidv4 } from "uuid";
// import Product from "../models/Product";
// import ImageProduct from "../models/ImageProduct";
// import User from "../models/User";
// import type { Multer } from "multer";
// // Importation des types nécessaires depuis Express
// import { Request, Response, NextFunction } from "express";
// import sequelize from "../config/db";
// // Étendre l'interface Request pour inclure les fichiers Multer

// /**
//  * Contrôleur pour afficher la page d'accueil.
//  * @param req - Objet de requête HTTP.
//  * @param res - Objet de réponse HTTP.
//  * @param next - Fonction pour passer au middleware suivant (gestion des erreurs).
//  */
// export const getProducts = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     let response;

//     response = await Product.findAll({
//       attributes: [
//         "id",
//         "uuid",
//         "keyword",
//         "name",
//         "price",
//         "deliveryFee",
//         "extraQuestion",
//       ],
//       include: [
//         {
//           model: User,
//           attributes: ["name", "role"],
//           as: "creator", // L'alias défini dans votre association
//         },
//       ],
//       order: [["createdAt", "DESC"]], // Tri par date de création (du plus récent au moins récent)
//     });

//     res.status(200).json(response);
//   } catch (error: any) {
//     next(error instanceof Error ? error : new Error(String(error)));
//     res.status(500).json({ msg: error.message });
//   }
// };
// export const getProductById = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { id } = req.params;

//     // Rechercher le produit avec ses images associées
//     const product = await Product.findOne({
//       where: { uuid: id }, // Recherche par UUID
//       include: [
//         {
//           model: ImageProduct,
//           as: "images",
//           attributes: ["imageUrl"], // Sélectionne uniquement l'URL de l'image
//         },
//       ],
//     });

//     if (!product) {
//       res.status(404).json({ message: "Produit non trouvé." });
//       return;
//     }

//     // Transformer la structure de réponse pour n'inclure que les chemins des images
//     const formattedProduct = {
//       ...product.get(), // Convertit l'instance Sequelize en objet JS
//       images: product.images?.map((img) => img.imageUrl), // Garde uniquement les URLs des images
//     };

//     res.status(200).json(formattedProduct);
//   } catch (error) {
//     console.error("Erreur lors de la récupération du produit :", error);
//     res.status(500).json({ message: "Erreur interne du serveur." });
//   }
// };

// export const updateProduct = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   console.log("🛠️ Données reçues :", req.body);

//   try {
//     // Vérifier si le produit existe avant de continuer
//     const product = await Product.findOne({
//       where: { uuid: req.params.id }, // <-- correction ici
//     });

//     if (!product) {
//       res.status(404).json({ msg: "Produit non trouvé" });
//       return;
//     }

//     // Mise en forme des données mises à jour avec validation des prix
//     const updateData: any = {};

//     // Validation et ajout des données dans updateData
//     if (req.body.name) updateData.name = req.body.name;

//     // Validation du champ "price"
//     if (req.body.price && !isNaN(Number(req.body.price))) {
//       updateData.price = Number(req.body.price);
//     } else if (req.body.price) {
//       // Si price est fourni mais invalide
//       res.status(400).json({ msg: "Le prix doit être un nombre valide !" });
//       return;
//     }

//     // Validation du champ "deliveryFee"
//     if (req.body.deliveryFee) {
//       const deliveryFee = Number(req.body.deliveryFee);
//       if (!isNaN(deliveryFee)) {
//         updateData.deliveryFee = deliveryFee;
//       } else {
//         res.status(400).json({
//           msg: "Les frais de livraison doivent être un nombre valide !",
//         });
//         return;
//       }
//     }

//     // Validation du champ "extraQuestions"
//     if (req.body.extraQuestions)
//       updateData.extraQuestion = req.body.extraQuestions;

//     if (req.body.keyword) updateData.keyword = req.body.keyword;
//     if (req.body.createdBy) updateData.createdBy = req.body.createdBy;

//     // Vérification que les données sont valides
//     if (Object.keys(updateData).length === 0) {
//       res.status(400).json({ msg: "Aucune donnée valide à mettre à jour" });
//       return;
//     }

//     // Mise à jour du produit
//     const [updatedRows, updatedProducts] = await Product.update(updateData, {
//       where: { uuid: req.params.id }, // <-- correction ici aussi
//       returning: true,
//     });

//     if (updatedRows === 0) {
//       res.status(400).json({ msg: "Aucune modification effectuée" });
//       return;
//     }

//     res.status(200).json({
//       msg: "Produit modifié avec succès !",
//       product: updatedProducts[0],
//     });
//   } catch (error: any) {
//     next(error instanceof Error ? error : new Error(String(error)));
//   }
// };
// // Création d'un produit
// export const createProduct = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   const multerReq = req as Request & {
//     file?: Express.Multer.File;
//     files?:
//       | Express.Multer.File[]
//       | { [fieldname: string]: Express.Multer.File[] };
//   };

//   try {
//     const {
//       name,
//       price,
//       productIdOrKeyword,
//       shippingFee,
//       extraQuestions,
//       createdBy,
//       ordreEnvoi,
//     } = multerReq.body;

//     // Création du produit
//     const product = await Product.create({
//       uuid: uuidv4(), // Génération d'un UUID unique
//       keyword: productIdOrKeyword,
//       name,
//       price,
//       deliveryFee: shippingFee,
//       extraQuestion: extraQuestions,
//       createdBy: createdBy, // Remplace par l'ID de l'utilisateur connecté
//       ordreEnvoi,
//     });

//     // Sauvegarde des images si elles existent
//     if (multerReq.files && Array.isArray(multerReq.files)) {
//       const imageRecords = multerReq.files.map((file) => ({
//         productId: product.uuid,
//         imageUrl: `/images/products/${file.filename}`,
//       }));

//       await ImageProduct.bulkCreate(imageRecords);
//     }

//     res.status(201).json({ message: "Produit ajouté avec succès", product });
//   } catch (error) {
//     console.error("Erreur lors de l'ajout du produit:", error);
//     res.status(500).json({ error: "Erreur serveur" });
//   }
// };

// export const deleteProduct = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   const transaction = await sequelize.transaction(); // Démarrer une transaction

//   try {
//     const { id } = req.params;

//     if (!id) {
//       res.status(400).json({ message: "L'identifiant du produit est requis." });
//       return;
//     }

//     // Vérifier si le produit existe
//     const product = await Product.findOne({ where: { uuid: id }, transaction });

//     if (!product) {
//       res.status(404).json({ message: "Produit non trouvé." });
//       return;
//     }

//     // Suppression des images associées (facultatif si onDelete: "CASCADE" fonctionne bien)
//     await ImageProduct.destroy({ where: { productId: id }, transaction });

//     // Suppression du produit
//     await Product.destroy({ where: { uuid: id }, transaction });

//     await transaction.commit(); // Valider la transaction

//     res.status(200).json({ message: "Produit supprimé avec succès." });
//   } catch (error: any) {
//     await transaction.rollback(); // Annuler la transaction en cas d'erreur

//     console.error("Erreur lors de la suppression du produit :", error);

//     if (error.name === "SequelizeForeignKeyConstraintError") {
//       res.status(400).json({
//         message:
//           "Impossible de supprimer ce produit car il est lié à d'autres données.",
//         error: error.message,
//       });
//     } else {
//       res.status(500).json({
//         message: "Erreur serveur lors de la suppression du produit.",
//         error: error.message,
//       });
//     }
//   }
// };
