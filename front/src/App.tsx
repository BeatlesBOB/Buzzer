import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Room from "./pages/Room";
import Lobby from "./pages/Lobby";
import Admin from "./pages/Admin";
import Buzzer from "./pages/Buzzer";

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
    path: "room/:id",
    element: <Room />,
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
  return <RouterProvider router={router} />;
}
