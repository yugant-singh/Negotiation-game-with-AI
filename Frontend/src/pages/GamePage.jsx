import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { submitOffer, saveToLeaderboard } from "../services/api";
import "./GamePage.scss";

function GamePage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const {
    playerName,
    selectedProduct,
    messages,
    addMessage,
    gameStatus,
    setGameStatus,
    roundsLeft,
    setRoundsLeft,
    finalPrice,
    setFinalPrice,
  } = useGame();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  // Naya message aaye toh scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const playerMessage = input.trim();
    setInput("");

    // Player ka message chat mein add karo
    addMessage("player", playerMessage);

    // Chat history update karo
    const updatedHistory = [
      ...chatHistory,
      { role: "user", content: playerMessage },
    ];

    try {
      setLoading(true);

      const res = await submitOffer(sessionId, {
        playerMessage,
        chatHistory,
      });

      const { aiMessage, status, gameStatus: gs, finalPrice: fp, roundsLeft: rl } = res.data;

      // AI ka message chat mein add karo
      addMessage("ai", aiMessage);

      // Chat history mein AI response bhi add karo
      setChatHistory([
        ...updatedHistory,
        { role: "assistant", content: aiMessage },
      ]);

      setGameStatus(gs);
      setRoundsLeft(rl);

      if (gs === "deal_closed") {
        setFinalPrice(fp);
        await saveToLeaderboard(sessionId);
      }
    } catch (err) {
      console.error("Message send failed:", err);
      addMessage("ai", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="game">
      {/* Left Panel */}
      <div className="game__panel">
        <div className="game__product">
          <span className="game__product-image">{selectedProduct?.image}</span>
          <h2 className="game__product-name">{selectedProduct?.name}</h2>
          <p className="game__product-desc">{selectedProduct?.description}</p>
          <p className="game__product-price">
            Listed at{" "}
            <span>₹{selectedProduct?.listedPrice.toLocaleString()}</span>
          </p>
        </div>

        {/* Round Tracker */}
        <div className="game__rounds">
          <p className="game__rounds-label">Rounds Left</p>
          <div className="game__rounds-circles">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`game__round-circle ${
                  i < roundsLeft ? "active" : "used"
                }`}
              />
            ))}
          </div>
        </div>

        <button
          className="game__leaderboard-btn"
          onClick={() => navigate("/leaderboard")}
        >
          🏆 Leaderboard
        </button>
      </div>

      {/* Chat Area */}
      <div className="game__chat">
        {/* Messages */}
        <div className="game__messages">
          {messages.length === 0 && (
            <p className="game__empty">
              Start negotiating — make an offer or convince the seller! 💬
            </p>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`game__message game__message--${msg.sender}`}
            >
              <span className="game__message-sender">
                {msg.sender === "player" ? `👤 ${playerName}` : "🤖 AI Seller"}
              </span>
              <p className="game__message-text">{msg.text}</p>
              <span className="game__message-time">{msg.time}</span>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="game__message game__message--ai">
              <span className="game__message-sender">🤖 AI Seller</span>
              <p className="game__message-text game__typing">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </p>
            </div>
          )}

          {/* Game Over */}
          {gameStatus === "deal_closed" && (
            <div className="game__result game__result--success">
              🎉 Deal closed at ₹{finalPrice?.toLocaleString()}! Saved to leaderboard.
              <button onClick={() => navigate("/")}>Play Again</button>
            </div>
          )}

          {gameStatus === "deal_failed" && (
            <div className="game__result game__result--fail">
              😔 No deal made. Better luck next time!
              <button onClick={() => navigate("/")}>Try Again</button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {gameStatus === "ongoing" && (
          <div className="game__input-area">
            <input
              type="text"
              placeholder="Type your offer or message... I’m a student—can you give it to me for ₹8000?')"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="game__input"
              disabled={loading}
            />
            <button
              className="game__submit-btn"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              {loading ? "..." : "Send 🚀"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GamePage;
