import React from "react";
import { render, screen } from "@testing-library/react";
import EditAssignment from "@/pages/AssignmentsManagement/Edit";

// Mock EditAssignmentForm component
jest.mock("@/components/Assignment/EditAssignmentForm", () => ({
  EditAssignmentForm: jest.fn(() => <div data-testid="mocked-edit-assignment-form">Mocked Edit Assignment Form</div>),
}));

describe("EditAssignment Component", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test("renders EditAssignmentForm component", () => {
    render(<EditAssignment />);

    // Check if EditAssignmentForm is rendered
    const mockedForm = screen.getByTestId("mocked-edit-assignment-form");
    expect(mockedForm).toBeInTheDocument();
    expect(screen.getByText("Mocked Edit Assignment Form")).toBeInTheDocument();
  });

  test("renders without crashing", () => {
    const { container } = render(<EditAssignment />);
    expect(container).toBeInTheDocument();
  });
});
