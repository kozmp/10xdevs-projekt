import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusCardHeader } from "./StatusCardHeader";
import { StatusIndicator } from "./StatusIndicator";
import { useStatusCard } from "./useStatusCard";
import type { StatusCardProps } from "./types";

export function StatusCard({ status, shopName, className, title, onStatusClick }: StatusCardProps) {
  const { getStatusColor, getStatusLabel, getStatusAriaLabel, getDescription, handleStatusClick, isClickable } =
    useStatusCard(status, shopName, onStatusClick);

  return (
    <Card className={className}>
      <StatusCardHeader title={title} description={getDescription()} />
      <CardContent>
        <StatusIndicator
          color={getStatusColor()}
          label={getStatusLabel()}
          ariaLabel={getStatusAriaLabel()}
          onClick={handleStatusClick}
          isClickable={isClickable}
        />
      </CardContent>
    </Card>
  );
}
