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
exports.deleteFAQ = exports.updateFAQ = exports.getFAQsById = exports.createFAQ = exports.getFAQs = void 0;
const FAQ_1 = __importDefault(require("../models/FAQ"));
const User_1 = __importDefault(require("../models/User"));
const sequelize_1 = require("sequelize");
const getFAQs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response;
        response = yield FAQ_1.default.findAll({
            attributes: ["id", "question", "answer"],
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
exports.getFAQs = getFAQs;
const createFAQ = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { question, answer, createdBy } = req.body;
        yield FAQ_1.default.create({
            question: question,
            answer: answer,
            createdBy: createdBy,
        });
        res.status(201).json({ msg: "La question/reponse a créé avec succès !" });
    }
    catch (error) {
        // Transmission de l'erreur au middleware global
        next(error instanceof Error ? error : new Error(String(error)));
    }
});
exports.createFAQ = createFAQ;
const getFAQsById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Vérifier si l'ID est bien fourni
        if (!id) {
            res.status(400).json({ message: "L'ID de l'utilisateur est requis" });
            return;
        }
        // Récupération de l'utilisateur
        const questionaire = yield FAQ_1.default.findOne({
            attributes: ["id", "question", "answer"],
            where: { id: id },
        });
        // Vérifier si l'utilisateur existe
        if (!questionaire) {
            res.status(404).json({ message: "Questionaire non trouvé" });
            return;
        }
        res.status(200).json(questionaire);
    }
    catch (error) {
        console.error("Erreur lors de la récupération du questionaire:", error);
        if (error.name === "SequelizeConnectionError") {
            res.status(500).json({
                message: "Erreur de connexion à la base de données",
                error: error.message,
            });
        }
        else if (error.name === "SequelizeDatabaseError") {
            res.status(500).json({
                message: "Erreur de base de données",
                error: error.message,
            });
        }
        else {
            res.status(500).json({
                message: "Erreur serveur lors de la récupération du questionaire",
                error: error.message,
            });
        }
    }
});
exports.getFAQsById = getFAQsById;
const updateFAQ = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Vérifier si le produit existe avant de continuer
        const faq = yield FAQ_1.default.findOne({
            where: {
                id: req.params.id, // Assurer que `id` est un paramètre correct
            },
        });
        if (!faq) {
            res.status(404).json({ msg: "Produit non trouvé" });
        }
        let response;
        const { question, answer } = req.body;
        yield FAQ_1.default.update({ question, answer }, { where: { id: faq === null || faq === void 0 ? void 0 : faq.id } });
        response = yield FAQ_1.default.findOne({
            attributes: ["id", "question", "answer"],
            where: {
                [sequelize_1.Op.and]: [{ id: faq === null || faq === void 0 ? void 0 : faq.id }, { userId: req.userId }],
            },
        });
        // Retourner la réponse si tout est OK
        res.status(200).json({ msg: "Produit modifié avec succès !" });
    }
    catch (error) {
        // Transmission de l'erreur au middleware global
        next(error instanceof Error ? error : new Error(String(error)));
    }
});
exports.updateFAQ = updateFAQ;
const deleteFAQ = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Vérifier si l'UUID est fourni
        if (!id) {
            res.status(400).json({ message: "L'UUID du Questioniare est requis" });
            return;
        }
        // Vérifier si l'utilisateur existe
        const faq = yield FAQ_1.default.findOne({ where: { id: id } });
        if (!faq) {
            res.status(404).json({ message: "Questioniare non trouvé" });
            return;
        }
        // Suppression de l'utilisateur
        yield FAQ_1.default.destroy({ where: { id: id } });
        res.status(200).json({ message: "Questioniare supprimé avec succès" });
    }
    catch (error) {
        console.error("Erreur lors de la suppression du Questioniare:", error);
        if (error.name === "SequelizeForeignKeyConstraintError") {
            res.status(400).json({
                message: "Impossible de supprimer ce Questioniare car il est lié à d'autres données",
                error: error.message,
            });
        }
        else if (error.name === "SequelizeConnectionError") {
            res.status(500).json({
                message: "Erreur de connexion à la base de données",
                error: error.message,
            });
        }
        else {
            res.status(500).json({
                message: "Erreur serveur lors de la suppression du Questioniare",
                error: error.message,
            });
        }
    }
});
exports.deleteFAQ = deleteFAQ;
