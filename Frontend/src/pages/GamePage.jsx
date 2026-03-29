import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { submitOffer, saveToLeaderboard } from "../services/api";
import toast from "react-hot-toast";
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
  const [localFinalPrice, setLocalFinalPrice] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const playerMessage = input.trim();
    setInput("");

    addMessage("player", playerMessage);

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

      const {
        aiMessage,
        status,
        gameStatus: gs,
        finalPrice: fp,
        roundsLeft: rl,
      } = res.data;

      addMessage("ai", aiMessage);

      setChatHistory([
        ...updatedHistory,
        { role: "assistant", content: aiMessage },
      ]);

      setGameStatus(gs);
      setRoundsLeft(rl);

      // Toast notifications
      if (gs === "deal_closed") {
        setLocalFinalPrice(fp);
        setFinalPrice(fp);
        await saveToLeaderboard(sessionId);
        toast.success(`🎉 Deal closed at ₹${fp?.toLocaleString()}!`);
      } else if (status === "rejected") {
        toast.error("❌ Offer rejected! Try a better price.");
      } else if (status === "countered") {
        toast(`💬 AI countered! Keep negotiating.`, {
          icon: "🤝",
        });
      } else if (rl === 2) {
        toast(`⚠️ Only 2 rounds left!`, {
          icon: "⏰",
          style: {
            background: "#12121a",
            color: "#ffaa00",
            border: "1px solid #ffaa00",
            borderRadius: "12px",
          },
        });
      } else if (gs === "deal_failed") {
        toast.error("😔 No deal made. Try again!");
      }
    } catch (err) {
      console.error("Message send failed:", err);
      addMessage("ai", "Something went wrong. Please try again.");
      toast.error("Something went wrong!");
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
          <div className="game__product-price-row">
            <p className="game__product-price">
              Listed at{" "}
              <span>₹{selectedProduct?.listedPrice.toLocaleString()}</span>
            </p>
          </div>
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
          <p className="game__rounds-count">{roundsLeft} / 6 remaining</p>
        </div>

        {/* Tips */}
        <div className="game__tips">
          <p className="game__tips-title">💡 Tips</p>
          <ul>
            <li>Tell the seller you're a student</li>
            <li>Give a logical reason for discount</li>
            <li>Build rapport before offering</li>
            <li>Don't lowball — be reasonable</li>
          </ul>
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
        {/* Chat Header */}
        <div className="game__chat-header">
          <div className="game__chat-header-info">
            <span className="game__chat-avatar">🤖</span>
            <div>
              <p className="game__chat-name">AI Seller</p>
              <p className="game__chat-status">
                {gameStatus === "ongoing" ? "🟢 Online" : "🔴 Offline"}
              </p>
            </div>
          </div>
          <p className="game__chat-product">
            Negotiating: {selectedProduct?.image} {selectedProduct?.name}
          </p>
        </div>

        {/* Messages */}
        <div className="game__messages">
          {messages.length === 0 && (
            <div className="game__welcome">
              <p>
                👋 Hello <strong>{playerName}</strong>!
              </p>
              <p>
                I'm selling <strong>{selectedProduct?.name}</strong> for{" "}
                <strong>
                  ₹{selectedProduct?.listedPrice.toLocaleString()}
                </strong>
                .
              </p>
              <p>Make me an offer or convince me to give you a discount! 😏</p>
            </div>
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

          {/* Loading */}
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

          {/* Deal Closed */}
          {gameStatus === "deal_closed" && (
            <div className="game__result game__result--success">
              <p className="game__result-emoji">🎉</p>
              <p className="game__result-title">Deal Closed!</p>
              <p className="game__result-price">
                ₹{(localFinalPrice || finalPrice)?.toLocaleString()}
              </p>
              <p className="game__result-savings">
                You saved ₹
                {(
                  selectedProduct?.listedPrice -
                  (localFinalPrice || finalPrice)
                )?.toLocaleString()}
                !
              </p>
              <p className="game__result-sub">Saved to leaderboard ✅</p>
              <button onClick={() => navigate("/")}>Play Again 🚀</button>
            </div>
          )}

          {/* Deal Failed */}
          {gameStatus === "deal_failed" && (
            <div className="game__result game__result--fail">
              <p className="game__result-emoji">😔</p>
              <p className="game__result-title">No Deal Made</p>
              <p className="game__result-sub">
                Better luck next time! Try a different strategy.
              </p>
              <button onClick={() => navigate("/")}>Try Again 🔄</button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {gameStatus === "ongoing" && (
          <div className="game__input-area">
            <input
              type="text"
              placeholder="Type your offer or message... (e.g. 'Main student hu, ₹8000 mein doge?')"
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