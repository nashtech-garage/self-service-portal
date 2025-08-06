import type { PaginationResponse } from "@/entities/api";
import type { AssetReport } from "@/entities/report";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@/services/axiosInterceptorService";

export const getReportThunk = createAsyncThunk(
  "report/get",
  async (params: object) => (await axiosInstance.get("report", { params })).data
);
export interface ReportState {
  isLoading: boolean;
  error: string | null;
  report: PaginationResponse<AssetReport> | null;
}

const initialState: ReportState = {
  isLoading: false,
  error: null,
  report: null,
};

const reportReducer = createSlice({
  name: "report",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getReportThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getReportThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.report = action.payload as PaginationResponse<AssetReport>;
        state.error = null;
      })
      .addCase(getReportThunk.rejected, (state, action) => {
        state.isLoading = false;
        const message =
          (action.payload as { message: string })?.message || "An error occurred during fetching report info";
        state.error = message;
      });
  },
});

export default reportReducer.reducer;
