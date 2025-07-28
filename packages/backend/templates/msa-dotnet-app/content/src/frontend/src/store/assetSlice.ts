import type { PaginationResponse } from "@/entities/api";
import type { Asset, BasicAsset, CreateAsset, DetailEditAsset, EditAsset } from "@/entities/asset";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { assetService } from "@services/assetService";
import axiosInstance from "@services/axiosInterceptorService";
import { paramsSerializer } from "@utils/formatUtils";

export const getListAssetThunk = createAsyncThunk(
  "assets/getListAsset",
  async (params: object) => await (await axiosInstance.get("/asset-management", { params, paramsSerializer })).data
);

export const getDetailAssetThunk = createAsyncThunk(
  "assets/getDetailAsset",
  async (id: number) => (await axiosInstance.get(`/asset-management/${id}`)).data
);

export const createAssetThunk = createAsyncThunk(
  "assets/createAsset",
  async (assetData: CreateAsset) => await assetService.createAsset(assetData)
);

export const editAssetThunk = createAsyncThunk(
  "assets/editAsset",
  async (assetData: EditAsset) => await assetService.editAsset(assetData)
);

export interface AssetState {
  isLoading: boolean;
  error: string | null;
  message: string | null;
  assets?: PaginationResponse<BasicAsset> | null;
  asset: Asset;
  success: boolean;
  editedAsset: DetailEditAsset | null;
  reduxParams?: {
    page: number;
    pageSize: number;
    sortBy: string;
    direction: "asc" | "desc";
    keySearch: string | null;
  } | null;
}

const initialState: AssetState = {
  isLoading: false,
  error: "",
  assets: null,
  asset: {},
  success: false,
  message: null,
  editedAsset: null,
  reduxParams: null,
};

const assetReducer = createSlice({
  name: "assets",
  initialState,
  reducers: {
    resetState: (state) => {
      state.isLoading = false;
      state.error = null;
      state.success = false;
      state.message = null;
    },
    addAssetToTop: (state, action) => {
      if (!state.assets || !state.assets.data) {
        return;
      }

      // Kiểm tra nếu asset đã tồn tại trong danh sách
      const assetIndex = state.assets.data.findIndex((a) => a.id === action.payload.id);

      // Xóa asset cũ nếu tìm thấy
      if (assetIndex !== -1) {
        state.assets.data.splice(assetIndex, 1);
      }

      // Thêm asset mới vào đầu danh sách
      state.assets.data.unshift(action.payload);
    },
    // Thêm action reset
    resetEditedAsset: (state) => {
      state.editedAsset = null;
    },
    setReduxParams: (state, action) => {
      state.reduxParams = action.payload;
    },
    resetReduxParams: (state) => {
      state.reduxParams = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getListAssetThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getListAssetThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assets = action.payload as PaginationResponse<BasicAsset>;
        state.error = null;
      })
      .addCase(getListAssetThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message as string;        
      })
      .addCase(getDetailAssetThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDetailAssetThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.asset = action.payload.data;
        state.error = null;
      })
      .addCase(getDetailAssetThunk.rejected, (state, action) => {
        state.isLoading = false;
        const message =
          (action.payload as { message: string })?.message || "An error occurred during fetching asset info";
        state.error = message;
      })
      .addCase(createAssetThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createAssetThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.asset = action.payload.data;
        state.message = action.payload?.message || "Asset created successfully";
        state.error = null;
      })
      .addCase(createAssetThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to create new asset.";
      })
      .addCase(editAssetThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(editAssetThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.editedAsset = action.payload.data;
        state.error = null;
      })
      .addCase(editAssetThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to edit asset.";
      });
  },
});

export const { resetState, addAssetToTop, resetEditedAsset, setReduxParams, resetReduxParams } = assetReducer.actions;

export default assetReducer.reducer;
