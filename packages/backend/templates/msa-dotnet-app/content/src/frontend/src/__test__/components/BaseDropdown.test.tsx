import BaseDropdown from "@components/common/BaseDropdown";
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { forwardRef, useImperativeHandle } from "react";

// Helper: Mock child component that supports ref
const MockChild = forwardRef<HTMLSelectElement>((props, ref) => (
  <select ref={ref} data-testid="mock-child">
    <option value="1">One</option>
  </select>
));

describe("BaseDropdown", () => {
  it("renders children", () => {
    render(
      <BaseDropdown>
        <span data-testid="child">Test Child</span>
      </BaseDropdown>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("applies className prop", () => {
    render(
      <BaseDropdown className="custom-class">
        <span>Child</span>
      </BaseDropdown>
    );
    expect(screen.getByRole("button").parentElement).toHaveClass("custom-class");
  });

  it("renders filter icon button", () => {
    render(
      <BaseDropdown>
        <span>Child</span>
      </BaseDropdown>
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByRole("button").querySelector("i.pi.pi-filter-fill")).toBeInTheDocument();
  });

  it("passes ref to child if child is a valid React element (not string type)", () => {
    render(
      <BaseDropdown>
        <MockChild />
      </BaseDropdown>
    );
    expect(screen.getByTestId("mock-child")).toBeInTheDocument();
  });

  it("does not pass ref to child if child is a string type element", () => {
    // No error should occur, and child should render
    render(
      <BaseDropdown>
        <span data-testid="plain-span">Plain</span>
      </BaseDropdown>
    );
    expect(screen.getByTestId("plain-span")).toBeInTheDocument();
  });

  it("handleTriggerClick calls trigger.click() if trigger exists", () => {
    // Arrange: Spy on click
    const clickSpy = jest.fn();
    // Fake child with ref and overlayRef.previousSibling
    const FakeChild = forwardRef<any>((props, ref) => {
      useImperativeHandle(ref, () => ({
        overlayRef: {
          previousSibling: { click: clickSpy },
        },
      }));
      return <div>Fake</div>;
    });

    render(
      <BaseDropdown>
        <FakeChild />
      </BaseDropdown>
    );

    // Act: Click the filter button
    fireEvent.click(screen.getByRole("button"));

    // Assert: clickSpy should be called
    expect(clickSpy).toHaveBeenCalled();
  });

  it("handleTriggerClick does nothing if trigger does not exist", () => {
    // Arrange: Child with no overlayRef
    const NoTriggerChild = forwardRef<any>((props, ref) => {
      useImperativeHandle(ref, () => ({}));
      return <div>NoTrigger</div>;
    });

    render(
      <BaseDropdown>
        <NoTriggerChild />
      </BaseDropdown>
    );

    // Should not throw
    fireEvent.click(screen.getByRole("button"));
    // No error, test passes
  });
});
