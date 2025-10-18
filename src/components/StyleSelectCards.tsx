import type { GenerationStyle } from "@/lib/services/product-description-generator.service";
import { Card } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

interface StyleSelectCardsProps {
  selected: GenerationStyle;
  onSelect: (style: GenerationStyle) => void;
}

const styles: Array<{
  id: GenerationStyle;
  name: string;
  description: string;
}> = [
  {
    id: "professional",
    name: "Profesjonalny",
    description: "Techniczny język z naciskiem na specyfikację i szczegóły",
  },
  {
    id: "casual",
    name: "Casualowy",
    description: "Przyjazny i konwersacyjny ton, jak rozmowa z przyjacielem",
  },
  {
    id: "sales-focused",
    name: "Sprzedażowy",
    description: "Podkreśla korzyści i wartość produktu",
  },
];

export function StyleSelectCards({ selected, onSelect }: StyleSelectCardsProps) {
  return (
    <RadioGroup
      value={selected}
      onValueChange={(value) => onSelect(value as GenerationStyle)}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {styles.map((style) => (
        <Card
          key={style.id}
          className={`relative p-4 cursor-pointer transition-all ${
            selected === style.id ? "border-primary ring-2 ring-primary" : "hover:border-gray-300"
          }`}
          onClick={() => onSelect(style.id)}
        >
          <RadioGroupItem value={style.id} id={style.id} className="sr-only" />
          <Label htmlFor={style.id} className="space-y-2">
            <h3 className="font-semibold">{style.name}</h3>
            <p className="text-sm text-gray-600">{style.description}</p>
          </Label>
        </Card>
      ))}
    </RadioGroup>
  );
}
