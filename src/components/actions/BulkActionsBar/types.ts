export interface BulkActionsBarProps {
  selectedCount: number;
  maxLimit: number;
  onGenerate: () => void;
  onClear: () => void;
  className?: string;
}

export interface UseBulkActionsBarReturn {
  isDisabled: boolean;
  isMaxReached: boolean;
  handleGenerate: () => void;
  shouldRender: boolean;
  selectedCountClass: string;
  generateButtonLabel: string;
}
