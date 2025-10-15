import { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useProductDetail } from '@/components/hooks/useProductDetail';

interface ProductPreviewModalProps {
  productId: string | null;
  onClose: () => void;
}

export function ProductPreviewModal({
  productId,
  onClose,
}: ProductPreviewModalProps) {
  const { product, loading, error } = useProductDetail(productId);

  const open = productId !== null;

  // Sanitize HTML (basic sanitization - in production use DOMPurify)
  const sanitizeHTML = (html: string | null) => {
    if (!html) return 'Brak danych';
    // Basic sanitization - remove script tags
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  };

  const formattedDate = useMemo(() => {
    if (!product?.createdAt) return '-';
    return new Intl.DateTimeFormat('pl-PL', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(product.createdAt));
  }, [product]);

  const lastSyncedDate = useMemo(() => {
    if (!product?.lastSyncedAt) return '-';
    return new Intl.DateTimeFormat('pl-PL', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(product.lastSyncedAt));
  }, [product]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {loading ? 'Ładowanie...' : product?.name || 'Szczegóły produktu'}
          </DialogTitle>
          <DialogDescription>
            {product?.sku && `SKU: ${product.sku}`}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
              <p className="mt-4 text-muted-foreground">
                Ładowanie szczegółów produktu...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="text-red-500 text-3xl mb-2">⚠️</div>
            <p className="text-red-500">{error.message}</p>
          </div>
        )}

        {!loading && !error && !product && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Brak produktu</p>
          </div>
        )}

        {product && !loading && !error && (
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <span
                  className={`text-sm ${
                    product.status === 'published'
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }`}
                >
                  {product.status === 'published' ? 'Opublikowany' : 'Szkic'}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Utworzono: {formattedDate}
              </div>
              <div className="text-sm text-muted-foreground">
                Ostatnia synchronizacja: {lastSyncedDate}
              </div>
            </div>

            {/* Accordion Sections */}
            <Accordion type="multiple" className="w-full">
              {/* Short Description */}
              <AccordionItem value="short-description">
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
              <AccordionItem value="long-description">
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
              <AccordionItem value="categories">
                <AccordionTrigger>
                  Kategorie ({product.categories.length})
                </AccordionTrigger>
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
                    <p className="text-sm text-muted-foreground">
                      Brak kategorii
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Collections */}
              <AccordionItem value="collections">
                <AccordionTrigger>
                  Kolekcje ({product.collections.length})
                </AccordionTrigger>
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
                    <p className="text-sm text-muted-foreground">
                      Brak kolekcji
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Metadata */}
              {product.metadata && (
                <AccordionItem value="metadata">
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
        )}
      </DialogContent>
    </Dialog>
  );
}
