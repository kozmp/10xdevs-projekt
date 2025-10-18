import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CARD_TEXTS } from "./constants";

interface StatusCardHeaderProps {
  title?: string;
  description: string;
}

export function StatusCardHeader({ title = CARD_TEXTS.TITLE, description }: StatusCardHeaderProps) {
  return (
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  );
}
