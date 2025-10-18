import React from "react";
import { Button } from "@/components/ui/button";

interface JobsHistoryHeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export function JobsHistoryHeader({ onRefresh, isLoading }: JobsHistoryHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold">Historia zleceń</h1>
      <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
        Odśwież
      </Button>
    </div>
  );
}
