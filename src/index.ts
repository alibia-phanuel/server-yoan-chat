import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db";
import homeRoutes from "./routes/homeRoutes.routes";
import AuthRouteRoute from "./routes/AuthRoute.routes";
import newProductRoute from "./routes/NewProductRoute.routes";
import Faq from "./routes/Faq.routes";
import UserRoute from "./routes/UserRoute.routes";
import qrCodeRouter from "./routes/qrCode";
import bodyParser from "body-parser";
import errorHandler from "./middleware/errorHandler";
import path from "path";
import { initializeWppClient } from "./config/wppconnectClient";

// Chargement des variables d'environnement
dotenv.config();

// Initialisation de l'application Express
const app = express();
const server = http.createServer(app);

// Configuration CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://yoan-client-chat-boot.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Middlewares
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration du moteur EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Fichiers statiques
app.use(express.static(path.join(__dirname, "../public")));
app.use("/images/products", express.static("public/images/products"));
app.use("/images/messages", express.static("public/images/messages"));

// Route principale (page d'accueil stylisée)
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WhatsApp Bot</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            .container {
                background: rgba(255, 255, 255, 0.95);
                padding: 2rem;
                border-radius: 15px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                text-align: center;
                max-width: 400px;
                width: 90%;
            }
            h1 {
                color: #333;
                margin-bottom: 1.5rem;
                font-size: 1.8rem;
            }
            .button {
                background: #25D366;
                color: white;
                border: none;
                padding: 1rem 2rem;
                border-radius: 8px;
                font-size: 1.1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-block;
            }
            .button:hover {
                background: #128C7E;
                transform: translateY(-2px);
            }
            .status {
                margin-top: 1rem;
                padding: 0.8rem;
                border-radius: 8px;
                background: #f8f9fa;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>WhatsApp Bot</h1>
            <a href="/qr" class="button">Initialiser WhatsApp</a>
            <div class="status" id="status">Prêt à initialiser</div>
        </div>
    </body>
    </html>
  `);
});

// Initialisation de Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔌 Nouvelle connexion Socket.IO:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Déconnexion Socket.IO:", socket.id);
  });
});

export { io };

// Vérification des variables d'environnement essentielles
if (
  !process.env.JWT_SECRET ||
  !process.env.DB_HOST ||
  !process.env.DB_USER ||
  !process.env.DB_PASSWORD
) {
  console.error("❌ Variables d'environnement manquantes.");
  process.exit(1);
}

// Déclaration des routes
app.use("/", homeRoutes);
app.use(AuthRouteRoute);
app.use(UserRoute);
app.use(Faq);
app.use(qrCodeRouter);
app.use("/api", newProductRoute);

// Middleware global pour gérer les erreurs
app.use(errorHandler);
import puppeteer from "puppeteer";

// Démarrage du serveur
const startServer = async () => {
  try {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`🚀 Serveur + Socket.IO lancé sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Erreur au démarrage du serveur:", error);
    process.exit(1);
  }
};

// Synchronisation de la base de données
sequelize

  .sync({ force: false })
  .then(() => console.log("✅ Base de données synchronisée"))
  .catch((err) => console.error("❌ Erreur de connexion DB:", err));
// Synchronisation de la table des sessions
initializeWppClient().catch((err) => {
  console.error("❌ Impossible d'initialiser le client WhatsApp :", err);
});

startServer();
