export interface StatusCardProps {
  status: boolean;
  shopName?: string;
  className?: string;
  title?: string;
  onStatusClick?: () => void;
}

export interface UseStatusCardReturn {
  getStatusColor: () => string;
  getStatusLabel: () => string;
  getStatusAriaLabel: () => string;
  getDescription: () => string;
  handleStatusClick: () => void;
  isClickable: boolean;
}
