import type { GetHomeAssignmentsRequest, HomeAssignmentDetail } from "@/entities/homeAssignment";
import { homeAssignmentService } from "@/services/homeAssignmentService";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Define the state type for home items
export interface HomeState {
  assignments: HomeAssignmentDetail[];
  loading: boolean;
  error: string | null;
  totalRecords: number;
  acceptLoading: boolean;
}

// Initial state
const initialState: HomeState = {
  assignments: [],
  loading: false,
  error: null,
  totalRecords: 0,
  acceptLoading: false,
};

// Async thunk for fetching home items
export const fetchHomeAssignment = createAsyncThunk(
  "home/fetchHomeAssignment",
  async (params: GetHomeAssignmentsRequest) => {
    const response = await homeAssignmentService.getMyAssignments(params);
    return {
      assignments: response.data,
      totalRecords: response.total,
    };
  }
);

// Create the slice
const homeAssignmentSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    clearActionStatus: (state) => {
      // state.actionSuccess = false;
      // state.actionMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchHomeAssignment
      .addCase(fetchHomeAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHomeAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload.assignments;
        state.totalRecords = action.payload.totalRecords;
      })
      .addCase(fetchHomeAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch assignments";
      });
  },
});

// Export actions and reducer
export const { clearActionStatus } = homeAssignmentSlice.actions;
export default homeAssignmentSlice.reducer;
