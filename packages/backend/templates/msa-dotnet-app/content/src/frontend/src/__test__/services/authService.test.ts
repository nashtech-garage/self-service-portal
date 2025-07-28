import { authService } from "@/services/authService";
import axiosInstance from "@/services/axiosInterceptorService";
import { describe, it, expect, jest } from "@jest/globals";

jest.mock("@/services/axiosInterceptorService");
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe("authService.login", () => {
  it("should POST login credentials and return user data", async () => {
    const credentials = { username: "john", password: "123456" };
    const mockUser = { id: 1, username: "john" };
    const mockResponse = { data: mockUser };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    const result = await authService.login(credentials);

    expect(mockedAxios.post).toHaveBeenCalledWith("/auth/login", credentials);
    expect(result).toEqual(mockUser);
  });
});

describe("authService.logout", () => {
  it("should call POST to /auth/logout", async () => {
    mockedAxios.post.mockResolvedValueOnce({});

    await authService.logout();

    expect(mockedAxios.post).toHaveBeenCalledWith("/auth/logout");
  });
});

describe("authService.changePassword", () => {
  it("should PUT current and new password", async () => {
    const currentPassword = "old123";
    const newPassword = "new456";
    const mockResponse = { data: null };

    mockedAxios.put.mockResolvedValueOnce(mockResponse);

    const result = await authService.changePassword(currentPassword, newPassword);

    expect(mockedAxios.put).toHaveBeenCalledWith("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    expect(result).toBeNull();
  });
});

describe("authService.firstChangePassword", () => {
  it("should PUT new password for first-time change", async () => {
    const newPassword = "newFirst123";
    const mockResponse = { data: null };

    mockedAxios.put.mockResolvedValueOnce(mockResponse);

    const result = await authService.firstChangePassword(newPassword);

    expect(mockedAxios.put).toHaveBeenCalledWith("/auth/first-change-password", {
      password: newPassword,
    });
    expect(result).toBeNull();
  });
});

describe("authService.getme", () => {
  it("should GET current user profile", async () => {
    const mockProfile = { id: 1, username: "john", role: "Admin" };
    const mockResponse = { data: mockProfile };

    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    const result = await authService.getme();

    expect(mockedAxios.get).toHaveBeenCalledWith("/me");
    expect(result).toEqual(mockProfile);
  });
});
