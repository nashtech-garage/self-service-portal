import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { categoryService } from "@/services/categoryService";
export interface CategoryState {
  categories: any[];
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
  message: null,
};

export const fetchCategories = createAsyncThunk("categories/fetchCategories", async () => {
  return (await categoryService.getCategories()).data;
});

export const fetchCreateCategories = createAsyncThunk(
  "categories/fetchCreateCategories",
  async ({ prefix, category }: { prefix: string; category: string }, { rejectWithValue }) => {
    return categoryService
      .createCategory({ prefix, category })
      .then((response) => response.data)
      .catch((error) => {
        return rejectWithValue(error);
      });
  }
);

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    clearCategoryMessage: (state) => {
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch categories";
      })
      .addCase(fetchCreateCategories.pending, (state) => {
        state.loading = true;
        state.message = null;
        state.error = null;
      })
      .addCase(fetchCreateCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload?.message || "Category created successfully";
        state.error = null;
      })
      .addCase(fetchCreateCategories.rejected, (state, action) => {
        state.loading = false;
        if (typeof action.payload === "object" && action.payload !== null) {
          state.error = (action.payload as { message?: string }).message || "Failed to create category.";
        } else {
          state.error = action.error.message || "Failed to create category.";
        }
      });
  },
});

export const { clearCategoryMessage } = categorySlice.actions;
export default categorySlice.reducer;
