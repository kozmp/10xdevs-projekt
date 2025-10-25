import React, { useState } from "react";
import { JobCostEstimateCard } from "./JobCostEstimateCard";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

/**
 * Demo komponent pokazujący różne stany JobCostEstimateCard
 *
 * Demonstruje:
 * 1. Stan ładowania (Loading)
 * 2. Stan pending (kalkulacja w trakcie)
 * 3. Stan sukcesu (koszty obliczone)
 */

type DemoState = "loading" | "pending" | "success";

export default function JobCostEstimateDemo() {
  const [state, setState] = useState<DemoState>("pending");

  const renderCard = () => {
    switch (state) {
      case "loading":
        return <JobCostEstimateCard isLoading={true} />;

      case "pending":
        return (
          <JobCostEstimateCard
            totalCostEstimate={null}
            estimatedTokensTotal={null}
            isLoading={false}
            productCount={10}
          />
        );

      case "success":
        return (
          <JobCostEstimateCard
            totalCostEstimate={0.002158}
            estimatedTokensTotal={5842}
            isLoading={false}
            productCount={10}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Symulator stanów</CardTitle>
          <CardDescription>Przełącz między różnymi stanami komponentu</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button variant={state === "loading" ? "default" : "outline"} onClick={() => setState("loading")}>
            Loading
          </Button>
          <Button variant={state === "pending" ? "default" : "outline"} onClick={() => setState("pending")}>
            Pending
          </Button>
          <Button variant={state === "success" ? "default" : "outline"} onClick={() => setState("success")}>
            Success
          </Button>
        </CardContent>
      </Card>

      {/* Component Preview */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Podgląd komponentu</h2>
        {renderCard()}
      </div>

      {/* State Description */}
      <Card>
        <CardHeader>
          <CardTitle>Opis stanu: {state}</CardTitle>
        </CardHeader>
        <CardContent>
          {state === "loading" && (
            <p className="text-sm text-muted-foreground">
              Stan <strong>Loading</strong> - Komponent pokazuje szkielety podczas pierwszego ładowania danych z API.
              Ten stan jest krótkotrwały.
            </p>
          )}
          {state === "pending" && (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                Stan <strong>Pending</strong> - Job został utworzony, ale koszty są jeszcze obliczane w tle
                (asynchronicznie).
              </p>
              <p>
                W tym stanie komponent wyświetla animowany spinner i informację "Szacowanie kosztów...". Hook{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">useJobCostEstimate</code> robi polling
                co 2 sekundy.
              </p>
            </div>
          )}
          {state === "success" && (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                Stan <strong>Success</strong> - Koszty zostały pomyślnie obliczone i zapisane w bazie danych.
              </p>
              <p>
                Komponent wyświetla:
                <ul className="ml-5 mt-1 list-disc">
                  <li>Całkowity koszt (formatowany jako USD)</li>
                  <li>Koszt per produkt</li>
                  <li>Łączną liczbę tokenów</li>
                  <li>Badge "Obliczono"</li>
                </ul>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Example */}
      <Card>
        <CardHeader>
          <CardTitle>Przykład użycia</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs">
            <code>{`import { useJobCostEstimate } from "@/components/hooks/useJobCostEstimate";
import { JobCostEstimateCard } from "@/components/JobCostEstimateCard";

function JobDetailsPage({ jobId }) {
  const { job, isLoading } = useJobCostEstimate(jobId);

  return (
    <JobCostEstimateCard
      totalCostEstimate={job?.totalCostEstimate}
      estimatedTokensTotal={job?.estimatedTokensTotal}
      isLoading={isLoading}
      productCount={job?.productCount}
    />
  );
}`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
