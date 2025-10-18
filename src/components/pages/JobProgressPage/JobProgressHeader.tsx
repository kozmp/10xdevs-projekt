import React from "react";
import { Button } from "@/components/ui/button";

interface JobProgressHeaderProps {
  jobId: string;
  canCancel: boolean;
  onCancelClick: () => void;
  onBackClick: () => void;
}

export function JobProgressHeader({ jobId, canCancel, onCancelClick, onBackClick }: JobProgressHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold">Postęp zlecenia</h1>
        <p className="text-sm text-muted-foreground mt-1">
          ID: <span className="font-mono">{jobId}</span>
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onBackClick}>
          Wróć do listy
        </Button>
        {canCancel && (
          <Button variant="destructive" onClick={onCancelClick}>
            Anuluj zlecenie
          </Button>
        )}
      </div>
    </div>
  );
}
