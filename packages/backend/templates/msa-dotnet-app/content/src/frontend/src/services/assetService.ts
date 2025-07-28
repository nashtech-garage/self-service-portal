import type { ApiResponse } from "@/entities/api";
import type { CreateAsset, EditAsset } from "@/entities/asset";
import axiosInstance from "./axiosInterceptorService";

export const assetService = {
  async createAsset(assetData: CreateAsset): Promise<ApiResponse<any>> {
    return axiosInstance.post("/asset-management", assetData);
  },

  async editAsset(assetData: EditAsset): Promise<ApiResponse<any>> {
    return (await axiosInstance.put(`/asset-management/assetId?assetId=${assetData.id}`, assetData)).data;
  },

  async deleteAsset(assetId: number): Promise<ApiResponse<any>> {
    return axiosInstance.delete(`/asset-management/${assetId}`);
  },
};

export const authService = {
  async getDetail(id: number): Promise<any> {
    return axiosInstance.get(`/asset-management/${id}`);
  },
};
