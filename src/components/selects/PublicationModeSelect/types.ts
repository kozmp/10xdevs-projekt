export type PublicationMode = 'draft' | 'published';

export interface PublicationModeOption {
  value: PublicationMode;
  label: string;
  description: string;
}

export interface PublicationModeSelectProps {
  value: PublicationMode;
  onChange: (mode: PublicationMode) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export interface UsePublicationModeSelectReturn {
  groupId: string;
  modes: PublicationModeOption[];
  getItemId: (value: PublicationMode) => string;
}
