export interface ProductCategory {
  id: string;
  name: string;
}

export interface ProductCollection {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  status: "published" | "draft";
  shortDescription: string | null;
  longDescription: string | null;
  categories: ProductCategory[];
  collections: ProductCollection[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  lastSyncedAt: string | null;
}

export interface ProductPreviewModalProps {
  productId: string | null;
  onClose: () => void;
}

export interface UseProductPreviewReturn {
  product: Product | null;
  loading: boolean;
  error: Error | null;
  formattedDate: string;
  lastSyncedDate: string;
  sanitizeHTML: (html: string | null) => string;
}
