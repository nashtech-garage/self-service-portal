import type { PaginationResponse } from "@/entities/api";
import type { ReturningRequest } from "@/entities/returningRequest";
import axiosInstance from "./axiosInterceptorService";

export interface GetReturningRequestsParams {
  page: number;
  pageSize: number;
  sortBy: string;
  direction: string;
  keySearch?: string;
  states?: number[];
  returnedDate?: string;
}

export const returningRequestService = {
  getReturningRequests: async (params: GetReturningRequestsParams): Promise<PaginationResponse<ReturningRequest>> => {
    const requestParams: any = {
      pageSize: params.pageSize,
      page: params.page,
      sortBy: params.sortBy,
      direction: params.direction,
    };

    if (params.keySearch) {
      requestParams.keySearch = params.keySearch;
    }

    if (params.returnedDate) {
      requestParams.returnedDate = params.returnedDate;
    }

    // Handle multiple states for ASP.NET Core
    if (params.states && params.states.length > 0) {
      // For ASP.NET Core, send multiple State parameters: State=1&State=2
      params.states.forEach((state) => {
        if (!requestParams.State) {
          requestParams.State = [];
        }
        if (Array.isArray(requestParams.State)) {
          requestParams.State.push(state);
        }
      });
    }

    const response = await axiosInstance.get("/returning-request-management", {
      params: requestParams,
      paramsSerializer: (params) => {
        const searchParams = new URLSearchParams();

        Object.keys(params).forEach((key) => {
          const value = params[key];
          if (Array.isArray(value)) {
            // Handle array parameters (like State)
            value.forEach((v) => searchParams.append(key, v.toString()));
          } else if (value !== undefined && value !== null) {
            searchParams.append(key, value.toString());
          }
        });

        return searchParams.toString();
      },
    });

    return response.data;
  },

  completeReturningRequest: async (id: number) => {
    const response = await axiosInstance.patch(`/returning-request-management/${id}/complete`);
    return response.data;
  },

  cancelReturningRequest: async (id: number) => {
    const response = await axiosInstance.patch(`/returning-request-management/${id}/cancel`);
    return response.data;
  },
};
