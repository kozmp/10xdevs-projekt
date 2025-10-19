import { useId, useCallback } from "react";
import { PUBLICATION_MODES } from "./constants";
import type { PublicationMode, UsePublicationModeSelectReturn } from "./types";

export function usePublicationModeSelect(): UsePublicationModeSelectReturn {
  const groupId = useId();

  const getItemId = useCallback(
    (value: PublicationMode) => {
      return `${groupId}-${value}`;
    },
    [groupId]
  );

  return {
    groupId,
    modes: PUBLICATION_MODES,
    getItemId,
  };
}
