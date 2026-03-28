import { Routes, Route } from "react-router-dom";
import HomePage from "../src/pages/HomePage.jsx";
import GamePage from "../src/pages/GamePage";
import LeaderboardPage from "../src/pages/LeaderboardPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/game/:sessionId" element={<GamePage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
    </Routes>
  );
}

export default AppRoutes;