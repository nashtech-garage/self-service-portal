import { useClickOutside } from "@hooks/useClickOutside";
import { useDropdownMenu } from "@hooks/useDropdownMenu";
import { act, renderHook } from "@testing-library/react";

jest.mock("@hooks/useClickOutside", () => ({
  useClickOutside: jest.fn(),
}));

const mockedUseClickOutside = useClickOutside as jest.Mock;

describe("useDropdownMenu Hook", () => {
  beforeEach(() => {
    mockedUseClickOutside.mockClear();
  });

  it("should initialize with isOpen as false", () => {
    const { result } = renderHook(() => useDropdownMenu());
    expect(result.current.isOpen).toBe(false);
  });

  it("should toggle the isOpen state when toggle is called", () => {
    const { result } = renderHook(() => useDropdownMenu());
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(false);
  });
  it("should return refs for trigger and menu", () => {
    const { result } = renderHook(() => useDropdownMenu());
    expect(result.current.triggerRef).toBeDefined();
    expect(result.current.triggerRef.current).toBeNull();
    expect(result.current.menuRef).toBeDefined();
    expect(result.current.menuRef.current).toBeNull();
  });

  it("should call useClickOutside with the correct refs and handler", () => {
    const { result } = renderHook(() => useDropdownMenu());
    expect(mockedUseClickOutside).toHaveBeenCalledTimes(1);
    const [refs, handler, trigger] = mockedUseClickOutside.mock.calls[0];
    expect(refs).toEqual([result.current.triggerRef, result.current.menuRef]);
    expect(trigger).toBe(result.current.triggerRef);
    expect(handler).toBeInstanceOf(Function);
  });

  it("should set isOpen to false when the outside click handler is triggered", () => {
    const { result } = renderHook(() => useDropdownMenu());

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);
    const handler = mockedUseClickOutside.mock.calls[0][1];
    act(() => {
      handler();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it("should remain closed if the outside click handler is triggered when already closed", () => {
    const { result } = renderHook(() => useDropdownMenu());
    expect(result.current.isOpen).toBe(false);
    const handler = mockedUseClickOutside.mock.calls[0][1];
    act(() => {
      handler();
    });
    expect(result.current.isOpen).toBe(false);
  });
});
