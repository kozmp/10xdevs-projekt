import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface ProductsTableHeaderProps {
  isAllSelected: boolean;
  onSelectAll: (checked: boolean) => void;
}

export function ProductsTableHeader({ isAllSelected, onSelectAll }: ProductsTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-12">
          <Checkbox checked={isAllSelected} onCheckedChange={onSelectAll} aria-label="Zaznacz wszystkie" />
        </TableHead>
        <TableHead>Nazwa</TableHead>
        <TableHead>SKU</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Kategorie</TableHead>
        <TableHead>Ostatnia aktualizacja</TableHead>
      </TableRow>
    </TableHeader>
  );
}
