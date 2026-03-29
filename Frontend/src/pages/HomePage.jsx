import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProducts, startGame } from "../services/api";
import { useGame } from "../context/GameContext";
import "./HomePage.scss";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProductLocal] = useState(null);
  const [name, setName] = useState("");
  const [starting, setStarting] = useState(false);
  const [difficulty, setDifficulty] = useState("medium");

  const { setPlayerName, setSelectedProduct, setSessionId, resetGame } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getAllProducts();
        setProducts(res.data);
      } catch (err) {
        console.error("Products fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleStart = async () => {
    if (!name.trim() || !selectedProduct) return;
    try {
      setStarting(true);
      const res = await startGame(name, selectedProduct._id, difficulty);
      const { sessionId, product, maxRounds } = res.data;
      setPlayerName(name);
      setSelectedProduct(product);
      setSessionId(sessionId);
      navigate(`/game/${sessionId}`);
    } catch (err) {
      console.error("Game start failed:", err);
    } finally {
      setStarting(false);
    }
  };

  const difficultyConfig = {
    easy: {
      label: "Easy",
      emoji: "😊",
      desc: "8 rounds, AI is flexible",
      color: "success",
    },
    medium: {
      label: "Medium",
      emoji: "😐",
      desc: "6 rounds, balanced AI",
      color: "warning",
    },
    hard: {
      label: "Hard",
      emoji: "😈",
      desc: "4 rounds, AI is stubborn",
      color: "danger",
    },
  };

  return (
    <div className="home">
      {/* Navbar */}
      <nav className="home__navbar">
        <div className="home__navbar-logo">🤝 Negotiation Game</div>
        <button
          className="home__navbar-btn"
          onClick={() => navigate("/leaderboard")}
        >
          🏆 Leaderboard
        </button>
      </nav>

      {/* Name Input */}
      <div className="home__name-section">
        <input
          type="text"
          placeholder="Enter your name to begin..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="home__input"
        />
      </div>

      {/* Difficulty Selector */}
      <div className="home__difficulty-section">
        <h2 className="home__section-title">Choose Difficulty</h2>
        <div className="home__difficulty-options">
          {Object.entries(difficultyConfig).map(([key, val]) => (
            <div
              key={key}
              className={`home__difficulty-card home__difficulty-card--${val.color} ${
                difficulty === key ? "selected" : ""
              }`}
              onClick={() => setDifficulty(key)}
            >
              <span className="home__difficulty-emoji">{val.emoji}</span>
              <p className="home__difficulty-label">{val.label}</p>
              <p className="home__difficulty-desc">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Products Section */}
      <div className="home__products-section">
        <h2 className="home__section-title">Choose a Product to Negotiate</h2>
        {loading ? (
          <p className="home__loading">Loading products...</p>
        ) : (
          <div className="home__products-scroll">
            {products.map((product) => (
              <div
                key={product._id}
                className={`home__product-card ${
                  selectedProduct?._id === product._id ? "selected" : ""
                }`}
                onClick={() => setSelectedProductLocal(product)}
              >
                <span className="home__product-image">{product.image}</span>
                <h3 className="home__product-name">{product.name}</h3>
                <p className="home__product-price">
                  ₹{product.listedPrice.toLocaleString()}
                </p>
                <span
                  className={`home__mood home__mood--${product.personality}`}
                >
                  {product.personality}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className={`home__bottom-bar ${selectedProduct ? "visible" : ""}`}>
        {selectedProduct ? (
          <>
            <div className="home__bottom-info">
              <span className="home__bottom-image">{selectedProduct.image}</span>
              <div>
                <p className="home__bottom-name">{selectedProduct.name}</p>
                <p className="home__bottom-price">
                  Listed at ₹{selectedProduct.listedPrice.toLocaleString()}
                  <span
                    className={`home__mood home__mood--${selectedProduct.personality}`}
                  >
                    {selectedProduct.personality}
                  </span>
                </p>
              </div>
            </div>
            <div className="home__bottom-right">
              <span className={`home__bottom-difficulty home__bottom-difficulty--${difficultyConfig[difficulty].color}`}>
                {difficultyConfig[difficulty].emoji} {difficultyConfig[difficulty].label}
              </span>
              <button
                className="home__start-btn"
                onClick={handleStart}
                disabled={!name.trim() || starting}
              >
                {starting ? "Starting..." : "Start Negotiation 🚀"}
              </button>
            </div>
          </>
        ) : (
          <p className="home__bottom-hint">
            👆 Select a product to start negotiating
          </p>
        )}
      </div>
    </div>
  );
}

export default HomePage;