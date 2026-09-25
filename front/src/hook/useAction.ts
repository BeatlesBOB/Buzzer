import { useCallback } from "react";
import type { AckResponse } from "../../../shared/protocol";
import { ERROR_MESSAGES, ERROR_TITLE } from "../lib/errors";
import useToasts from "./useToasts";

/** Affiche un toast si l'action a échoué et renvoie la réponse telle quelle. */
export default function useAction() {
  const { pushToast } = useToasts();
  return useCallback(
    async <T,>(promise: Promise<AckResponse<T>>) => {
      const res = await promise;
      if (!res.ok) pushToast({ title: ERROR_TITLE, desc: ERROR_MESSAGES[res.error] });
      return res;
    },
    [pushToast]
  );
}
