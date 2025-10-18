import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Job } from "./types";

interface JobsTableRowProps {
  job: Job;
  formatDate: (dateString: string | null) => string;
  getStatusLabel: (status: Job["status"]) => string;
  getStatusColor: (status: Job["status"]) => string;
  getPublicationModeLabel: (mode: Job["publicationMode"]) => string;
  onRowClick: (jobId: string) => void;
}

export function JobsTableRow({
  job,
  formatDate,
  getStatusLabel,
  getStatusColor,
  getPublicationModeLabel,
  onRowClick,
}: JobsTableRowProps) {
  return (
    <TableRow onClick={() => onRowClick(job.jobId)} className="cursor-pointer hover:bg-muted/50">
      <TableCell className="font-mono text-sm">{job.jobId.slice(0, 8)}...</TableCell>
      <TableCell>
        <span className={getStatusColor(job.status)}>{getStatusLabel(job.status)}</span>
      </TableCell>
      <TableCell>{job.style}</TableCell>
      <TableCell className="uppercase">{job.language}</TableCell>
      <TableCell>{getPublicationModeLabel(job.publicationMode)}</TableCell>
      <TableCell>{formatDate(job.createdAt)}</TableCell>
      <TableCell className="text-right">
        {job.totalCostEstimate ? `$${job.totalCostEstimate.toFixed(2)}` : "-"}
      </TableCell>
    </TableRow>
  );
}
