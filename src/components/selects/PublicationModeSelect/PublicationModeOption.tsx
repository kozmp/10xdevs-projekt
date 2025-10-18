import React from "react";
import { RadioGroupItem } from "@/components/ui/radio-group";
import type { PublicationMode } from "./types";

interface PublicationModeOptionProps {
  value: PublicationMode;
  label: string;
  description: string;
  itemId: string;
  disabled?: boolean;
}

export function PublicationModeOption({ value, label, description, itemId, disabled }: PublicationModeOptionProps) {
  return (
    <div className="flex items-start space-x-2">
      <RadioGroupItem value={value} id={itemId} disabled={disabled} />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor={itemId}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          {label}
        </label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
