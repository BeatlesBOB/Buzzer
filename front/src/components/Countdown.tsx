import useNow from "../hook/useNow";

/** Secondes restantes avant `expiresAt` (heure serveur), corrigées du décalage d'horloge. */
export default function Countdown({ expiresAt, clockOffset }: { expiresAt: number; clockOffset: number }) {
  const now = useNow(true, 200);
  const left = Math.max(0, Math.ceil((expiresAt - (now + clockOffset)) / 1000));
  return <span className="tabular-nums">{left}s</span>;
}
