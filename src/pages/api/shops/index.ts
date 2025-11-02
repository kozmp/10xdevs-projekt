import type { APIRoute } from "astro";
import type { UpdateShopCommand } from "../../../types";
import { updateShopSchema, shopResponseSchema } from "../../../lib/schemas/shop";
import { ShopService } from "../../../lib/services/shop.service";

// Wyłączamy prerenderowanie dla endpointów API
export const prerender = false;

/**
 * PUT /api/shops
 *
 * Tworzy lub aktualizuje połączenie ze sklepem Shopify.
 * Weryfikuje klucz API przez Shopify Admin REST API.
 *
 * Request body: UpdateShopCommand { shopifyDomain, apiKey }
 * Response: ShopResponseDTO (200 OK)
 */
export const PUT: APIRoute = async ({ locals, request }) => {
  try {
    // 1. Weryfikacja autoryzacji
    if (!locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized - Please log in",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 2. Parsowanie i walidacja body
    const body = await request.json();
    const validation = updateShopSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request data",
          details: validation.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const command: UpdateShopCommand = validation.data;

    // 3. Weryfikacja klucza API przez Shopify Admin REST API
    const shopService = new ShopService(locals.supabase);
    const verificationResult = await shopService.verifyShopifyApiKey(command.shopifyDomain, command.apiKey);

    if (!verificationResult.isValid) {
      return new Response(
        JSON.stringify({
          error: "Shopify API key verification failed",
          details: verificationResult.errorMessage,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 4. Utwórz lub zaktualizuj sklep w bazie
    try {
      const shop = await shopService.createOrUpdateShop(locals.user.id, command.shopifyDomain, command.apiKey);

      // 5. Walidacja odpowiedzi
      const responseValidation = shopResponseSchema.safeParse(shop);
      if (!responseValidation.success) {
        console.error("[PUT /api/shops] Invalid shop response format:", responseValidation.error);
        return new Response(
          JSON.stringify({
            error: "Internal server error",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(JSON.stringify(shop), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : "Unknown error";
      console.error("[PUT /api/shops] Service error:", serviceError);

      return new Response(
        JSON.stringify({
          error: "Failed to create/update shop",
          details: errorMessage,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (err) {
    console.error("[PUT /api/shops] Error:", err);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * GET /api/shops
 *
 * Pobiera dane sklepu połączonego z kontem użytkownika.
 *
 * Response: ShopResponseDTO (200 OK)
 * - isConnected = true: sklep skonfigurowany, wszystkie pola wypełnione
 * - isConnected = false: sklep nieskonfigurowany, tylko isConnected wypełnione
 */
export const GET: APIRoute = async ({ locals }) => {
  try {
    // 1. Weryfikacja autoryzacji
    if (!locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized - Please log in",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 2. Pobierz sklep dla użytkownika
    const shopService = new ShopService(locals.supabase);
    const shop = await shopService.getShopByUserId(locals.user.id);

    // 3. Normalizacja odpowiedzi
    let responseDTO: import("../../../types").ShopResponseDTO;

    if (!shop) {
      // Sklep nie istnieje - zwracamy 200 OK z isConnected = false
      // To normalny stan biznesowy, nie błąd!
      responseDTO = {
        isConnected: false,
      };
    } else {
      // Sklep istnieje - zwracamy pełne dane z isConnected = true
      responseDTO = {
        isConnected: true,
        ...shop,
      };
    }

    // 4. Walidacja odpowiedzi
    const responseValidation = shopResponseSchema.safeParse(responseDTO);
    if (!responseValidation.success) {
      console.error("[GET /api/shops] Invalid shop response format:", responseValidation.error);
      return new Response(
        JSON.stringify({
          error: "Internal server error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(responseDTO), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[GET /api/shops] Error:", err);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * DELETE /api/shops
 *
 * Usuwa połączenie ze sklepem Shopify.
 * Usuwa sklep, klucz API oraz wszystkie powiązane dane (produkty, joby) przez CASCADE.
 *
 * Response: 204 No Content (success) lub 404 jeśli sklep nie istnieje
 */
export const DELETE: APIRoute = async ({ locals }) => {
  try {
    // 1. Weryfikacja autoryzacji
    if (!locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized - Please log in",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 2. Usuń sklep
    const shopService = new ShopService(locals.supabase);

    try {
      const deleted = await shopService.deleteShop(locals.user.id);

      if (!deleted) {
        // Sklep nie istniał - to nie jest błąd, zwracamy 404
        return new Response(
          JSON.stringify({
            error: "Shop not found",
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Sklep usunięty pomyślnie - 204 No Content
      return new Response(null, {
        status: 204,
      });
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : "Unknown error";
      console.error("[DELETE /api/shops] Service error:", serviceError);

      return new Response(
        JSON.stringify({
          error: "Failed to delete shop",
          details: errorMessage,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (err) {
    console.error("[DELETE /api/shops] Error:", err);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
