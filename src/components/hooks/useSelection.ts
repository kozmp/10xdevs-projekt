import { useState, useCallback, useMemo } from "react";

interface UseSelectionReturn<T> {
  selected: T[];
  isSelected: (item: T) => boolean;
  toggle: (item: T) => boolean; // Returns true if added, false if removed or limit reached
  toggleAll: (items: T[]) => void;
  clear: () => void;
  count: number;
  isMaxReached: boolean;
  maxLimit: number;
}

export function useSelection<T = string>(maxLimit = 50): UseSelectionReturn<T> {
  const [selected, setSelected] = useState<T[]>([]);

  const isSelected = useCallback(
    (item: T): boolean => {
      return selected.includes(item);
    },
    [selected]
  );

  const toggle = useCallback(
    (item: T): boolean => {
      if (isSelected(item)) {
        // Remove item
        setSelected((prev) => prev.filter((i) => i !== item));
        return false;
      } else {
        // Add item if limit not reached
        if (selected.length >= maxLimit) {
          return false; // Limit reached, cannot add
        }
        setSelected((prev) => [...prev, item]);
        return true;
      }
    },
    [isSelected, selected.length, maxLimit]
  );

  const toggleAll = useCallback(
    (items: T[]) => {
      // Check if all items are selected
      const allSelected = items.every((item) => selected.includes(item));

      if (allSelected) {
        // Deselect all items from the list
        setSelected((prev) => prev.filter((item) => !items.includes(item)));
      } else {
        // Select all items up to the limit
        const newItems = items.filter((item) => !selected.includes(item));
        const availableSlots = maxLimit - selected.length;
        const itemsToAdd = newItems.slice(0, availableSlots);

        if (itemsToAdd.length > 0) {
          setSelected((prev) => [...prev, ...itemsToAdd]);
        }
      }
    },
    [selected, maxLimit]
  );

  const clear = useCallback(() => {
    setSelected([]);
  }, []);

  const isMaxReached = useMemo(() => selected.length >= maxLimit, [selected.length, maxLimit]);

  return {
    selected,
    isSelected,
    toggle,
    toggleAll,
    clear,
    count: selected.length,
    isMaxReached,
    maxLimit,
  };
}
