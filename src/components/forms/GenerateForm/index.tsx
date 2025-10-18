import React from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StyleSelectCards } from "@/components/StyleSelectCards";
import { LanguageSelect } from "@/components/LanguageSelect";
import { useGenerateForm } from "./useGenerateForm";
import type { GenerateFormProps } from "./types";

export function GenerateForm({ selectedProductIds, onSuccess, onError }: GenerateFormProps) {
  const { form, isGenerating, progress, results, summary, error, handleSubmit } = useGenerateForm(
    selectedProductIds,
    onSuccess,
    onError
  );

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Generowanie opisów produktów</h1>
        <p className="text-gray-600">Wybrane produkty: {selectedProductIds.length}</p>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Styl komunikacji</h2>
            <StyleSelectCards selected={form.watch("style")} onSelect={(value) => form.setValue("style", value)} />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Język</h2>
            <LanguageSelect selected={form.watch("language")} onSelect={(value) => form.setValue("language", value)} />
          </div>

          <div className="space-y-4">
            <Button type="submit" disabled={isGenerating || selectedProductIds.length === 0} className="w-full">
              {isGenerating ? "Generowanie..." : "Generuj opisy"}
            </Button>

            {isGenerating && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-gray-600 text-center">Generowanie opisów... {progress}%</p>
              </div>
            )}

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

            {summary && (
              <div className="p-4 bg-green-50 rounded-md">
                <h3 className="font-semibold text-green-800">Podsumowanie</h3>
                <ul className="mt-2 space-y-1 text-green-700">
                  <li>Łącznie: {summary.total}</li>
                  <li>Sukces: {summary.success}</li>
                  <li>Błędy: {summary.error}</li>
                </ul>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Wyniki</h3>
                <div className="space-y-4">
                  {results.map((result) => (
                    <div
                      key={result.productId}
                      className={`p-4 rounded-md ${result.status === "success" ? "bg-green-50" : "bg-red-50"}`}
                    >
                      <h4 className="font-semibold">Product ID: {result.productId}</h4>
                      {result.status === "success" ? (
                        <div className="mt-2 space-y-2">
                          <div>
                            <h5 className="font-medium">Krótki opis:</h5>
                            <p className="text-sm">{result.data?.shortDescription}</p>
                          </div>
                          <div>
                            <h5 className="font-medium">Długi opis:</h5>
                            <div
                              className="text-sm"
                              dangerouslySetInnerHTML={{
                                __html: result.data?.longDescription || "",
                              }}
                            />
                          </div>
                          <div>
                            <h5 className="font-medium">Meta opis:</h5>
                            <p className="text-sm">{result.data?.metaDescription}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-red-600 mt-2">{result.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
