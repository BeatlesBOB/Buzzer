import React from "react";
import ReactDOM from "react-dom/client";
import GameProvider from "./contexts/GameContext.tsx";
import ToastProvider from "./contexts/ToastContext.tsx";
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <GameProvider>
        <App />
      </GameProvider>
    </ToastProvider>
  </React.StrictMode>
);
