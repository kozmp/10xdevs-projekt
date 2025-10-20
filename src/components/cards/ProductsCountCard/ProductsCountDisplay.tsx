import React from "react";
import { CardContent } from "@/components/ui/card";
import { STYLES } from "./constants";

interface ProductsCountDisplayProps {
  count: string;
  onClick?: () => void;
  isClickable: boolean;
}

export function ProductsCountDisplay({ count, onClick, isClickable }: ProductsCountDisplayProps) {
  const className = `${STYLES.COUNT} ${isClickable ? STYLES.COUNT_CLICKABLE : ""}`;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isClickable && onClick && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <CardContent>
      <div
        className={className}
        onClick={isClickable ? onClick : undefined}
        onKeyDown={isClickable ? handleKeyDown : undefined}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
      >
        {count}
      </div>
    </CardContent>
  );
}
