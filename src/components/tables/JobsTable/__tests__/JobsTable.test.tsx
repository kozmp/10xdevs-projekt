import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { JobsTable } from "../index";
import type { Job } from "../types";

const mockJobs: Job[] = [
  {
    jobId: "123456789",
    status: "completed",
    style: "professional",
    language: "pl",
    publicationMode: "publish",
    createdAt: "2024-01-01T12:00:00Z",
    totalCostEstimate: 1.23,
  },
  {
    jobId: "987654321",
    status: "pending",
    style: "casual",
    language: "en",
    publicationMode: "draft",
    createdAt: "2024-01-02T12:00:00Z",
    totalCostEstimate: null,
  },
];

// Mock window.location
const mockLocation = vi.fn();
delete window.location;
window.location = { href: mockLocation } as unknown as Location;

describe("JobsTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when no jobs", () => {
    render(<JobsTable jobs={[]} />);
    expect(screen.getByText("Brak zleceń do wyświetlenia")).toBeInTheDocument();
  });

  it("renders table headers", () => {
    render(<JobsTable jobs={mockJobs} />);

    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Styl")).toBeInTheDocument();
    expect(screen.getByText("Język")).toBeInTheDocument();
    expect(screen.getByText("Tryb publikacji")).toBeInTheDocument();
    expect(screen.getByText("Data utworzenia")).toBeInTheDocument();
    expect(screen.getByText("Koszt")).toBeInTheDocument();
  });

  it("renders job rows with correct data", () => {
    render(<JobsTable jobs={mockJobs} />);

    // First job
    expect(screen.getByText("12345678...")).toBeInTheDocument();
    expect(screen.getByText("Zakończony")).toBeInTheDocument();
    expect(screen.getByText("professional")).toBeInTheDocument();
    expect(screen.getByText("pl")).toBeInTheDocument(); // lowercase - CSS uppercase not visible in tests
    expect(screen.getByText("Opublikuj")).toBeInTheDocument();
    expect(screen.getByText("$1.23")).toBeInTheDocument();

    // Second job
    expect(screen.getByText("98765432...")).toBeInTheDocument();
    expect(screen.getByText("Oczekujący")).toBeInTheDocument();
    expect(screen.getByText("casual")).toBeInTheDocument();
    expect(screen.getByText("en")).toBeInTheDocument(); // lowercase - CSS uppercase not visible in tests
    expect(screen.getByText("Szkic")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("formats dates correctly", () => {
    render(<JobsTable jobs={mockJobs} />);

    const date1 = new Intl.DateTimeFormat("pl-PL", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date("2024-01-01T12:00:00Z"));

    const date2 = new Intl.DateTimeFormat("pl-PL", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date("2024-01-02T12:00:00Z"));

    expect(screen.getByText(date1)).toBeInTheDocument();
    expect(screen.getByText(date2)).toBeInTheDocument();
  });

  it("applies correct status colors", () => {
    render(<JobsTable jobs={mockJobs} />);

    const completedStatus = screen.getByText("Zakończony");
    const pendingStatus = screen.getByText("Oczekujący");

    expect(completedStatus.className).toContain("text-green-600");
    expect(pendingStatus.className).toContain("text-yellow-600");
  });

  it("handles row click", async () => {
    render(<JobsTable jobs={mockJobs} />);

    const firstRow = screen.getByText("12345678...");
    await userEvent.click(firstRow);

    expect(window.location.href).toBe("/jobs/123456789");
  });
});
