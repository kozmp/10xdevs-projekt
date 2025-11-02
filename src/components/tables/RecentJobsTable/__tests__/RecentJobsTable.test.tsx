import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecentJobsTable } from "../index";
import { CARD_TEXTS, STATUS_LABELS, TABLE_HEADERS } from "../constants";
import type { JobListDTO } from "@/types";

describe("RecentJobsTable", () => {
  const mockJobs: JobListDTO[] = [
    {
      jobId: "12345678-1234-5678-1234-567812345678",
      status: "completed",
      style: "professional",
      language: "pl",
      createdAt: "2024-01-01T12:00:00Z",
    },
    {
      jobId: "87654321-8765-4321-8765-432187654321",
      status: "pending",
      style: "casual",
      language: "en",
      createdAt: "2024-01-02T12:00:00Z",
    },
  ];

  it("renders empty state when no jobs", () => {
    render(<RecentJobsTable jobs={[]} />);

    expect(screen.getByText(CARD_TEXTS.TITLE)).toBeInTheDocument();
    expect(screen.getByText(CARD_TEXTS.NO_JOBS)).toBeInTheDocument();
  });

  it("renders table with jobs", () => {
    render(<RecentJobsTable jobs={mockJobs} />);

    TABLE_HEADERS.forEach((header) => {
      expect(screen.getByText(header.label)).toBeInTheDocument();
    });

    mockJobs.forEach((job) => {
      expect(screen.getByText(job.jobId.slice(0, 8))).toBeInTheDocument();
      expect(screen.getByText(STATUS_LABELS[job.status])).toBeInTheDocument();
      expect(screen.getByText(job.style)).toBeInTheDocument();
      expect(screen.getByText(job.language)).toBeInTheDocument(); // Component uses lowercase with CSS uppercase
    });
  });

  it("limits number of displayed jobs", () => {
    const manyJobs = Array.from({ length: 10 }, (_, i) => ({
      ...mockJobs[0],
      jobId: `job-${i}`,
    }));

    render(<RecentJobsTable jobs={manyJobs} maxItems={3} />);

    expect(screen.getAllByRole("row")).toHaveLength(4); // header + 3 rows
  });

  it("formats dates correctly", () => {
    render(<RecentJobsTable jobs={mockJobs} />);

    const date = new Date("2024-01-01T12:00:00Z");
    const formattedDate = new Intl.DateTimeFormat("pl-PL", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);

    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });

  it("handles row click with custom handler", async () => {
    const onJobClick = vi.fn();
    render(<RecentJobsTable jobs={mockJobs} onJobClick={onJobClick} />);

    const firstRow = screen.getByText(mockJobs[0].jobId.slice(0, 8));
    await userEvent.click(firstRow);

    expect(onJobClick).toHaveBeenCalledWith(mockJobs[0].jobId);
  });

  it("handles row click with default navigation", async () => {
    const { location } = window;
    // @ts-expect-error - Testing requires modifying readonly window.location
    delete window.location;
    window.location = { href: "" } as Location;

    render(<RecentJobsTable jobs={mockJobs} />);

    const firstRow = screen.getByText(mockJobs[0].jobId.slice(0, 8));
    await userEvent.click(firstRow);

    expect(window.location.href).toBe(`/jobs/${mockJobs[0].jobId}`);

    window.location = location;
  });

  it("applies status colors correctly", () => {
    render(<RecentJobsTable jobs={mockJobs} />);

    const completedStatus = screen.getByText(STATUS_LABELS.completed);
    const pendingStatus = screen.getByText(STATUS_LABELS.pending);

    expect(completedStatus).toHaveClass("text-green-600");
    expect(pendingStatus).toHaveClass("text-yellow-600");
  });

  it("applies custom className", () => {
    const customClassName = "custom-class";
    render(<RecentJobsTable jobs={mockJobs} className={customClassName} />);

    const card = screen.getByRole("article");
    expect(card).toHaveClass(customClassName);
  });

  it("maintains table header order", () => {
    render(<RecentJobsTable jobs={mockJobs} />);

    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(TABLE_HEADERS.length);
    headers.forEach((header, index) => {
      expect(header).toHaveTextContent(TABLE_HEADERS[index].label);
    });
  });
});
