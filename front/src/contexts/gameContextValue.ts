import { createContext } from "react";
import type { PublicPlayer, PublicRoom, PublicTeam, Session } from "../../../shared/protocol";

export interface GameContextValue {
  connected: boolean;
  /**
   * Id de la room pour laquelle la reprise de session (ou le watch) est terminée.
   * Une page attend `readyRoomId === son id` avant de conclure que la room n'existe pas.
   */
  readyRoomId: string | null;
  session: Session | null;
  room: PublicRoom | null;
  /** Heure serveur - heure locale, pour afficher les comptes à rebours. */
  clockOffset: number;
  me: PublicPlayer | null;
  myTeam: PublicTeam | null;
  startSession: (session: Session, room?: PublicRoom) => void;
  watch: (roomId: string) => void;
  /** Oublie la session mais continue de suivre la room (joueur qui quitte son équipe). */
  forgetSession: () => void;
  /** Oublie tout (retour à l'accueil). */
  leave: () => void;
}

export const GameContext = createContext<GameContextValue | null>(null);
