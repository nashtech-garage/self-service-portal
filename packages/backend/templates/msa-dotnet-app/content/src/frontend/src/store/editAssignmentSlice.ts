import type { ApiResponse, PaginationResponse } from "@/entities/api";
import type { AssignableAssetsResponse, AssignableUsersResponse } from "@/entities/createAssignment";
import type { EditAssignmentDetail, UpdateAssignmentRequest, UpdateAssignmentResponse } from "@/entities/assignment";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@services/axiosInterceptorService";

export interface EditAssignmentState {
    assignableUsers?: PaginationResponse<AssignableUsersResponse> | null;
    assignableAssets?: PaginationResponse<AssignableAssetsResponse> | null;
    assignmentDetail?: EditAssignmentDetail | null;
    updatedAssignment?: UpdateAssignmentResponse | null;
    loading: boolean;
    loadingUpdate?: boolean;
    loadingDelete?: boolean;
    error: string | null;
    deleteSuccess?: boolean;
}

const initialState: EditAssignmentState = {
    assignableUsers: null,
    assignableAssets: null,
    assignmentDetail: null,
    updatedAssignment: null,
    loading: false,
    loadingUpdate: false,
    loadingDelete: false,
    error: null,
    deleteSuccess: false,
};

export const updateAssignmentThunk = createAsyncThunk<ApiResponse<UpdateAssignmentResponse>, { id: number, data: UpdateAssignmentRequest }>(
    "assignment-management/updateAssignment",
    async ({ id, data }) => {
        const response = await axiosInstance.patch<ApiResponse<UpdateAssignmentResponse>>(`/assignment-management/${id}`, data);
        return response.data;
    }
);

export const getAssignmentDetailThunk = createAsyncThunk<EditAssignmentDetail, number>(
    "assignment-management/getAssignmentEditDetail",
    async (id: number) => {
        const response = await axiosInstance.get<ApiResponse<EditAssignmentDetail>>(`/assignment-management/edit/${id}`);
        return response.data.data;
    }
);

const editAssignmentSlice = createSlice({
    name: "editAssignment",
    initialState,
    reducers: {
        resetEditAssignmentState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            // Get Assignment Detail
            .addCase(getAssignmentDetailThunk.pending, (state) => {
                state.loadingUpdate = true;
                state.error = null;
            })
            .addCase(getAssignmentDetailThunk.fulfilled, (state, action) => {
                state.loadingUpdate = false;
                state.assignmentDetail = action.payload;
            })
            .addCase(getAssignmentDetailThunk.rejected, (state, action) => {
                state.loadingUpdate = false;
                const message = (action.payload as { message: string })?.message || "An error occurred during fetching assignment detail.";
                state.error = message;
            })

            // UpdateAssignmentForm
            .addCase(updateAssignmentThunk.pending, (state) => {
                state.loadingUpdate = true;
                state.error = null;
            })
            .addCase(updateAssignmentThunk.fulfilled, (state, action) => {
                state.loadingUpdate = false;
                state.updatedAssignment = action.payload.data;
            })
            .addCase(updateAssignmentThunk.rejected, (state, action) => {
                state.loadingUpdate = false;
                state.error = (action.payload as { message: string })?.message || "Failed to update assignment.";
            });
    },
});

export default editAssignmentSlice.reducer;
export const { resetEditAssignmentState } = editAssignmentSlice.actions;
