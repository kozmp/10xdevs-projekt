import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusCard } from "../index";
import { CARD_TEXTS, STATUS_ARIA_LABELS, STATUS_COLORS } from "../constants";

describe("StatusCard", () => {
  const defaultProps = {
    status: true,
  };

  it("renders with default props", () => {
    render(<StatusCard {...defaultProps} />);

    expect(screen.getByText(CARD_TEXTS.TITLE)).toBeInTheDocument();
    expect(screen.getByText(CARD_TEXTS.DESCRIPTION_DEFAULT)).toBeInTheDocument();
    expect(screen.getByText(CARD_TEXTS.STATUS_ACTIVE)).toBeInTheDocument();
  });

  it("renders with shop name", () => {
    const shopName = "Test Shop";
    render(<StatusCard {...defaultProps} shopName={shopName} />);

    expect(screen.getByText(CARD_TEXTS.DESCRIPTION_WITH_SHOP.replace("{shopName}", shopName))).toBeInTheDocument();
  });

  it("renders with custom title", () => {
    const customTitle = "Custom Title";
    render(<StatusCard {...defaultProps} title={customTitle} />);

    expect(screen.getByText(customTitle)).toBeInTheDocument();
  });

  it("shows active status correctly", () => {
    render(<StatusCard {...defaultProps} />);

    const indicator = screen.getByLabelText(STATUS_ARIA_LABELS.ACTIVE);
    expect(indicator).toHaveClass(STATUS_COLORS.ACTIVE);
    expect(screen.getByText(CARD_TEXTS.STATUS_ACTIVE)).toBeInTheDocument();
  });

  it("shows error status correctly", () => {
    render(<StatusCard {...defaultProps} status={false} />);

    const indicator = screen.getByLabelText(STATUS_ARIA_LABELS.ERROR);
    expect(indicator).toHaveClass(STATUS_COLORS.ERROR);
    expect(screen.getByText(CARD_TEXTS.STATUS_ERROR)).toBeInTheDocument();
  });

  it("handles status click when onStatusClick is provided", async () => {
    const onStatusClick = vi.fn();
    render(<StatusCard {...defaultProps} onStatusClick={onStatusClick} />);

    const indicator = screen.getByLabelText(STATUS_ARIA_LABELS.ACTIVE);
    expect(indicator).toHaveClass("cursor-pointer");

    await userEvent.click(indicator);
    expect(onStatusClick).toHaveBeenCalledTimes(1);
  });

  it("does not handle click when onStatusClick is not provided", () => {
    render(<StatusCard {...defaultProps} />);

    const indicator = screen.getByLabelText(STATUS_ARIA_LABELS.ACTIVE);
    expect(indicator).not.toHaveClass("cursor-pointer");
    expect(indicator).not.toHaveAttribute("role", "button");
  });

  it("applies custom className", () => {
    const customClassName = "custom-class";
    render(<StatusCard {...defaultProps} className={customClassName} />);

    const card = screen.getByRole("article");
    expect(card).toHaveClass(customClassName);
  });

  it("maintains accessibility attributes when clickable", () => {
    render(<StatusCard {...defaultProps} onStatusClick={() => {}} />);

    const indicator = screen.getByRole("button");
    expect(indicator).toHaveAttribute("tabIndex", "0");
  });

  it("applies hover styles when clickable", () => {
    render(<StatusCard {...defaultProps} onStatusClick={() => {}} />);

    const indicator = screen.getByLabelText(STATUS_ARIA_LABELS.ACTIVE);
    expect(indicator).toHaveClass("hover:opacity-80", "transition-opacity");
  });
});
