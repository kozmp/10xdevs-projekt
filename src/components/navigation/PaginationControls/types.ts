export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  className?: string;
  showPageInfo?: boolean;
}

export interface UsePaginationControlsReturn {
  canGoPrev: boolean;
  canGoNext: boolean;
  handlePrevClick: () => void;
  handleNextClick: () => void;
  pageInfo: string;
  shouldRender: boolean;
}
