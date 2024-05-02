import React from "react";
import ReactDOM from "react-dom/client";
import GameContextProvider from "./contexts/GameContextProvider.tsx";
import App from "./App.tsx";
import "./index.css";
import ToastProvider from "./contexts/ToastContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <GameContextProvider>
        <App />
      </GameContextProvider>
    </ToastProvider>
  </React.StrictMode>
);
