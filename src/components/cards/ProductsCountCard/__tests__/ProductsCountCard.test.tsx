import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductsCountCard } from "../index";
import { CARD_TEXTS } from "../constants";

describe("ProductsCountCard", () => {
  const defaultProps = {
    count: 42,
  };

  it("renders with default props", () => {
    render(<ProductsCountCard {...defaultProps} />);

    expect(screen.getByText(CARD_TEXTS.TITLE)).toBeInTheDocument();
    expect(screen.getByText(CARD_TEXTS.DESCRIPTION)).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders with custom title and description", () => {
    const customTitle = "Custom Title";
    const customDescription = "Custom Description";
    render(<ProductsCountCard {...defaultProps} title={customTitle} description={customDescription} />);

    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customDescription)).toBeInTheDocument();
  });

  it("formats large numbers correctly", () => {
    render(<ProductsCountCard count={1234567} />);

    expect(screen.getByText("1 234 567")).toBeInTheDocument();
  });

  it("handles click when onCountClick is provided", async () => {
    const onCountClick = vi.fn();
    render(<ProductsCountCard {...defaultProps} onCountClick={onCountClick} />);

    const count = screen.getByText("42");
    expect(count).toHaveClass("cursor-pointer");

    await userEvent.click(count);
    expect(onCountClick).toHaveBeenCalledTimes(1);
  });

  it("does not handle click when onCountClick is not provided", async () => {
    render(<ProductsCountCard {...defaultProps} />);

    const count = screen.getByText("42");
    expect(count).not.toHaveClass("cursor-pointer");
    expect(count).not.toHaveAttribute("role", "button");
  });

  it("applies custom className", () => {
    const customClassName = "custom-class";
    render(<ProductsCountCard {...defaultProps} className={customClassName} />);

    const card = screen.getByRole("article");
    expect(card).toHaveClass(customClassName);
  });

  it("maintains accessibility attributes when clickable", () => {
    render(<ProductsCountCard {...defaultProps} onCountClick={() => {}} />);

    const count = screen.getByRole("button");
    expect(count).toHaveAttribute("tabIndex", "0");
  });

  it("applies hover styles when clickable", () => {
    render(<ProductsCountCard {...defaultProps} onCountClick={() => {}} />);

    const count = screen.getByText("42");
    expect(count).toHaveClass("hover:text-primary", "transition-colors");
  });
});
