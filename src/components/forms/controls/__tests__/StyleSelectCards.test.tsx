import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { StyleSelectCards } from "../StyleSelectCards";
import { STYLES } from "../constants";

function TestWrapper() {
  const { control } = useForm({
    defaultValues: {
      style: "professional",
    },
  });

  return <StyleSelectCards name="style" control={control} label="Test Label" description="Test Description" />;
}

describe("StyleSelectCards", () => {
  it("renders with default value", () => {
    render(<TestWrapper />);

    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();

    // Sprawdź, czy domyślny styl jest zaznaczony
    const defaultStyle = STYLES.find((s) => s.id === "professional");
    const defaultCard = screen.getByText(defaultStyle!.name).closest(".card");
    expect(defaultCard).toHaveClass("border-primary");
  });

  it("shows all style options", () => {
    render(<TestWrapper />);

    for (const style of STYLES) {
      expect(screen.getByText(style.name)).toBeInTheDocument();
      expect(screen.getByText(style.description)).toBeInTheDocument();
    }
  });

  it("allows selecting a different style", async () => {
    render(<TestWrapper />);

    const casualStyle = STYLES.find((s) => s.id === "casual")!;
    const casualCard = screen.getByText(casualStyle.name).closest(".card");

    await userEvent.click(casualCard!);

    await waitFor(() => {
      expect(casualCard).toHaveClass("border-primary");
    });
  });

  it("updates visual state when selecting different styles", async () => {
    render(<TestWrapper />);

    for (const style of STYLES) {
      const card = screen.getByText(style.name).closest(".card");
      await userEvent.click(card!);

      await waitFor(() => {
        expect(card).toHaveClass("border-primary");

        // Sprawdź, czy inne karty nie są zaznaczone
        STYLES.filter((s) => s.id !== style.id).forEach((otherStyle) => {
          const otherCard = screen.getByText(otherStyle.name).closest(".card");
          expect(otherCard).not.toHaveClass("border-primary");
        });
      });
    }
  });
});
