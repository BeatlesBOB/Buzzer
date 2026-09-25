import useGame from "../hook/useGame";

/** Visible pendant une coupure : socket.io se reconnecte seul, puis la session est reprise. */
export default function ConnectionBanner() {
  const { connected } = useGame();
  if (connected) return null;
  return (
    <div role="status" className="fixed top-0 inset-x-0 z-50 bg-black text-white text-center font-primary py-2">
      Connexion perdue, reconnexion en cours…
    </div>
  );
}
