import { BrowserRouter } from "react-router-dom";
import AppRoutes from "../src/AppRoutes.jsx";
import { GameProvider } from "./context/GameContext";

function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <AppRoutes />
      </GameProvider>
    </BrowserRouter>
  );
}

export default App;