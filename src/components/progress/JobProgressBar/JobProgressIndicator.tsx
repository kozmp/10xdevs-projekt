import React from "react";
import { Progress } from "@/components/ui/progress";

interface JobProgressIndicatorProps {
  progressPercentage: number;
  completedProducts: number;
  totalProducts: number;
}

export function JobProgressIndicator({
  progressPercentage,
  completedProducts,
  totalProducts,
}: JobProgressIndicatorProps) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm text-muted-foreground">
          {completedProducts} / {totalProducts} produktów
        </span>
        <span className="text-sm font-medium">{progressPercentage.toFixed(0)}%</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
}
