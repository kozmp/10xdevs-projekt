import type { APIRoute } from 'astro';
import { productIdSchema, productDetailSchema } from '../../../lib/schemas/product';
import type { ProductDetailDTO } from '../../../types';

export const prerender = false;

export const GET: APIRoute = async ({ locals, params }) => {
  try {
    // Walidacja parametru ID
    const validationResult = productIdSchema.safeParse(params.id);
    if (!validationResult.success) {
      return new Response(JSON.stringify({
        error: 'Invalid product ID',
        details: validationResult.error.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const productId = validationResult.data;

    // MVP: Mockowane produkty
    const mockProductsDetail: Record<string, ProductDetailDTO> = {
      '11111111-1111-1111-1111-111111111111': {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Product Test 1',
        sku: 'TEST-001',
        shortDescription: 'Short description for product 1',
        longDescription: 'Long description for product 1',
        status: 'published',
        metadata: { price: 99.99, weight: 1.5 },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-10T00:00:00Z',
        lastSyncedAt: '2025-01-10T00:00:00Z',
        categories: [{ id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', name: 'Category 1' }],
        collections: [{ id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', name: 'Collection 1' }]
      },
      '22222222-2222-2222-2222-222222222222': {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Product Test 2',
        sku: 'TEST-002',
        shortDescription: 'Short description for product 2',
        longDescription: 'Long description for product 2',
        status: 'draft',
        metadata: { price: 49.99 },
        createdAt: '2025-01-02T00:00:00Z',
        updatedAt: '2025-01-11T00:00:00Z',
        lastSyncedAt: null,
        categories: [{ id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', name: 'Category 2' }],
        collections: []
      },
      '33333333-3333-3333-3333-333333333333': {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Product Test 3',
        sku: 'TEST-003',
        shortDescription: 'Short description for product 3',
        longDescription: null,
        status: 'published',
        metadata: null,
        createdAt: '2025-01-03T00:00:00Z',
        updatedAt: '2025-01-12T00:00:00Z',
        lastSyncedAt: '2025-01-12T00:00:00Z',
        categories: [],
        collections: [{ id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', name: 'Collection 2' }]
      }
    };

    const productDetail = mockProductsDetail[productId];

    if (!productDetail) {
      return new Response(JSON.stringify({
        error: 'Product not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Walidacja odpowiedzi
    const responseValidation = productDetailSchema.safeParse(productDetail);
    if (!responseValidation.success) {
      console.error('Invalid product data format:', responseValidation.error);
      return new Response(JSON.stringify({
        error: 'Internal server error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(productDetail), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Error in GET /api/products/[id]:', err);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
