import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductsCountCardProps {
  count: number;
}

export function ProductsCountCard({ count }: ProductsCountCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Produkty</CardTitle>
        <CardDescription>Łączna liczba produktów w sklepie</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{count}</div>
      </CardContent>
    </Card>
  );
}
