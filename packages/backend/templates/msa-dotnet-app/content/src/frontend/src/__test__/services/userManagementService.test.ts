import { userManagementService } from "@/services/userManagementService";
import axiosInstance from "@/services/axiosInterceptorService";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";

jest.mock("@/services/axiosInterceptorService");
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("userManagementService.getUsers", () => {
  it("should fetch users with correct query params", async () => {
    const params = {
      SortBy: "fullName",
      Direction: "asc",
      Page: 2,
      PageSize: 10,
      KeySearch: "john",
      UserType: 1,
    };

    const mockData = {
      data: {
        data: [],
        total: 0,
        currentPage: 2,
        pageSize: 10,
        lastPage: 1,
      },
    };

    mockedAxios.get.mockResolvedValueOnce(mockData);

    const result = await userManagementService.getUsers(params);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/user-management",
      expect.objectContaining({
        params: {
          Page: 2,
          PageSize: 10,
          SortBy: "fullName",
          Direction: "asc",
          KeySearch: "john",
          UserType: 1,
        },
      })
    );
    expect(result).toEqual(mockData.data);
  });

  it("should serialize array parameters correctly", async () => {
    const mockResponse = {
      data: {
        data: [],
        total: 0,
        currentPage: 1,
        pageSize: 10,
        lastPage: 1,
      },
    };

    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    const params = {
      SortBy: "username",
      Direction: "asc",
      Page: 1,
      PageSize: 10,
      KeySearch: "john",
      UserType: 1,
    };

    await userManagementService.getUsers(params);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/user-management",
      expect.objectContaining({
        params: expect.objectContaining({
          UserType: 1,
          Page: 1,
          PageSize: 10,
          SortBy: "username",
          Direction: "asc",
          KeySearch: "john",
        }),
        paramsSerializer: expect.any(Function),
      })
    );
  });
});

describe("userManagementService.getUsersById", () => {
  it("should fetch user detail by ID", async () => {
    const mockUser = {
      id: 1,
      staffCode: "SD001",
      fullName: "John Doe",
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      dateOfBirth: "1990-01-01",
      gender: "Male",
      joinedDate: "2020-01-01",
      userType: 1,
      locationId: 1,
    };

    mockedAxios.get.mockResolvedValueOnce({
      data: mockUser,
    });

    const result = await userManagementService.getUsersById(1);

    expect(mockedAxios.get).toHaveBeenCalledWith("/user-management/1");
    expect(result).toEqual(mockUser);
  });
});

describe("userManagementService.editUser", () => {
  it("should call patch and return updated user", async () => {
    const userData = {
      id: 1,
      gender: 1,
      dateOfBirth: "1991-01-01",
      joinedDate: "2021-01-01",
      userType: 2,
      locationId: 1,
    };

    const mockResponse = {
      data: {
        ...userData,
        fullName: "Jane Doe",
        username: "janedoe",
        staffCode: "SD002",
      },
    };

    mockedAxios.patch.mockResolvedValueOnce({ data: mockResponse });

    const result = await userManagementService.editUser(userData);

    expect(mockedAxios.patch).toHaveBeenCalledWith(`/user-management/${userData.id}`, userData);
    expect(result).toEqual(mockResponse);
  });
});

describe("userManagementService.checkAssignmentUser", () => {
  it("should return true if user has valid assignment", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: true });

    const result = await userManagementService.checkAssignmentUser(1);

    expect(mockedAxios.get).toHaveBeenCalledWith("/user-management/1/check-has-valid-assignment");
    expect(result).toBe(true);
  });
});

describe("userManagementService.disableUser", () => {
  it("should call delete to disable user and return true", async () => {
    mockedAxios.delete.mockResolvedValueOnce({ data: true });

    const result = await userManagementService.disableUser(1);

    expect(mockedAxios.delete).toHaveBeenCalledWith("/user-management/1/disable");
    expect(result).toBe(true);
  });
});
