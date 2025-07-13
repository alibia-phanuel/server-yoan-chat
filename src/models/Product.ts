import { DataTypes, Model, Optional } from "sequelize";
import ImageProduct from "./ImageProduct";
import sequelize from "../config/db";
import User from "./User";

// Interface des attributs de Product
interface ProductAttributes {
  id: number;
  uuid: string;
  keyword: string;
  name: string;
  price: number;
  deliveryFee: number;
  extraQuestion?: string;
  createdBy: string;
  ordreEnvoi: "text-first" | "images-first";
}

// Interface pour la création (id auto-incrémenté)
interface ProductCreationAttributes extends Optional<ProductAttributes, "id"> {}

// Modèle Product avec Sequelize + TypeScript
class Product
  extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes
{
  public id!: number;
  public uuid!: string;
  public keyword!: string;
  public name!: string;
  public price!: number;
  public deliveryFee!: number;
  public extraQuestion?: string;
  public createdBy!: string;
  public ordreEnvoi!: "text-first" | "images-first";
  // ✅ Ajoute cette ligne pour inclure la relation d'images
  public images?: ImageProduct[];
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    keyword: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    deliveryFee: { type: DataTypes.FLOAT, allowNull: false },
    extraQuestion: { type: DataTypes.TEXT, allowNull: true },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    ordreEnvoi: {
      type: DataTypes.ENUM("text-first", "images-first"),
      allowNull: false,
      defaultValue: "text-first",
    },
  },
  {
    sequelize,
    tableName: "products",
  }
);

Product.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

export default Product;
