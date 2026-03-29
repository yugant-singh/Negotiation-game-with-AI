import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLeaderboard } from "../services/api";
import "./LeaderboardPage.scss";

function LeaderboardPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await getLeaderboard();
        setEntries(res.data);
      } catch (err) {
        console.error("Leaderboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getMedal = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  return (
    <div className="leaderboard">
      {/* Header */}
      <div className="leaderboard__header">
        <h1 className="leaderboard__title">🏆 Leaderboard</h1>
        <p className="leaderboard__subtitle">
          Top negotiators ranked by maximum savings
        </p>
      </div>

      {/* Table */}
      <div className="leaderboard__table-wrapper">
        {loading ? (
          <p className="leaderboard__loading">Loading leaderboard...</p>
        ) : entries.length === 0 ? (
          <p className="leaderboard__empty">
            No entries yet. Be the first to make a deal!
          </p>
        ) : (
          <table className="leaderboard__table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Product</th>
                <th>Listed Price</th>
                <th>Deal Price</th>
                <th>Savings</th>
                <th>Rounds</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr
                  key={entry._id}
                  className={index < 3 ? "leaderboard__top" : ""}
                >
                  <td className="leaderboard__rank">{getMedal(index)}</td>
                  <td className="leaderboard__player">{entry.playerName}</td>
                  <td className="leaderboard__product">
                    {entry.product?.image} {entry.product?.name}
                  </td>
                  <td className="leaderboard__listed">
                    ₹{entry.listedPrice.toLocaleString()}
                  </td>
                  <td className="leaderboard__deal">
                    ₹{entry.finalPrice.toLocaleString()}
                  </td>
                  <td className="leaderboard__savings">
                    ₹{entry.savings.toLocaleString()}
                  </td>
                  <td className="leaderboard__rounds">{entry.roundsUsed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Back Button */}
      <div className="leaderboard__action">
        <button
          className="leaderboard__btn"
          onClick={() => navigate("/")}
        >
          Play Again 🚀
        </button>
      </div>
    </div>
  );
}

export default LeaderboardPage;