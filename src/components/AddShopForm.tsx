import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { updateShopSchema } from "../lib/schemas/shop";
import { toast } from "sonner";
import { supabaseClient } from "../db/supabase.client";

export const AddShopForm = () => {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Walidacja danych
      const validationResult = updateShopSchema.safeParse({ apiKey });
      if (!validationResult.success) {
        toast.error("Błąd walidacji danych");
        return;
      }

      // Wysłanie żądania do API
      const response = await fetch("/api/shops", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabaseClient.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ apiKey }),
      });

      if (!response.ok) {
        throw new Error("Błąd podczas dodawania sklepu");
      }

      const data = await response.json();
      toast.success("Sklep został pomyślnie dodany");

      // Opcjonalne: przekierowanie do dashboardu
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error("Wystąpił błąd podczas dodawania sklepu");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="apiKey">Klucz API Sklepu</Label>
        <Input
          id="apiKey"
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Wprowadź klucz API"
          required
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Dodawanie..." : "Dodaj sklep"}
      </Button>
    </form>
  );
};
