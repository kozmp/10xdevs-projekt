import type { SupabaseClient } from "../../db/supabase.client";
import type { SaveDescriptionCommand, DescriptionVersionDTO } from "../../types";

/**
 * Serwis do zarządzania wersjami opisów produktów
 *
 * Odpowiedzialny za:
 * - Walidację dostępu użytkownika do produktu (via RLS)
 * - Zapis nowych wersji opisów z auto-incrementing version number
 * - Mapowanie danych z/do bazy danych
 */
export class DescriptionVersionService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Zapisuje nową wersję opisu produktu
   *
   * @param jobId - ID joba (dla RLS)
   * @param productId - ID produktu
   * @param command - Dane nowej wersji opisu
   * @returns Nowo utworzona wersja opisu
   * @throws Error jeśli job/product nie istnieje lub użytkownik nie ma dostępu
   */
  async saveDescriptionVersion(
    jobId: string,
    productId: string,
    command: SaveDescriptionCommand
  ): Promise<DescriptionVersionDTO> {
    // 1. Sprawdź czy product należy do tego joba i czy user ma dostęp (RLS)
    const { data: product, error: productError } = await this.supabase
      .from("products")
      .select("product_id, job_id")
      .eq("product_id", productId)
      .eq("job_id", jobId)
      .single();

    if (productError || !product) {
      throw new Error(
        productError?.code === "PGRST116"
          ? "Product not found or access denied"
          : `Failed to verify product: ${productError?.message || "Unknown error"}`
      );
    }

    // 2. Pobierz aktualny numer wersji (max version + 1)
    const { data: latestVersion } = await this.supabase
      .from("description_versions")
      .select("version")
      .eq("product_id", productId)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    const nextVersion = latestVersion ? latestVersion.version + 1 : 1;

    // 3. Zapisz nową wersję
    const { data: newVersion, error: insertError } = await this.supabase
      .from("description_versions")
      .insert({
        product_id: productId,
        job_id: jobId,
        content: command.content,
        format: command.format,
        version_note: command.versionNote,
        version: nextVersion,
      })
      .select()
      .single();

    if (insertError || !newVersion) {
      throw new Error(
        `Failed to save description version: ${insertError?.message || "Unknown error"}`
      );
    }

    // 4. Mapuj do DTO
    return {
      versionId: newVersion.version_id,
      productId: newVersion.product_id,
      jobId: newVersion.job_id,
      content: newVersion.content,
      format: newVersion.format as "html" | "markdown",
      versionNote: newVersion.version_note || undefined,
      createdAt: newVersion.created_at,
      version: newVersion.version,
    };
  }

  /**
   * Pobiera wszystkie wersje opisu dla produktu
   *
   * @param productId - ID produktu
   * @returns Lista wersji opisów posortowanych malejąco (najnowsze pierwsze)
   */
  async getDescriptionVersions(productId: string): Promise<DescriptionVersionDTO[]> {
    const { data: versions, error } = await this.supabase
      .from("description_versions")
      .select("*")
      .eq("product_id", productId)
      .order("version", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch description versions: ${error.message}`);
    }

    return (
      versions?.map((v) => ({
        versionId: v.version_id,
        productId: v.product_id,
        jobId: v.job_id,
        content: v.content,
        format: v.format as "html" | "markdown",
        versionNote: v.version_note || undefined,
        createdAt: v.created_at,
        version: v.version,
      })) || []
    );
  }
}
