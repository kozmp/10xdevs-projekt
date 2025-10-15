import type { APIRoute } from 'astro';
import { createJobSchema, jobResponseSchema } from '../../../lib/schemas/job';
import type { JobResponseDTO } from '../../../types';

export const prerender = false;

export const POST: APIRoute = async ({ locals, request }) => {
  try {
    // Parsowanie i walidacja body
    const body = await request.json();
    const validationResult = createJobSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(JSON.stringify({
        error: 'Invalid request data',
        details: validationResult.error.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const command = validationResult.data;

    // MVP: Mockowana walidacja produktów
    const validProductIds = new Set([
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
      '33333333-3333-3333-3333-333333333333'
    ]);

    const invalidProductIds = command.productIds.filter(id => !validProductIds.has(id));

    if (invalidProductIds.length > 0) {
      return new Response(JSON.stringify({
        error: 'Some products do not exist or do not belong to your shop',
        invalidProductIds
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // MVP: Generowanie mockowego job ID (UUID format)
    const mockJobId = `${Date.now().toString(16).padStart(8, '0').substring(0,8)}-0000-4000-8000-${Math.random().toString(16).substring(2,14).padStart(12, '0')}`;

    // Przygotowanie odpowiedzi
    const response: JobResponseDTO = {
      jobId: mockJobId,
      status: 'pending'
    };

    // Walidacja odpowiedzi
    const responseValidation = jobResponseSchema.safeParse(response);
    if (!responseValidation.success) {
      console.error('Invalid response format:', responseValidation.error);
      return new Response(JSON.stringify({
        error: 'Internal server error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Error in POST /api/jobs:', err);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
