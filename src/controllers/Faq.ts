import { Request, Response, NextFunction } from "express";
import FAQ from "../models/FAQ";
import User from "../models/User";
import { Op } from "sequelize";

interface UserProps extends Request {
  userId?: number;
  role?: string;
}

export const getFAQs = async (
  req: UserProps,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let response;

    response = await FAQ.findAll({
      attributes: ["id", "question", "answer"],
      include: [
        {
          model: User,
          attributes: ["name", "role"],
          as: "creator", // L'alias défini dans votre association
        },
      ],
      order: [["createdAt", "DESC"]], // Tri par date de création (du plus récent au moins récent)
    });

    res.status(200).json(response);
  } catch (error: any) {
    next(error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({ msg: error.message });
  }
};

export const createFAQ = async (
  req: UserProps,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { question, answer, createdBy } = req.body;

    await FAQ.create({
      question: question,
      answer: answer,
      createdBy: createdBy,
    });
    res.status(201).json({ msg: "La question/reponse a créé avec succès !" });
  } catch (error) {
    // Transmission de l'erreur au middleware global
    next(error instanceof Error ? error : new Error(String(error)));
  }
};

export const getFAQsById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Vérifier si l'ID est bien fourni
    if (!id) {
      res.status(400).json({ message: "L'ID de l'utilisateur est requis" });
      return;
    }

    // Récupération de l'utilisateur
    const questionaire = await FAQ.findOne({
      attributes: ["id", "question", "answer"],
      where: { id: id },
    });

    // Vérifier si l'utilisateur existe
    if (!questionaire) {
      res.status(404).json({ message: "Questionaire non trouvé" });
      return;
    }

    res.status(200).json(questionaire);
  } catch (error: any) {
    console.error("Erreur lors de la récupération du questionaire:", error);

    if (error.name === "SequelizeConnectionError") {
      res.status(500).json({
        message: "Erreur de connexion à la base de données",
        error: error.message,
      });
    } else if (error.name === "SequelizeDatabaseError") {
      res.status(500).json({
        message: "Erreur de base de données",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Erreur serveur lors de la récupération du questionaire",
        error: error.message,
      });
    }
  }
};

export const updateFAQ = async (
  req: UserProps,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Vérifier si le produit existe avant de continuer
    const faq = await FAQ.findOne({
      where: {
        id: req.params.id, // Assurer que `id` est un paramètre correct
      },
    });

    if (!faq) {
      res.status(404).json({ msg: "Produit non trouvé" });
    }

    let response;

    const { question, answer } = req.body;
    await FAQ.update({ question, answer }, { where: { id: faq?.id } });

    response = await FAQ.findOne({
      attributes: ["id", "question", "answer"],
      where: {
        [Op.and]: [{ id: faq?.id }, { userId: req.userId }],
      },
    });

    // Retourner la réponse si tout est OK
    res.status(200).json({ msg: "Produit modifié avec succès !" });
  } catch (error: any) {
    // Transmission de l'erreur au middleware global
    next(error instanceof Error ? error : new Error(String(error)));
  }
};

export const deleteFAQ = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Vérifier si l'UUID est fourni
    if (!id) {
      res.status(400).json({ message: "L'UUID du Questioniare est requis" });
      return;
    }

    // Vérifier si l'utilisateur existe
    const faq = await FAQ.findOne({ where: { id: id } });
    if (!faq) {
      res.status(404).json({ message: "Questioniare non trouvé" });
      return;
    }

    // Suppression de l'utilisateur
    await FAQ.destroy({ where: { id: id } });

    res.status(200).json({ message: "Questioniare supprimé avec succès" });
  } catch (error: any) {
    console.error("Erreur lors de la suppression du Questioniare:", error);

    if (error.name === "SequelizeForeignKeyConstraintError") {
      res.status(400).json({
        message:
          "Impossible de supprimer ce Questioniare car il est lié à d'autres données",
        error: error.message,
      });
    } else if (error.name === "SequelizeConnectionError") {
      res.status(500).json({
        message: "Erreur de connexion à la base de données",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Erreur serveur lors de la suppression du Questioniare",
        error: error.message,
      });
    }
  }
};
