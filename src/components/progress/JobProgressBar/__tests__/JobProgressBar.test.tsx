import { render, screen } from "@testing-library/react";
import { JobProgressBar } from "../index";
import type { JobStatus } from "../types";

describe("JobProgressBar", () => {
  const defaultProps = {
    progress: 50,
    status: "processing" as JobStatus,
    totalProducts: 10,
    completedProducts: 5,
  };

  it("renders progress information correctly", () => {
    render(<JobProgressBar {...defaultProps} />);

    expect(screen.getByText("Postęp generowania")).toBeInTheDocument();
    expect(screen.getByText("W trakcie")).toBeInTheDocument();
    expect(screen.getByText("5 / 10 produktów")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("clamps progress value between 0 and 100", () => {
    render(<JobProgressBar {...defaultProps} progress={150} />);
    expect(screen.getByText("100%")).toBeInTheDocument();

    render(<JobProgressBar {...defaultProps} progress={-50} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("displays correct status colors", () => {
    const statuses: JobStatus[] = ["pending", "processing", "completed", "failed", "cancelled"];
    const colors = {
      pending: "text-yellow-600",
      processing: "text-blue-600",
      completed: "text-green-600",
      failed: "text-red-600",
      cancelled: "text-gray-600",
    };

    statuses.forEach((status) => {
      render(<JobProgressBar {...defaultProps} status={status} />);
      const statusElement = screen.getByText(
        status === "pending"
          ? "Oczekujący"
          : status === "processing"
            ? "W trakcie"
            : status === "completed"
              ? "Zakończony"
              : status === "failed"
                ? "Błąd"
                : "Anulowany"
      );
      expect(statusElement.className).toContain(colors[status]);
    });
  });

  it("shows appropriate status messages", () => {
    // Processing state
    render(<JobProgressBar {...defaultProps} status="processing" />);
    expect(screen.getByText("Generowanie opisów może potrwać kilka minut...")).toBeInTheDocument();

    // Completed state
    render(<JobProgressBar {...defaultProps} status="completed" />);
    expect(screen.getByText("✓ Wszystkie opisy zostały wygenerowane")).toBeInTheDocument();

    // Failed state
    render(<JobProgressBar {...defaultProps} status="failed" />);
    expect(screen.getByText("⚠ Wystąpił błąd podczas generowania")).toBeInTheDocument();

    // Cancelled state
    render(<JobProgressBar {...defaultProps} status="cancelled" />);
    expect(screen.getByText("Zlecenie zostało anulowane")).toBeInTheDocument();
  });

  it("handles zero products correctly", () => {
    render(<JobProgressBar {...defaultProps} totalProducts={0} completedProducts={0} />);

    expect(screen.getByText("0 / 0 produktów")).toBeInTheDocument();
  });

  it("handles completion correctly", () => {
    render(
      <JobProgressBar {...defaultProps} status="completed" progress={100} totalProducts={10} completedProducts={10} />
    );

    expect(screen.getByText("10 / 10 produktów")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("✓ Wszystkie opisy zostały wygenerowane")).toBeInTheDocument();
  });
});
