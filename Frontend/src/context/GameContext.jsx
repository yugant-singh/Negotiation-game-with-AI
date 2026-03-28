import { createContext, useContext, useState } from "react";

const GameContext = createContext();

export function GameProvider({ children }) {
  const [playerName, setPlayerName] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [gameStatus, setGameStatus] = useState("ongoing");
  const [roundsLeft, setRoundsLeft] = useState(6);
  const [finalPrice, setFinalPrice] = useState(null);

  const addMessage = (sender, text, offer = null) => {
    setMessages((prev) => [
      ...prev,
      { sender, text, offer, time: new Date().toLocaleTimeString() },
    ]);
  };

  const resetGame = () => {
    setSelectedProduct(null);
    setSessionId(null);
    setMessages([]);
    setGameStatus("ongoing");
    setRoundsLeft(6);
    setFinalPrice(null);
  };

  return (
    <GameContext.Provider
      value={{
        playerName,
        setPlayerName,
        selectedProduct,
        setSelectedProduct,
        sessionId,
        setSessionId,
        messages,
        addMessage,
        gameStatus,
        setGameStatus,
        roundsLeft,
        setRoundsLeft,
        finalPrice,
        setFinalPrice,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
