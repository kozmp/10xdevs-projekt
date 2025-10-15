import { useId } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { ProductStatus } from '@/types';

interface FilterDropdownProps {
  value: ProductStatus | 'all';
  onChange: (value: ProductStatus | 'all') => void;
}

const statusOptions: { value: ProductStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'published', label: 'Opublikowane' },
  { value: 'draft', label: 'Szkice' },
];

export function FilterDropdown({ value, onChange }: FilterDropdownProps) {
  const selectId = useId();

  return (
    <div className="space-y-2">
      <Label htmlFor={selectId}>Status produktu</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={selectId} className="w-[200px]">
          <SelectValue placeholder="Wybierz status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
