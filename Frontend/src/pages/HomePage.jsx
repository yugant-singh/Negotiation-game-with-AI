import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProducts, startGame } from "../services/api";
import { useGame } from "../context/GameContext";
import "./HomePage.scss";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [name, setName] = useState("");
  const [starting, setStarting] = useState(false);

  const { setPlayerName, setSelectedProduct, setSessionId, resetGame } = useGame();
  const navigate = useNavigate();

  // Page load hote hi sab reset karo
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
    if (!name.trim() || !selectedProductId) return;

    try {
      setStarting(true);
      const res = await startGame(name, selectedProductId);
      const { sessionId, product } = res.data;

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

  return (
    <div className="home">
      {/* Header */}
      <div className="home__header">
        <h1 className="home__title">🤝 Negotiation Game</h1>
        <p className="home__subtitle">
          Outsmart the AI seller. Get the lowest price. Top the leaderboard.
        </p>
      </div>

      {/* Player Name Input */}
      <div className="home__name">
        <input
          type="text"
          placeholder="Enter your name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="home__input"
        />
      </div>

      {/* Products */}
      <div className="home__section">
        <h2 className="home__section-title">Choose a Product</h2>
        {loading ? (
          <p className="home__loading">Loading products...</p>
        ) : (
          <div className="home__products">
            {products.map((product) => (
              <div
                key={product._id}
                className={`home__product-card ${
                  selectedProductId === product._id ? "selected" : ""
                }`}
                onClick={() => setSelectedProductId(product._id)}
              >
                <span className="home__product-image">{product.image}</span>
                <h3 className="home__product-name">{product.name}</h3>
                <p className="home__product-desc">{product.description}</p>
                <p className="home__product-price">
                  Listed at{" "}
                  <span>₹{product.listedPrice.toLocaleString()}</span>
                </p>
                <p className="home__product-personality">
                  Seller mood:{" "}
                  <span className={`mood mood--${product.personality}`}>
                    {product.personality}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start Button */}
      <div className="home__action">
        <button
          className="home__btn"
          onClick={handleStart}
          disabled={!name.trim() || !selectedProductId || starting}
        >
          {starting ? "Starting..." : "Start Negotiation 🚀"}
        </button>
        <button
          className="home__btn home__btn--secondary"
          onClick={() => navigate("/leaderboard")}
        >
          View Leaderboard 🏆
        </button>
      </div>
    </div>
  );
}

export default HomePage;