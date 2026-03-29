import express from "express";
import cors from "cors";
import gameRoutes from "./routes/game.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";

const app = express();

app.use(express.json());
app.use(express.static("./public"))
app.use(cors({
    origin:"http://localhost:5173"
    
}))
// Routes
app.use("/api/game", gameRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Negotiation Game API is running" });
});

export default app;