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
const axios_1 = __importDefault(require("axios"));
function processFacebookLink(shortLink) {
    return __awaiter(this, void 0, void 0, function* () {
        function extractLink(input) {
            // Expression régulière pour capturer un lien HTTP ou HTTPS
            const regex = /(https?:\/\/[^\s]+)/;
            const match = input.match(regex);
            // Si un lien est trouvé, on le retourne, sinon on retourne null
            return match ? match[0] : null;
        }
        //   // Exemple d'utilisation
        //   const inputString =
        //     "https://fb.me/hTcrCk8rQ Bonjour ! Puis-je en savoir plus à ce sujet ?";
        const extractedLink = extractLink(shortLink);
        try {
            // Étape 1 : Récupérer le lien long
            const response = yield axios_1.default.head(extractedLink !== null && extractedLink !== void 0 ? extractedLink : "", {
                maxRedirects: 10,
            });
            const longLink = response.request.res.responseUrl;
            // Étape 2 : Extraire les identifiants depuis le lien long
            const regex = /facebook\.com\/(\d+)\/videos\/(\d+)/;
            const match = longLink.match(regex);
            if (match) {
                const pageId = match[1];
                const videoId = match[2];
                const formattedId = `${pageId}_${videoId}`;
                return { longLink, formattedId };
            }
            else {
                throw new Error("Les identifiants n'ont pas pu être extraits du lien long.");
            }
        }
        catch (error) {
            console.error("Erreur :", error.message);
            return null;
        }
    });
}
exports.default = processFacebookLink;
