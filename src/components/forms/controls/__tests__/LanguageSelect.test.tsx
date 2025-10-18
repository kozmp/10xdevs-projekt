import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { LanguageSelect } from "../LanguageSelect";
import { LANGUAGES } from "../constants";

function TestWrapper() {
  const { control } = useForm({
    defaultValues: {
      language: "pl",
    },
  });

  return <LanguageSelect name="language" control={control} label="Test Label" description="Test Description" />;
}

describe("LanguageSelect", () => {
  it("renders with default value", () => {
    render(<TestWrapper />);

    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveValue("Polski");
  });

  it("shows all language options", async () => {
    render(<TestWrapper />);

    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);

    for (const language of LANGUAGES) {
      expect(screen.getByText(language.name)).toBeInTheDocument();
    }
  });

  it("allows selecting a different language", async () => {
    render(<TestWrapper />);

    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);
    await userEvent.click(screen.getByText("English"));

    await waitFor(() => {
      expect(combobox).toHaveValue("English");
    });
  });
});
