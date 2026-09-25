import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import Admin from "./pages/Admin";
import Buzzer from "./pages/Buzzer";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "lobby/:id", element: <Lobby /> },
  { path: "admin/:id", element: <Admin /> },
  { path: "buzzer/:id", element: <Buzzer /> },
]);

/** Empêche l'écran de s'éteindre en pleine partie. Le navigateur relâche le verrou quand l'onglet est masqué. */
function useWakeLock() {
  useEffect(() => {
    if (!("wakeLock" in navigator)) return;
    let sentinel: WakeLockSentinel | null = null;
    const request = () => {
      if (document.visibilityState !== "visible") return;
      navigator.wakeLock
        .request("screen")
        .then((s) => (sentinel = s))
        .catch(() => {}); // refusé (batterie faible…) : pas bloquant
    };
    request();
    document.addEventListener("visibilitychange", request);
    return () => {
      document.removeEventListener("visibilitychange", request);
      sentinel?.release();
    };
  }, []);
}

export default function App() {
  useWakeLock();
  return <RouterProvider router={router} />;
}
