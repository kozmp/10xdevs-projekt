import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "../index";
import { DEFAULT_VALUES, BUTTON_LABELS } from "../constants";

describe("SearchInput", () => {
  const defaultProps = {
    value: "",
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders with default props", () => {
    render(<SearchInput {...defaultProps} />);

    const input = screen.getByRole("searchbox");
    expect(input).toHaveAttribute("placeholder", DEFAULT_VALUES.PLACEHOLDER);
    expect(input).toHaveAttribute("aria-label", DEFAULT_VALUES.ARIA_LABEL);
  });

  it("renders with custom placeholder and aria-label", () => {
    const customPlaceholder = "Custom placeholder";
    const customAriaLabel = "Custom aria label";
    render(<SearchInput {...defaultProps} placeholder={customPlaceholder} ariaLabel={customAriaLabel} />);

    const input = screen.getByRole("searchbox");
    expect(input).toHaveAttribute("placeholder", customPlaceholder);
    expect(input).toHaveAttribute("aria-label", customAriaLabel);
  });

  it("shows character count", () => {
    render(<SearchInput {...defaultProps} value="test" />);

    expect(screen.getByText("4/50 znaków")).toBeInTheDocument();
  });

  it("shows clear button when input has value", () => {
    render(<SearchInput {...defaultProps} value="test" />);

    expect(screen.getByRole("button", { name: BUTTON_LABELS.CLEAR })).toBeInTheDocument();
  });

  it("hides clear button when input is empty", () => {
    render(<SearchInput {...defaultProps} />);

    expect(screen.queryByRole("button", { name: BUTTON_LABELS.CLEAR })).not.toBeInTheDocument();
  });

  it("calls onChange after debounce delay", async () => {
    render(<SearchInput {...defaultProps} />);

    const input = screen.getByRole("searchbox");
    await userEvent.type(input, "test");

    expect(defaultProps.onChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(DEFAULT_VALUES.DEBOUNCE_MS);
    });

    expect(defaultProps.onChange).toHaveBeenCalledWith("test");
  });

  it("clears input when clear button is clicked", async () => {
    render(<SearchInput {...defaultProps} value="test" />);

    const clearButton = screen.getByRole("button", {
      name: BUTTON_LABELS.CLEAR,
    });
    await userEvent.click(clearButton);

    expect(defaultProps.onChange).toHaveBeenCalledWith("");
  });

  it("prevents input beyond maxLength", async () => {
    render(<SearchInput {...defaultProps} maxLength={5} />);

    const input = screen.getByRole("searchbox");
    await userEvent.type(input, "123456");

    expect(input).toHaveValue("12345");
  });

  it("updates local value when external value changes", () => {
    const { rerender } = render(<SearchInput {...defaultProps} />);

    rerender(<SearchInput {...defaultProps} value="new value" />);

    const input = screen.getByRole("searchbox");
    expect(input).toHaveValue("new value");
  });

  it("applies custom className", () => {
    const customClassName = "custom-class";
    render(<SearchInput {...defaultProps} className={customClassName} />);

    const container = screen.getByRole("searchbox").closest("div")?.parentElement;
    expect(container).toHaveClass(customClassName);
  });

  it("maintains accessibility attributes", () => {
    render(<SearchInput {...defaultProps} />);

    const input = screen.getByRole("searchbox");
    const label = screen.getByText(DEFAULT_VALUES.LABEL);

    expect(label).toHaveAttribute("for", input.id);
    expect(label).toHaveClass("sr-only");
  });
});
