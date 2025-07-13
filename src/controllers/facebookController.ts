import { Request, Response } from "express";
import { getFacebookPosts } from "../models/facebookModel";

export const fetchPosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { page } = req.params;

  if (page !== "afrikagadget" && page !== "topqualites") {
    res.status(400).json({ error: "Nom de page invalide" });
    return;
  }

  try {
    const posts = await getFacebookPosts(
      page as "afrikagadget" | "topqualites"
    );
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};
