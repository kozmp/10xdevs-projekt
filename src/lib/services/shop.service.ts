import type { SupabaseClient } from "../../db/supabase.client";
import type { ShopResponseDTO } from "../../types";
import { encryptApiKey, decryptApiKey } from "../encryption";

/**
 * Serwis do zarządzania połączeniami ze sklepami Shopify
 *
 * Odpowiedzialny za:
 * - Weryfikację klucza API Shopify
 * - Utworzenie/aktualizację sklepu w bazie
 * - Usunięcie połączenia ze sklepem
 */

export interface VerifyShopifyApiKeyResult {
  isValid: boolean;
  shopDomain?: string;
  errorMessage?: string;
}

export class ShopService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Weryfikuje klucz API Shopify przez wywołanie Shopify Admin REST API
   *
   * @param shopDomain - Domena sklepu Shopify (np. "test-shop.myshopify.com")
   * @param apiKey - Shopify Admin API access token
   * @returns Rezultat weryfikacji
   */
  async verifyShopifyApiKey(shopDomain: string, apiKey: string): Promise<VerifyShopifyApiKeyResult> {
    try {
      // Shopify Admin REST API endpoint - GET /admin/api/2024-01/shop.json
      // https://shopify.dev/docs/api/admin-rest/2024-01/resources/shop#get-shop
      const apiVersion = "2024-01";
      const url = `https://${shopDomain}/admin/api/${apiVersion}/shop.json`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": apiKey,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        return {
          isValid: false,
          errorMessage: "Invalid API key - Unauthorized",
        };
      }

      if (response.status === 403) {
        return {
          isValid: false,
          errorMessage: "API key does not have required permissions",
        };
      }

      if (response.status === 404) {
        return {
          isValid: false,
          errorMessage: "Shop not found - Check domain",
        };
      }

      if (!response.ok) {
        return {
          isValid: false,
          errorMessage: `Shopify API error: ${response.status} ${response.statusText}`,
        };
      }

      // Parse response
      const data = await response.json();

      if (!data.shop || !data.shop.domain) {
        return {
          isValid: false,
          errorMessage: "Invalid response from Shopify API",
        };
      }

      return {
        isValid: true,
        shopDomain: data.shop.domain,
      };
    } catch (error) {
      console.error("[ShopService] Error verifying Shopify API key:", error);
      return {
        isValid: false,
        errorMessage: error instanceof Error ? error.message : "Failed to verify API key",
      };
    }
  }

  /**
   * Tworzy lub aktualizuje sklep w bazie danych
   *
   * Jeśli sklep dla użytkownika już istnieje, aktualizuje klucz API.
   * Jeśli nie istnieje, tworzy nowy rekord.
   *
   * @param userId - ID użytkownika (dla RLS)
   * @param shopDomain - Domena sklepu Shopify
   * @param apiKey - Klucz API Shopify (zostanie zaszyfrowany)
   * @returns Dane utworzonego/zaktualizowanego sklepu
   * @throws Error jeśli operacja się nie powiedzie
   */
  async createOrUpdateShop(userId: string, shopDomain: string, apiKey: string): Promise<ShopResponseDTO> {
    // 1. Szyfruj klucz API
    const encryptedData = encryptApiKey(apiKey);

    // 2. Sprawdź czy sklep już istnieje dla tego użytkownika
    const { data: existingShop, error: fetchError } = await this.supabase
      .from("shops")
      .select("shop_id, user_id")
      .eq("user_id", userId)
      .single();

    // 3a. Jeśli sklep istnieje - UPDATE
    if (existingShop && !fetchError) {
      const { data: updatedShop, error: updateError } = await this.supabase
        .from("shops")
        .update({
          shopify_domain: shopDomain,
          api_key_encrypted: encryptedData.encrypted,
          api_key_iv: encryptedData.iv,
          updated_at: new Date().toISOString(),
        })
        .eq("shop_id", existingShop.shop_id)
        .select()
        .single();

      if (updateError || !updatedShop) {
        throw new Error(`Failed to update shop: ${updateError?.message || "Unknown error"}`);
      }

      return this.mapToShopResponseDTO(updatedShop);
    }

    // 3b. Jeśli sklep nie istnieje - INSERT
    const { data: newShop, error: insertError } = await this.supabase
      .from("shops")
      .insert({
        user_id: userId,
        shopify_domain: shopDomain,
        api_key_encrypted: encryptedData.encrypted,
        api_key_iv: encryptedData.iv,
      })
      .select()
      .single();

    if (insertError || !newShop) {
      throw new Error(`Failed to create shop: ${insertError?.message || "Unknown error"}`);
    }

    return this.mapToShopResponseDTO(newShop);
  }

  /**
   * Usuwa połączenie ze sklepem dla użytkownika
   *
   * Usuwa rekord sklepu z bazy danych (wraz z kluczem API).
   * Dzięki CASCADE, usunie również wszystkie powiązane rekordy (produkty, joby).
   *
   * @param userId - ID użytkownika
   * @returns true jeśli sklep został usunięty, false jeśli nie znaleziono
   * @throws Error jeśli operacja się nie powiedzie
   */
  async deleteShop(userId: string): Promise<boolean> {
    // 1. Sprawdź czy sklep istnieje
    const { data: existingShop, error: fetchError } = await this.supabase
      .from("shops")
      .select("shop_id")
      .eq("user_id", userId)
      .single();

    if (fetchError || !existingShop) {
      // Sklep nie istnieje - to nie jest błąd
      return false;
    }

    // 2. Usuń sklep (CASCADE usuwa produkty, joby, etc.)
    const { error: deleteError } = await this.supabase.from("shops").delete().eq("shop_id", existingShop.shop_id);

    if (deleteError) {
      throw new Error(`Failed to delete shop: ${deleteError.message}`);
    }

    return true;
  }

  /**
   * Pobiera sklep dla użytkownika
   *
   * @param userId - ID użytkownika
   * @returns Dane sklepu lub null jeśli nie znaleziono
   */
  async getShopByUserId(userId: string): Promise<ShopResponseDTO | null> {
    const { data: shop, error } = await this.supabase
      .from("shops")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !shop) {
      return null;
    }

    return this.mapToShopResponseDTO(shop);
  }

  /**
   * Mapuje rekord z bazy na ShopResponseDTO
   *
   * Zawsze zwraca isConnected: true, ponieważ ta metoda jest wywoływana
   * tylko gdy sklep istnieje w bazie (ma klucz API).
   */
  private mapToShopResponseDTO(shop: any): ShopResponseDTO {
    return {
      isConnected: true,
      shopId: shop.shop_id,
      shopifyDomain: shop.shopify_domain,
      createdAt: shop.created_at ? new Date(shop.created_at).toISOString() : new Date().toISOString(),
      updatedAt: shop.updated_at ? new Date(shop.updated_at).toISOString() : new Date().toISOString(),
    };
  }
}
