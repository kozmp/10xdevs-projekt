import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { JobProgressHeader } from "./JobProgressHeader";
import { JobProgressIndicator } from "./JobProgressIndicator";
import { JobProgressMessage } from "./JobProgressMessage";
import { useJobProgressBar } from "./useJobProgressBar";
import type { JobProgressBarProps } from "./types";

export function JobProgressBar({ progress, status, totalProducts, completedProducts }: JobProgressBarProps) {
  const { progressPercentage, statusLabel, statusColor, statusMessage } = useJobProgressBar(progress, status);

  return (
    <Card>
      <JobProgressHeader statusLabel={statusLabel} statusColor={statusColor} />
      <CardContent className="space-y-4">
        <JobProgressIndicator
          progressPercentage={progressPercentage}
          completedProducts={completedProducts}
          totalProducts={totalProducts}
        />
        <JobProgressMessage status={status} message={statusMessage} />
      </CardContent>
    </Card>
  );
}
