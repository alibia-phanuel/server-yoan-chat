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
exports.deleteProduct = exports.createProduct = exports.updateProduct = exports.getProductById = exports.getProducts = void 0;
const uuid_1 = require("uuid");
const Product_1 = __importDefault(require("../models/Product"));
const ImageProduct_1 = __importDefault(require("../models/ImageProduct"));
const User_1 = __importDefault(require("../models/User"));
const db_1 = __importDefault(require("../config/db"));
// Étendre l'interface Request pour inclure les fichiers Multer
/**
 * Contrôleur pour afficher la page d'accueil.
 * @param req - Objet de requête HTTP.
 * @param res - Objet de réponse HTTP.
 * @param next - Fonction pour passer au middleware suivant (gestion des erreurs).
 */
const getProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response;
        response = yield Product_1.default.findAll({
            attributes: [
                "id",
                "uuid",
                "keyword",
                "name",
                "price",
                "deliveryFee",
                "extraQuestion",
            ],
            include: [
                {
                    model: User_1.default,
                    attributes: ["name", "role"],
                    as: "creator", // L'alias défini dans votre association
                },
            ],
            order: [["createdAt", "DESC"]], // Tri par date de création (du plus récent au moins récent)
        });
        res.status(200).json(response);
    }
    catch (error) {
        next(error instanceof Error ? error : new Error(String(error)));
        res.status(500).json({ msg: error.message });
    }
});
exports.getProducts = getProducts;
const getProductById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        // Rechercher le produit avec ses images associées
        const product = yield Product_1.default.findOne({
            where: { uuid: id }, // Recherche par UUID
            include: [
                {
                    model: ImageProduct_1.default,
                    as: "images",
                    attributes: ["imageUrl"], // Sélectionne uniquement l'URL de l'image
                },
            ],
        });
        if (!product) {
            res.status(404).json({ message: "Produit non trouvé." });
            return;
        }
        // Transformer la structure de réponse pour n'inclure que les chemins des images
        const formattedProduct = Object.assign(Object.assign({}, product.get()), { images: (_a = product.images) === null || _a === void 0 ? void 0 : _a.map((img) => img.imageUrl) });
        res.status(200).json(formattedProduct);
    }
    catch (error) {
        console.error("Erreur lors de la récupération du produit :", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
});
exports.getProductById = getProductById;
const updateProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("🛠️ Données reçues :", req.body);
    try {
        // Vérifier si le produit existe avant de continuer
        const product = yield Product_1.default.findOne({
            where: { uuid: req.params.id },
        });
        if (!product) {
            res.status(404).json({ msg: "Produit non trouvé" });
            return;
        }
        // Mise en forme des données mises à jour avec validation des prix
        const updateData = {};
        // Validation et ajout des données dans updateData
        if (req.body.name)
            updateData.name = req.body.name;
        // Validation du champ "price"
        if (req.body.price && !isNaN(Number(req.body.price))) {
            updateData.price = Number(req.body.price);
        }
        else {
            res.status(400).json({ msg: "Le prix doit être un nombre valide !" });
            return;
        }
        // Validation du champ "deliveryFee"
        if (req.body.deliveryFee) {
            const deliveryFee = Number(req.body.deliveryFee);
            if (!isNaN(deliveryFee)) {
                updateData.deliveryFee = deliveryFee;
            }
            else {
                res.status(400).json({
                    msg: "Les frais de livraison doivent être un nombre valide !",
                });
                return;
            }
        }
        // Validation du champ "extraQuestions"
        if (req.body.extraQuestions)
            updateData.extraQuestion = req.body.extraQuestions; // Correction du champ
        if (req.body.keyword)
            updateData.keyword = req.body.keyword;
        if (req.body.createdBy)
            updateData.createdBy = req.body.createdBy; // Validation à ajouter selon le rôle de l'utilisateur
        // Vérification que les données sont valides
        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ msg: "Aucune donnée valide à mettre à jour" });
            return;
        }
        // Mise à jour du produit
        const [updatedRows, updatedProducts] = yield Product_1.default.update(updateData, {
            where: { uuid: req.params.id },
            returning: true, // Retourne les nouvelles valeurs après mise à jour
        });
        // Vérifier si la mise à jour a bien été effectuée
        if (updatedRows === 0) {
            res.status(400).json({ msg: "Aucune modification effectuée" });
            return;
        }
        res.status(200).json({
            msg: "Produit modifié avec succès !",
            product: updatedProducts[0], // Retourne le produit mis à jour
        });
    }
    catch (error) {
        next(error instanceof Error ? error : new Error(String(error)));
    }
});
exports.updateProduct = updateProduct;
// Création d'un produit
const createProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const multerReq = req;
    try {
        const { name, price, productIdOrKeyword, shippingFee, extraQuestions, createdBy, } = multerReq.body;
        // Création du produit
        const product = yield Product_1.default.create({
            uuid: (0, uuid_1.v4)(), // Génération d'un UUID unique
            keyword: productIdOrKeyword,
            name,
            price,
            deliveryFee: shippingFee,
            extraQuestion: extraQuestions,
            createdBy: createdBy, // Remplace par l'ID de l'utilisateur connecté
        });
        // Sauvegarde des images si elles existent
        if (multerReq.files && Array.isArray(multerReq.files)) {
            const imageRecords = multerReq.files.map((file) => ({
                productId: product.id,
                imageUrl: `/images/products/${file.filename}`,
            }));
            yield ImageProduct_1.default.bulkCreate(imageRecords);
        }
        res.status(201).json({ message: "Produit ajouté avec succès", product });
    }
    catch (error) {
        console.error("Erreur lors de l'ajout du produit:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});
exports.createProduct = createProduct;
const deleteProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield db_1.default.transaction(); // Démarrer une transaction
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ message: "L'identifiant du produit est requis." });
            return;
        }
        // Vérifier si le produit existe
        const product = yield Product_1.default.findOne({ where: { id }, transaction });
        if (!product) {
            res.status(404).json({ message: "Produit non trouvé." });
            return;
        }
        // Suppression des images associées (facultatif si onDelete: "CASCADE" fonctionne bien)
        yield ImageProduct_1.default.destroy({ where: { productId: id }, transaction });
        // Suppression du produit
        yield Product_1.default.destroy({ where: { id }, transaction });
        yield transaction.commit(); // Valider la transaction
        res.status(200).json({ message: "Produit supprimé avec succès." });
    }
    catch (error) {
        yield transaction.rollback(); // Annuler la transaction en cas d'erreur
        console.error("Erreur lors de la suppression du produit :", error);
        if (error.name === "SequelizeForeignKeyConstraintError") {
            res.status(400).json({
                message: "Impossible de supprimer ce produit car il est lié à d'autres données.",
                error: error.message,
            });
        }
        else {
            res.status(500).json({
                message: "Erreur serveur lors de la suppression du produit.",
                error: error.message,
            });
        }
    }
});
exports.deleteProduct = deleteProduct;
