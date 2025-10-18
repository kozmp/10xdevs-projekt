import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ACCORDION_SECTIONS } from "./constants";
import type { Product } from "./types";

interface ProductPreviewContentProps {
  product: Product;
  sanitizeHTML: (html: string | null) => string;
  formattedDate: string;
  lastSyncedDate: string;
}

export function ProductPreviewContent({
  product,
  sanitizeHTML,
  formattedDate,
  lastSyncedDate,
}: ProductPreviewContentProps) {
  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          <span className={`text-sm ${product.status === "published" ? "text-green-600" : "text-gray-600"}`}>
            {product.status === "published" ? "Opublikowany" : "Szkic"}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">Utworzono: {formattedDate}</div>
        <div className="text-sm text-muted-foreground">Ostatnia synchronizacja: {lastSyncedDate}</div>
      </div>

      {/* Accordion Sections */}
      <Accordion type="multiple" className="w-full">
        {/* Short Description */}
        <AccordionItem value={ACCORDION_SECTIONS.SHORT_DESCRIPTION}>
          <AccordionTrigger>Krótki opis</AccordionTrigger>
          <AccordionContent>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: sanitizeHTML(product.shortDescription),
              }}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Long Description */}
        <AccordionItem value={ACCORDION_SECTIONS.LONG_DESCRIPTION}>
          <AccordionTrigger>Pełny opis</AccordionTrigger>
          <AccordionContent>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: sanitizeHTML(product.longDescription),
              }}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Categories */}
        <AccordionItem value={ACCORDION_SECTIONS.CATEGORIES}>
          <AccordionTrigger>Kategorie ({product.categories.length})</AccordionTrigger>
          <AccordionContent>
            {product.categories.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {product.categories.map((category) => (
                  <li key={category.id} className="text-sm">
                    {category.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Brak kategorii</p>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Collections */}
        <AccordionItem value={ACCORDION_SECTIONS.COLLECTIONS}>
          <AccordionTrigger>Kolekcje ({product.collections.length})</AccordionTrigger>
          <AccordionContent>
            {product.collections.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {product.collections.map((collection) => (
                  <li key={collection.id} className="text-sm">
                    {collection.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Brak kolekcji</p>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Metadata */}
        {product.metadata && (
          <AccordionItem value={ACCORDION_SECTIONS.METADATA}>
            <AccordionTrigger>Metadane</AccordionTrigger>
            <AccordionContent>
              <pre className="text-xs bg-muted p-4 rounded overflow-auto">
                {JSON.stringify(product.metadata, null, 2)}
              </pre>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
}
