import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { JobProductsListHeader } from "./JobProductsListHeader";
import { JobProductsTable } from "./JobProductsTable";
import { useJobProductsList } from "./useJobProductsList";
import type { JobProductsListProps } from "./types";

export function JobProductsList({ products }: JobProductsListProps) {
  const { getStatusLabel, getStatusColor, getTokenCount, formatCost, formatTokens } = useJobProductsList();

  if (products.length === 0) {
    return (
      <Card>
        <JobProductsListHeader productsCount={0} />
        <CardContent>
          <p className="text-sm text-muted-foreground">Brak produktów</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <JobProductsListHeader productsCount={products.length} />
      <CardContent>
        <JobProductsTable
          products={products}
          getStatusLabel={getStatusLabel}
          getStatusColor={getStatusColor}
          getTokenCount={getTokenCount}
          formatCost={formatCost}
          formatTokens={formatTokens}
        />
      </CardContent>
    </Card>
  );
}
