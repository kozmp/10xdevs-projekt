import { useMemo } from "react";
import { useProductDetail } from "@/components/hooks/useProductDetail";
import { DATE_FORMAT_OPTIONS } from "./constants";
import type { UseProductPreviewReturn } from "./types";

export function useProductPreview(productId: string | null): UseProductPreviewReturn {
  const { product, loading, error } = useProductDetail(productId);

  const formattedDate = useMemo(() => {
    if (!product?.createdAt) return "-";
    return new Intl.DateTimeFormat("pl-PL", DATE_FORMAT_OPTIONS).format(new Date(product.createdAt));
  }, [product]);

  const lastSyncedDate = useMemo(() => {
    if (!product?.lastSyncedAt) return "-";
    return new Intl.DateTimeFormat("pl-PL", DATE_FORMAT_OPTIONS).format(new Date(product.lastSyncedAt));
  }, [product]);

  const sanitizeHTML = (html: string | null): string => {
    if (!html) return "Brak danych";
    // Basic sanitization - remove script tags
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  };

  return {
    product,
    loading,
    error,
    formattedDate,
    lastSyncedDate,
    sanitizeHTML,
  };
}
