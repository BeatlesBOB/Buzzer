/** Lien encodé dans le QR code : un appareil photo classique ouvre directement le lobby. */
export const lobbyUrl = (roomId: string) => `${window.location.origin}/lobby/${roomId}`;

/** Accepte un lien de lobby ou un id brut (QR code, champ texte). */
export const parseRoomId = (value: string) => {
  const trimmed = value.trim();
  const match = trimmed.match(/\/lobby\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : trimmed;
};
