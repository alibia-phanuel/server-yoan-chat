"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const homeRoutes_routes_1 = __importDefault(require("./routes/homeRoutes.routes"));
const AuthRoute_routes_1 = __importDefault(require("./routes/AuthRoute.routes"));
const ProductsRoute_routes_1 = __importDefault(require("./routes/ProductsRoute.routes"));
const facebookRoutes_1 = __importDefault(require("./routes/facebookRoutes"));
const Faq_routes_1 = __importDefault(require("./routes/Faq.routes"));
const UserRoute_routes_1 = __importDefault(require("./routes/UserRoute.routes"));
const Whatsapp_API_routes_1 = __importDefault(require("./routes/Whatsapp_API.routes"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Vérification des variables d'environnement
if (!process.env.JWT_SECRET ||
    !process.env.DB_HOST ||
    !process.env.DB_USER ||
    !process.env.DB_PASSWORD) {
    console.error("❌ Erreur: certaines variables d'environnement sont manquantes.");
    process.exit(1);
}
// Configuration du moteur de rendu EJS
app.set("view engine", "ejs");
// Configuration CORS
const allowedOrigins = [
    "http://localhost:5173", // Pour les tests en local
    "https://chat-boot-front-end.vercel.app", // Pour la prod
];
app.get("/", (req, res) => {
    res.send("bonjour"); // Vérifie que "views/home.ejs" existe
});
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
}));
// Déclaration des routes
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/images/products", express_1.default.static("public/images/products"));
app.use("/images/messages", express_1.default.static("public/images/messages"));
// Middleware global pour la gestion des erreurs (toujours à la fin)
// Déclaration des routes
app.use("/", homeRoutes_routes_1.default);
app.use(AuthRoute_routes_1.default);
app.use(UserRoute_routes_1.default);
app.use(Faq_routes_1.default);
app.use(ProductsRoute_routes_1.default);
app.use(Whatsapp_API_routes_1.default);
// Ici, tu utilises facebookRoutes pour gérer les routes qui commencent par "/facebook"
app.use("/facebook", facebookRoutes_1.default);
app.use(errorHandler_1.default);
// Lancer le serveur
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("❌ Erreur lors du démarrage du serveur:", error);
        process.exit(1);
    }
});
// // Synchronisation des modèles avec la base de données
// Synchronisation Sequelize
db_1.default
    .sync({ force: false }) // Mets `force: true` pour reset la DB à chaque lancement
    .then(() => console.log("✅ Base de données synchronisée"))
    .catch((err) => console.error("❌ Erreur de connexion DB:", err));
// Synchronisation de la table des sessions
startServer();
