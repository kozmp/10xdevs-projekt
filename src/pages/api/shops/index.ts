import type { APIRoute } from "astro";
import type { ShopResponseDTO, UpdateShopCommand } from "../../../types";
import { updateShopSchema, shopResponseSchema } from "../../../lib/schemas/shop";
import { encryptApiKey } from "../../../lib/encryption";

// Wyłączamy prerenderowanie dla endpointów API
export const prerender = false;

// Implementacja endpointu PUT
export const PUT: APIRoute = async ({ locals, request }) => {
  try {
    // Parsowanie body
    const body = await request.json();

    // Walidacja danych wejściowych
    const validationResult = updateShopSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request data",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Szyfrowanie klucza API
    const encryptedData = encryptApiKey(validationResult.data.apiKey);

    // Sprawdzamy czy mamy użytkownika w kontekście
    if (!locals.user) {
      console.error("[Shops API] No user in context");
      return new Response(
        JSON.stringify({
          error: "Unauthorized - Please log in",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            ...locals.corsHeaders,
          },
        }
      );
    }

    console.debug("[Shops API] Creating shop for user:", {
      userId: locals.user.id,
      email: locals.user.email,
    });

    // Dodanie nowego sklepu do bazy danych
    const { data: shop, error: insertError } = await locals.supabase
      .from("shops")
      .insert({
        api_key_encrypted: encryptedData.encrypted,
        api_key_iv: encryptedData.iv,
        shopify_domain: "test-shop.myshopify.com", // TODO: pobrać domenę z API Shopify
        user_id: locals.user.id, // Dodajemy ID użytkownika dla RLS
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting shop:", insertError);
      return new Response(
        JSON.stringify({
          error: "Failed to create shop",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...locals.corsHeaders,
          },
        }
      );
    }

    const shopResponse: ShopResponseDTO = {
      shopId: shop.shop_id,
      shopifyDomain: shop.shopify_domain,
      createdAt: shop.created_at,
      updatedAt: shop.updated_at,
    };

    // Walidacja odpowiedzi
    const responseValidation = shopResponseSchema.safeParse(shopResponse);
    if (!responseValidation.success) {
      console.error("Invalid shop data format:", responseValidation.error);
      return new Response(
        JSON.stringify({
          error: "Internal server error",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...locals.corsHeaders,
          },
        }
      );
    }

    return new Response(JSON.stringify(shopResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...locals.corsHeaders,
      },
    });
  } catch (err) {
    console.error("Error in PUT /api/shops:", err);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...locals.corsHeaders,
        },
      }
    );
  }
};

export const GET: APIRoute = async ({ locals }) => {
  try {
    // Sprawdzamy czy mamy użytkownika w kontekście
    if (!locals.user) {
      console.error("[Shops API] No user in context");
      return new Response(
        JSON.stringify({
          error: "Unauthorized - Please log in",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            ...locals.corsHeaders,
          },
        }
      );
    }

    console.debug("[Shops API] User context:", {
      userId: locals.user.id,
      email: locals.user.email,
    });

    // MVP: Zwracamy mockowane dane sklepu
    const now = new Date().toISOString();
    const shopResponse: ShopResponseDTO = {
      shopId: locals.user.id,
      shopifyDomain: "test-shop.myshopify.com",
      createdAt: now,
      updatedAt: now,
    };

    // Walidacja odpowiedzi
    const responseValidation = shopResponseSchema.safeParse(shopResponse);
    if (!responseValidation.success) {
      console.error("Invalid shop data format:", responseValidation.error);
      return new Response(
        JSON.stringify({
          error: "Internal server error",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...locals.corsHeaders,
          },
        }
      );
    }

    return new Response(JSON.stringify(shopResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...locals.corsHeaders,
      },
    });
  } catch (err) {
    console.error("Error in GET /api/shops:", err);
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
