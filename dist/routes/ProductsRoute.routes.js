"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multerConfig_1 = __importDefault(require("../utils/multerConfig")); // Importer Multer
const Product_1 = require("../controllers/Product");
const router = express_1.default.Router();
// Routes produit
router.get("/products", Product_1.getProducts);
router.post("/products", multerConfig_1.default.array("images", 4), Product_1.createProduct); // Utilisation de multer pour les images
router.get("/products/:id", Product_1.getProductById);
router.patch("/products/:id", Product_1.updateProduct);
router.delete("/products/:id", Product_1.deleteProduct);
exports.default = router;
