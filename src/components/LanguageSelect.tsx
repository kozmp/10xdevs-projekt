import type { GenerationLanguage } from "@/lib/services/product-description-generator.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface LanguageSelectProps {
  selected: GenerationLanguage;
  onSelect: (language: GenerationLanguage) => void;
}

const languages: {
  id: GenerationLanguage;
  name: string;
}[] = [
  { id: "pl", name: "Polski" },
  { id: "en", name: "English" },
];

export function LanguageSelect({ selected, onSelect }: LanguageSelectProps) {
  return (
    <Select value={selected} onValueChange={(value) => onSelect(value as GenerationLanguage)}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Wybierz język" />
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.id} value={language.id}>
            {language.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
