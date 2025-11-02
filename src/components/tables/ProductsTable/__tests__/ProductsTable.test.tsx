import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductsTable } from "../index";
import type { Product } from "../types";

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Product 1",
    sku: "SKU1",
    status: "active",
    categories: [{ id: "1", name: "Category 1" }],
    updated_at: "2024-01-01T12:00:00Z",
  },
  {
    id: "2",
    name: "Product 2",
    sku: "SKU2",
    status: "draft",
    categories: [{ id: "2", name: "Category 2" }],
    updated_at: "2024-01-02T12:00:00Z",
  },
];

const defaultProps = {
  products: mockProducts,
  loading: false,
  selectedIds: [],
  onSelectIds: vi.fn(),
  pagination: {
    page: 1,
    limit: 10,
    total: 2,
  },
  onPaginationChange: vi.fn(),
};

describe("ProductsTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", () => {
    render(<ProductsTable {...defaultProps} loading={true} />);
    // Loading state shows a spinner div, not a status role
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("renders products list", () => {
    render(<ProductsTable {...defaultProps} />);

    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Product 2")).toBeInTheDocument();
    expect(screen.getByText("SKU1")).toBeInTheDocument();
    expect(screen.getByText("SKU2")).toBeInTheDocument();
  });

  it("handles select all checkbox", async () => {
    render(<ProductsTable {...defaultProps} />);

    const selectAllCheckbox = screen.getByLabelText("Zaznacz wszystkie");
    await userEvent.click(selectAllCheckbox);

    expect(defaultProps.onSelectIds).toHaveBeenCalledWith(["1", "2"]);
  });

  it("handles individual product selection", async () => {
    render(<ProductsTable {...defaultProps} />);

    const productCheckbox = screen.getByLabelText("Zaznacz Product 1");
    await userEvent.click(productCheckbox);

    expect(defaultProps.onSelectIds).toHaveBeenCalledWith(["1"]);
  });

  it("opens preview modal on product name click", async () => {
    render(<ProductsTable {...defaultProps} />);

    const productNameButton = screen.getByText("Product 1");
    await userEvent.click(productNameButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("handles pagination changes", async () => {
    render(<ProductsTable {...defaultProps} />);

    const nextPageButton = screen.getByRole("button", { name: "Następna strona" });
    await userEvent.click(nextPageButton);

    expect(defaultProps.onPaginationChange).toHaveBeenCalledWith(2);
  });

  it("displays correct selection state", () => {
    render(<ProductsTable {...defaultProps} selectedIds={["1"]} />);

    const product1Checkbox = screen.getByLabelText("Zaznacz Product 1");
    const product2Checkbox = screen.getByLabelText("Zaznacz Product 2");

    expect(product1Checkbox).toBeChecked();
    expect(product2Checkbox).not.toBeChecked();
  });

  it("formats dates correctly", () => {
    render(<ProductsTable {...defaultProps} />);

    const date1 = new Date("2024-01-01T12:00:00Z").toLocaleString();
    const date2 = new Date("2024-01-02T12:00:00Z").toLocaleString();

    expect(screen.getByText(date1)).toBeInTheDocument();
    expect(screen.getByText(date2)).toBeInTheDocument();
  });
});
