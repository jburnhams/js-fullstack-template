import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { Calculator } from "../../frontend/src/components/Calculator";

// Mock fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe("Calculator Component", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("handles input validation errors (NaN)", () => {
    const mockOnError = vi.fn();
    const mockOnResult = vi.fn();
    const { container } = render(<Calculator onResult={mockOnResult} onError={mockOnError} />);

    // Disable form validation to allow submission with empty fields (which result in NaN)
    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    form?.setAttribute("novalidate", "true");

    // Inputs are initially empty (""), parsing them leads to NaN
    fireEvent.click(screen.getByRole("button", { name: /Calculate/i }));

    expect(mockOnError).toHaveBeenCalledWith("Please enter valid numbers");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("handles API error responses", async () => {
    const mockOnError = vi.fn();
    const mockOnResult = vi.fn();

    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Backend validation failed" }),
    });

    render(<Calculator onResult={mockOnResult} onError={mockOnError} />);

    fireEvent.change(screen.getByLabelText(/First Number/i), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText(/Second Number/i), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText(/Operation/i), { target: { value: "divide" } });

    fireEvent.click(screen.getByRole("button", { name: /Calculate/i }));

    expect(screen.getByRole("button")).toBeDisabled(); // Loading state

    await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith("Backend validation failed");
    });

    expect(mockOnResult).not.toHaveBeenCalled();
  });

  it("handles network errors", async () => {
    const mockOnError = vi.fn();
    const mockOnResult = vi.fn();

    fetchMock.mockRejectedValueOnce(new Error("Connection refused"));

    render(<Calculator onResult={mockOnResult} onError={mockOnError} />);

    fireEvent.change(screen.getByLabelText(/First Number/i), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText(/Second Number/i), { target: { value: "5" } });

    fireEvent.click(screen.getByRole("button", { name: /Calculate/i }));

    await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith("Network error: Error: Connection refused");
    });
  });

   it("successfully calculates result", async () => {
    const mockOnError = vi.fn();
    const mockOnResult = vi.fn();
    const mockResult = { result: 15, operation: "add", operands: { a: 10, b: 5 } };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResult,
    });

    render(<Calculator onResult={mockOnResult} onError={mockOnError} />);

    fireEvent.change(screen.getByLabelText(/First Number/i), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText(/Second Number/i), { target: { value: "5" } });

    fireEvent.click(screen.getByRole("button", { name: /Calculate/i }));

    await waitFor(() => {
        expect(mockOnResult).toHaveBeenCalledWith(mockResult);
    });
    expect(mockOnError).toHaveBeenCalledWith(""); // Clears error on submit
  });
});
