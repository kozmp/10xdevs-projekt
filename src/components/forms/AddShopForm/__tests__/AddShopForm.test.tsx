import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { AddShopForm } from "../index";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("AddShopForm", () => {
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it("renders form with all required fields", () => {
    render(<AddShopForm />);

    expect(screen.getByLabelText(/domena sklepu/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/klucz api/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sekret api/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /dodaj sklep/i })).toBeEnabled();
  });

  it("validates required fields", async () => {
    render(<AddShopForm />);

    const submitButton = screen.getByRole("button", { name: /dodaj sklep/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/domena jest wymagana/i)).toBeInTheDocument();
      expect(screen.getByText(/klucz api jest wymagany/i)).toBeInTheDocument();
      expect(screen.getByText(/sekret api jest wymagany/i)).toBeInTheDocument();
    });
  });

  it("validates Shopify domain format", async () => {
    render(<AddShopForm />);

    const domainInput = screen.getByLabelText(/domena sklepu/i);
    await userEvent.type(domainInput, "invalid-domain");

    const submitButton = screen.getByRole("button", { name: /dodaj sklep/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/nieprawidłowy format domeny shopify/i)).toBeInTheDocument();
    });
  });

  it("handles successful form submission", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { id: "1", domain: "test.myshopify.com" } }),
    });

    render(<AddShopForm onSuccess={mockOnSuccess} onError={mockOnError} redirectUrl="/dashboard" />);

    await userEvent.type(screen.getByLabelText(/domena sklepu/i), "test.myshopify.com");
    await userEvent.type(screen.getByLabelText(/klucz api/i), "a".repeat(32));
    await userEvent.type(screen.getByLabelText(/sekret api/i), "b".repeat(32));

    const submitButton = screen.getByRole("button", { name: /dodaj sklep/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/sklep został pomyślnie dodany/i)).toBeInTheDocument();
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnError).not.toHaveBeenCalled();
    });
  });

  it("handles API errors", async () => {
    const errorMessage = "Test error message";
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ success: false, error: errorMessage }),
    });

    render(<AddShopForm onSuccess={mockOnSuccess} onError={mockOnError} />);

    await userEvent.type(screen.getByLabelText(/domena sklepu/i), "test.myshopify.com");
    await userEvent.type(screen.getByLabelText(/klucz api/i), "a".repeat(32));
    await userEvent.type(screen.getByLabelText(/sekret api/i), "b".repeat(32));

    const submitButton = screen.getByRole("button", { name: /dodaj sklep/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalled();
    });
  });
});
