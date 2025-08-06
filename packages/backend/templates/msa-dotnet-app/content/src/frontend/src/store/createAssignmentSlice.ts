import type { ApiResponse, PaginationResponse } from "@/entities/api";
import type {
  AssignableAssetsResponse,
  AssignableUsersResponse,
  CreateAssignmentRequest,
  CreateAssignmentResponse,
  GetAssignableAssetsRequest,
  GetAssignableUsersRequest,
} from "@/entities/createAssignment";
import { adminAssignmentService } from "@/services/assignmentService";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface CreateAssignmentState {
  assignableUsers?: PaginationResponse<AssignableUsersResponse> | null;
  assignableAssets?: PaginationResponse<AssignableAssetsResponse> | null;
  createdAssignment?: CreateAssignmentResponse | null;
  loading: boolean;
  loadingCreate?: boolean;
  error: string | null;
}

const initialState: CreateAssignmentState = {
  assignableUsers: null,
  assignableAssets: null,
  createdAssignment: null,
  loading: false,
  loadingCreate: false,
  error: null,
};

export const createAssignmentThunk = createAsyncThunk<ApiResponse<CreateAssignmentResponse>, CreateAssignmentRequest>(
  "assignment-management/createAssignment",
  async (form) => await adminAssignmentService.createAssignment(form)
);

export const fetchAssignableUsersThunk = createAsyncThunk<
  PaginationResponse<AssignableUsersResponse>,
  GetAssignableUsersRequest
>(
  "assignment-management/assignable-users",
  async (request) => await adminAssignmentService.fetchAssignableUsers(request)
);

export const fetchAssignableAssetsThunk = createAsyncThunk<
  PaginationResponse<AssignableAssetsResponse>,
  GetAssignableAssetsRequest
>(
  "assignment-management/assignable-assets",
  async (request) => await adminAssignmentService.fetchAssignableAssets(request)
);

const createAssignmentSlice = createSlice({
  name: "createAssignment",
  initialState,
  reducers: {
    resetCreateAssignmentState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Users
      .addCase(fetchAssignableUsersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignableUsersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.assignableUsers = action.payload as PaginationResponse<AssignableUsersResponse>;
      })
      .addCase(fetchAssignableUsersThunk.rejected, (state, action) => {
        state.loading = false;
        const message = (action.payload as { message: string })?.message || "An error occurred during fetching users.";
        state.error = message;
      })

      // Assets
      .addCase(fetchAssignableAssetsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignableAssetsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.assignableAssets = action.payload as PaginationResponse<AssignableAssetsResponse>;
      })
      .addCase(fetchAssignableAssetsThunk.rejected, (state, action) => {
        state.loading = false;
        const message = (action.payload as { message: string })?.message || "An error occurred during fetching assets.";
        state.error = message;
      })

      // CreateAssignmentForm
      .addCase(createAssignmentThunk.pending, (state) => {
        state.loadingCreate = true;
        state.error = null;
      })
      .addCase(createAssignmentThunk.fulfilled, (state, action) => {
        state.loadingCreate = false;
        state.createdAssignment = action.payload.data;
      })
      .addCase(createAssignmentThunk.rejected, (state, action) => {
        state.loadingCreate = false;
        state.error = (action.payload as { message: string })?.message || "Failed to create assignment.";
      });
  },
});

export default createAssignmentSlice.reducer;
export const { resetCreateAssignmentState } = createAssignmentSlice.actions;
