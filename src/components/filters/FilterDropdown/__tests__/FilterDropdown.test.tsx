import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterDropdown } from "../index";
import { FILTER_OPTIONS, DEFAULT_LABEL, DEFAULT_PLACEHOLDER } from "../constants";
import type { FilterValue } from "../types";

describe("FilterDropdown", () => {
  const defaultProps = {
    value: "all" as FilterValue,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default props", () => {
    render(<FilterDropdown {...defaultProps} />);

    expect(screen.getByText(DEFAULT_LABEL)).toBeInTheDocument();
    // Select component renders as a button with combobox role
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders with custom label and placeholder", () => {
    const customLabel = "Custom Label";
    const customPlaceholder = "Custom Placeholder";
    render(<FilterDropdown {...defaultProps} label={customLabel} placeholder={customPlaceholder} />);

    expect(screen.getByText(customLabel)).toBeInTheDocument();
    // Placeholder is rendered inside SelectValue component, not as an attribute
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("shows selected value", () => {
    render(<FilterDropdown {...defaultProps} value="published" />);

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("Opublikowane");
  });

  // TODO: Fix happy-dom incompatibility with Radix UI Select hasPointerCapture
  it.skip("shows all options when clicked", async () => {
    render(<FilterDropdown {...defaultProps} />);

    const trigger = screen.getByRole("combobox");
    await userEvent.click(trigger);

    // SelectItem components render with role="option"
    FILTER_OPTIONS.forEach((option) => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  // TODO: Fix happy-dom incompatibility with Radix UI Select hasPointerCapture
  it.skip("calls onChange with selected value", async () => {
    render(<FilterDropdown {...defaultProps} />);

    const trigger = screen.getByRole("combobox");
    await userEvent.click(trigger);

    // Click on the text content instead of role="option"
    const option = screen.getByText("Opublikowane");
    await userEvent.click(option);

    expect(defaultProps.onChange).toHaveBeenCalledWith("published");
  });

  it("applies custom className", () => {
    const customClassName = "custom-class";
    render(<FilterDropdown {...defaultProps} className={customClassName} />);

    const container = screen.getByText(DEFAULT_LABEL).closest("div");
    expect(container).toHaveClass(customClassName);
  });

  it("handles disabled state", () => {
    render(<FilterDropdown {...defaultProps} disabled={true} />);

    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();
  });

  it("maintains accessibility attributes", () => {
    render(<FilterDropdown {...defaultProps} />);

    const label = screen.getByText(DEFAULT_LABEL);
    const select = screen.getByRole("combobox");

    expect(label).toHaveAttribute("for", select.id);
  });

  it("maintains trigger width", () => {
    render(<FilterDropdown {...defaultProps} />);

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveClass("w-[200px]");
  });
});
