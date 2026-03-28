import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

// ─── Product APIs ───
export const getAllProducts = () => api.get("/game/products");

// ─── Game APIs ───
export const startGame = (playerName, productId) =>
  api.post("/game/start", { playerName, productId });

export const submitOffer = (sessionId, data) =>
  api.post(`/game/${sessionId}/offer`, data);

export const getSession = (sessionId) => api.get(`/game/${sessionId}`);

// ─── Leaderboard APIs ───
export const saveToLeaderboard = (sessionId) =>
  api.post("/leaderboard/save", { sessionId });

export const getLeaderboard = () => api.get("/leaderboard");
