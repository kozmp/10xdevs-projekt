import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CARD_TEXTS } from "./constants";

export function RecentJobsHeader() {
  return (
    <CardHeader>
      <CardTitle>{CARD_TEXTS.TITLE}</CardTitle>
      <CardDescription>{CARD_TEXTS.DESCRIPTION}</CardDescription>
    </CardHeader>
  );
}
