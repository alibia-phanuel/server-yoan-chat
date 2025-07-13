"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../controllers/User");
const router = express_1.default.Router();
router.get("/users", User_1.getUsers);
router.get("/users/:id", User_1.getUserById);
router.post("/users", User_1.createUser);
router.patch("/users/:id", User_1.updateUser);
router.delete("/users/:id", User_1.deleteUser);
exports.default = router;
