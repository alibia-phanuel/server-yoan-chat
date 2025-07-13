// routes/productRoutes.ts
import express from "express";
import { getProductById } from "../controllers/newProduct/getProductById";

const router = express.Router();

router.get("/products/:id", getProductById);

export default router;
