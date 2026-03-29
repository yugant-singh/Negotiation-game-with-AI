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
      const res = await startGame(name, selectedProduct._id);
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
                <span className={`home__mood home__mood--${product.personality}`}>
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
                  <span className={`home__mood home__mood--${selectedProduct.personality}`}>
                    {selectedProduct.personality}
                  </span>
                </p>
              </div>
            </div>
            <button
              className="home__start-btn"
              onClick={handleStart}
              disabled={!name.trim() || starting}
            >
              {starting ? "Starting..." : "Start Negotiation 🚀"}
            </button>
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