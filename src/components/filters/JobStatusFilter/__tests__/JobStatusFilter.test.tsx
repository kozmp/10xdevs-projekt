import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobStatusFilter } from "../index";
import { STATUS_OPTIONS, DEFAULT_LABEL, DEFAULT_PLACEHOLDER } from "../constants";
import type { JobStatusValue } from "../types";

describe("JobStatusFilter", () => {
  const defaultProps = {
    value: "all" as JobStatusValue,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default props", () => {
    render(<JobStatusFilter {...defaultProps} />);

    expect(screen.getByText(DEFAULT_LABEL)).toBeInTheDocument();
    // Select component renders as a button with combobox role, but placeholder is not an attribute
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders with custom label and placeholder", () => {
    const customLabel = "Custom Label";
    const customPlaceholder = "Custom Placeholder";

    render(<JobStatusFilter {...defaultProps} label={customLabel} placeholder={customPlaceholder} />);

    expect(screen.getByText(customLabel)).toBeInTheDocument();
    // Placeholder is rendered inside SelectValue component, not as an attribute
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders all status options", async () => {
    render(<JobStatusFilter {...defaultProps} />);

    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);

    STATUS_OPTIONS.forEach((option) => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it("shows selected value", () => {
    const selectedOption = STATUS_OPTIONS.find((option) => option.value === "completed")!;

    render(<JobStatusFilter {...defaultProps} value="completed" />);

    expect(screen.getByText(selectedOption.label)).toBeInTheDocument();
  });

  it("calls onChange when selecting an option", async () => {
    render(<JobStatusFilter {...defaultProps} />);

    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);

    const option = screen.getByText("Zakończone");
    await userEvent.click(option);

    expect(defaultProps.onChange).toHaveBeenCalledWith("completed");
  });

  it("applies custom className to trigger", () => {
    const customClassName = "custom-width";

    render(<JobStatusFilter {...defaultProps} className={customClassName} />);

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveClass(customClassName);
  });

  it("maintains accessibility attributes", () => {
    render(<JobStatusFilter {...defaultProps} />);

    const label = screen.getByText(DEFAULT_LABEL);
    const combobox = screen.getByRole("combobox");

    expect(label).toHaveAttribute("for", combobox.id);
  });
});
