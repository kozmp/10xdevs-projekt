import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function JobsTableHeader() {
  return (
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
  );
}
