import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { JobProductDTO } from "@/types";

interface JobProductsListProps {
  products: JobProductDTO[];
}

const statusLabels: Record<string, string> = {
  pending: "Oczekujący",
  processing: "W trakcie",
  completed: "Zakończony",
  failed: "Błąd",
};

const statusColors: Record<string, string> = {
  pending: "text-yellow-600",
  processing: "text-blue-600",
  completed: "text-green-600",
  failed: "text-red-600",
};

export function JobProductsList({ products }: JobProductsListProps) {
  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produkty</CardTitle>
          <CardDescription>Lista produktów w zleceniu</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Brak produktów</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produkty ({products.length})</CardTitle>
        <CardDescription>Lista produktów w zleceniu</CardDescription>
      </CardHeader>
      <CardContent>
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
              const tokens = product.tokenUsageDetails ? JSON.parse(product.tokenUsageDetails as any) : null;
              const totalTokens = tokens ? (tokens.input || 0) + (tokens.output || 0) : null;

              return (
                <TableRow key={product.productId}>
                  <TableCell className="font-mono text-sm">{product.productId.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <span className={statusColors[product.status] || "text-gray-600"}>
                      {statusLabels[product.status] || product.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{product.cost ? `$${product.cost.toFixed(4)}` : "-"}</TableCell>
                  <TableCell className="text-right">{totalTokens ? totalTokens.toLocaleString() : "-"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
