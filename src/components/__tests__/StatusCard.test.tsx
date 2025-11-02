import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatusCard } from "../StatusCard";

describe("StatusCard", () => {
  describe("when shop is connected (status = true)", () => {
    it("should render with green indicator and 'Aktywne' label", () => {
      render(<StatusCard status={true} shopName="test-shop.myshopify.com" />);

      expect(screen.getByText("Status połączenia")).toBeInTheDocument();
      expect(screen.getByText("Sklep: test-shop.myshopify.com")).toBeInTheDocument();
      expect(screen.getByText("Aktywne")).toBeInTheDocument();
      expect(screen.getByLabelText("Połączono")).toHaveClass("bg-green-500");
    });

    it("should render without shop name when not provided", () => {
      render(<StatusCard status={true} />);

      expect(screen.getByText("Status połączenia")).toBeInTheDocument();
      expect(screen.getByText("Sprawdź połączenie z API")).toBeInTheDocument();
      expect(screen.getByText("Aktywne")).toBeInTheDocument();
    });
  });

  describe("when shop is NOT connected (status = false)", () => {
    it("should render with yellow indicator and 'Nieskonfigurowany' label", () => {
      render(<StatusCard status={false} />);

      expect(screen.getByText("Status połączenia")).toBeInTheDocument();
      expect(screen.getByText("Sprawdź połączenie z API")).toBeInTheDocument();
      expect(screen.getByText("Nieskonfigurowany")).toBeInTheDocument();
      expect(screen.getByLabelText("Nieskonfigurowany")).toHaveClass("bg-yellow-500");
    });

    it("should render with yellow indicator even when shopName is undefined", () => {
      render(<StatusCard status={false} shopName={undefined} />);

      expect(screen.getByLabelText("Nieskonfigurowany")).toHaveClass("bg-yellow-500");
      expect(screen.getByText("Nieskonfigurowany")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("should have proper aria-label for connected state", () => {
      render(<StatusCard status={true} />);

      const indicator = screen.getByLabelText("Połączono");
      expect(indicator).toBeInTheDocument();
    });

    it("should have proper aria-label for disconnected state", () => {
      render(<StatusCard status={false} />);

      const indicator = screen.getByLabelText("Nieskonfigurowany");
      expect(indicator).toBeInTheDocument();
    });
  });
});
