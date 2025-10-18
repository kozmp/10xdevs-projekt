import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CARD_TEXTS } from "./constants";

interface ProductsCountHeaderProps {
  title?: string;
  description?: string;
}

export function ProductsCountHeader({
  title = CARD_TEXTS.TITLE,
  description = CARD_TEXTS.DESCRIPTION,
}: ProductsCountHeaderProps) {
  return (
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  );
}
