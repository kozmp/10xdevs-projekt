import React from "react";
import { CardContent } from "@/components/ui/card";
import { CARD_TEXTS } from "./constants";

export function RecentJobsEmpty() {
  return (
    <CardContent>
      <p className="text-sm text-muted-foreground">{CARD_TEXTS.NO_JOBS}</p>
    </CardContent>
  );
}
