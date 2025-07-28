import { useClickOutside } from "@hooks/useClickOutside";
import { act, fireEvent, renderHook } from "@testing-library/react";

jest.useFakeTimers();

describe("useClickOutside Hook", () => {
  let mockHandler: jest.Mock;
  let refElement1: React.RefObject<HTMLDivElement>;
  let refElement2: React.RefObject<HTMLDivElement>;
  let triggerRef: React.RefObject<HTMLButtonElement>;
  let insideElement1: HTMLDivElement;
  let insideElement2: HTMLDivElement;
  let triggerElement: HTMLButtonElement;
  let outsideElement: HTMLDivElement;

  beforeEach(() => {
    mockHandler = jest.fn();

    insideElement1 = document.createElement("div");
    insideElement2 = document.createElement("div");
    triggerElement = document.createElement("button");
    outsideElement = document.createElement("div");

    document.body.appendChild(insideElement1);
    document.body.appendChild(insideElement2);
    document.body.appendChild(triggerElement);
    document.body.appendChild(outsideElement);

    refElement1 = { current: insideElement1 };
    refElement2 = { current: insideElement2 };
    triggerRef = { current: triggerElement };
  });

  afterEach(() => {
    document.body.innerHTML = "";
    jest.clearAllMocks();
  });

  it("should call the handler when a click occurs outside the ref elements and the trigger", () => {
    renderHook(() => useClickOutside([refElement1, refElement2], mockHandler, triggerRef));

    fireEvent.click(outsideElement);

    expect(mockHandler).not.toHaveBeenCalled();

    act(() => {
      jest.runAllTimers();
    });

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  it("should not call the handler when clicking inside one of the ref elements", () => {
    renderHook(() => useClickOutside([refElement1, refElement2], mockHandler, triggerRef));

    fireEvent.click(insideElement1);
    act(() => {
      jest.runAllTimers();
    });
    expect(mockHandler).not.toHaveBeenCalled();
    fireEvent.click(insideElement2);
    act(() => {
      jest.runAllTimers();
    });
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it("should not call the handler when clicking on the trigger element", () => {
    renderHook(() => useClickOutside([refElement1], mockHandler, triggerRef));

    fireEvent.click(triggerElement);

    act(() => {
      jest.runAllTimers();
    });

    expect(mockHandler).not.toHaveBeenCalled();
  });

  it("should remove the event listener on unmount", () => {
    const addSpy = jest.spyOn(document, "addEventListener");
    const removeSpy = jest.spyOn(document, "removeEventListener");

    const { unmount } = renderHook(() => useClickOutside([refElement1], mockHandler, triggerRef));

    expect(addSpy).toHaveBeenCalledWith("click", expect.any(Function));
    const listener = addSpy.mock.calls[0][1];
    unmount();

    expect(removeSpy).toHaveBeenCalledWith("click", listener);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("should not crash and work correctly if a ref in the array is null", () => {
    const nullRef: React.RefObject<HTMLDivElement | null> = { current: null };
    renderHook(() => useClickOutside([refElement1, nullRef], mockHandler, triggerRef));

    fireEvent.click(outsideElement);
    act(() => {
      jest.runAllTimers();
    });
    expect(mockHandler).toHaveBeenCalledTimes(1);

    mockHandler.mockClear();
    fireEvent.click(insideElement1);
    act(() => {
      jest.runAllTimers();
    });
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it("should use the new handler if it changes between renders", () => {
    const newHandler = jest.fn();
    const { rerender } = renderHook(({ handler }) => useClickOutside([refElement1], handler, triggerRef), {
      initialProps: { handler: mockHandler },
    });

    rerender({ handler: newHandler });
    fireEvent.click(outsideElement);
    act(() => {
      jest.runAllTimers();
    });

    expect(mockHandler).not.toHaveBeenCalled();
    expect(newHandler).toHaveBeenCalledTimes(1);
  });
});
