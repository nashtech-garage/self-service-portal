import type { PaginationResponse } from "@/entities/api";
import type { ReturningRequest } from "@/entities/returningRequest";
import { returningRequestService, type GetReturningRequestsParams } from "@/services/returningRequestService";
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ReturningRequestState {
  data: ReturningRequest[];
  loading: boolean;
  error: string | null;
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  lastPage: number;
}

const initialState: ReturningRequestState = {
  data: [],
  loading: false,
  error: null,
  totalRecords: 0,
  currentPage: 1,
  pageSize: 10,
  lastPage: 1,
};

// Async thunks
export const fetchReturningRequests = createAsyncThunk(
  "returningRequest/fetchReturningRequests",
  async (params: GetReturningRequestsParams, { rejectWithValue }) => {
    try {
      const response = await returningRequestService.getReturningRequests(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch returning requests");
    }
  }
);

const returningRequestSlice = createSlice({
  name: "returningRequest",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch returning requests
      .addCase(fetchReturningRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchReturningRequests.fulfilled,
        (state, action: PayloadAction<PaginationResponse<ReturningRequest>>) => {
          state.loading = false;
          state.data = action.payload.data;
          state.totalRecords = action.payload.total;
          state.currentPage = action.payload.currentPage;
          state.pageSize = action.payload.pageSize;
          state.lastPage = action.payload.lastPage;
          state.error = null;
        }
      )
      .addCase(fetchReturningRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = returningRequestSlice.actions;
export default returningRequestSlice.reducer;
