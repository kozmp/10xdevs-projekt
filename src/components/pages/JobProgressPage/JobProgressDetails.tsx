import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Job } from "./types";

interface JobProgressDetailsProps {
  job: Job;
  formattedDate: string;
  totalCost: number;
}

export function JobProgressDetails({ job, formattedDate, totalCost }: JobProgressDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Szczegóły zlecenia</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-sm text-muted-foreground">Data utworzenia</div>
          <div className="font-medium">{formattedDate}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Styl</div>
          <div className="font-medium">{job.style}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Język</div>
          <div className="font-medium uppercase">{job.language}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Tryb publikacji</div>
          <div className="font-medium">{job.publicationMode === "draft" ? "Szkic" : "Opublikuj"}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Szacowany koszt</div>
          <div className="font-medium">${job.totalCostEstimate?.toFixed(2) || "0.00"}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Rzeczywisty koszt</div>
          <div className="font-bold text-lg">${totalCost.toFixed(2)}</div>
        </div>
      </CardContent>
    </Card>
  );
}
