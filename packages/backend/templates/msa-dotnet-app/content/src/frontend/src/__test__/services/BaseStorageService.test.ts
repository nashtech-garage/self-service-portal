import { BaseStorageService } from "@services/storage/BaseStorageService";
import { describe, beforeEach, jest, it, expect } from "@jest/globals";

describe("BaseStorageService", () => {
  let mockStorage: Storage;
  let service: BaseStorageService;

  beforeEach(() => {
    mockStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    } as any;

    service = new BaseStorageService(mockStorage);
  });

  it("should store and retrieve access token", () => {
    service.setToken({ accessToken: "abc", refreshToken: "xyz" });

    expect(mockStorage.setItem).toHaveBeenCalledWith("access_token", "abc");
    expect(mockStorage.setItem).toHaveBeenCalledWith("refresh_token", "xyz");
  });

  it("should clear tokens", () => {
    service.clearToken();
    expect(mockStorage.removeItem).toHaveBeenCalledWith("access_token");
    expect(mockStorage.removeItem).toHaveBeenCalledWith("refresh_token");
  });

  it("should set and get item", () => {
    const key = "user";
    const value = { name: "John" };

    service.setItem(key, value);
    expect(mockStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(value));

    (mockStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(value));
    const result = service.getItem<typeof value>(key);
    expect(result).toEqual(value);
  });

  it("should handle TTL correctly", () => {
    const now = Date.now();
    jest.spyOn(Date, "now").mockReturnValue(now);

    service.setItemWithExpiry("temp", { val: 1 }, 60); // 60s
    const expected = {
      value: { val: 1 },
      expiry: now + 60 * 1000,
    };

    expect(mockStorage.setItem).toHaveBeenCalledWith("temp", JSON.stringify(expected));

    // not expired
    (mockStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(expected));
    expect(service.getItemWithExpiry("temp")).toEqual({ val: 1 });

    // expired
    jest.spyOn(Date, "now").mockReturnValue(now + 61 * 1000);
    (mockStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(expected));
    expect(service.getItemWithExpiry("temp")).toBeNull();
    expect(mockStorage.removeItem).toHaveBeenCalledWith("temp");
  });
});
