import Leaderboard from "../models/leaderboard.model.js";
import GameSession from "../models/game.model.js";

// ─── Deal Save Karo Leaderboard Pe ───
export const saveToLeaderboard = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await GameSession.findById(sessionId).populate("product");
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.status !== "deal_closed") {
      return res.status(400).json({ message: "Deal not closed yet" });
    }

    const savings = session.product.listedPrice - session.finalPrice;

    const entry = await Leaderboard.create({
      playerName: session.playerName,
      product: session.product._id,
      finalPrice: session.finalPrice,
      listedPrice: session.product.listedPrice,
      roundsUsed: session.rounds.length,
      savings,
    });

    res.status(201).json({
      message: "Saved to leaderboard",
      entry,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ─── Leaderboard Fetch Karo ───
export const getLeaderboard = async (req, res) => {
  try {
    const entries = await Leaderboard.find()
      .populate("product", "name image")
      .sort({ savings: -1 }) // Sabse zyada savings upar
      .limit(10);             // Top 10

    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
