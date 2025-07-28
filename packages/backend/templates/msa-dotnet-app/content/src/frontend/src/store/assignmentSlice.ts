import type { AdminAssignment, AdminAssignmentListRequest } from "@/entities/assignment";
import { adminAssignmentService } from "@/services/assignmentService";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Define the state type for admin assignments
export interface AdminAssignmentState {
  assignments: AdminAssignment[];
  loading: boolean;
  error: string | null;
  totalRecords: number;
  searchParams?: AdminAssignmentListRequest;
}

// Initial state
const initialState: AdminAssignmentState = {
  assignments: [],
  loading: false,
  error: null,
  totalRecords: 0,
  searchParams: {
    page: 1,
    pageSize: 10,
    sortBy: "assignedDate",
    direction: "desc",
  },
};

// Async thunk for fetching admin assignments
export const fetchAdminAssignments = createAsyncThunk(
  "adminAssignments/fetchAdminAssignments",
  async (params: AdminAssignmentListRequest) => {
    const response = await adminAssignmentService.getAdminAssignments(params);

    return {
      assignments: response.data,
      totalRecords: response.total,
    };
  }
);

// Create the slice
const adminAssignmentSlice = createSlice({
  name: "adminAssignments",
  initialState,
  reducers: {
    addAssignmentToTop: (state, action) => {
      const index = state.assignments.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.assignments.splice(index, 1);
      } else {
        state.totalRecords += 1;
      }
      state.assignments.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAdminAssignments
      .addCase(fetchAdminAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload.assignments;
        state.totalRecords = action.payload.totalRecords;
      })
      .addCase(fetchAdminAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch admin assignments";
      });
  },
});

export default adminAssignmentSlice.reducer;
export const { addAssignmentToTop } = adminAssignmentSlice.actions;
