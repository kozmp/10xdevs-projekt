import React from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { RecentJobsHeader } from "./RecentJobsHeader";
import { RecentJobsRow } from "./RecentJobsRow";
import { RecentJobsEmpty } from "./RecentJobsEmpty";
import { useRecentJobs } from "./useRecentJobs";
import { TABLE_HEADERS } from "./constants";
import type { RecentJobsTableProps } from "./types";

export function RecentJobsTable({ jobs, className, maxItems = 5, onJobClick }: RecentJobsTableProps) {
  const { formatDate, handleRowClick, getStatusLabel, getStatusColor, shouldShowEmptyState } = useRecentJobs(
    jobs,
    onJobClick
  );

  if (shouldShowEmptyState) {
    return (
      <Card className={className}>
        <RecentJobsHeader />
        <RecentJobsEmpty />
      </Card>
    );
  }

  const displayedJobs = jobs.slice(0, maxItems);

  return (
    <Card className={className}>
      <RecentJobsHeader />
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {TABLE_HEADERS.map((header) => (
                <TableHead key={header.key}>{header.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedJobs.map((job) => (
              <RecentJobsRow
                key={job.jobId}
                job={job}
                onRowClick={handleRowClick}
                formatDate={formatDate}
                getStatusLabel={getStatusLabel}
                getStatusColor={getStatusColor}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
