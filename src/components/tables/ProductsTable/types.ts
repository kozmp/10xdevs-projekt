export interface Product {
  id: string;
  name: string;
  sku: string;
  status: 'active' | 'draft' | 'archived';
  categories: Array<{
    id: string;
    name: string;
  }>;
  updated_at: string;
  description?: string;
  price?: number;
  images?: string[];
}

export interface ProductsTablePagination {
  page: number;
  limit: number;
  total: number;
}

export interface ProductsTableProps {
  products: Product[];
  loading: boolean;
  selectedIds: string[];
  onSelectIds: (ids: string[]) => void;
  pagination: ProductsTablePagination;
  onPaginationChange: (page: number) => void;
}

export interface UseProductsTableReturn {
  handleSelectAll: (checked: boolean) => void;
  handleSelectOne: (checked: boolean, id: string) => void;
  previewProduct: Product | null;
  setPreviewProduct: (product: Product | null) => void;
  isAllSelected: boolean;
  isSelected: (id: string) => boolean;
}
