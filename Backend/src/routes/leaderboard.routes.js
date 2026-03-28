import express from "express";
import { saveToLeaderboard, getLeaderboard } from "../controllers/leaderboardController.js";

const router = express.Router();

router.post("/save", saveToLeaderboard);
router.get("/", getLeaderboard);

export default router;
