import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { ProductsTable } from "../ProductsTable";

describe("ProductsTable", () => {
  const mockProducts = [
    {
      id: "1",
      name: "Product 1",
      status: "active",
      categories: ["Electronics"],
      createdAt: "2025-10-15T12:00:00Z",
    },
    {
      id: "2",
      name: "Product 2",
      status: "inactive",
      categories: ["Books"],
      createdAt: "2025-10-15T13:00:00Z",
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

  describe("Rendering", () => {
    it("should render all products", () => {
      render(<ProductsTable {...defaultProps} />);

      expect(screen.getByText("Product 1")).toBeInTheDocument();
      expect(screen.getByText("Product 2")).toBeInTheDocument();
    });

    it("should render loading state", () => {
      render(<ProductsTable {...defaultProps} loading={true} />);

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("should render empty state", () => {
      render(<ProductsTable {...defaultProps} products={[]} />);

      expect(screen.getByText(/Brak produktów/i)).toBeInTheDocument();
    });

    it("should format dates correctly", () => {
      render(<ProductsTable {...defaultProps} />);

      // Note: Actual format will depend on the locale settings
      expect(screen.getAllByText(/15 paź 2025/)).toHaveLength(2);
    });
  });

  describe("Selection", () => {
    it("should handle individual row selection", () => {
      render(<ProductsTable {...defaultProps} />);

      const checkbox = screen.getAllByRole("checkbox")[1]; // First product checkbox
      fireEvent.click(checkbox);

      expect(defaultProps.onSelectIds).toHaveBeenCalledWith(["1"]);
    });

    it("should handle select all", () => {
      render(<ProductsTable {...defaultProps} />);

      const selectAllCheckbox = screen.getAllByRole("checkbox")[0];
      fireEvent.click(selectAllCheckbox);

      expect(defaultProps.onSelectIds).toHaveBeenCalledWith(["1", "2"]);
    });

    it("should show selected state correctly", () => {
      render(<ProductsTable {...defaultProps} selectedIds={["1"]} />);

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes[1]).toBeChecked(); // First product checkbox
      expect(checkboxes[2]).not.toBeChecked(); // Second product checkbox
    });
  });

  describe("Pagination", () => {
    it("should render pagination controls", () => {
      render(
        <ProductsTable
          {...defaultProps}
          pagination={{
            page: 2,
            limit: 10,
            total: 25,
          }}
        />
      );

      expect(screen.getByText("2")).toBeInTheDocument(); // Current page
      expect(screen.getByText("3")).toBeInTheDocument(); // Next page
    });

    it("should handle page changes", () => {
      render(
        <ProductsTable
          {...defaultProps}
          pagination={{
            page: 1,
            limit: 10,
            total: 25,
          }}
        />
      );

      const nextPageButton = screen.getByRole("button", { name: /następna/i });
      fireEvent.click(nextPageButton);

      expect(defaultProps.onPaginationChange).toHaveBeenCalledWith(2);
    });

    it("should disable pagination buttons appropriately", () => {
      render(
        <ProductsTable
          {...defaultProps}
          pagination={{
            page: 1,
            limit: 10,
            total: 10,
          }}
        />
      );

      const prevButton = screen.getByRole("button", { name: /poprzednia/i });
      const nextButton = screen.getByRole("button", { name: /następna/i });

      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });
  });

  describe("Sorting and Filtering", () => {
    it("should render sortable column headers", () => {
      render(<ProductsTable {...defaultProps} />);

      const headers = screen.getAllByRole("columnheader");
      expect(headers).toHaveLength(5); // Checkbox, Name, Status, Categories, Date
    });

    it("should render status indicators", () => {
      render(<ProductsTable {...defaultProps} />);

      const rows = screen.getAllByRole("row");
      const firstRow = within(rows[1]);
      const secondRow = within(rows[2]);

      expect(firstRow.getByText("active")).toBeInTheDocument();
      expect(secondRow.getByText("inactive")).toBeInTheDocument();
    });

    it("should render category badges", () => {
      render(<ProductsTable {...defaultProps} />);

      expect(screen.getByText("Electronics")).toBeInTheDocument();
      expect(screen.getByText("Books")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible table structure", () => {
      render(<ProductsTable {...defaultProps} />);

      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getByRole("rowgroup")).toBeInTheDocument();
      expect(screen.getAllByRole("row").length).toBeGreaterThan(0);
    });

    it("should have accessible checkboxes", () => {
      render(<ProductsTable {...defaultProps} />);

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes[0]).toHaveAttribute("aria-label", "Zaznacz wszystkie");
    });

    it("should have accessible pagination controls", () => {
      render(<ProductsTable {...defaultProps} />);

      expect(screen.getByRole("navigation")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /poprzednia/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /następna/i })).toBeInTheDocument();
    });
  });
});
