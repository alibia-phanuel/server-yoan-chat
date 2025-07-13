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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPosts = void 0;
const facebookModel_1 = require("../models/facebookModel");
const fetchPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page } = req.params;
    if (page !== "afrikagadget" && page !== "topqualites") {
        res.status(400).json({ error: "Nom de page invalide" });
        return;
    }
    try {
        const posts = yield (0, facebookModel_1.getFacebookPosts)(page);
        res.status(200).json(posts);
    }
    catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});
exports.fetchPosts = fetchPosts;
