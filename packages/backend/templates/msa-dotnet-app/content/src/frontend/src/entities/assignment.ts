import type { ListRequestParams } from "./common";
import type { AssignmentStatus } from "./enums";

export interface AdminAssignment {
  id?: number;
  assetCode?: string;
  assetName?: string;
  assignedTo?: string;
  assignedBy?: string;
  assignedDate?: string;
  state?: AssignmentStatus;
  isReturningRequested?: boolean;
}

export interface AdminAssignmentListItem {
  currentPage?: number;
  pageSize?: number;
  total?: number;
  lastPage?: number;
  data?: AdminAssignment[];
}

export interface AdminAssignmentListRequest extends ListRequestParams {
  state?: number;
  states?: number[];
  assignedDate?: string;
}

export interface DetailAssignment {
  id: number;
  assetCode: string;
  assetName: string;
  assetSpecification: string;
  assignedTo: string;
  assignedBy: string;
  assignedDate: string;
  state: AssignmentStatus;
  note?: string;
}

export interface EditAssignmentDetail {
  id: number;
  userId: number;
  fullName: string;
  assetId: number;
  assetName: string;
  assignedDate: string;
  note?: string;
  state: AssignmentStatus;
}

export interface UpdateAssignmentRequest {
  userId: number;
  assetId: number;
  assignedDate: string;
  note?: string;
}

export interface UpdateAssignmentResponse {
  id: number;
  assetId : number;
  assetCode: string;
  assetName: string;
  assignedTo: string;
  assignedBy: string;
  assignedDate: string;
  state: AssignmentStatus;
}