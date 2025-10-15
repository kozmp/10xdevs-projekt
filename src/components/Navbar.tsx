import React from 'react';
import { Button } from './ui/button';

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="text-xl font-bold">10x Devs</a>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="/products"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Produkty
            </a>
            <a
              href="/jobs"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Zadania
            </a>
            <a
              href="/add-shop"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Dodaj sklep
            </a>
            <Button
              variant="outline"
              onClick={() => {
                fetch('/api/auth/logout', { method: 'POST' })
                  .then(() => window.location.href = '/login');
              }}
            >
              Wyloguj
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}