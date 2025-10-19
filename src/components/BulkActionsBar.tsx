import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BulkActionsBarProps {
  selectedCount: number;
  maxLimit: number;
  onGenerate: () => void;
  onClear: () => void;
}

export function BulkActionsBar({ selectedCount, maxLimit, onGenerate, onClear }: BulkActionsBarProps) {
  const isDisabled = selectedCount === 0;
  const isMaxReached = selectedCount >= maxLimit;

  const handleGenerate = useCallback(() => {
    if (!isDisabled) {
      onGenerate();
    }
  }, [isDisabled, onGenerate]);

  // Don't show bar if no items selected
  if (selectedCount === 0) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-1/2 -translate-x-1/2 p-4 shadow-lg z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Zaznaczono:</span>
          <span className={`text-lg font-bold ${isMaxReached ? "text-red-500" : "text-primary"}`}>{selectedCount}</span>
          <span className="text-sm text-muted-foreground">/ {maxLimit}</span>
        </div>

        {isMaxReached && (
          <span className="text-xs text-red-500" role="alert">
            Osiągnięto maksymalny limit
          </span>
        )}

        <div className="flex gap-2 ml-4">
          <Button variant="outline" size="sm" onClick={onClear} aria-label="Wyczyść zaznaczenie">
            Wyczyść
          </Button>
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={isDisabled}
            aria-label={`Generuj opisy dla ${selectedCount} produktów`}
          >
            Generuj opisy ({selectedCount})
          </Button>
        </div>
      </div>
    </Card>
  );
}
