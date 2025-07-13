import { Router } from "express";
import { createProductElement } from "../controllers/newProduct/createProductElement";
import { getAllProduct } from "../controllers/newProduct/getAllProduct";
import { deleteNewProduct } from "../controllers/newProduct/deleteNewProduct";
import { updateProduct } from "../controllers/newProduct/updateNewProduct";
import { getProductById } from "../controllers/newProduct/getProductById";
import upload from "../utils/multerConfig"; // Importer Multer

const router = Router();
router.post("/newproducts", upload.array("images", 10), createProductElement);
router.get("/newproducts", getAllProduct);
router.delete("/newproducts/:id", deleteNewProduct);
router.get("/products/:id", getProductById);
router.put("/newproducts/:id", upload.array("images", 10), updateProduct);

export default router;
