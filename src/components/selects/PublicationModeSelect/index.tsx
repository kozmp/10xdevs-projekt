import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { PublicationModeOption } from "./PublicationModeOption";
import { usePublicationModeSelect } from "./usePublicationModeSelect";
import { DEFAULT_LABEL } from "./constants";
import type { PublicationModeSelectProps } from "./types";

export function PublicationModeSelect({
  value,
  onChange,
  label = DEFAULT_LABEL,
  className,
  disabled,
}: PublicationModeSelectProps) {
  const { groupId, modes, getItemId } = usePublicationModeSelect();

  return (
    <div className={className}>
      <div className="space-y-2">
        <Label htmlFor={groupId}>{label}</Label>
        <RadioGroup value={value} onValueChange={onChange} id={groupId} disabled={disabled}>
          {modes.map((mode) => (
            <PublicationModeOption
              key={mode.value}
              value={mode.value}
              label={mode.label}
              description={mode.description}
              itemId={getItemId(mode.value)}
              disabled={disabled}
            />
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
