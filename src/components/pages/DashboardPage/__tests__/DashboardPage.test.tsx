import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { DashboardPage } from "../index";
import { useDashboardData } from "@/components/hooks/useDashboardData";
import { MESSAGES, BUTTON_LABELS, BUTTON_ARIA_LABELS, PAGE_TITLE } from "../constants";

// Mock the hooks
vi.mock("@/components/hooks/useDashboardData");

// Mock the child components
vi.mock("@/components/StatusCard", () => ({
  StatusCard: () => <div data-testid="status-card" />,
}));

vi.mock("@/components/ProductsCountCard", () => ({
  ProductsCountCard: () => <div data-testid="products-count-card" />,
}));

vi.mock("@/components/RecentJobsTable", () => ({
  RecentJobsTable: () => <div data-testid="recent-jobs-table" />,
}));

vi.mock("@/components/ApiKeyModal", () => ({
  ApiKeyModal: () => <div data-testid="api-key-modal" />,
}));

describe("DashboardPage", () => {
  const mockData = {
    shop: {
      shopifyDomain: "test-shop.myshopify.com",
    },
    count: 10,
    jobs: [],
  };

  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", () => {
    vi.mocked(useDashboardData).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: mockRefetch,
    });

    render(<DashboardPage />);

    expect(screen.getByText(MESSAGES.LOADING)).toBeInTheDocument();
  });

  it("renders error state", () => {
    const error = new Error("Test error");
    vi.mocked(useDashboardData).mockReturnValue({
      data: null,
      loading: false,
      error,
      refetch: mockRefetch,
    });

    render(<DashboardPage />);

    expect(screen.getByText(MESSAGES.ERROR_TITLE)).toBeInTheDocument();
    expect(screen.getByText(error.message)).toBeInTheDocument();
  });

  it("renders no data state", () => {
    vi.mocked(useDashboardData).mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<DashboardPage />);

    expect(screen.getByText(MESSAGES.NO_DATA)).toBeInTheDocument();
  });

  it("renders dashboard content", () => {
    vi.mocked(useDashboardData).mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<DashboardPage />);

    expect(screen.getByText(PAGE_TITLE)).toBeInTheDocument();
    expect(screen.getByTestId("status-card")).toBeInTheDocument();
    expect(screen.getByTestId("products-count-card")).toBeInTheDocument();
    expect(screen.getByTestId("recent-jobs-table")).toBeInTheDocument();
  });

  it("calls refetch when refresh button is clicked", async () => {
    vi.mocked(useDashboardData).mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<DashboardPage />);

    const refreshButton = screen.getByRole("button", {
      name: BUTTON_ARIA_LABELS.REFRESH,
    });
    await userEvent.click(refreshButton);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("calls refetch when retry button is clicked in error state", async () => {
    vi.mocked(useDashboardData).mockReturnValue({
      data: null,
      loading: false,
      error: new Error("Test error"),
      refetch: mockRefetch,
    });

    render(<DashboardPage />);

    const retryButton = screen.getByRole("button", {
      name: BUTTON_LABELS.RETRY,
    });
    await userEvent.click(retryButton);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("shows API key modal when shop is not configured", () => {
    vi.mocked(useDashboardData).mockReturnValue({
      data: {
        ...mockData,
        shop: { shopifyDomain: null },
      },
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<DashboardPage />);

    expect(screen.getByTestId("api-key-modal")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    vi.mocked(useDashboardData).mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    const customClassName = "custom-class";
    render(<DashboardPage className={customClassName} />);

    const mainElement = screen.getByRole("main");
    expect(mainElement).toHaveClass(customClassName);
  });
});
