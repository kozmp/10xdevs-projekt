import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { JobsHistoryPage } from "../index";

// Mock useJobsHistory hook
vi.mock("@/components/hooks/useJobsHistory", () => ({
  useJobsHistory: vi.fn(),
}));

// Mock window.scrollTo
const mockScrollTo = vi.fn();
window.scrollTo = mockScrollTo;

describe("JobsHistoryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", () => {
    vi.mocked(useJobsHistory).mockReturnValue({
      jobs: [],
      meta: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<JobsHistoryPage />);

    expect(screen.getByText("Ładowanie zleceń...")).toBeInTheDocument();
  });

  it("renders error state", () => {
    const error = new Error("Test error");
    vi.mocked(useJobsHistory).mockReturnValue({
      jobs: [],
      meta: null,
      loading: false,
      error,
      refetch: vi.fn(),
    });

    render(<JobsHistoryPage />);

    expect(screen.getByText("Wystąpił błąd podczas ładowania zleceń")).toBeInTheDocument();
    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("renders jobs table with data", () => {
    vi.mocked(useJobsHistory).mockReturnValue({
      jobs: [
        {
          jobId: "1",
          status: "completed",
          style: "professional",
          language: "pl",
          publicationMode: "publish",
          createdAt: "2024-01-01T12:00:00Z",
          totalCostEstimate: 1.23,
        },
      ],
      meta: {
        total: 1,
        totalPages: 1,
        currentPage: 1,
        limit: 20,
      },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<JobsHistoryPage />);

    expect(screen.getByText("Historia zleceń")).toBeInTheDocument();
    expect(screen.getByText("Znaleziono 1 zleceń")).toBeInTheDocument();
  });

  it("handles filter change", async () => {
    const mockRefetch = vi.fn();
    vi.mocked(useJobsHistory).mockReturnValue({
      jobs: [],
      meta: null,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<JobsHistoryPage />);

    const filterButton = screen.getByRole("button", { name: /wszystkie/i });
    await userEvent.click(filterButton);
    const completedOption = screen.getByText("Zakończone");
    await userEvent.click(completedOption);

    expect(mockRefetch).toHaveBeenCalled();
  });

  it("handles refresh button click", async () => {
    const mockRefetch = vi.fn();
    vi.mocked(useJobsHistory).mockReturnValue({
      jobs: [],
      meta: null,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<JobsHistoryPage />);

    const refreshButton = screen.getByRole("button", { name: /odśwież/i });
    await userEvent.click(refreshButton);

    expect(mockRefetch).toHaveBeenCalled();
  });

  it("handles pagination", async () => {
    vi.mocked(useJobsHistory).mockReturnValue({
      jobs: [],
      meta: {
        total: 40,
        totalPages: 2,
        currentPage: 1,
        limit: 20,
      },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<JobsHistoryPage />);

    const nextPageButton = screen.getByRole("button", { name: /następna/i });
    await userEvent.click(nextPageButton);

    expect(mockScrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
