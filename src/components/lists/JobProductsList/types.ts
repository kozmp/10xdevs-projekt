export interface TokenUsageDetails {
  input: number;
  output: number;
}

export interface JobProduct {
  productId: string;
  status: "pending" | "processing" | "completed" | "failed";
  cost: number | null;
  tokenUsageDetails: string | null;
}

export interface JobProductsListProps {
  products: JobProduct[];
}

export interface UseJobProductsListReturn {
  getStatusLabel: (status: JobProduct["status"]) => string;
  getStatusColor: (status: JobProduct["status"]) => string;
  getTokenCount: (details: string | null) => number | null;
  formatCost: (cost: number | null) => string;
  formatTokens: (count: number | null) => string;
}
