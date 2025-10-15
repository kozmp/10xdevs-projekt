import { Button } from '@/components/ui/button';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: PaginationControlsProps) {
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Strona {currentPage} z {totalPages}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrev || isLoading}
          aria-label="Poprzednia strona"
        >
          Poprzednia
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext || isLoading}
          aria-label="Następna strona"
        >
          Następna
        </Button>
      </div>
    </div>
  );
}
