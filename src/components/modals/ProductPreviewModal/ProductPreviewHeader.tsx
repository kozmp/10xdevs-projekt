import React from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Product } from "./types";

interface ProductPreviewHeaderProps {
  product: Product | null;
  loading: boolean;
}

export function ProductPreviewHeader({ product, loading }: ProductPreviewHeaderProps) {
  return (
    <DialogHeader>
      <DialogTitle>{loading ? "Ładowanie..." : product?.name || "Szczegóły produktu"}</DialogTitle>
      <DialogDescription>{product?.sku && `SKU: ${product.sku}`}</DialogDescription>
    </DialogHeader>
  );
}
