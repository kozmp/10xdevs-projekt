import type { APIRoute } from 'astro';
import { z } from 'zod';
import { ProductDescriptionGeneratorService, GenerationStyle, GenerationLanguage } from '@/lib/services/product-description-generator.service';

const generateDescriptionsSchema = z.object({
  productIds: z.array(z.string().uuid()),
  style: z.enum(['professional', 'casual', 'sales-focused'] as const),
  language: z.enum(['pl', 'en'] as const)
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validationResult = generateDescriptionsSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(JSON.stringify({
        error: 'Invalid request data',
        details: validationResult.error.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { productIds, style, language } = validationResult.data;

    // Inicjalizacja serwisu
    const generator = new ProductDescriptionGeneratorService({
      apiKey: import.meta.env.OPENROUTER_API_KEY,
      defaultModel: 'openai/gpt-4o-mini'
    });

    // MVP: Mockowane dane produktów (do zastąpienia rzeczywistymi danymi z bazy)
    const mockProducts = productIds.map(id => ({
      id,
      name: `Product ${id.substring(0, 8)}`,
      sku: `SKU-${id.substring(0, 6)}`,
      metadata: { price: 99.99 },
      categories: [{ name: 'Test Category' }],
      collections: [{ name: 'Test Collection' }]
    }));

    // Generowanie opisów dla każdego produktu
    const results = await Promise.all(
      mockProducts.map(async (product) => {
        try {
          const descriptions = await generator.generateDescription(product, {
            style: style as GenerationStyle,
            language: language as GenerationLanguage
          });

          return {
            productId: product.id,
            status: 'success',
            data: descriptions
          };
        } catch (error) {
          console.error(`Error generating descriptions for product ${product.id}:`, error);
          return {
            productId: product.id,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    // Obliczanie statystyk
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    return new Response(JSON.stringify({
      results,
      summary: {
        total: productIds.length,
        success: successCount,
        error: errorCount
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in generate-descriptions endpoint:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
