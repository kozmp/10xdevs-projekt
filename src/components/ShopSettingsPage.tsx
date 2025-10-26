import { useEffect } from "react";
import { useShopConnection } from "./hooks/useShopConnection";
import { ShopConnectionModal } from "./ShopConnectionModal";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Toaster } from "./ui/sonner";
import { Badge } from "./ui/badge";

/**
 * Strona ustawień połączenia ze sklepem Shopify
 *
 * Demonstracja pełnej integracji:
 * - Hook useShopConnection do zarządzania stanem
 * - ShopConnectionModal do UI
 * - Automatyczne pobieranie danych przy montowaniu
 * - Wyświetlanie aktualnego statusu połączenia
 */
export function ShopSettingsPage() {
  const { shop, isLoading, error, isDialogOpen, connectShop, disconnectShop, fetchShop, openDialog, closeDialog } =
    useShopConnection();

  // Pobierz dane sklepu przy montowaniu komponentu
  useEffect(() => {
    fetchShop();
  }, [fetchShop]);

  return (
    <main className="container mx-auto p-6 max-w-4xl" data-testid="shop-settings-page">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Shop Settings</h1>
        <p className="text-muted-foreground">Manage your Shopify store connection and API credentials</p>
      </div>

      {/* Connection Status Card */}
      <Card className="p-6 mb-6" data-testid="connection-status-card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">Shopify Connection</h2>
            <p className="text-sm text-muted-foreground">
              {shop
                ? "Your store is connected and ready to use"
                : "Connect your Shopify store to start generating product descriptions"}
            </p>
          </div>
          {shop ? (
            <Badge variant="default" className="bg-green-500" data-testid="connection-badge">
              Connected
            </Badge>
          ) : (
            <Badge variant="secondary" data-testid="connection-badge">
              Not Connected
            </Badge>
          )}
        </div>

        {/* Shop Details */}
        {shop && (
          <div className="bg-muted/50 rounded-md p-4 mb-4">
            <div className="grid gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shop Domain:</span>
                <span className="font-medium">{shop.shopifyDomain}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Connected:</span>
                <span className="font-medium">
                  {new Date(shop.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="font-medium">
                  {new Date(shop.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div
            className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-4 text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {shop ? (
            <>
              <Button onClick={openDialog} variant="outline" data-testid="update-api-key-button">
                Update API Key
              </Button>
              <Button onClick={fetchShop} variant="outline" disabled={isLoading} data-testid="refresh-button">
                {isLoading ? "Refreshing..." : "Refresh"}
              </Button>
            </>
          ) : (
            <Button onClick={openDialog} disabled={isLoading} data-testid="connect-button">
              Connect Shopify Store
            </Button>
          )}
        </div>
      </Card>

      {/* Instructions Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">How to connect your Shopify store</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>
            Go to your Shopify Admin panel: <code className="text-xs">your-shop.myshopify.com/admin</code>
          </li>
          <li>
            Navigate to <strong>Settings → Apps and sales channels → Develop apps</strong>
          </li>
          <li>Create a new app or use an existing one</li>
          <li>
            Configure <strong>Admin API access scopes</strong> (required: <code className="text-xs">read_products</code>
            , <code className="text-xs">write_products</code>)
          </li>
          <li>
            Generate an <strong>Admin API access token</strong> (starts with <code className="text-xs">shpat_</code>)
          </li>
          <li>Copy your store domain and API token, then click "Connect Shopify Store" above</li>
        </ol>
      </Card>

      {/* Shop Connection Modal */}
      <ShopConnectionModal
        open={isDialogOpen}
        onOpenChange={closeDialog}
        onConnect={connectShop}
        onDisconnect={disconnectShop}
        currentShop={shop}
        isLoading={isLoading}
        apiError={error}
      />

      {/* Toast notifications */}
      <Toaster />
    </main>
  );
}
