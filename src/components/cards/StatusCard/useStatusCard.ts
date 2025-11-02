import { useCallback } from "react";
import { CARD_TEXTS, STATUS_COLORS, STATUS_ARIA_LABELS } from "./constants";
import type { UseStatusCardReturn } from "./types";

export function useStatusCard(status: boolean, shopName?: string, onStatusClick?: () => void): UseStatusCardReturn {
  const getStatusColor = useCallback(() => {
    return status ? STATUS_COLORS.ACTIVE : STATUS_COLORS.ERROR;
  }, [status]);

  const getStatusLabel = useCallback(() => {
    return status ? CARD_TEXTS.STATUS_ACTIVE : CARD_TEXTS.STATUS_ERROR;
  }, [status]);

  const getStatusAriaLabel = useCallback(() => {
    return status ? STATUS_ARIA_LABELS.ACTIVE : STATUS_ARIA_LABELS.ERROR;
  }, [status]);

  const getDescription = useCallback(() => {
    if (shopName) {
      return CARD_TEXTS.DESCRIPTION_WITH_SHOP.replace("{shopName}", shopName);
    }
    return CARD_TEXTS.DESCRIPTION_DEFAULT;
  }, [shopName]);

  const handleStatusClick = useCallback(() => {
    if (onStatusClick) {
      onStatusClick();
    }
  }, [onStatusClick]);

  const isClickable = Boolean(onStatusClick);

  return {
    getStatusColor,
    getStatusLabel,
    getStatusAriaLabel,
    getDescription,
    handleStatusClick,
    isClickable,
  };
}
