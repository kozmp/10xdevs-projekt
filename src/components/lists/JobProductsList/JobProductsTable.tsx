import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { JobProduct } from "./types";

interface JobProductsTableProps {
  products: JobProduct[];
  getStatusLabel: (status: JobProduct["status"]) => string;
  getStatusColor: (status: JobProduct["status"]) => string;
  getTokenCount: (details: string | null) => number | null;
  formatCost: (cost: number | null) => string;
  formatTokens: (count: number | null) => string;
}

export function JobProductsTable({
  products,
  getStatusLabel,
  getStatusColor,
  getTokenCount,
  formatCost,
  formatTokens,
}: JobProductsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID Produktu</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Koszt</TableHead>
          <TableHead className="text-right">Tokeny</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => {
          const totalTokens = getTokenCount(product.tokenUsageDetails);

          return (
            <TableRow key={product.productId}>
              <TableCell className="font-mono text-sm">{product.productId.slice(0, 8)}...</TableCell>
              <TableCell>
                <span className={getStatusColor(product.status)}>{getStatusLabel(product.status)}</span>
              </TableCell>
              <TableCell className="text-right">{formatCost(product.cost)}</TableCell>
              <TableCell className="text-right">{formatTokens(totalTokens)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
