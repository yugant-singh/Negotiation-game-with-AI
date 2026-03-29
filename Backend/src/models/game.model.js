import mongoose from "mongoose";

const roundSchema = new mongoose.Schema({
  roundNumber: Number,
  playerOffer: Number,
  aiResponse: String,
  aiCounterOffer: Number,
  status: {
    type: String,
    enum: ["countered", "accepted", "rejected", "talking", "failed"],
  },
});

const gameSessionSchema = new mongoose.Schema(
  {
    playerName: {
      type: String,
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    rounds: [roundSchema],
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    maxRounds: {
      type: Number,
      default: 6,
    },
    status: {
      type: String,
      enum: ["ongoing", "deal_closed", "deal_failed"],
      default: "ongoing",
    },
    finalPrice: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("GameSession", gameSessionSchema);