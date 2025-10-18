import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { STYLES } from "./constants";
import type { JobListDTO } from "@/types";

interface RecentJobsRowProps {
  job: JobListDTO;
  onRowClick: (jobId: string) => void;
  formatDate: (date: string | null) => string;
  getStatusLabel: (status: string) => string;
  getStatusColor: (status: string) => string;
}

export function RecentJobsRow({ job, onRowClick, formatDate, getStatusLabel, getStatusColor }: RecentJobsRowProps) {
  return (
    <TableRow key={job.jobId} onClick={() => onRowClick(job.jobId)} className={STYLES.ROW}>
      <TableCell className={STYLES.ID_CELL}>{job.jobId.slice(0, 8)}</TableCell>
      <TableCell>
        <span className={getStatusColor(job.status)}>{getStatusLabel(job.status)}</span>
      </TableCell>
      <TableCell>{job.style}</TableCell>
      <TableCell className="uppercase">{job.language}</TableCell>
      <TableCell>{formatDate(job.createdAt)}</TableCell>
    </TableRow>
  );
}
