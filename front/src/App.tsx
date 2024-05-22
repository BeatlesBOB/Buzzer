import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import Admin from "./pages/Admin";
import Buzzer from "./pages/Buzzer";
import { useEffect } from "react";
import useToasts from "./hook/useToasts";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "lobby/:id",
    element: <Lobby />,
  },
  {
    path: "admin/:id",
    element: <Admin />,
  },
  {
    path: "buzzer/:id",
    element: <Buzzer />,
  },
]);

export default function App() {
  const { pushToast } = useToasts();

  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    async function makeDeviceWakeLocked() {
      try {
        wakeLock = await navigator.wakeLock.request("screen");
      } catch (err: any) {
        pushToast({
          title: "Whooops nan mais on savais que ça pouvais pas etre parfait",
          desc: `${err.name}, ${err.message}`,
        });
      }
    }

    makeDeviceWakeLocked();

    return () => {
      if (wakeLock) {
        wakeLock.release().then(() => {
          wakeLock = null;
        });
      }
    };
  }, []);

  return <RouterProvider router={router} />;
}
