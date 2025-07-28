import { AdminAssignmentService } from "@services/assignmentService";
import axiosInstance from "@/services/axiosInterceptorService";
import { describe, expect, it, jest } from "@jest/globals";
import { PAGINATION_CONFIGS } from "@config/TableConfig";

jest.mock("@/services/axiosInterceptorService");
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

const service = new AdminAssignmentService();
const DEFAULT_PAGE_SIZE = PAGINATION_CONFIGS.assignment.pageSize;

describe("getAdminAssignments", () => {
  it("should call API with default params when no input is given", async () => {
    const mockResponse = { data: { items: [], total: 0 } };
    mockedAxios.get.mockResolvedValue(mockResponse);

    const result = await service.getAdminAssignments();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/assignment-management",
      expect.objectContaining({
        params: expect.objectContaining({
          page: 1,
          pageSize: DEFAULT_PAGE_SIZE,
          SortBy: "assignedDate",
          Direction: "asc",
          keySearch: "",
        }),
        paramsSerializer: expect.any(Function),
      })
    );

    expect(result).toEqual(mockResponse.data);
  });

  it("should include filters like states", async () => {
    const mockResponse = { data: { items: [], total: 5 } };
    mockedAxios.get.mockResolvedValue(mockResponse);

    const input = {
      page: 2,
      states: [1, 2],
      search: "test",
    };

    const result = await service.getAdminAssignments(input);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/assignment-management",
      expect.objectContaining({
        params: expect.objectContaining({
          page: 2,
          state: [1, 2],
          keySearch: "test",
        }),
      })
    );
    expect(result).toEqual(mockResponse.data);
  });
});

it("should include single state filter when states is not provided", async () => {
  const mockResponse = { data: { items: [], total: 3 } };
  mockedAxios.get.mockResolvedValue(mockResponse);

  const input = {
    page: 1,
    state: 1, // dùng state (not states)
    search: "single",
  };

  const result = await service.getAdminAssignments(input);

  expect(mockedAxios.get).toHaveBeenCalledWith(
    "/assignment-management",
    expect.objectContaining({
      params: expect.objectContaining({
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        SortBy: "assignedDate",
        Direction: "asc",
        keySearch: "single",
        state: 1, // đây là điểm cần kiểm tra
      }),
      paramsSerializer: expect.any(Function),
    })
  );

  expect(result).toEqual(mockResponse.data);
});

describe("getAssignmentDetail", () => {
  it("should fetch assignment detail by id", async () => {
    const mockData = { id: 1, note: "Detail" };
    mockedAxios.get.mockResolvedValue({ data: mockData });

    const result = await service.getAssignmentDetail(1);

    expect(mockedAxios.get).toHaveBeenCalledWith("/assignment-management/1");
    expect(result).toEqual(mockData);
  });
});

describe("returnAssignment", () => {
  it("should POST to return endpoint", async () => {
    const mockData = { success: true };
    mockedAxios.post.mockResolvedValue({ data: mockData });

    const result = await service.returnAssignment(10);

    expect(mockedAxios.post).toHaveBeenCalledWith("/assignment-management/10/returning-request");
    expect(result).toEqual(mockData);
  });
});

describe("deleteAssignment", () => {
  it("should DELETE assignment by ID", async () => {
    const mockData = { deleted: true };
    mockedAxios.delete.mockResolvedValue({ data: mockData });

    const result = await service.deleteAssignment(99);

    expect(mockedAxios.delete).toHaveBeenCalledWith("/assignment-management/99");
    expect(result).toEqual(mockData);
  });
});

describe("createAssignment", () => {
  it("should POST to create assignment", async () => {
    const mockForm = { assetId: 1, userId: 2, assignedDate: "2024-01-01", note: "" };
    const mockResponse = { data: { success: true, assignmentId: 1 } };

    mockedAxios.post.mockResolvedValue(mockResponse);

    const result = await service.createAssignment(mockForm);

    expect(mockedAxios.post).toHaveBeenCalledWith("/assignment-management", mockForm);
    expect(result).toEqual(mockResponse.data);
  });
});

describe("fetchAssignableUsers", () => {
  it("should GET assignable users", async () => {
    const mockRequest = { page: 1, pageSize: 5, keyword: "john" };
    const mockData = { data: { items: [], total: 0 } };

    mockedAxios.get.mockResolvedValue(mockData);

    const result = await service.fetchAssignableUsers(mockRequest);

    expect(mockedAxios.get).toHaveBeenCalledWith("/assignment-management/assignable-users", { params: mockRequest });
    expect(result).toEqual(mockData.data);
  });
});

describe("fetchAssignableAssets", () => {
  it("should GET assignable assets", async () => {
    const mockRequest = { page: 1, pageSize: 5, keyword: "laptop" };
    const mockData = { data: { items: [], total: 0 } };

    mockedAxios.get.mockResolvedValue(mockData);

    const result = await service.fetchAssignableAssets(mockRequest);

    expect(mockedAxios.get).toHaveBeenCalledWith("/assignment-management/assignable-assets", { params: mockRequest });
    expect(result).toEqual(mockData.data);
  });
});
