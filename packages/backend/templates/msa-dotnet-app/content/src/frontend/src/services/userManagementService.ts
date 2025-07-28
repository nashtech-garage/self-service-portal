import type { ApiResponse, PaginationResponse } from "@/entities/api";
import type { EditUserPayload, UserDetail, UserResponse } from "@/entities/user";
import { paramsSerializer } from "@utils/formatUtils";
import axiosInstance from "./axiosInterceptorService";

export const userManagementService = {
  async getUsers(params: object): Promise<PaginationResponse<UserResponse>> {
    return (
      await axiosInstance.get<PaginationResponse<UserResponse>>(`/user-management`, {
        params,
        paramsSerializer,
      })
    ).data;
  },

  async getUsersById(id: number): Promise<ApiResponse<UserDetail>> {
    return (await axiosInstance.get(`/user-management/${id}`)).data;
  },
  async editUser(userData: EditUserPayload): Promise<ApiResponse<UserDetail>> {
    return (await axiosInstance.patch(`/user-management/${userData.id}`, userData)).data;
  },
  async checkAssignmentUser(id: number): Promise<Boolean> {
    return (await axiosInstance.get(`/user-management/${id}/check-has-valid-assignment`)).data;
  },
  async disableUser(id: number): Promise<Boolean> {
    return (await axiosInstance.delete(`/user-management/${id}/disable`)).data;
  },
};
