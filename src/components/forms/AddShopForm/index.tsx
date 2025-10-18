import React from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAddShopForm } from "./useAddShopForm";
import type { AddShopFormProps } from "./types";

export function AddShopForm({ onSuccess, onError, redirectUrl }: AddShopFormProps) {
  const { form, isSubmitting, error, success, handleSubmit } = useAddShopForm(onSuccess, onError, redirectUrl);

  return (
    <Card className="max-w-lg mx-auto p-6">
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="shopifyDomain">Domena sklepu</Label>
            <Input
              {...form.register("shopifyDomain")}
              id="shopifyDomain"
              type="text"
              placeholder="your-store.myshopify.com"
            />
            {form.formState.errors.shopifyDomain && (
              <p className="text-sm text-red-600">{form.formState.errors.shopifyDomain.message}</p>
            )}
            <p className="text-sm text-muted-foreground">Wprowadź domenę swojego sklepu Shopify</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">Klucz API</Label>
            <Input {...form.register("apiKey")} id="apiKey" type="text" />
            {form.formState.errors.apiKey && (
              <p className="text-sm text-red-600">{form.formState.errors.apiKey.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiSecret">Sekret API</Label>
            <Input {...form.register("apiSecret")} id="apiSecret" type="password" />
            {form.formState.errors.apiSecret && (
              <p className="text-sm text-red-600">{form.formState.errors.apiSecret.message}</p>
            )}
          </div>

          {error && <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

          {success && (
            <div className="p-4 bg-green-50 text-green-600 rounded-md">
              Sklep został pomyślnie dodany! Za chwilę nastąpi przekierowanie...
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Dodawanie..." : "Dodaj sklep"}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
