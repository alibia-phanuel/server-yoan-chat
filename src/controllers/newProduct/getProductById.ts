// controllers/productController.ts
import { Request, Response } from "express";
import NewProduct from "../../models/NewProduct";
import ProductElement from "../../models/ProductElement";

export async function getProductById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    const product = await NewProduct.findByPk(id, {
      include: [
        {
          model: ProductElement,
          as: "elements",
          order: [["order", "ASC"]],
        },
      ],
    });

    if (!product) {
      res.status(404).json({ message: "Produit non trouvé" });
      return;
    }

    res.status(200).json(product);
  } catch (err) {
    console.error("Erreur lors de la récupération du produit :", err);
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
}
