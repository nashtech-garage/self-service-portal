import { assetService, authService } from "@/services/assetService";
import axiosInstance from "@/services/axiosInterceptorService";
import type { CreateAsset, EditAsset } from "@/entities/asset";
import { describe, expect, it, jest } from "@jest/globals";

jest.mock("@/services/axiosInterceptorService"); // mock toàn bộ axiosInstance

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe("assetService.createAsset", () => {
  it("should call POST /asset-management with correct data", async () => {
    const mockAsset: CreateAsset = {
      name: "Laptop Dell",
      categoryId: 1,
      specification: "i7, 16GB RAM",
      installedDate: "2024-01-01",
      state: 0,
    };

    const mockResponse = { data: { success: true } };
    mockedAxios.post.mockResolvedValue(mockResponse);

    const result = await assetService.createAsset(mockAsset);

    expect(mockedAxios.post).toHaveBeenCalledWith("/asset-management", mockAsset);
    expect(result).toEqual(mockResponse);
  });
});

describe("assetService.editAsset", () => {
  it("should call PUT /asset-management/assetId with query and correct data", async () => {
    const mockAsset: EditAsset = {
      id: 123,
      name: "Updated Laptop",
      specification: "Updated spec",
      installedDate: "2024-02-01",
      state: 1,
    };

    const mockResponse = { data: { message: "Asset updated" } };
    mockedAxios.put.mockResolvedValue(mockResponse);

    const result = await assetService.editAsset(mockAsset);

    expect(mockedAxios.put).toHaveBeenCalledWith(`/asset-management/assetId?assetId=${mockAsset.id}`, mockAsset);
    expect(result).toEqual(mockResponse.data);
  });
});

describe("assetService.deleteAsset", () => {
  it("should call DELETE /asset-management/:id", async () => {
    const assetId = 456;
    const mockResponse = { data: { success: true } };

    mockedAxios.delete.mockResolvedValue(mockResponse);

    const result = await assetService.deleteAsset(assetId);

    expect(mockedAxios.delete).toHaveBeenCalledWith(`/asset-management/${assetId}`);
    expect(result).toEqual(mockResponse);
  });
});

describe("authService.getDetail", () => {
  it("should call GET /asset-management/:id", async () => {
    const id = 789;
    const mockResponse = { data: { id, name: "Asset name" } };

    mockedAxios.get.mockResolvedValue(mockResponse);

    const result = await authService.getDetail(id);

    expect(mockedAxios.get).toHaveBeenCalledWith(`/asset-management/${id}`);
    expect(result).toEqual(mockResponse);
  });
});
