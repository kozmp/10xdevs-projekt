import { useEffect, useId } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useApiKey } from '@/components/hooks/useApiKey';

interface ApiKeyModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ApiKeyModal({ open, onClose, onSuccess }: ApiKeyModalProps) {
  const { key, setKey, save, remove, status, error } = useApiKey();
  const inputId = useId();

  const handleSave = async () => {
    const shop = await save();
    if (shop) {
      toast.success(`Klucz API zapisany pomyślnie`, {
        description: shop.shopifyDomain
          ? `Połączono ze sklepem: ${shop.shopifyDomain}`
          : 'Sklep skonfigurowany',
      });
      onClose();
      onSuccess?.();
    }
  };

  const handleRemove = async () => {
    if (!confirm('Czy na pewno chcesz usunąć klucz API?')) {
      return;
    }

    const success = await remove();
    if (success) {
      toast.success('Klucz API został usunięty');
      onClose();
      onSuccess?.();
    }
  };

  const isLoading = status === 'loading';
  const isSaveDisabled = key.length < 8 || isLoading;

  // Reset error when modal closes
  useEffect(() => {
    if (!open) {
      setKey('');
    }
  }, [open, setKey]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Konfiguracja klucza API</DialogTitle>
          <DialogDescription>
            Wprowadź klucz API Shopify, aby połączyć się ze sklepem.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor={inputId}>Klucz API Shopify</Label>
            <Input
              id={inputId}
              type="password"
              placeholder="Wprowadź klucz API..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              disabled={isLoading}
              aria-invalid={!!error}
              aria-describedby={error ? `${inputId}-error` : undefined}
            />
            {error && (
              <p
                id={`${inputId}-error`}
                className="text-sm text-red-500"
                role="alert"
              >
                {error}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Klucz musi zawierać co najmniej 8 znaków
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRemove}
            disabled={isLoading}
            type="button"
          >
            Usuń
          </Button>
          <Button onClick={handleSave} disabled={isSaveDisabled} type="button">
            {isLoading ? 'Zapisywanie...' : 'Zapisz'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
