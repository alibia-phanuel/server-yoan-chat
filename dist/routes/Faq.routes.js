"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Faq_1 = require("../controllers/Faq");
const router = express_1.default.Router();
router.get("/question", Faq_1.getFAQs);
router.post("/question", Faq_1.createFAQ);
router.get("/question/:id", Faq_1.getFAQsById);
router.patch("/question/:id", Faq_1.updateFAQ);
router.delete("/question/:id", Faq_1.deleteFAQ);
exports.default = router;
