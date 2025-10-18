import React from "react";
import { Table, TableBody } from "@/components/ui/table";
import { JobsTableHeader } from "./JobsTableHeader";
import { JobsTableRow } from "./JobsTableRow";
import { useJobsTable } from "./useJobsTable";
import type { JobsTableProps } from "./types";

export function JobsTable({ jobs }: JobsTableProps) {
  const { formatDate, handleRowClick, getStatusLabel, getStatusColor, getPublicationModeLabel } = useJobsTable();

  if (jobs.length === 0) {
    return <div className="text-center py-8 text-muted-foreground border rounded-md">Brak zleceń do wyświetlenia</div>;
  }

  return (
    <div className="border rounded-md">
      <Table>
        <JobsTableHeader />
        <TableBody>
          {jobs.map((job) => (
            <JobsTableRow
              key={job.jobId}
              job={job}
              formatDate={formatDate}
              getStatusLabel={getStatusLabel}
              getStatusColor={getStatusColor}
              getPublicationModeLabel={getPublicationModeLabel}
              onRowClick={handleRowClick}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
