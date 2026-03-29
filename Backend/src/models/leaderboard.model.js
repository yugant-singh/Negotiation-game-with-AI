import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GameSession",
      unique: true, 
    },
    playerName: {
      type: String,
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    listedPrice: {
      type: Number,
      required: true,
    },
    roundsUsed: {
      type: Number,
      required: true,
    },
    savings: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Leaderboard", leaderboardSchema);