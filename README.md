# 🤝 Negotiation Game

An AI-powered negotiation game where you interact with an AI seller to purchase a product at the lowest possible price. The AI has hidden constraints like minimum price, target profit, and negotiation personality — your goal is to outsmart it through reasoning, timing, and tactics.

---

## 🎮 How to Play

1. Enter your name
2. Choose a product to negotiate
3. Chat with the AI seller — make offers or convince it with reasons
4. The lower the price you get, the higher you rank on the leaderboard
5. You have 6 rounds to close the deal

---

## 🧠 AI Seller Personalities

| Personality | Behavior |
|-------------|----------|
| 😤 Stubborn | Very firm, rarely budges |
| 😊 Friendly | Open to fair deals |
| 😰 Desperate | Needs to sell urgently, more flexible |

---

## 🛠️ Tech Stack

**Frontend**
- React + Vite
- React Router DOM
- Axios
- SCSS
- React Hot Toast

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Groq AI (llama-3.3-70b-versatile)

---

## 📁 Folder Structure
```
negotiation-game/
├── client/                   → React Frontend
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       └── styles/
│
└── server/                   → Node + Express Backend
    └── src/
        ├── controllers/
        ├── data/
        ├── models/
        ├── routes/
        └── services/
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Groq API Key — [console.groq.com](https://console.groq.com)

### Backend Setup
```bash
cd server
npm install
```

Create `.env` file in `server/` —
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/negotiation-game
GROQ_API_KEY=your_groq_api_key_here
```

Seed the database —
```bash
npm run seed
```

Start the server —
```bash
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/game/products | Get all products |
| POST | /api/game/start | Start a new game session |
| POST | /api/game/:sessionId/offer | Submit offer or message |
| GET | /api/game/:sessionId | Get session details |
| POST | /api/leaderboard/save | Save deal to leaderboard |
| GET | /api/leaderboard | Get top 10 leaderboard |

---

## ✨ Features

- 🤖 AI seller with hidden constraints and personality
- 💬 Real conversation — Hinglish + English support
- 🧠 Emotional intelligence — student discount, logical reasoning
- 🏆 Global leaderboard — ranked by savings
- 📱 Fully responsive — mobile + desktop
- 🔔 Toast notifications — real-time feedback