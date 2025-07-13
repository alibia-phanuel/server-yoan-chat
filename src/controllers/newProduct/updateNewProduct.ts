import { Request, Response } from "express";
import sequelize from "../../config/db";
import NewProduct from "../../models/NewProduct";
import ProductElement from "../../models/ProductElement";
import ImageProduct from "../../models/ImageProduct";
import path from "path";
import fs from "fs";

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const transaction = await sequelize.transaction();
  console.log(req.body);
  try {
    const { id } = req.params;

    const { keyword, name, elements } = req.body;
    const files = Array.isArray(req.files)
      ? (req.files as Express.Multer.File[])
      : [];
    // Trouver le produit
    const product = await NewProduct.findOne({ where: { id } });
    if (!product) {
      await transaction.rollback();
      res.status(404).json({ message: "Produit non trouvé" });
      return;
    }

    // Mise à jour du produit
    await product.update({ keyword, name }, { transaction });

    // Supprimer anciens éléments et images liés
    await ProductElement.destroy({ where: { productId: id }, transaction });
    const oldImages = await ImageProduct.findAll({
      where: { productId: id },
      transaction,
    });

    for (const image of oldImages) {
      if (image.imageUrl) {
        // Supprimer fichier physique
        // Supposons que imageUrl est du type "/uploads/nomfichier.jpg"
        const imagePath = path.join(
          process.cwd(),
          "public",
          image.imageUrl.replace(/^\//, "")
        );
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }

    await ImageProduct.destroy({ where: { productId: id }, transaction });

    // Parser elements JSON si nécessaire
    let parsedElements: any[] = [];
    try {
      parsedElements =
        typeof elements === "string" ? JSON.parse(elements) : elements;
      if (!Array.isArray(parsedElements))
        throw new Error("Elements doit être un tableau");
    } catch {
      await transaction.rollback();
      res.status(400).json({ message: "Format invalide pour les éléments" });
      return;
    }

    // Créer les nouveaux éléments
    let imageIndex = 0;
    for (const element of parsedElements) {
      if (element.type === "image") {
        if (files[imageIndex]) {
          const file = files[imageIndex];
          const filename = `${Date.now()}-${file.originalname}`;
          const imageUrl = `/uploads/${filename}`;
          const imagePath = path.join(
            process.cwd(),
            "public",
            "uploads",
            filename
          );

          // Écrire le fichier uploadé
          fs.writeFileSync(imagePath, file.buffer);

          // Créer élément image et ImageProduct
          await ProductElement.create(
            {
              productId: id,
              type: "image",
              imageUrl,
              caption: element.caption,
              order: element.order,
            },
            { transaction }
          );

          await ImageProduct.create(
            {
              productId: id,
              imageUrl,
            },
            { transaction }
          );

          imageIndex++;
        } else if (element.imageUrl) {
          // Image existante : juste créer ProductElement
          await ProductElement.create(
            {
              productId: id,
              type: "image",
              imageUrl: element.imageUrl,
              caption: element.caption,
              order: element.order,
            },
            { transaction }
          );
        }
      } else if (element.type === "text") {
        // Élément texte
        await ProductElement.create(
          {
            productId: id,
            type: "text",
            content: element.content,
            order: element.order,
          },
          { transaction }
        );
      }
    }

    // Récupérer produit mis à jour avec éléments triés
    const updatedProduct = await NewProduct.findByPk(id, {
      include: [
        {
          model: ProductElement,
          as: "elements",
          separate: true,
          order: [["order", "ASC"]],
        },
      ],
      transaction, // ✅ Transaction globale ici
    });

    await transaction.commit();

    res.status(200).json(updatedProduct);
  } catch (error: any) {
    await transaction.rollback();
    console.error("Erreur lors de la mise à jour du produit:", error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du produit",
      error: error.message,
    });
  }
};
