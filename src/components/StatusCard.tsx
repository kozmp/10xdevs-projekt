import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StatusCardProps {
  status: boolean;
  shopName?: string;
}

export function StatusCard({ status, shopName }: StatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status połączenia</CardTitle>
        <CardDescription>{shopName ? `Sklep: ${shopName}` : "Sprawdź połączenie z API"}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div
            className={`h-3 w-3 rounded-full ${status ? "bg-green-500" : "bg-yellow-500"}`}
            aria-label={status ? "Połączono" : "Nieskonfigurowany"}
          />
          <span className="text-sm font-medium">{status ? "Aktywne" : "Nieskonfigurowany"}</span>
        </div>
      </CardContent>
    </Card>
  );
}
