// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginSuccessResponse {
  message: string;
  user: {
    id: string;
    email: string;
  };
}

export interface LoginErrorResponse {
  error: string;
}

// Rozszerz Astro.locals o user
declare global {
  namespace App {
    interface Locals {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}