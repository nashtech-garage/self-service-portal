import { PAGE_SIZE } from "@/constants/pagination";
import type { ApiResponse, PaginationResponse } from "@/entities/api";
import type { AdminAssignment, AdminAssignmentListRequest } from "@/entities/assignment";
import type {
  AssignableAssetsResponse,
  AssignableUsersResponse,
  CreateAssignmentRequest,
  CreateAssignmentResponse,
  GetAssignableAssetsRequest,
  GetAssignableUsersRequest,
} from "@/entities/createAssignment";
import { paramsSerializer } from "@/utils/formatUtils";
import axiosInstance from "./axiosInterceptorService";

// Sử dụng giá trị mặc định từ PAGE_SIZE
const DEFAULT_PAGE_SIZE = PAGE_SIZE[2]; // 15

/**
 * Service for handling admin assignment related API calls
 */
export class AdminAssignmentService {
  /**
   * Get admin assignments with pagination and filtering
   */
  getAdminAssignments = async (params?: AdminAssignmentListRequest): Promise<PaginationResponse<AdminAssignment>> => {
    const requestParams: any = {
      page: params?.page || 1,
      pageSize: params?.pageSize || DEFAULT_PAGE_SIZE,
      SortBy: params?.sortBy || "assignedDate",
      Direction: params?.direction || "asc",
      keySearch: params?.search || "",
      assignedDate: params?.assignedDate,
    };

    if (params?.states && params.states.length > 0) {
      requestParams.state = params.states;
    } else if (params?.state !== undefined) {
      requestParams.state = params.state;
    }

    return (
      await axiosInstance.get<PaginationResponse<AdminAssignment>>("/assignment-management", {
        params: requestParams,
        paramsSerializer,
      })
    ).data;
  };

  getAssignmentDetail = async (assignmentId: number): Promise<any> => {
    const response = await axiosInstance.get(`/assignment-management/${assignmentId}`);
    return response.data;
  };

  returnAssignment = async (assignmentId: number): Promise<any> => {
    const response = await axiosInstance.post(`/assignment-management/${assignmentId}/returning-request`);
    return response.data;
  };

  deleteAssignment = async (assignmentId: number): Promise<any> => {
    const response = await axiosInstance.delete(`/assignment-management/${assignmentId}`);
    return response.data;
  };

  createAssignment = async (form: CreateAssignmentRequest): Promise<ApiResponse<CreateAssignmentResponse>> => {
    const response = await axiosInstance.post<ApiResponse<CreateAssignmentResponse>>("/assignment-management", form);
    return response.data;
  };

  fetchAssignableUsers = async (
    request: GetAssignableUsersRequest
  ): Promise<PaginationResponse<AssignableUsersResponse>> => {
    const response = await axiosInstance.get<PaginationResponse<AssignableUsersResponse>>(
      "/assignment-management/assignable-users",
      { params: request }
    );
    return response.data;
  };

  fetchAssignableAssets = async (
    request: GetAssignableAssetsRequest
  ): Promise<PaginationResponse<AssignableAssetsResponse>> => {
    const response = await axiosInstance.get<PaginationResponse<AssignableAssetsResponse>>(
      "/assignment-management/assignable-assets",
      { params: request }
    );
    return response.data;
  };
}

export const adminAssignmentService = new AdminAssignmentService();
