import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { LanguageSelect } from "../LanguageSelect";
import { LANGUAGES } from "../constants";

function TestWrapper() {
  const methods = useForm({
    defaultValues: {
      language: "pl",
    },
  });

  return (
    <FormProvider {...methods}>
      <LanguageSelect name="language" control={methods.control} label="Test Label" description="Test Description" />
    </FormProvider>
  );
}

describe("LanguageSelect", () => {
  it("renders with default value", () => {
    render(<TestWrapper />);

    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveTextContent("Polski");
  });

  it("shows all language options", async () => {
    render(<TestWrapper />);

    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);

    // Wait for dropdown to open and options to render
    await waitFor(() => {
      expect(combobox).toHaveAttribute("aria-expanded", "true");
    });

    // Verify all options are present (use getAllByRole for multiple options)
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(LANGUAGES.length);

    // Verify each language name appears in the options
    LANGUAGES.forEach((language) => {
      expect(screen.getByRole("option", { name: language.name })).toBeInTheDocument();
    });
  });

  it("allows selecting a different language", async () => {
    render(<TestWrapper />);

    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);

    // Wait for English option to appear then click it
    const englishOption = await screen.findByText("English");
    await userEvent.click(englishOption);

    await waitFor(() => {
      expect(combobox).toHaveTextContent("English");
    });
  });
});
