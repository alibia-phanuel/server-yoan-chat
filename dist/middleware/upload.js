"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// 📁 Nouveau chemin vers le dossier public/images/messages
const uploadDir = path_1.default.join(__dirname, "../../public/images/messages/");
// 📁 Création du dossier s'il n'existe pas
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// ✅ Types MIME autorisés (images seulement)
const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const baseName = path_1.default
            .basename(file.originalname, ext)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9]/g, "_");
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${baseName}${ext}`);
    },
});
// 🔐 Filtre pour autoriser uniquement les images
const fileFilter = (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Seuls les fichiers image sont autorisés."));
    }
};
// 🎯 Export de l'uploader avec filtrage et limite
exports.upload = (0, multer_1.default)({
    storage,
    limits: { files: 10 },
    fileFilter,
});
