import express from "express";
import path from "path";
import {
  initializeWppClient,
  resetWppClient,
} from "../config/wppconnectClient";

const router = express.Router();

router.get("/qr", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/qr.html"));
});

router.post("/initialize", async (req, res) => {
  try {
    await initializeWppClient();
    res.json({ success: true, message: "Initialisation démarrée" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erreur lors de l'initialisation" });
  }
});

router.post("/reset", async (req, res) => {
  try {
    await resetWppClient();
    res.json({ success: true, message: "Client réinitialisé" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erreur lors de la réinitialisation" });
  }
});

export default router;
