import type { ApiResponse } from "@/entities/api";
import type { CategoryCreate } from "@/entities/category";
import axiosInstance from "./axiosInterceptorService";

export const categoryService = {
  async getCategories(): Promise<any> {
    const respone = await axiosInstance.get("/meta-data/get-categories");
    return respone.data;
  },
  async createCategory(
    categoryData: CategoryCreate
  ): Promise<ApiResponse<any>> {
    return axiosInstance
      .post("/category-management", categoryData)
      .then((response) => response.data)
      .catch((error) => {
        throw error;
      });
  },
};
