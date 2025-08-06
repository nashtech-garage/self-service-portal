import { setLoading } from "@/store/appSlice";
import { useLoading } from "@hooks/useLoading";
import { act, renderHook } from "@testing-library/react";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => mockDispatch,
}));

jest.mock("@/store/appSlice", () => ({
  setLoading: jest.fn((isLoading) => ({
    type: "app/setLoading",
    payload: isLoading,
  })),
}));

const mockedSetLoading = setLoading as unknown as jest.Mock;

describe("useLoading Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should dispatch setLoading(true), resolve the promise, and then dispatch setLoading(false) on success", async () => {
    const { result } = renderHook(() => useLoading());

    const successData = { message: "Success" };
    const successfulPromise = Promise.resolve(successData);

    let promiseResult: any;
    await act(async () => {
      promiseResult = await result.current.withLoading(successfulPromise);
    });

    expect(promiseResult).toEqual(successData);

    expect(mockDispatch).toHaveBeenCalledTimes(2);

    expect(mockedSetLoading).toHaveBeenNthCalledWith(1, true);
    expect(mockDispatch).toHaveBeenNthCalledWith(1, { type: "app/setLoading", payload: true });

    expect(mockedSetLoading).toHaveBeenNthCalledWith(2, false);
    expect(mockDispatch).toHaveBeenNthCalledWith(2, { type: "app/setLoading", payload: false });
  });

  it("should dispatch setLoading(true), reject the promise, and still dispatch setLoading(false) on failure", async () => {
    const { result } = renderHook(() => useLoading());

    const error = new Error("Something went wrong");
    const failingPromise = Promise.reject(error);

    await act(async () => {
      await expect(result.current.withLoading(failingPromise)).rejects.toThrow("Something went wrong");
    });

    expect(mockDispatch).toHaveBeenCalledTimes(2);

    expect(mockedSetLoading).toHaveBeenNthCalledWith(1, true);
    expect(mockDispatch).toHaveBeenNthCalledWith(1, { type: "app/setLoading", payload: true });

    expect(mockedSetLoading).toHaveBeenNthCalledWith(2, false);
    expect(mockDispatch).toHaveBeenNthCalledWith(2, { type: "app/setLoading", payload: false });
  });

  it("should dispatch setLoading(true) immediately and setLoading(false) only after the promise settles", async () => {
    const { result } = renderHook(() => useLoading());

    let resolvePromise: (value: string) => void;
    const longPromise = new Promise<string>((resolve) => {
      resolvePromise = resolve;
    });

    act(() => {
      result.current.withLoading(longPromise);
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockedSetLoading).toHaveBeenCalledWith(true);

    await act(async () => {
      resolvePromise("Done");
      await longPromise;
    });

    expect(mockDispatch).toHaveBeenCalledTimes(2);
    expect(mockedSetLoading).toHaveBeenLastCalledWith(false);
  });
});
