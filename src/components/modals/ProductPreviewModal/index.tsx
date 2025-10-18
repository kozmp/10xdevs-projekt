import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProductPreviewHeader } from "./ProductPreviewHeader";
import { ProductPreviewContent } from "./ProductPreviewContent";
import { useProductPreview } from "./useProductPreview";
import type { ProductPreviewModalProps } from "./types";

export function ProductPreviewModal({ productId, onClose }: ProductPreviewModalProps) {
  const { product, loading, error, formattedDate, lastSyncedDate, sanitizeHTML } = useProductPreview(productId);

  const open = productId !== null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto" showCloseButton>
        <ProductPreviewHeader product={product} loading={loading} />

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
              <p className="mt-4 text-muted-foreground">Ładowanie szczegółów produktu...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="text-red-500 text-3xl mb-2">⚠️</div>
            <p className="text-red-500">{error.message}</p>
          </div>
        )}

        {!loading && !error && !product && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Brak produktu</p>
          </div>
        )}

        {product && !loading && !error && (
          <ProductPreviewContent
            product={product}
            sanitizeHTML={sanitizeHTML}
            formattedDate={formattedDate}
            lastSyncedDate={lastSyncedDate}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
