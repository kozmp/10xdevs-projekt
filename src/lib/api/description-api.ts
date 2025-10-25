/**
 * API Client for Description Versions
 *
 * Funkcje do komunikacji z backendem dla zarządzania wersjami opisów produktów
 */

import type { DescriptionVersionDTO } from "../../types";

export interface SaveDescriptionRequest {
  content: string;
  format: "html" | "markdown";
  versionNote?: string;
}

export interface SaveDescriptionResponse extends DescriptionVersionDTO {}

export interface GetDescriptionVersionsResponse extends Array<DescriptionVersionDTO> {}

/**
 * Zapisuje nową wersję opisu produktu
 *
 * @param jobId - ID joba
 * @param productId - ID produktu
 * @param data - Dane nowej wersji opisu
 * @returns Nowo utworzona wersja opisu
 * @throws Error jeśli request się nie powiedzie
 */
export async function saveDescriptionVersion(
  jobId: string,
  productId: string,
  data: SaveDescriptionRequest
): Promise<SaveDescriptionResponse> {
  const response = await fetch(`/api/jobs/${jobId}/products/${productId}/description`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include", // Dla cookie-based auth
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || `HTTP ${response.status}: Failed to save description`);
  }

  return response.json();
}

/**
 * Pobiera wszystkie wersje opisu produktu
 *
 * @param jobId - ID joba
 * @param productId - ID produktu
 * @returns Lista wersji opisów (najnowsze pierwsze)
 * @throws Error jeśli request się nie powiedzie
 */
export async function getDescriptionVersions(
  jobId: string,
  productId: string
): Promise<GetDescriptionVersionsResponse> {
  const response = await fetch(`/api/jobs/${jobId}/products/${productId}/description`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch description versions`);
  }

  return response.json();
}
