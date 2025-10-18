import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaginationControls } from "../index";
import { BUTTON_LABELS, BUTTON_ARIA_LABELS, PAGE_INFO_FORMAT } from "../constants";

describe("PaginationControls", () => {
  const defaultProps = {
    currentPage: 2,
    totalPages: 5,
    onPageChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders pagination controls with page info", () => {
    render(<PaginationControls {...defaultProps} />);

    const expectedPageInfo = PAGE_INFO_FORMAT.replace("{current}", "2").replace("{total}", "5");
    expect(screen.getByText(expectedPageInfo)).toBeInTheDocument();

    expect(screen.getByLabelText(BUTTON_ARIA_LABELS.PREV)).toBeInTheDocument();
    expect(screen.getByLabelText(BUTTON_ARIA_LABELS.NEXT)).toBeInTheDocument();
  });

  it("hides page info when showPageInfo is false", () => {
    render(<PaginationControls {...defaultProps} showPageInfo={false} />);

    const expectedPageInfo = PAGE_INFO_FORMAT.replace("{current}", "2").replace("{total}", "5");
    expect(screen.queryByText(expectedPageInfo)).not.toBeInTheDocument();
  });

  it("disables previous button on first page", () => {
    render(<PaginationControls {...defaultProps} currentPage={1} />);

    const prevButton = screen.getByLabelText(BUTTON_ARIA_LABELS.PREV);
    expect(prevButton).toBeDisabled();

    const nextButton = screen.getByLabelText(BUTTON_ARIA_LABELS.NEXT);
    expect(nextButton).not.toBeDisabled();
  });

  it("disables next button on last page", () => {
    render(<PaginationControls {...defaultProps} currentPage={5} />);

    const prevButton = screen.getByLabelText(BUTTON_ARIA_LABELS.PREV);
    expect(prevButton).not.toBeDisabled();

    const nextButton = screen.getByLabelText(BUTTON_ARIA_LABELS.NEXT);
    expect(nextButton).toBeDisabled();
  });

  it("disables both buttons when loading", () => {
    render(<PaginationControls {...defaultProps} isLoading={true} />);

    const prevButton = screen.getByLabelText(BUTTON_ARIA_LABELS.PREV);
    const nextButton = screen.getByLabelText(BUTTON_ARIA_LABELS.NEXT);

    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  it("calls onPageChange with correct page number when clicking prev/next", async () => {
    render(<PaginationControls {...defaultProps} />);

    const prevButton = screen.getByLabelText(BUTTON_ARIA_LABELS.PREV);
    const nextButton = screen.getByLabelText(BUTTON_ARIA_LABELS.NEXT);

    await userEvent.click(prevButton);
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);

    await userEvent.click(nextButton);
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(3);
  });

  it("does not render when totalPages is 1 or less", () => {
    const { container } = render(<PaginationControls {...defaultProps} totalPages={1} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("applies custom className", () => {
    const customClassName = "custom-class";
    render(<PaginationControls {...defaultProps} className={customClassName} />);

    const container = screen.getByText(BUTTON_LABELS.PREV).closest("div")?.parentElement;
    expect(container).toHaveClass(customClassName);
  });

  it("maintains button order and spacing", () => {
    render(<PaginationControls {...defaultProps} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent(BUTTON_LABELS.PREV);
    expect(buttons[1]).toHaveTextContent(BUTTON_LABELS.NEXT);

    const buttonContainer = buttons[0].parentElement;
    expect(buttonContainer).toHaveClass("flex gap-2");
  });
});
