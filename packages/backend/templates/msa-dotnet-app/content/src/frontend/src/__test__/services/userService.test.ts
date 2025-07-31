import { userService } from "@/services/userService";
import axiosInstance from "@/services/axiosInterceptorService";
import { store } from "@/store";
import { setNewUser } from "@/store/userSlice";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";

jest.mock("@/services/axiosInterceptorService");
jest.mock("@/store", () => ({
  store: {
    dispatch: jest.fn(),
  },
}));
jest.mock("@/store/userSlice", () => ({
  setNewUser: jest.fn(),
}));

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;
const mockedDispatch = store.dispatch as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("userService.createUser", () => {
  it("should call API with formatted payload and dispatch on success", async () => {
    const userFormData = {
      firstName: "Jane",
      lastName: "Doe",
      gender: "Female",
      userType: 2,
      dateOfBirth: new Date("1995-01-01"),
      joinedDate: new Date("2022-01-01"),
    };

    const expectedPayload = {
      firstName: "Jane",
      lastName: "Doe",
      gender: 0,
      userType: 2,
      dateOfBirth: "1995-01-01T00:00:00.000Z",
      joinedDate: "2022-01-01T00:00:00.000Z",
    };

    const mockApiResponse = {
      data: {
        status: 201,
        data: {
          id: 1,
          username: "janedoe",
        },
        message: "Created successfully",
      },
    };

    mockedAxios.post.mockResolvedValueOnce(mockApiResponse);

    const result = await userService.createUser(userFormData);

    expect(mockedAxios.post).toHaveBeenCalledWith("/user-management", expectedPayload);
    expect(setNewUser).toHaveBeenCalledWith(mockApiResponse.data.data);
    expect(mockedDispatch).toHaveBeenCalled();
    expect(result).toEqual(mockApiResponse.data);
  });

  it("should NOT dispatch if status is not 201", async () => {
    const userFormData = {
      firstName: "John",
      lastName: "Smith",
      gender: "Male",
      userType: 1,
      dateOfBirth: new Date("1990-05-05"),
      joinedDate: new Date("2023-05-01"),
    };

    const mockApiResponse = {
      data: {
        status: 400,
        data: null,
        message: "Bad Request",
      },
    };

    mockedAxios.post.mockResolvedValueOnce(mockApiResponse);

    const result = await userService.createUser(userFormData);

    expect(mockedDispatch).not.toHaveBeenCalled();
    expect(result).toEqual(mockApiResponse.data);
  });
});
