import express from "express";
import { startGame, submitOffer, getSession, getAllProducts } from "../controllers/gameController.js";

const router = express.Router();

router.get("/products", getAllProducts);
router.post("/start", startGame);
router.post("/:sessionId/offer", submitOffer);
router.get("/:sessionId", getSession);

export default router;