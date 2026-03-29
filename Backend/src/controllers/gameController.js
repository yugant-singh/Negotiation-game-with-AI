import GameSession from "../models/game.model.js";
import Product from "../models/product.model.js";
import { generateAIResponse } from "../services/aiSellerService.js";

// Difficulty ke hisaab se maxRounds aur flexibility
const difficultyConfig = {
  easy: {
    maxRounds: 8,
    flexibilityBonus: 0.15, // AI zyada flexible
  },
  medium: {
    maxRounds: 6,
    flexibilityBonus: 0,
  },
  hard: {
    maxRounds: 4,
    flexibilityBonus: -0.10, // AI kam flexible
  },
};

// ─── All Products Fetch ───
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find(
      {},
      "name description image listedPrice personality"
    );
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Game Start ───
export const startGame = async (req, res) => {
  try {
    const { playerName, productId, difficulty = "medium" } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Difficulty ke hisaab se maxRounds set karo
    const { maxRounds } = difficultyConfig[difficulty];

    const session = await GameSession.create({
      playerName,
      product: productId,
      difficulty,
      maxRounds,
      rounds: [],
      status: "ongoing",
    });

    res.status(201).json({
      message: "Game started",
      sessionId: session._id,
      difficulty,
      maxRounds,
      product: {
        _id: product._id,
        name: product.name,
        description: product.description,
        image: product.image,
        listedPrice: product.listedPrice,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Submit Message ───
export const submitOffer = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { playerMessage, chatHistory } = req.body;

    const session = await GameSession.findById(sessionId).populate("product");
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.status !== "ongoing") {
      return res.status(400).json({ message: "Game is already over" });
    }

    if (session.rounds.length >= session.maxRounds) {
      session.status = "deal_failed";
      await session.save();
      return res.status(400).json({ message: "No rounds left. Deal failed." });
    }

    const roundNumber = session.rounds.length + 1;
    const product = session.product;

    // Difficulty config pass karo AI ko
    const { flexibilityBonus } = difficultyConfig[session.difficulty];

    const aiResult = await generateAIResponse(
      product,
      playerMessage,
      chatHistory,
      roundNumber,
      session.maxRounds,
      flexibilityBonus
    );

    const round = {
      roundNumber,
      playerOffer: aiResult.extractedOffer,
      aiResponse: aiResult.aiMessage,
      aiCounterOffer: null,
      status: aiResult.status,
    };

    session.rounds.push(round);

    if (aiResult.status === "accepted") {
      session.status = "deal_closed";
      session.finalPrice = aiResult.finalPrice;
    } else if (
      session.rounds.length >= session.maxRounds &&
      aiResult.status !== "accepted"
    ) {
      session.status = "deal_failed";
    }

    await session.save();

    res.json({
      aiMessage: aiResult.aiMessage,
      status: aiResult.status,
      gameStatus: session.status,
      finalPrice: session.finalPrice,
      roundsLeft: session.maxRounds - session.rounds.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Session Details ───
export const getSession = async (req, res) => {
  try {
    const session = await GameSession.findById(req.params.sessionId).populate(
      "product",
      "name description image listedPrice"
    );

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};