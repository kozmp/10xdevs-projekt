import { useMemo, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { JobListDTO } from "@/types";

interface JobsTableProps {
  jobs: JobListDTO[];
}

const statusLabels: Record<string, string> = {
  pending: "Oczekujący",
  processing: "W trakcie",
  completed: "Zakończony",
  failed: "Błąd",
  cancelled: "Anulowany",
};

const statusColors: Record<string, string> = {
  pending: "text-yellow-600",
  processing: "text-blue-600",
  completed: "text-green-600",
  failed: "text-red-600",
  cancelled: "text-gray-600",
};

export function JobsTable({ jobs }: JobsTableProps) {
  const formatDate = useCallback((dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pl-PL", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  }, []);

  const handleRowClick = useCallback((jobId: string) => {
    window.location.href = `/jobs/${jobId}`;
  }, []);

  const tableRows = useMemo(
    () =>
      jobs.map((job) => (
        <TableRow
          key={job.jobId}
          onClick={() => handleRowClick(job.jobId)}
          className="cursor-pointer hover:bg-muted/50"
        >
          <TableCell className="font-mono text-sm">{job.jobId.slice(0, 8)}...</TableCell>
          <TableCell>
            <span className={statusColors[job.status] || "text-gray-600"}>
              {statusLabels[job.status] || job.status}
            </span>
          </TableCell>
          <TableCell>{job.style}</TableCell>
          <TableCell className="uppercase">{job.language}</TableCell>
          <TableCell>{job.publicationMode === "draft" ? "Szkic" : "Opublikuj"}</TableCell>
          <TableCell>{formatDate(job.createdAt)}</TableCell>
          <TableCell className="text-right">
            {job.totalCostEstimate ? `$${job.totalCostEstimate.toFixed(2)}` : "-"}
          </TableCell>
        </TableRow>
      )),
    [jobs, formatDate, handleRowClick]
  );

  if (jobs.length === 0) {
    return <div className="text-center py-8 text-muted-foreground border rounded-md">Brak zleceń do wyświetlenia</div>;
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Styl</TableHead>
            <TableHead>Język</TableHead>
            <TableHead>Tryb publikacji</TableHead>
            <TableHead>Data utworzenia</TableHead>
            <TableHead className="text-right">Koszt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{tableRows}</TableBody>
      </Table>
    </div>
  );
}
