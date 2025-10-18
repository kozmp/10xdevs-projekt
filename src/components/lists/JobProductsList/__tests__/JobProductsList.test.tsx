import { render, screen } from "@testing-library/react";
import { JobProductsList } from "../index";
import type { JobProduct } from "../types";

const mockProducts: JobProduct[] = [
  {
    productId: "123456789",
    status: "completed",
    cost: 0.1234,
    tokenUsageDetails: JSON.stringify({ input: 100, output: 50 }),
  },
  {
    productId: "987654321",
    status: "processing",
    cost: null,
    tokenUsageDetails: null,
  },
];

describe("JobProductsList", () => {
  it("renders empty state", () => {
    render(<JobProductsList products={[]} />);

    expect(screen.getByText("Produkty")).toBeInTheDocument();
    expect(screen.getByText("Brak produktów")).toBeInTheDocument();
  });

  it("renders products list with correct data", () => {
    render(<JobProductsList products={mockProducts} />);

    // Header
    expect(screen.getByText("Produkty (2)")).toBeInTheDocument();

    // Product IDs
    expect(screen.getByText("12345678...")).toBeInTheDocument();
    expect(screen.getByText("98765432...")).toBeInTheDocument();

    // Statuses
    expect(screen.getByText("Zakończony")).toBeInTheDocument();
    expect(screen.getByText("W trakcie")).toBeInTheDocument();

    // Costs
    expect(screen.getByText("$0.1234")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();

    // Tokens
    expect(screen.getByText("150")).toBeInTheDocument(); // 100 + 50
  });

  it("applies correct status colors", () => {
    render(<JobProductsList products={mockProducts} />);

    const completedStatus = screen.getByText("Zakończony");
    const processingStatus = screen.getByText("W trakcie");

    expect(completedStatus.className).toContain("text-green-600");
    expect(processingStatus.className).toContain("text-blue-600");
  });

  it("handles invalid token usage details", () => {
    const productsWithInvalidTokens: JobProduct[] = [
      {
        productId: "123",
        status: "completed",
        cost: 0.1,
        tokenUsageDetails: "invalid json",
      },
    ];

    render(<JobProductsList products={productsWithInvalidTokens} />);

    // Should show dash for invalid token details
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("formats numbers correctly", () => {
    const productsWithLargeNumbers: JobProduct[] = [
      {
        productId: "123",
        status: "completed",
        cost: 1.23456789,
        tokenUsageDetails: JSON.stringify({ input: 1000000, output: 500000 }),
      },
    ];

    render(<JobProductsList products={productsWithLargeNumbers} />);

    // Cost should be formatted to 4 decimal places
    expect(screen.getByText("$1.2346")).toBeInTheDocument();

    // Large token numbers should use thousand separators
    expect(screen.getByText("1,500,000")).toBeInTheDocument();
  });
});
