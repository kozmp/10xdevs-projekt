import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { JobProgressPage } from "../index";
import { toast } from "sonner";
import { TOAST_MESSAGES } from "../constants";

// Mock useJobProgress hook
vi.mock("@/components/hooks/useJobProgress", () => ({
  useJobProgress: vi.fn(),
}));

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockJob = {
  jobId: "123",
  status: "processing",
  progress: 50,
  style: "professional",
  language: "pl",
  publicationMode: "publish",
  createdAt: "2024-01-01T12:00:00Z",
  totalCostEstimate: 1.23,
};

const mockProducts = [
  {
    id: "1",
    status: "completed",
    cost: 0.5,
  },
  {
    id: "2",
    status: "processing",
    cost: null,
  },
];

describe("JobProgressPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", () => {
    vi.mocked(useJobProgress).mockReturnValue({
      job: null,
      products: null,
      loading: true,
      error: null,
      cancel: vi.fn(),
    });

    render(<JobProgressPage jobId="123" />);

    expect(screen.getByText("Ładowanie danych...")).toBeInTheDocument();
  });

  it("renders error state", () => {
    const error = new Error("Test error");
    vi.mocked(useJobProgress).mockReturnValue({
      job: null,
      products: null,
      loading: false,
      error,
      cancel: vi.fn(),
    });

    render(<JobProgressPage jobId="123" />);

    expect(screen.getByText("Wystąpił błąd podczas ładowania")).toBeInTheDocument();
    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("renders no job state", () => {
    vi.mocked(useJobProgress).mockReturnValue({
      job: null,
      products: null,
      loading: false,
      error: null,
      cancel: vi.fn(),
    });

    render(<JobProgressPage jobId="123" />);

    expect(screen.getByText("Nie znaleziono zlecenia")).toBeInTheDocument();
  });

  it("renders job details", () => {
    vi.mocked(useJobProgress).mockReturnValue({
      job: mockJob,
      products: mockProducts,
      loading: false,
      error: null,
      cancel: vi.fn(),
    });

    render(<JobProgressPage jobId="123" />);

    expect(screen.getByText("Postęp zlecenia")).toBeInTheDocument();
    expect(screen.getByText("123")).toBeInTheDocument();
    expect(screen.getByText("professional")).toBeInTheDocument();
    expect(screen.getByText("PL")).toBeInTheDocument();
    expect(screen.getByText("Opublikuj")).toBeInTheDocument();
    expect(screen.getByText("$1.23")).toBeInTheDocument();
    expect(screen.getByText("$0.50")).toBeInTheDocument();
  });

  it("handles job cancellation", async () => {
    const mockCancel = vi.fn().mockResolvedValue(true);
    vi.mocked(useJobProgress).mockReturnValue({
      job: mockJob,
      products: mockProducts,
      loading: false,
      error: null,
      cancel: mockCancel,
    });

    render(<JobProgressPage jobId="123" />);

    // Open cancel modal
    const cancelButton = screen.getByText("Anuluj zlecenie");
    await userEvent.click(cancelButton);

    // Confirm cancellation
    const confirmButton = screen.getByText("Tak, anuluj");
    await userEvent.click(confirmButton);

    expect(mockCancel).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith(TOAST_MESSAGES.CANCEL_SUCCESS);
  });

  it("handles failed cancellation", async () => {
    const mockCancel = vi.fn().mockResolvedValue(false);
    vi.mocked(useJobProgress).mockReturnValue({
      job: mockJob,
      products: mockProducts,
      loading: false,
      error: null,
      cancel: mockCancel,
    });

    render(<JobProgressPage jobId="123" />);

    // Open cancel modal
    const cancelButton = screen.getByText("Anuluj zlecenie");
    await userEvent.click(cancelButton);

    // Confirm cancellation
    const confirmButton = screen.getByText("Tak, anuluj");
    await userEvent.click(confirmButton);

    expect(mockCancel).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(TOAST_MESSAGES.CANCEL_ERROR);
  });

  it("calculates completed products and total cost", () => {
    vi.mocked(useJobProgress).mockReturnValue({
      job: mockJob,
      products: mockProducts,
      loading: false,
      error: null,
      cancel: vi.fn(),
    });

    render(<JobProgressPage jobId="123" />);

    expect(screen.getByText("1/2")).toBeInTheDocument(); // Completed products
    expect(screen.getByText("$0.50")).toBeInTheDocument(); // Total cost
  });
});
