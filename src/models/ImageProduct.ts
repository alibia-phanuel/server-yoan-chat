import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import Product from "./Product";

// Interface des attributs de ImageProduct
interface ImageProductAttributes {
  id: number;
  productId: string;
  imageUrl: string;
}

// Interface pour la création (id auto-incrémenté)
interface ImageProductCreationAttributes
  extends Optional<ImageProductAttributes, "id"> {}

// Modèle ImageProduct avec Sequelize + TypeScript
class ImageProduct
  extends Model<ImageProductAttributes, ImageProductCreationAttributes>
  implements ImageProductAttributes
{
  public id!: number;
  public productId!: string;
  public imageUrl!: string;
}

ImageProduct.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "products_new", key: "id" },
      onDelete: "CASCADE",
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize, tableName: "image_products" }
);

// Définition des relations
ImageProduct.belongsTo(Product, { foreignKey: "productId", as: "product" });
Product.hasMany(ImageProduct, { foreignKey: "productId", as: "images" });

export default ImageProduct;
