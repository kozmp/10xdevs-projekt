import React from "react";

interface PaginationInfoProps {
  pageInfo: string;
}

export function PaginationInfo({ pageInfo }: PaginationInfoProps) {
  return <div className="text-sm text-muted-foreground">{pageInfo}</div>;
}
