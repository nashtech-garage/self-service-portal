import { UserTypeEnum } from "./enums";

/**
 * PrimeReact severity levels for components
 */
export type PrimeSeverity = "success" | "info" | "warning" | "danger" | "secondary" | "contrast" | undefined;

/**
 * Common user information interface
 * Used for representing user data across the application
 */
export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  role?: UserTypeEnum;
}

export interface HomeItemCommon {
  id: number;
  assignedDate: string;
}

export interface ListRequestParams {
  pageSize?: number;
  page?: number;
  sortBy?: string;
  direction?: number | string;
  search?: string;
}

export interface SelectOption {
  name: string;
  value: number;
}

export interface GenderOption {
  value: string;
  label: string;
}

export interface CustomError {
  status: number;
  message: string;
  error: string[];
}
