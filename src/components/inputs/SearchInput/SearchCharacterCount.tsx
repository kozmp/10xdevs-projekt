import React from "react";
import { STYLES } from "./constants";

interface SearchCharacterCountProps {
  count: string;
}

export function SearchCharacterCount({ count }: SearchCharacterCountProps) {
  return <p className={STYLES.CHARACTER_COUNT}>{count}</p>;
}
