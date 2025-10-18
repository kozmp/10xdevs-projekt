import { useCallback, useMemo } from 'react';
import { BUTTON_ARIA_LABELS, COLORS } from './constants';
import type { UseBulkActionsBarReturn } from './types';

export function useBulkActionsBar(
  selectedCount: number,
  maxLimit: number,
  onGenerate: () => void
): UseBulkActionsBarReturn {
  const isDisabled = selectedCount === 0;
  const isMaxReached = selectedCount >= maxLimit;

  const handleGenerate = useCallback(() => {
    if (!isDisabled) {
      onGenerate();
    }
  }, [isDisabled, onGenerate]);

  const selectedCountClass = useMemo(() => {
    return isMaxReached ? COLORS.ERROR : COLORS.PRIMARY;
  }, [isMaxReached]);

  const generateButtonLabel = useMemo(() => {
    return BUTTON_ARIA_LABELS.GENERATE.replace('{count}', String(selectedCount));
  }, [selectedCount]);

  const shouldRender = selectedCount > 0;

  return {
    isDisabled,
    isMaxReached,
    handleGenerate,
    shouldRender,
    selectedCountClass,
    generateButtonLabel,
  };
}
