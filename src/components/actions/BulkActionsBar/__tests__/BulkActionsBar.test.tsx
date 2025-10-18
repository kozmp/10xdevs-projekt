import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BulkActionsBar } from "../index";
import { BUTTON_LABELS, BUTTON_ARIA_LABELS, TEXT_LABELS } from "../constants";

describe("BulkActionsBar", () => {
  const defaultProps = {
    selectedCount: 3,
    maxLimit: 10,
    onGenerate: vi.fn(),
    onClear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with selected count and buttons", () => {
    render(<BulkActionsBar {...defaultProps} />);

    expect(screen.getByText(TEXT_LABELS.SELECTED)).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("/ 10")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: BUTTON_ARIA_LABELS.CLEAR })).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: BUTTON_ARIA_LABELS.GENERATE.replace("{count}", "3"),
      })
    ).toBeInTheDocument();
  });

  it("does not render when selectedCount is 0", () => {
    const { container } = render(<BulkActionsBar {...defaultProps} selectedCount={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows max limit reached alert when limit is reached", () => {
    render(<BulkActionsBar {...defaultProps} selectedCount={10} />);

    expect(screen.getByRole("alert")).toHaveTextContent(TEXT_LABELS.MAX_LIMIT_REACHED);
  });

  it("applies error color when limit is reached", () => {
    render(<BulkActionsBar {...defaultProps} selectedCount={10} />);

    const countElement = screen.getByText("10");
    expect(countElement).toHaveClass("text-red-500");
  });

  it("applies primary color when under limit", () => {
    render(<BulkActionsBar {...defaultProps} />);

    const countElement = screen.getByText("3");
    expect(countElement).toHaveClass("text-primary");
  });

  it("calls onClear when clear button is clicked", async () => {
    render(<BulkActionsBar {...defaultProps} />);

    const clearButton = screen.getByRole("button", {
      name: BUTTON_ARIA_LABELS.CLEAR,
    });
    await userEvent.click(clearButton);

    expect(defaultProps.onClear).toHaveBeenCalledTimes(1);
  });

  it("calls onGenerate when generate button is clicked", async () => {
    render(<BulkActionsBar {...defaultProps} />);

    const generateButton = screen.getByRole("button", {
      name: BUTTON_ARIA_LABELS.GENERATE.replace("{count}", "3"),
    });
    await userEvent.click(generateButton);

    expect(defaultProps.onGenerate).toHaveBeenCalledTimes(1);
  });

  it("disables generate button when selectedCount is 0", () => {
    render(<BulkActionsBar {...defaultProps} selectedCount={0} />);

    const generateButton = screen.getByRole("button", {
      name: BUTTON_ARIA_LABELS.GENERATE.replace("{count}", "0"),
    });
    expect(generateButton).toBeDisabled();
  });

  it("applies custom className", () => {
    const customClassName = "custom-class";
    render(<BulkActionsBar {...defaultProps} className={customClassName} />);

    const container = screen.getByText(TEXT_LABELS.SELECTED).closest(".custom-class");
    expect(container).toBeInTheDocument();
  });

  it("maintains button order and spacing", () => {
    render(<BulkActionsBar {...defaultProps} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent(BUTTON_LABELS.CLEAR);
    expect(buttons[1]).toHaveTextContent(`${BUTTON_LABELS.GENERATE} (3)`);

    const buttonContainer = buttons[0].parentElement;
    expect(buttonContainer).toHaveClass("flex gap-2");
  });
});
