import { categoryService } from "@/services/categoryService";
import axiosInstance from "@/services/axiosInterceptorService";
import { describe, it, expect, jest } from "@jest/globals";

jest.mock("@/services/axiosInterceptorService");
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe("categoryService", () => {
  describe("getCategories", () => {
    it("should fetch categories and return response data", async () => {
      const mockData = { data: [{ id: 1, name: "Laptop" }] };
      mockedAxios.get.mockResolvedValueOnce(mockData);

      const result = await categoryService.getCategories();

      expect(mockedAxios.get).toHaveBeenCalledWith("/meta-data/get-categories");
      expect(result).toEqual(mockData.data);
    });
  });

  describe("createCategory", () => {
    it("should post new category and return response data", async () => {
      const newCategory = {
        prefix: "MON",
        category: "Monitor",
      };

      const mockResponse = {
        data: { id: 2, prefix: "MON", category: "Monitor" },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await categoryService.createCategory(newCategory);

      expect(mockedAxios.post).toHaveBeenCalledWith("/category-management", newCategory);
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw error if API fails", async () => {
      const newCategory = {
        prefix: "KEY",
        category: "Keyboard",
      };

      const mockError = new Error("Network Error");
      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(categoryService.createCategory(newCategory)).rejects.toThrow("Network Error");
    });
  });
});
