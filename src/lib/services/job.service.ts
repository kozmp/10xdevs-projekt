import type { SupabaseClient } from "../../db/supabase.client";
import type { CreateJobCommand, JobDTO, CostEstimateRequest } from "../../types";
import { CostEstimateService } from "./cost-estimate.service";

/**
 * Serwis do zarządzania jobami (zleceniami generowania opisów)
 *
 * Odpowiedzialny za:
 * - Tworzenie jobów
 * - Asynchroniczną kalkulację kosztów
 * - Zarządzanie statusem jobów
 */
export class JobService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Tworzy nowy job w bazie danych
   *
   * @param command - Dane do utworzenia joba
   * @param shopId - ID sklepu (dla RLS)
   * @returns Utworzony job
   * @throws Error jeśli nie udało się utworzyć joba
   */
  async createJob(command: CreateJobCommand, shopId: string): Promise<JobDTO> {
    // 1. Weryfikuj że produkty istnieją i należą do sklepu
    const { data: products, error: productsError } = await this.supabase
      .from("products")
      .select("id")
      .eq("shop_id", shopId)
      .in("id", command.productIds);

    if (productsError) {
      throw new Error(`Failed to verify products: ${productsError.message}`);
    }

    if (!products || products.length !== command.productIds.length) {
      const foundIds = products?.map((p) => p.id) || [];
      const missingIds = command.productIds.filter((id) => !foundIds.includes(id));
      throw new Error(`Products not found or access denied: ${missingIds.join(", ")}`);
    }

    // 2. Utwórz job w bazie
    const { data: job, error: jobError } = await this.supabase
      .from("jobs")
      .insert({
        shop_id: shopId,
        status: "pending",
        style: command.style,
        language: command.language,
        publication_mode: command.publicationMode || "draft",
        model: command.model || "openai/gpt-4o-mini",
        system_message: command.systemMessage,
      })
      .select()
      .single();

    if (jobError || !job) {
      throw new Error(`Failed to create job: ${jobError?.message || "Unknown error"}`);
    }

    // 3. Utwórz powiązania job-product (job_products table)
    const jobProducts = command.productIds.map((productId) => ({
      job_id: job.id,
      product_id: productId,
      status: "pending" as const,
    }));

    const { error: jobProductsError } = await this.supabase.from("job_products").insert(jobProducts);

    if (jobProductsError) {
      // Rollback: usuń job jeśli nie udało się dodać produktów
      await this.supabase.from("jobs").delete().eq("id", job.id);
      throw new Error(`Failed to associate products with job: ${jobProductsError.message}`);
    }

    // 4. Zwróć utworzony job
    return this.mapToJobDTO(job);
  }

  /**
   * Asynchronicznie kalkuluje koszty dla joba i zapisuje je w bazie
   * Ta funkcja jest wywoływana w tle i nie blokuje głównej funkcjonalności
   *
   * @param jobId - ID joba
   * @param model - Model LLM do użycia (opcjonalny)
   * @returns Promise<void>
   */
  async calculateInitialCostEstimate(jobId: string, model?: string): Promise<void> {
    try {
      // 1. Pobierz job z bazy
      const { data: job, error: jobError } = await this.supabase
        .from("jobs")
        .select("id, shop_id, style, language")
        .eq("id", jobId)
        .single();

      if (jobError || !job) {
        console.error(`[JobService] Failed to fetch job ${jobId}:`, jobError?.message);
        return;
      }

      // 2. Pobierz produkty powiązane z jobem
      const { data: jobProducts, error: jobProductsError } = await this.supabase
        .from("job_products")
        .select("product_id")
        .eq("job_id", jobId);

      if (jobProductsError || !jobProducts || jobProducts.length === 0) {
        console.error(`[JobService] Failed to fetch products for job ${jobId}:`, jobProductsError?.message);
        return;
      }

      const productIds = jobProducts.map((jp) => jp.product_id);

      // 3. Użyj CostEstimateService do kalkulacji kosztów
      const costEstimateService = new CostEstimateService(this.supabase);

      const estimateRequest: CostEstimateRequest = {
        productIds,
        style: job.style,
        language: job.language,
        model: model || "openai/gpt-4o-mini",
      };

      // Nie przekazujemy userId, bo używamy shop_id z RLS
      // Tutaj musimy pobrać userId z sesji lub kontekstu - na razie pomijamy
      const estimate = await costEstimateService.estimateCost(estimateRequest, job.shop_id);

      // 4. Zaktualizuj job z wynikami kalkulacji
      const { error: updateError } = await this.supabase
        .from("jobs")
        .update({
          total_cost_estimate: estimate.totalCost,
          estimated_tokens_total: estimate.totalTokens,
        })
        .eq("id", jobId);

      if (updateError) {
        console.error(`[JobService] Failed to update job ${jobId} with cost estimate:`, updateError.message);
        return;
      }

      console.log(`[JobService] Successfully calculated cost estimate for job ${jobId}: $${estimate.totalCost}`);
    } catch (error) {
      console.error(`[JobService] Error calculating cost estimate for job ${jobId}:`, error);
      // Nie rzucamy błędu - to funkcja asynchroniczna w tle
    }
  }

  /**
   * Pobiera job z bazy danych
   */
  async getJob(jobId: string): Promise<JobDTO | null> {
    const { data: job, error } = await this.supabase.from("jobs").select("*").eq("id", jobId).single();

    if (error || !job) {
      return null;
    }

    return this.mapToJobDTO(job);
  }

  /**
   * Mapuje rekord z bazy na JobDTO
   */
  private mapToJobDTO(job: any): JobDTO {
    return {
      id: job.id,
      shopId: job.shop_id,
      status: job.status,
      style: job.style,
      language: job.language,
      totalCostEstimate: job.total_cost_estimate,
      estimatedTokensTotal: job.estimated_tokens_total,
      publicationMode: job.publication_mode,
      model: job.model,
      systemMessage: job.system_message,
      createdAt: job.created_at,
      startedAt: job.started_at,
      completedAt: job.completed_at,
    };
  }
}
