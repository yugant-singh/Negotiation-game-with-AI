import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema(
  {
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
      type: Number, // listedPrice - finalPrice
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Leaderboard", leaderboardSchema);
