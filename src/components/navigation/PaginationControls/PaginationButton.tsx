import React from "react";
import { Button } from "@/components/ui/button";
import { BUTTON_VARIANTS } from "./constants";

interface PaginationButtonProps {
  onClick: () => void;
  disabled: boolean;
  ariaLabel: string;
  children: React.ReactNode;
}

export function PaginationButton({ onClick, disabled, ariaLabel, children }: PaginationButtonProps) {
  return (
    <Button
      variant={BUTTON_VARIANTS.DEFAULT}
      size={BUTTON_VARIANTS.SIZE}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </Button>
  );
}
