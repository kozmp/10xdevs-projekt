import type { GenerateFormData } from "./schema";

export interface GenerateFormProps {
  selectedProductIds: string[];
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface GenerateFormResult {
  productId: string;
  status: "success" | "error";
  data?: {
    shortDescription: string;
    longDescription: string;
    metaDescription: string;
  };
  error?: string;
}

export interface GenerateFormSummary {
  total: number;
  success: number;
  error: number;
}

export interface UseGenerateFormReturn {
  isGenerating: boolean;
  progress: number;
  results: GenerateFormResult[];
  summary: GenerateFormSummary | null;
  error: string | null;
  handleSubmit: (data: GenerateFormData) => Promise<void>;
}
