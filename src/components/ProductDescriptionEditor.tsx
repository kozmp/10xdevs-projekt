import React, { useState } from "react";
import { RichTextEditor } from "./RichTextEditor";
import { useDescriptionEditor } from "./hooks/useDescriptionEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Save, History, Loader2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/**
 * Product Description Editor with API Integration
 *
 * Pełny komponent edytora z integracją backendu:
 * - Rich text editing
 * - Auto-save (optional)
 * - Version history
 * - Loading states
 * - Error handling
 */

interface ProductDescriptionEditorProps {
  jobId: string;
  productId: string;
  productName?: string;
  initialContent?: string;
  autoSave?: boolean;
  readOnly?: boolean;
}

export const ProductDescriptionEditor: React.FC<ProductDescriptionEditorProps> = ({
  jobId,
  productId,
  productName = "Produkt",
  initialContent = "",
  autoSave = false,
  readOnly = false,
}) => {
  const {
    content,
    isSaving,
    isLoading,
    error,
    versions,
    currentVersion,
    hasUnsavedChanges,
    setContent,
    saveDescription,
    loadVersion,
  } = useDescriptionEditor({
    jobId,
    productId,
    initialContent,
    autoSave,
  });

  // Local state for version note dialog
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [versionNote, setVersionNote] = useState("");
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  /**
   * Handle save with optional version note
   */
  const handleSave = async () => {
    if (versionNote.trim()) {
      await saveDescription(versionNote);
      setVersionNote("");
      setShowSaveDialog(false);
    } else {
      await saveDescription();
    }
  };

  /**
   * Handle quick save (without version note)
   */
  const handleQuickSave = async () => {
    await saveDescription();
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pl-PL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Ładowanie edytora...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with product info and actions */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle>Edycja opisu produktu</CardTitle>
              <CardDescription>
                {productName}
                {currentVersion && (
                  <span className="ml-2 text-xs">
                    • Wersja {currentVersion.version}
                    {currentVersion.versionNote && ` (${currentVersion.versionNote})`}
                  </span>
                )}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              {/* Version History Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVersionHistory(true)}
                disabled={versions.length === 0 || readOnly}
              >
                <History className="h-4 w-4 mr-2" />
                Historia ({versions.length})
              </Button>

              {/* Save Button */}
              <Button
                variant={hasUnsavedChanges ? "default" : "outline"}
                size="sm"
                onClick={handleQuickSave}
                disabled={isSaving || !hasUnsavedChanges || readOnly}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Zapisywanie...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {hasUnsavedChanges ? "Zapisz" : "Zapisano"}
                  </>
                )}
              </Button>

              {/* Save with Note Button */}
              {hasUnsavedChanges && !readOnly && (
                <Button variant="secondary" size="sm" onClick={() => setShowSaveDialog(true)} disabled={isSaving}>
                  Zapisz z komentarzem
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error Alert */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rich Text Editor */}
      <RichTextEditor
        initialContent={content}
        onChange={setContent}
        placeholder="Zacznij pisać opis produktu..."
        label="Treść opisu"
        readOnly={readOnly}
        error={!!error}
      />

      {/* Auto-save indicator */}
      {autoSave && (
        <p className="text-xs text-muted-foreground">Auto-save włączony • Zmiany zapisują się automatycznie</p>
      )}

      {/* Save with Version Note Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zapisz nową wersję</DialogTitle>
            <DialogDescription>Dodaj opcjonalny komentarz do tej wersji opisu.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="version-note">Komentarz do wersji (opcjonalnie)</Label>
              <Input
                id="version-note"
                placeholder="np. Dodano sekcję specyfikacji technicznej"
                value={versionNote}
                onChange={(e) => setVersionNote(e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">{versionNote.length} / 500 znaków</p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Anuluj
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Zapisywanie...
                </>
              ) : (
                "Zapisz"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historia wersji</DialogTitle>
            <DialogDescription>Wybierz wersję do przywrócenia</DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-4">
            {versions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Brak zapisanych wersji</p>
            ) : (
              versions.map((version) => (
                <Card
                  key={version.versionId}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    currentVersion?.versionId === version.versionId ? "border-primary" : ""
                  }`}
                  onClick={() => {
                    loadVersion(version.versionId);
                    setShowVersionHistory(false);
                  }}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Wersja {version.version}</span>
                          {currentVersion?.versionId === version.versionId && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                              Aktualna
                            </span>
                          )}
                        </div>
                        {version.versionNote && <p className="text-sm text-muted-foreground">{version.versionNote}</p>}
                        <p className="text-xs text-muted-foreground">{formatDate(version.createdAt)}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {version.content.replace(/<[^>]*>/g, "").length} znaków
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDescriptionEditor;
