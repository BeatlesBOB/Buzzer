import React from "react";
import ReactDOM from "react-dom/client";
import SocketProvider from "./contexts/SocketProvider.tsx";
import GameContextProvider from "./contexts/GameContextProvider.tsx";
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SocketProvider>
      <GameContextProvider>
        <App />
      </GameContextProvider>
    </SocketProvider>
  </React.StrictMode>
);
