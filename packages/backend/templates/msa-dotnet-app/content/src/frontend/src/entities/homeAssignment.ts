import type { PaginationResponse } from "@/entities/api";
import type { HomeItemCommon, ListRequestParams, UserInfo } from "./common";
import { AssignmentStatus } from "./enums";

// Raw API response types - used internally by services
export interface HomeAssignment extends HomeItemCommon {
  assetCode: string;
  assetName: string;
  assetCategoryName: string;
  assignedDate: string;
  state: number;
}

export type GetHomeAssignmentsRequest = ListRequestParams;

// Main Home item type used throughout the application - merged from HomeAssignmentDetail
export interface HomeAssignmentDetail extends HomeItemCommon {
  assetCode?: string;
  assetId?: string;
  assetName: string;
  assetCategoryName?: string;
  assetSpecification?: string | null;
  assignedTo: UserInfo | string;
  assignedBy: UserInfo | string;
  assignedDate: string;
  status?: AssignmentStatus;
  state: number;
  isReturningRequested?: boolean;
  note?: string | null;
  specification?: string;
}

// Type alias for backward compatibility
// export type HomeAssignmentDetail = HomeAssignmentItem;

export type { PaginationResponse };
