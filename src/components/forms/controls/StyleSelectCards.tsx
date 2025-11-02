import React from "react";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { STYLES } from "./constants";
import type { StyleSelectProps } from "./types";

export function StyleSelectCards({
  name,
  control,
  label = "Styl komunikacji",
  description,
  defaultValue = "professional",
}: StyleSelectProps) {
  return (
    <FormField
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
              defaultValue={defaultValue}
            >
              {STYLES.map((style) => (
                <Card
                  key={style.id}
                  className={`relative p-4 cursor-pointer transition-all ${
                    field.value === style.id ? "border-primary ring-2 ring-primary" : "hover:border-gray-300"
                  }`}
                  onClick={() => field.onChange(style.id)}
                >
                  <RadioGroupItem value={style.id} id={style.id} className="sr-only" />
                  <Label htmlFor={style.id} className="space-y-2">
                    <h3 className="font-semibold">{style.name}</h3>
                    <p className="text-sm text-gray-600">{style.description}</p>
                  </Label>
                </Card>
              ))}
            </RadioGroup>
          </FormControl>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
