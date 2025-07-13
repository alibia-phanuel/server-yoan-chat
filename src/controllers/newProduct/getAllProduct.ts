import { Request, Response } from "express";
import NewProduct from "../../models/NewProduct";
import ProductElement from "../../models/ProductElement";
export async function getAllProduct(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // 🔹 Récupération de tous les produits
    const products = await NewProduct.findAll();

    // 🔹 Récupération des éléments pour chaque produit
    const productsWithElements = await Promise.all(
      products.map(async (product) => {
        const elements = await ProductElement.findAll({
          where: { productId: product.id },
          order: [["order", "ASC"]],
        });

        return {
          ...product.toJSON(),
          elements,
        };
      })
    );

    res.status(200).json(productsWithElements);
  } catch (err) {
    console.error("Erreur récupération des produits :", err);
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
}
