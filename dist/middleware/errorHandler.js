"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Middleware de gestion des erreurs
const errorHandler = (err, req, res, next) => {
    console.error("Erreur :", err.message); // Log de l'erreur pour le débogage
    const statusCode = err.status || 500; // Utilise le statut d'erreur défini ou 500 par défaut
    res.status(statusCode).json({
        success: false,
        message: err.message || "Une erreur est survenue.",
    });
};
exports.default = errorHandler;
