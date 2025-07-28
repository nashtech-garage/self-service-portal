import type { SelectOption } from "./common";

export interface UserResponse {
  id: number;
  staffCode: string;
  fullName: string;
  firstName: string;
  lastName: string;
  username: string;
  joinedDate: string;
  userType: number;
}
export interface UserListResponse {
  currentPage: number;
  pageSize: number;
  total: number;
  lastPage: number;
  data: UserResponse[];
}
export interface UserDetail extends UserResponse {
  dateOfBirth: string;
  gender: number;
  locationId: number;
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  gender: string;
  joinedDate: Date | null;
  userType: SelectOption | number | null;
}
export interface CreateUserResponse {
  id: number;
  staffCode: string;
  fullName: string;
  firstName: string;
  lastName: string;
  username: string;
  joinedDate: string;
  userType: number;
  rawPassword: string;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: number;
  joinedDate: string;
  userType: number;
}

export interface EditUserPayload {
  id: number;
  dateOfBirth: string;
  gender: number;
  joinedDate: string;
  userType: number;
}
