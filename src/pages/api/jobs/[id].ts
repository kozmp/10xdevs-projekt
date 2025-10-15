import type { APIRoute } from 'astro';
import { jobDetailSchema } from '../../../lib/schemas/job';
import type { JobDetailDTO } from '../../../types';

export const prerender = false;

export const GET: APIRoute = async ({ locals, params }) => {
  try {
    // Walidacja ID zlecenia - dopuszczamy również mock job IDs
    if (!params.id) {
      return new Response(JSON.stringify({
        error: 'Invalid job ID format'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // MVP: Mockowane zlecenia
    const mockJobsDetail: Record<string, JobDetailDTO> = {
      'job-1234567890-abc123': {
        jobId: 'job-1234567890-abc123',
        status: 'in_progress',
        style: 'Professional',
        language: 'pl',
        publicationMode: 'draft',
        createdAt: '2025-01-15T10:00:00Z',
        startedAt: '2025-01-15T10:05:00Z',
        completedAt: null,
        totalCostEstimate: 15.50,
        products: [
          {
            productId: '11111111-1111-1111-1111-111111111111',
            status: 'completed',
            cost: 5.00,
            tokenUsageDetails: { input: 100, output: 200 }
          },
          {
            productId: '22222222-2222-2222-2222-222222222222',
            status: 'in_progress',
            cost: null,
            tokenUsageDetails: null
          }
        ],
        progress: 50
      }
    };

    // Jeśli job ID zaczyna się od "job-", zwracamy mock
    const jobDetail = params.id.startsWith('job-')
      ? mockJobsDetail[params.id] || {
          jobId: params.id,
          status: 'pending',
          style: 'Professional',
          language: 'pl',
          publicationMode: 'draft',
          createdAt: new Date().toISOString(),
          startedAt: null,
          completedAt: null,
          totalCostEstimate: null,
          products: [],
          progress: 0
        }
      : null;

    if (!jobDetail) {
      return new Response(JSON.stringify({
        error: 'Job not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Walidacja odpowiedzi
    const responseValidation = jobDetailSchema.safeParse(jobDetail);
    if (!responseValidation.success) {
      console.error('Invalid job data format:', responseValidation.error);
      return new Response(JSON.stringify({
        error: 'Internal server error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(jobDetail), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Error in GET /api/jobs/[id]:', err);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
