import type { GenerationStyle, GenerationLanguage } from "@/lib/services/product-description-generator.service";
import type { Control } from "react-hook-form";

export interface FormControlProps<T> {
  name: string;
  control: Control<any>;
  label?: string;
  description?: string;
  error?: string;
}

export interface LanguageSelectProps extends FormControlProps<GenerationLanguage> {
  defaultValue?: GenerationLanguage;
}

export interface StyleSelectProps extends FormControlProps<GenerationStyle> {
  defaultValue?: GenerationStyle;
}

export interface Language {
  id: GenerationLanguage;
  name: string;
}

export interface Style {
  id: GenerationStyle;
  name: string;
  description: string;
}
