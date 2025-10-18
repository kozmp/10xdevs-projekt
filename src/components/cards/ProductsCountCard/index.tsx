import React from "react";
import { Card } from "@/components/ui/card";
import { ProductsCountHeader } from "./ProductsCountHeader";
import { ProductsCountDisplay } from "./ProductsCountDisplay";
import { useProductsCount } from "./useProductsCount";
import type { ProductsCountCardProps } from "./types";

export function ProductsCountCard({ count, className, title, description, onCountClick }: ProductsCountCardProps) {
  const { formattedCount, handleCountClick, isClickable } = useProductsCount(count, onCountClick);

  return (
    <Card className={className}>
      <ProductsCountHeader title={title} description={description} />
      <ProductsCountDisplay count={formattedCount} onClick={handleCountClick} isClickable={isClickable} />
    </Card>
  );
}
