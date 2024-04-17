import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Room from "./pages/Room";
import Lobby from "./pages/Lobby";

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
]);

export default function App() {
  return <RouterProvider router={router} />;
}
