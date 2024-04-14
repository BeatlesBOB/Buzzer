import React from "react";
import ReactDOM from "react-dom/client";
import SocketContextrovider from "./contexts/SocketContextProvider.tsx";
import GameContextProvider from "./contexts/GameContextProvider.tsx";
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SocketContextrovider>
      <GameContextProvider>
        <App />
      </GameContextProvider>
    </SocketContextrovider>
  </React.StrictMode>
);
