import React, { useState, useId } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { UpdateShopCommand, ShopResponseDTO } from "../types";
import { updateShopSchema } from "../lib/schemas/shop";
import type { ZodError } from "zod";

/**
 * Props dla ShopConnectionModal
 */
interface ShopConnectionModalProps {
  /** Czy dialog jest otwarty */
  open: boolean;
  /** Callback przy zmianie stanu otwarcia dialogu */
  onOpenChange: (open: boolean) => void;
  /** Callback przy próbie połączenia sklepu */
  onConnect: (command: UpdateShopCommand) => Promise<boolean>;
  /** Callback przy rozłączeniu sklepu */
  onDisconnect: () => Promise<boolean>;
  /** Obecne dane sklepu (jeśli połączony) */
  currentShop: ShopResponseDTO | null;
  /** Czy trwa operacja */
  isLoading: boolean;
  /** Błąd z API (jeśli występuje) */
  apiError: string | null;
}

/**
 * Błędy walidacji formularza
 */
interface FormErrors {
  shopifyDomain?: string;
  apiKey?: string;
}

/**
 * Modal do zarządzania połączeniem ze sklepem Shopify
 *
 * Funkcjonalność:
 * - Formularz do dodania/aktualizacji klucza API Shopify
 * - Walidacja po stronie klienta (Zod)
 * - Wyświetlanie błędów walidacji i API
 * - Przycisk rozłączenia dla istniejących połączeń
 * - Pełna dostępność (A11y)
 *
 * @example
 * ```tsx
 * function Settings() {
 *   const { shop, isLoading, error, connectShop, disconnectShop } = useShopConnection();
 *
 *   return (
 *     <ShopConnectionModal
 *       open={isOpen}
 *       onOpenChange={setIsOpen}
 *       onConnect={connectShop}
 *       onDisconnect={disconnectShop}
 *       currentShop={shop}
 *       isLoading={isLoading}
 *       apiError={error}
 *     />
 *   );
 * }
 * ```
 */
export function ShopConnectionModal({
  open,
  onOpenChange,
  onConnect,
  onDisconnect,
  currentShop,
  isLoading,
  apiError,
}: ShopConnectionModalProps) {
  // Form state
  const [shopifyDomain, setShopifyDomain] = useState(currentShop?.shopifyDomain || "");
  const [apiKey, setApiKey] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  // Unique IDs for accessibility
  const shopifyDomainId = useId();
  const apiKeyId = useId();
  const shopifyDomainErrorId = useId();
  const apiKeyErrorId = useId();

  /**
   * Walidacja formularza po stronie klienta
   */
  const validateForm = (): boolean => {
    try {
      updateShopSchema.parse({ shopifyDomain, apiKey });
      setFormErrors({});
      return true;
    } catch (err) {
      if (err && typeof err === "object" && "errors" in err) {
        const zodError = err as ZodError;
        const errors: FormErrors = {};
        zodError.errors.forEach((error) => {
          const field = error.path[0] as keyof FormErrors;
          errors[field] = error.message;
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  /**
   * Handler submitu formularza
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Walidacja
    if (!validateForm()) {
      return;
    }

    // Wywołanie API
    const success = await onConnect({ shopifyDomain, apiKey });

    if (success) {
      // Reset formularza po sukcesie
      setApiKey("");
      setFormErrors({});
      onOpenChange(false);
    }
  };

  /**
   * Handler rozłączenia sklepu
   */
  const handleDisconnect = async () => {
    const success = await onDisconnect();

    if (success) {
      setShopifyDomain("");
      setApiKey("");
      setFormErrors({});
      setShowDisconnectConfirm(false);
      onOpenChange(false);
    }
  };

  /**
   * Reset stanu przy zamknięciu dialogu
   */
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset formularza przy zamknięciu
      setFormErrors({});
      setShowDisconnectConfirm(false);
      // Zachowaj shopifyDomain jeśli sklep jest połączony
      if (currentShop) {
        setShopifyDomain(currentShop.shopifyDomain);
      } else {
        setShopifyDomain("");
      }
      setApiKey("");
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="shop-connection-modal">
        <DialogHeader>
          <DialogTitle data-testid="modal-title">
            {currentShop ? "Update Shopify Connection" : "Connect Shopify Store"}
          </DialogTitle>
          <DialogDescription>
            {currentShop
              ? "Update your Shopify API credentials or disconnect your store."
              : "Connect your Shopify store to start generating product descriptions."}
          </DialogDescription>
        </DialogHeader>

        {showDisconnectConfirm ? (
          // Potwierdzenie rozłączenia
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to disconnect your store? This will remove all jobs and generated
              descriptions.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDisconnectConfirm(false)}
                disabled={isLoading}
                data-testid="cancel-disconnect-button"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDisconnect}
                disabled={isLoading}
                data-testid="confirm-disconnect-button"
              >
                {isLoading ? "Disconnecting..." : "Confirm Disconnect"}
              </Button>
            </div>
          </div>
        ) : (
          // Formularz połączenia
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* API Error Display */}
              {apiError && (
                <div
                  className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md text-sm"
                  role="alert"
                  aria-live="polite"
                >
                  {apiError}
                </div>
              )}

              {/* Shopify Domain */}
              <div className="grid gap-2">
                <Label htmlFor={shopifyDomainId}>
                  Shopify Domain <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={shopifyDomainId}
                  data-testid="shopify-domain-input"
                  type="text"
                  placeholder="your-shop.myshopify.com"
                  value={shopifyDomain}
                  onChange={(e) => setShopifyDomain(e.target.value)}
                  disabled={isLoading || !!currentShop}
                  aria-invalid={!!formErrors.shopifyDomain}
                  aria-describedby={formErrors.shopifyDomain ? shopifyDomainErrorId : undefined}
                  required
                />
                {formErrors.shopifyDomain && (
                  <p id={shopifyDomainErrorId} className="text-sm text-destructive" role="alert" data-testid="domain-error">
                    {formErrors.shopifyDomain}
                  </p>
                )}
                {currentShop && (
                  <p className="text-xs text-muted-foreground">
                    Domain cannot be changed. Disconnect and reconnect to change.
                  </p>
                )}
              </div>

              {/* API Key */}
              <div className="grid gap-2">
                <Label htmlFor={apiKeyId}>
                  Admin API Access Token <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={apiKeyId}
                  data-testid="api-key-input"
                  type="password"
                  placeholder="shpat_..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={isLoading}
                  aria-invalid={!!formErrors.apiKey}
                  aria-describedby={formErrors.apiKey ? apiKeyErrorId : undefined}
                  required
                />
                {formErrors.apiKey && (
                  <p id={apiKeyErrorId} className="text-sm text-destructive" role="alert" data-testid="apikey-error">
                    {formErrors.apiKey}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Your API key must start with &quot;shpat_&quot; and have read access to products.
                </p>
              </div>
            </div>

            <DialogFooter>
              <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:justify-between">
                {/* Disconnect button (left side on desktop) */}
                {currentShop && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDisconnectConfirm(true)}
                    disabled={isLoading}
                    className="sm:mr-auto"
                    data-testid="disconnect-button"
                  >
                    Disconnect Store
                  </Button>
                )}

                {/* Submit buttons (right side) */}
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:ml-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    disabled={isLoading}
                    data-testid="cancel-button"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading || !shopifyDomain || !apiKey} data-testid="submit-button">
                    {isLoading
                      ? "Verifying..."
                      : currentShop
                        ? "Update Connection"
                        : "Connect Store"}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
