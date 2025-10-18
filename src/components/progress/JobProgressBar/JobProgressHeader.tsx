import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface JobProgressHeaderProps {
  statusLabel: string;
  statusColor: string;
}

export function JobProgressHeader({ statusLabel, statusColor }: JobProgressHeaderProps) {
  return (
    <CardHeader>
      <CardTitle>Postęp generowania</CardTitle>
      <CardDescription>
        <span className={statusColor}>{statusLabel}</span>
      </CardDescription>
    </CardHeader>
  );
}
