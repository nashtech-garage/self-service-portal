import type { SelectOption } from "@/entities/common";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@services/axiosInterceptorService";

export const getListCategoriesThunk = createAsyncThunk(
  "metaData/getListCategories",
  async (params: object) => (await axiosInstance.get("meta-data/get-categories", { params })).data
);

export interface MetaDataState {
  isLoading: boolean;
  error: string | null;
  categories: SelectOption[];
}

const initialState: MetaDataState = {
  isLoading: false,
  error: "",
  categories: [],
};

const metaDataReducer = createSlice({
  name: "metaData",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getListCategoriesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getListCategoriesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload.data as SelectOption[];
        state.error = null;
      })
      .addCase(getListCategoriesThunk.rejected, (state, action) => {
        state.isLoading = false;
        const message =
          (action.payload as { message: string })?.message || "An error occurred during fetching asset info";
        state.error = message;
      });
  },
});

export default metaDataReducer.reducer;
