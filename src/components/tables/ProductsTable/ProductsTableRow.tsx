import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import type { Product } from "./types";

interface ProductsTableRowProps {
  product: Product;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onPreview: () => void;
}

export function ProductsTableRow({ product, isSelected, onSelect, onPreview }: ProductsTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        <Checkbox checked={isSelected} onCheckedChange={onSelect} aria-label={`Zaznacz ${product.name}`} />
      </TableCell>
      <TableCell>
        <button onClick={onPreview} className="text-left hover:text-primary">
          {product.name}
        </button>
      </TableCell>
      <TableCell>{product.sku}</TableCell>
      <TableCell>{product.status}</TableCell>
      <TableCell>{product.categories?.map((c) => c.name).join(", ")}</TableCell>
      <TableCell>{new Date(product.updated_at).toLocaleString()}</TableCell>
    </TableRow>
  );
}
