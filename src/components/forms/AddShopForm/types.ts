import type { AddShopFormData } from "./schema";

export interface AddShopFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  redirectUrl?: string;
}

export interface UseAddShopFormReturn {
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
  handleSubmit: (data: AddShopFormData) => Promise<void>;
  form: ReturnType<typeof useForm<AddShopFormData>>;
}

export interface AddShopApiResponse {
  success: boolean;
  error?: string;
  data?: {
    id: string;
    domain: string;
  };
}
