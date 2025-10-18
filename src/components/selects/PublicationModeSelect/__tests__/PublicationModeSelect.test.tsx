import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PublicationModeSelect } from "../index";
import { PUBLICATION_MODES, DEFAULT_LABEL } from "../constants";
import type { PublicationMode } from "../types";

describe("PublicationModeSelect", () => {
  const defaultProps = {
    value: "draft" as PublicationMode,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default props", () => {
    render(<PublicationModeSelect {...defaultProps} />);

    expect(screen.getByText(DEFAULT_LABEL)).toBeInTheDocument();
    PUBLICATION_MODES.forEach((mode) => {
      expect(screen.getByText(mode.label)).toBeInTheDocument();
      expect(screen.getByText(mode.description)).toBeInTheDocument();
    });
  });

  it("renders with custom label", () => {
    const customLabel = "Custom Label";
    render(<PublicationModeSelect {...defaultProps} label={customLabel} />);

    expect(screen.getByText(customLabel)).toBeInTheDocument();
  });

  it("shows selected value", () => {
    render(<PublicationModeSelect {...defaultProps} />);

    const draftRadio = screen.getByLabelText("Szkic");
    expect(draftRadio).toBeChecked();

    const publishedRadio = screen.getByLabelText("Opublikuj");
    expect(publishedRadio).not.toBeChecked();
  });

  it("calls onChange when selecting an option", async () => {
    render(<PublicationModeSelect {...defaultProps} />);

    const publishedRadio = screen.getByLabelText("Opublikuj");
    await userEvent.click(publishedRadio);

    expect(defaultProps.onChange).toHaveBeenCalledWith("published");
  });

  it("applies custom className", () => {
    const customClassName = "custom-class";
    render(<PublicationModeSelect {...defaultProps} className={customClassName} />);

    const container = screen.getByText(DEFAULT_LABEL).closest("div");
    expect(container?.parentElement).toHaveClass(customClassName);
  });

  it("handles disabled state", () => {
    render(<PublicationModeSelect {...defaultProps} disabled={true} />);

    const radios = screen.getAllByRole("radio");
    radios.forEach((radio) => {
      expect(radio).toBeDisabled();
    });

    const labels = screen.getAllByRole("label");
    labels.forEach((label) => {
      expect(label).toHaveClass("peer-disabled:cursor-not-allowed");
    });
  });

  it("maintains accessibility attributes", () => {
    render(<PublicationModeSelect {...defaultProps} />);

    const label = screen.getByText(DEFAULT_LABEL);
    const radioGroup = screen.getByRole("radiogroup");

    expect(label).toHaveAttribute("for", radioGroup.id);

    PUBLICATION_MODES.forEach((mode) => {
      const radio = screen.getByLabelText(mode.label);
      const label = screen.getByText(mode.label);
      expect(label).toHaveAttribute("for", radio.id);
    });
  });
});
