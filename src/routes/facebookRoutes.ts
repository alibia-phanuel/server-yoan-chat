import express from "express";
import { fetchPosts } from "../controllers/facebookController";

const router = express.Router();

// GET /facebook/posts/:page (ex: /facebook/posts/afrikagadget)
router.get("/posts/:page", fetchPosts);

export default router;
