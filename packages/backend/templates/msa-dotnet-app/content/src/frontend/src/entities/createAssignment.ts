import type { QueryRequest } from "./api";
import { UserTypeEnum } from "./enums";

export interface CreateAssignmentRequest {
  assetId: number; // ID of the asset assigned
  userId: number; // User ID of the assignee
  assignedDate: string; // Date of assignment
  note?: string; // Optional note for the assignment
}
export interface CreateAssignmentResponse {
  id: number; // Unique identifier for the created assignment
  assetCode: string;
  assetName: string;
  assignedTo: string;
  assignedBy: string;
  assignedDate: string;
  state: number;
}

export interface GetAssignableAssetsRequest extends QueryRequest {
  keySearch?: string;
}

export interface GetAssignableUsersRequest extends QueryRequest {
  keySearch?: string;
}

export interface AssignableAssetsResponse {
  id: number; // Unique identifier for the asset
  code: string; // Code of the asset
  name: string; // Name of the asset
  categoryName: string; // Category name of the asset
}

export interface AssignableUsersResponse {
  id: number; // Unique identifier for the user
  staffCode: string; // Staff code of the user
  fullName: string; // Full name of the user
  type: UserTypeEnum;
}
