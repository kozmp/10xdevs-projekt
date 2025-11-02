import { useState, useCallback } from "react";
import type { UpdateShopCommand, ShopResponseDTO } from "../../types";
import { toast } from "sonner";

/**
 * Stan custom hooka useShopConnection
 */
interface UseShopConnectionState {
  /** Dane połączonego sklepu (null jeśli nie ma połączenia) */
  shop: ShopResponseDTO | null;
  /** Czy trwa operacja (PUT/DELETE) */
  isLoading: boolean;
  /** Błąd operacji (null jeśli brak błędu) */
  error: string | null;
  /** Czy dialog jest otwarty */
  isDialogOpen: boolean;
}

/**
 * Akcje zwracane przez hook
 */
interface UseShopConnectionActions {
  /** Połącz lub zaktualizuj sklep */
  connectShop: (command: UpdateShopCommand) => Promise<boolean>;
  /** Usuń połączenie ze sklepem */
  disconnectShop: () => Promise<boolean>;
  /** Pobierz dane sklepu z serwera */
  fetchShop: () => Promise<void>;
  /** Otwórz dialog połączenia ze sklepem */
  openDialog: () => void;
  /** Zamknij dialog */
  closeDialog: () => void;
  /** Reset stanu błędu */
  resetError: () => void;
}

/**
 * Zwracany typ z hooka
 */
type UseShopConnectionReturn = UseShopConnectionState & UseShopConnectionActions;

/**
 * Custom hook do zarządzania połączeniem ze sklepem Shopify
 *
 * Funkcjonalność:
 * - Pobieranie danych aktualnego połączenia
 * - Tworzenie/aktualizacja połączenia z weryfikacją API key
 * - Usuwanie połączenia
 * - Zarządzanie stanem dialogu
 * - Toast notifications dla sukcesu i błędów
 *
 * @example
 * ```tsx
 * function ShopSettings() {
 *   const {
 *     shop,
 *     isLoading,
 *     error,
 *     connectShop,
 *     disconnectShop,
 *     isDialogOpen,
 *     openDialog,
 *     closeDialog
 *   } = useShopConnection();
 *
 *   const handleConnect = async (data: UpdateShopCommand) => {
 *     const success = await connectShop(data);
 *     if (success) {
 *       closeDialog();
 *     }
 *   };
 *
 *   return (
 *     <>
 *       {shop ? (
 *         <div>Connected to: {shop.shopifyDomain}</div>
 *       ) : (
 *         <button onClick={openDialog}>Connect Store</button>
 *       )}
 *       <ShopConnectionModal
 *         open={isDialogOpen}
 *         onOpenChange={closeDialog}
 *         onConnect={handleConnect}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export function useShopConnection(): UseShopConnectionReturn {
  // State
  const [shop, setShop] = useState<ShopResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /**
   * Pobierz dane sklepu z serwera
   */
  const fetchShop = useCallback(async () => {
    try {
      const response = await fetch("/api/shops", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 404) {
        // Sklep nie istnieje - to normalna sytuacja
        setShop(null);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch shop data");
      }

      const shopData: ShopResponseDTO = await response.json();
      setShop(shopData);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch shop data";
      console.error("Error fetching shop:", err);
      setError(errorMessage);
      // Nie pokazujemy toasta dla błędu fetchowania - to może być po prostu brak sklepu
    }
  }, []);

  /**
   * Połącz lub zaktualizuj sklep Shopify
   * @returns true jeśli operacja się powiodła
   */
  const connectShop = useCallback(async (command: UpdateShopCommand): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/shops", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.details || errorData.error || "Failed to connect shop";
        throw new Error(errorMessage);
      }

      const shopData: ShopResponseDTO = await response.json();
      setShop(shopData);
      setError(null);
      toast.success("Shop connected successfully");
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect shop";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error connecting shop:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Usuń połączenie ze sklepem (wraz z wszystkimi danymi)
   * @returns true jeśli operacja się powiodła
   */
  const disconnectShop = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/shops", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 404) {
        // Sklep już nie istnieje - to OK
        setShop(null);
        toast.success("Shop disconnected successfully");
        return true;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to disconnect shop");
      }

      // 204 No Content - sklep usunięty
      setShop(null);
      setError(null);
      toast.success("Shop disconnected successfully");
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to disconnect shop";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error disconnecting shop:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Otwórz dialog połączenia ze sklepem
   */
  const openDialog = useCallback(() => {
    setIsDialogOpen(true);
    setError(null); // Reset błędu przy otwarciu dialogu
  }, []);

  /**
   * Zamknij dialog
   */
  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setError(null); // Reset błędu przy zamknięciu dialogu
  }, []);

  /**
   * Reset stanu błędu
   */
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    shop,
    isLoading,
    error,
    isDialogOpen,

    // Actions
    connectShop,
    disconnectShop,
    fetchShop,
    openDialog,
    closeDialog,
    resetError,
  };
}
