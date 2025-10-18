import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface JobProductsListHeaderProps {
  productsCount: number;
}

export function JobProductsListHeader({ productsCount }: JobProductsListHeaderProps) {
  return (
    <CardHeader>
      <CardTitle>{productsCount > 0 ? `Produkty (${productsCount})` : "Produkty"}</CardTitle>
      <CardDescription>Lista produktów w zleceniu</CardDescription>
    </CardHeader>
  );
}
