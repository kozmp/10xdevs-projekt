import { useId } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { PublicationMode } from "@/types";

interface PublicationModeSelectProps {
  value: PublicationMode;
  onChange: (mode: PublicationMode) => void;
}

const modes: { value: PublicationMode; label: string; description: string }[] = [
  {
    value: "draft",
    label: "Szkic",
    description: "Zapisz jako szkic do późniejszego przeglądu",
  },
  {
    value: "published",
    label: "Opublikuj",
    description: "Opublikuj od razu po wygenerowaniu",
  },
];

export function PublicationModeSelect({ value, onChange }: PublicationModeSelectProps) {
  const groupId = useId();

  return (
    <div className="space-y-2">
      <Label htmlFor={groupId}>Tryb publikacji</Label>
      <RadioGroup value={value} onValueChange={onChange} id={groupId}>
        {modes.map((mode) => (
          <div key={mode.value} className="flex items-start space-x-2">
            <RadioGroupItem value={mode.value} id={`${groupId}-${mode.value}`} />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor={`${groupId}-${mode.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {mode.label}
              </label>
              <p className="text-sm text-muted-foreground">{mode.description}</p>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
