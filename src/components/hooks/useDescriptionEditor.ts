import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  saveDescriptionVersion,
  getDescriptionVersions,
  type SaveDescriptionRequest,
} from "../../lib/api/description-api";
import type { DescriptionVersionDTO } from "../../types";

/**
 * Custom Hook for Description Editor
 *
 * Zarządza stanem edytora i komunikacją z API
 *
 * Features:
 * - Auto-save z debouncing (opcjonalnie)
 * - Loading states
 * - Error handling
 * - Toast notifications
 * - Version history management
 */

interface UseDescriptionEditorOptions {
  jobId: string;
  productId: string;
  initialContent?: string;
  autoSave?: boolean;
  autoSaveDelay?: number; // ms
  onSaveSuccess?: (version: DescriptionVersionDTO) => void;
  onSaveError?: (error: Error) => void;
}

interface UseDescriptionEditorReturn {
  // State
  content: string;
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
  versions: DescriptionVersionDTO[];
  currentVersion: DescriptionVersionDTO | null;

  // Actions
  setContent: (content: string) => void;
  saveDescription: (versionNote?: string) => Promise<void>;
  loadVersions: () => Promise<void>;
  loadVersion: (versionId: string) => void;

  // Computed
  hasUnsavedChanges: boolean;
  characterCount: number;
}

export function useDescriptionEditor({
  jobId,
  productId,
  initialContent = "",
  autoSave = false,
  autoSaveDelay = 3000,
  onSaveSuccess,
  onSaveError,
}: UseDescriptionEditorOptions): UseDescriptionEditorReturn {
  // State
  const [content, setContentState] = useState(initialContent);
  const [savedContent, setSavedContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<DescriptionVersionDTO[]>([]);
  const [currentVersion, setCurrentVersion] = useState<DescriptionVersionDTO | null>(null);

  // Auto-save timer
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Computed values
  const hasUnsavedChanges = content !== savedContent;
  const characterCount = content.replace(/<[^>]*>/g, "").length; // Strip HTML tags

  /**
   * Set content with auto-save trigger
   */
  const setContent = useCallback(
    (newContent: string) => {
      setContentState(newContent);
      setError(null);

      // Clear existing timer
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }

      // Set new auto-save timer if enabled
      if (autoSave && newContent !== savedContent) {
        const timer = setTimeout(() => {
          saveDescription();
        }, autoSaveDelay);
        setAutoSaveTimer(timer);
      }
    },
    [autoSave, autoSaveDelay, savedContent, autoSaveTimer]
  );

  /**
   * Save description to backend
   */
  const saveDescription = useCallback(
    async (versionNote?: string) => {
      if (isSaving) {
        return; // Prevent concurrent saves
      }

      setIsSaving(true);
      setError(null);

      try {
        const request: SaveDescriptionRequest = {
          content,
          format: "html",
          versionNote,
        };

        const newVersion = await saveDescriptionVersion(jobId, productId, request);

        // Update state
        setSavedContent(content);
        setCurrentVersion(newVersion);
        setVersions((prev) => [newVersion, ...prev]);

        // Success callback
        onSaveSuccess?.(newVersion);

        // Show success toast
        toast.success("Opis zapisany pomyślnie", {
          description: `Wersja ${newVersion.version} utworzona`,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nie udało się zapisać opisu";
        setError(errorMessage);

        // Error callback
        onSaveError?.(err instanceof Error ? err : new Error(errorMessage));

        // Show error toast
        toast.error("Błąd zapisu", {
          description: errorMessage,
        });
      } finally {
        setIsSaving(false);
      }
    },
    [content, jobId, productId, isSaving, onSaveSuccess, onSaveError]
  );

  /**
   * Load all versions from backend
   */
  const loadVersions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const loadedVersions = await getDescriptionVersions(jobId, productId);
      setVersions(loadedVersions);

      // Set current version to latest
      if (loadedVersions.length > 0) {
        setCurrentVersion(loadedVersions[0]);
        setContentState(loadedVersions[0].content);
        setSavedContent(loadedVersions[0].content);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Nie udało się wczytać wersji opisów";
      setError(errorMessage);

      toast.error("Błąd ładowania", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [jobId, productId]);

  /**
   * Load specific version by ID
   */
  const loadVersion = useCallback(
    (versionId: string) => {
      const version = versions.find((v) => v.versionId === versionId);
      if (version) {
        setContentState(version.content);
        setSavedContent(version.content);
        setCurrentVersion(version);

        toast.info("Wczytano wersję", {
          description: `Wersja ${version.version}${version.versionNote ? `: ${version.versionNote}` : ""}`,
        });
      }
    },
    [versions]
  );

  // Load versions on mount
  useEffect(() => {
    if (jobId && productId) {
      loadVersions();
    }
  }, [jobId, productId, loadVersions]);

  // Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

  return {
    // State
    content,
    isSaving,
    isLoading,
    error,
    versions,
    currentVersion,

    // Actions
    setContent,
    saveDescription,
    loadVersions,
    loadVersion,

    // Computed
    hasUnsavedChanges,
    characterCount,
  };
}
