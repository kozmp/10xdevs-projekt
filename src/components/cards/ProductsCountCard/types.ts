export interface ProductsCountCardProps {
  count: number;
  className?: string;
  title?: string;
  description?: string;
  onCountClick?: () => void;
}

export interface UseProductsCountReturn {
  formattedCount: string;
  handleCountClick: () => void;
  isClickable: boolean;
}
