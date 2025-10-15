import type { APIRoute } from 'astro';
import { listProductsQuerySchema, listProductsResponseSchema } from '../../../lib/schemas/product';
import type { ProductSummaryDTO } from '../../../types';

export const prerender = false;

export const GET: APIRoute = async ({ locals, request, url }) => {
  try {
    // Parsowanie i walidacja query params
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const validationResult = listProductsQuerySchema.safeParse(queryParams);
    
    if (!validationResult.success) {
      console.debug('[Products API] Invalid query parameters:', {
        params: queryParams,
        errors: validationResult.error.errors
      });
      
      return new Response(JSON.stringify({
        error: 'Invalid query parameters',
        details: validationResult.error.errors
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...locals.corsHeaders
        }
      });
    }

    const { page, limit, status, search } = validationResult.data;

    // MVP: Zwracamy mockowane produkty
    const mockProducts: ProductSummaryDTO[] = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Product Test 1',
        sku: 'TEST-001',
        shortDescription: 'Short description for product 1',
        longDescription: 'Long description for product 1',
        status: 'published',
        categories: [{ id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', name: 'Category 1' }],
        collections: [{ id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', name: 'Collection 1' }]
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Product Test 2',
        sku: 'TEST-002',
        shortDescription: 'Short description for product 2',
        longDescription: 'Long description for product 2',
        status: 'draft',
        categories: [{ id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', name: 'Category 2' }],
        collections: []
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Product Test 3',
        sku: 'TEST-003',
        shortDescription: 'Short description for product 3',
        longDescription: null,
        status: 'published',
        categories: [],
        collections: [{ id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', name: 'Collection 2' }]
      }
    ];

    // Filtrowanie po statusie
    let filteredProducts = mockProducts;
    if (status) {
      filteredProducts = filteredProducts.filter(p => p.status === status);
    }
    if (search) {
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Paginacja
    const total = filteredProducts.length;
    const offset = (page - 1) * limit;
    const paginatedProducts = filteredProducts.slice(offset, offset + limit);

    const totalPages = Math.ceil(total / limit);
    
    const response = {
      data: paginatedProducts,
      meta: {
        total,
        page,
        limit,
        totalPages
      }
    };

    // Walidacja odpowiedzi
    const responseValidation = listProductsResponseSchema.safeParse(response);
    if (!responseValidation.success) {
      console.error('Invalid response format:', responseValidation.error);
      return new Response(JSON.stringify({
        error: 'Internal server error'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...locals.corsHeaders
        }
      });
    }

    // Przygotowanie odpowiedzi
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=60',
        ...locals.corsHeaders
      }
    });

  } catch (err) {
    console.error('Error in GET /api/products:', err);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
