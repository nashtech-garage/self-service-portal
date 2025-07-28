import { getTableConfig } from "@/config/TableConfig";
import { SORT_OPTION_NAMES, SORT_OPTION_VALUES } from "@/constants/pagination";
import type { ApiResponse } from "@/entities/api";
import type {
  GetHomeAssignmentsRequest,
  HomeAssignment,
  HomeAssignmentDetail,
  PaginationResponse,
} from "@/entities/homeAssignment";
import axiosInstance from "./axiosInterceptorService";

const convertSortDirection = (direction: any): string => {
  if (typeof direction === "string") {
    if (direction.toUpperCase() === "ASC") {
      return SORT_OPTION_NAMES[SORT_OPTION_VALUES.asc];
    }
    if (direction.toUpperCase() === "DESC") {
      return SORT_OPTION_NAMES[SORT_OPTION_VALUES.desc];
    }
    return direction.toLowerCase();
  }
  if (direction === SORT_OPTION_VALUES.asc || direction === 1) {
    return SORT_OPTION_NAMES[SORT_OPTION_VALUES.asc];
  }
  if (direction === SORT_OPTION_VALUES.desc || direction === -1) {
    return SORT_OPTION_NAMES[SORT_OPTION_VALUES.desc];
  }

  // Default fallback
  return SORT_OPTION_NAMES[SORT_OPTION_VALUES.desc];
};

export const homeAssignmentService = {
  /**
   * Get assignments assigned to the current user
   * @param params Query parameters for pagination and sorting
   * @returns Paginated list of assignments
   */
  async getMyAssignments(params?: GetHomeAssignmentsRequest): Promise<PaginationResponse<HomeAssignmentDetail>> {
    const config = getTableConfig("assignment");

    // Ensure all pagination parameters have concrete values
    const finalParams = {
      pageSize: params?.pageSize || config.pageSize,
      page: params?.page || config.page,
      sortBy: params?.sortBy || config.sortBy,
      direction: convertSortDirection(params?.direction || config.direction),
    };

    const response = await axiosInstance.get<PaginationResponse<HomeAssignment>>("/home/my-assignment", {
      params: finalParams,
    });

    const assignments = response.data.data as unknown as HomeAssignmentDetail[];

    return {
      ...response.data,
      data: assignments,
    };
  },

  async getAssignmentDetail(assignmentId: number): Promise<HomeAssignmentDetail> {
    try {
      const response = await axiosInstance.get<ApiResponse<HomeAssignmentDetail>>(
        `/home/my-assignment/${assignmentId}`
      );
      const assignmentData = response.data.data as unknown as HomeAssignmentDetail;

      return assignmentData;
    } catch (error) {
      console.error("Error fetching assignment detail:", error);
      throw error;
    }
  },

  async acceptAssignment(assignmentId: number): Promise<ApiResponse<string>> {
    const response = await axiosInstance.patch<ApiResponse<string>>(`/home/my-assignment/${assignmentId}/accept`);
    return response.data;
  },

  async declineAssignment(assignmentId: number): Promise<ApiResponse<string>> {
    const response = await axiosInstance.patch<ApiResponse<string>>(`/home/my-assignment/${assignmentId}/decline`);
    return response.data;
  },

  async returnAssignment(assignmentId: number): Promise<ApiResponse<string>> {
    const response = await axiosInstance.post<ApiResponse<string>>(
      `/home/my-assignment/${assignmentId}/returning-request`
    );
    return response.data;
  },
};
