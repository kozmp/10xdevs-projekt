import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DashboardPage } from "../DashboardPage";
import * as useDashboardDataModule from "@/components/hooks/useDashboardData";

// Mock the toast
vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => null,
}));

// Mock the child components
vi.mock("../StatusCard", () => ({
  StatusCard: ({ status, shopName }: { status: boolean; shopName?: string }) => (
    <div data-testid="status-card">
      Status: {status ? "configured" : "not configured"}
      {shopName && ` - ${shopName}`}
    </div>
  ),
}));

vi.mock("../ProductsCountCard", () => ({
  ProductsCountCard: ({ count }: { count: number }) => <div data-testid="products-count-card">Products: {count}</div>,
}));

vi.mock("../RecentJobsTable", () => ({
  RecentJobsTable: ({ jobs }: { jobs: any[] }) => <div data-testid="recent-jobs-table">Jobs: {jobs.length}</div>,
}));

vi.mock("../ApiKeyModal", () => ({
  ApiKeyModal: ({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) => (
    <div data-testid="api-key-modal">
      Modal: {open ? "open" : "closed"}
      <button onClick={onClose}>Close</button>
      <button onClick={onSuccess}>Success</button>
    </div>
  ),
}));

describe("DashboardPage", () => {
  const mockRefetch = vi.fn();

  const mockDashboardData = {
    shop: {
      id: "shop-1",
      userId: "user-1",
      shopifyDomain: "test-shop.myshopify.com",
      accessToken: "encrypted-token",
      createdAt: "2025-10-15T12:00:00Z",
      updatedAt: "2025-10-15T12:00:00Z",
    },
    count: 42,
    jobs: [
      {
        id: "job-1",
        status: "completed",
        createdAt: "2025-10-15T12:00:00Z",
        completedAt: "2025-10-15T12:05:00Z",
      },
      {
        id: "job-2",
        status: "pending",
        createdAt: "2025-10-15T13:00:00Z",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Loading State", () => {
    it("should render loading state", () => {
      vi.spyOn(useDashboardDataModule, "useDashboardData").mockReturnValue({
        loading: true,
        error: undefined,
        data: undefined,
        refetch: mockRefetch,
      });

      render(<DashboardPage />);

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Ładowanie danych...")).toBeInTheDocument();

      // Check for loading spinner by its class
      const loadingSpinner = document.querySelector(".animate-spin");
      expect(loadingSpinner).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("should render error state", () => {
      const mockError = new Error("Failed to fetch data");
      vi.spyOn(useDashboardDataModule, "useDashboardData").mockReturnValue({
        loading: false,
        error: mockError,
        data: undefined,
        refetch: mockRefetch,
      });

      render(<DashboardPage />);

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Wystąpił błąd podczas ładowania danych")).toBeInTheDocument();
      expect(screen.getByText("Failed to fetch data")).toBeInTheDocument();
    });

    it("should call refetch when retry button is clicked in error state", () => {
      const mockError = new Error("Failed to fetch data");
      vi.spyOn(useDashboardDataModule, "useDashboardData").mockReturnValue({
        loading: false,
        error: mockError,
        data: undefined,
        refetch: mockRefetch,
      });

      render(<DashboardPage />);

      const retryButton = screen.getByRole("button", {
        name: /spróbuj ponownie/i,
      });
      fireEvent.click(retryButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("No Data State", () => {
    it("should render no data state", () => {
      vi.spyOn(useDashboardDataModule, "useDashboardData").mockReturnValue({
        loading: false,
        error: undefined,
        data: undefined,
        refetch: mockRefetch,
      });

      render(<DashboardPage />);

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Brak danych do wyświetlenia")).toBeInTheDocument();
    });
  });

  describe("Success State", () => {
    it("should render dashboard with all components when data is loaded", () => {
      vi.spyOn(useDashboardDataModule, "useDashboardData").mockReturnValue({
        loading: false,
        error: undefined,
        data: mockDashboardData,
        refetch: mockRefetch,
      });

      render(<DashboardPage />);

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByTestId("status-card")).toBeInTheDocument();
      expect(screen.getByTestId("products-count-card")).toBeInTheDocument();
      expect(screen.getByTestId("recent-jobs-table")).toBeInTheDocument();
      expect(screen.getByTestId("api-key-modal")).toBeInTheDocument();
    });

    it("should pass correct props to StatusCard when shop is configured", () => {
      vi.spyOn(useDashboardDataModule, "useDashboardData").mockReturnValue({
        loading: false,
        error: undefined,
        data: mockDashboardData,
        refetch: mockRefetch,
      });

      render(<DashboardPage />);

      const statusCard = screen.getByTestId("status-card");
      expect(statusCard).toHaveTextContent("Status: configured");
      expect(statusCard).toHaveTextContent("test-shop.myshopify.com");
    });

    it("should pass correct props to StatusCard when shop is not configured", () => {
      const dataWithoutShop = {
        ...mockDashboardData,
        shop: {
          ...mockDashboardData.shop,
          shopifyDomain: "",
        },
      };

      vi.spyOn(useDashboardDataModule, "useDashboardData").mockReturnValue({
        loading: false,
        error: undefined,
        data: dataWithoutShop,
        refetch: mockRefetch,
      });

      render(<DashboardPage />);

      const statusCard = screen.getByTestId("status-card");
      expect(statusCard).toHaveTextContent("Status: not configured");
    });

    it("should pass correct count to ProductsCountCard", () => {
      vi.spyOn(useDashboardDataModule, "useDashboardData").mockReturnValue({
        loading: false,
        error: undefined,
        data: mockDashboardData,
        refetch: mockRefetch,
      });

      render(<DashboardPage />);

      expect(screen.getByTestId("products-count-card")).toHaveTextContent("Products: 42");
    });

    it("should pass jobs to RecentJobsTable", () => {
      vi.spyOn(useDashboardDataModule, "useDashboardData").mockReturnValue({
        loading: false,
        error: undefined,
        data: mockDashboardData,
        refetch: mockRefetch,
      });

      render(<DashboardPage />);

      expect(screen.getByTestId("recent-jobs-table")).toHaveTextContent("Jobs: 2");
    });

    it("should call refetch when refresh button is clicked", () => {
      vi.spyOn(useDashboardDataModule, "useDashboardData").mockReturnValue({
        loading: false,
        error: undefined,
        data: mockDashboardData,
        refetch: mockRefetch,
      });

      render(<DashboardPage />);

      const refreshButton = screen.getByRole("button", {
        name: /odśwież dane/i,
      });
      fireEvent.click(refreshButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("API Key Modal", () => {
    it("should not open modal when shop is configured", () => {
      vi.spyOn(useDashboardDataModule, "useDashboardData").mockReturnValue({
        loading: false,
        error: undefined,
        data: mockDashboardData,
        refetch: mockRefetch,
      });

      render(<DashboardPage />);

      expect(screen.getByTestId("api-key-modal")).toHaveTextContent("Modal: closed");
    });

    it("should open modal when shop is not configured", async () => {
      const dataWithoutShop = {
        ...mockDashboardData,
        shop: {
          ...mockDashboardData.shop,
          shopifyDomain: "",
        },
      };

      vi.spyOn(useDashboardDataModule, "useDashboardData").mockReturnValue({
        loading: false,
        error: undefined,
        data: dataWithoutShop,
        refetch: mockRefetch,
      });

      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByTestId("api-key-modal")).toHaveTextContent("Modal: open");
      });
    });

    it("should close modal when onClose is called", async () => {
      const dataWithoutShop = {
        ...mockDashboardData,
        shop: {
          ...mockDashboardData.shop,
          shopifyDomain: "",
        },
      };

      vi.spyOn(useDashboardDataModule, "useDashboardData").mockReturnValue({
        loading: false,
        error: undefined,
        data: dataWithoutShop,
        refetch: mockRefetch,
      });

      render(<DashboardPage />);

      // Wait for modal to open
      await waitFor(() => {
        expect(screen.getByTestId("api-key-modal")).toHaveTextContent("Modal: open");
      });

      // Click close button
      const closeButton = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.getByTestId("api-key-modal")).toHaveTextContent("Modal: closed");
      });
    });

    it("should call refetch when modal onSuccess is called", async () => {
      const dataWithoutShop = {
        ...mockDashboardData,
        shop: {
          ...mockDashboardData.shop,
          shopifyDomain: "",
        },
      };

      vi.spyOn(useDashboardDataModule, "useDashboardData").mockReturnValue({
        loading: false,
        error: undefined,
        data: dataWithoutShop,
        refetch: mockRefetch,
      });

      render(<DashboardPage />);

      // Wait for modal to open
      await waitFor(() => {
        expect(screen.getByTestId("api-key-modal")).toHaveTextContent("Modal: open");
      });

      // Click success button
      const successButton = screen.getByRole("button", { name: /success/i });
      fireEvent.click(successButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    it("should have accessible refresh button", () => {
      vi.spyOn(useDashboardDataModule, "useDashboardData").mockReturnValue({
        loading: false,
        error: undefined,
        data: mockDashboardData,
        refetch: mockRefetch,
      });

      render(<DashboardPage />);

      const refreshButton = screen.getByRole("button", {
        name: /odśwież dane/i,
      });
      expect(refreshButton).toHaveAttribute("aria-label", "Odśwież dane");
    });

    it("should have proper semantic structure", () => {
      vi.spyOn(useDashboardDataModule, "useDashboardData").mockReturnValue({
        loading: false,
        error: undefined,
        data: mockDashboardData,
        refetch: mockRefetch,
      });

      render(<DashboardPage />);

      const main = screen.getByRole("main");
      expect(main).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Dashboard");
    });
  });
});
