import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";

export function AddShopForm() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch("/api/shops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shopifyDomain: formData.get("domain"),
          apiKey: formData.get("apiKey"),
          apiSecret: formData.get("apiSecret"),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add shop");
      }

      setSuccess(true);
      form.reset();

      // Przekieruj na dashboard po 2 sekundach
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="domain">Domena sklepu</Label>
          <Input id="domain" name="domain" type="text" placeholder="your-store.myshopify.com" required />
          <p className="text-sm text-muted-foreground">Wprowadź domenę swojego sklepu Shopify</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiKey">Klucz API</Label>
          <Input id="apiKey" name="apiKey" type="text" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiSecret">Sekret API</Label>
          <Input id="apiSecret" name="apiSecret" type="password" required />
        </div>

        {error && <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

        {success && (
          <div className="p-4 bg-green-50 text-green-600 rounded-md">
            Sklep został pomyślnie dodany! Za chwilę nastąpi przekierowanie...
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Dodawanie..." : "Dodaj sklep"}
        </Button>
      </form>
    </Card>
  );
}
