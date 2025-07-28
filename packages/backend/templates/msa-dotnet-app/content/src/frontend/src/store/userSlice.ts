import type { PaginationResponse } from "@/entities/api";
import type { CreateUserResponse, EditUserPayload, UserDetail, UserResponse } from "@/entities/user";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { userManagementService } from "@services/userManagementService";

export interface UserState {
  newUser: Omit<CreateUserResponse, "rawPassword"> | null;
  userList: Omit<CreateUserResponse, "rawPassword">[];
  users: PaginationResponse<UserResponse> | null;
  editedUser: UserDetail | null;
  loading: boolean;
  error: string | null;
  selectedUser: any | null;
  totalRecords: number;
}

const initialState: UserState = {
  newUser: null,
  userList: [],
  users: null,
  editedUser: null,
  loading: false,
  error: null,
  selectedUser: null,
  totalRecords: 0,
};

export const fetchUsers = createAsyncThunk(
  "users/fetchUser",
  async (params: object) => await userManagementService.getUsers(params)
);

export const fetchUsersById = createAsyncThunk("users/fetchById", async (id: number) => {
  const response = await userManagementService.getUsersById(id);
  return response;
});

export const editUserThunk = createAsyncThunk("users/edit", async (payload: EditUserPayload) => {
  const response = await userManagementService.editUser(payload);
  return response;
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setNewUser: (state, action: PayloadAction<CreateUserResponse>) => {
      if (action.payload) {
        state.newUser = action.payload;
      }
    },
    clearNewUser: (state) => {
      state.newUser = null;
    },
    setUserList: (state, action: PayloadAction<Omit<CreateUserResponse, "rawPassword">[]>) => {
      state.userList = action.payload;
    },
    addUserToTop: (state, action) => {
      const user = action.payload;
      if (!state.users) {
        return;
      }
      const existingIndex = state.users.data.findIndex((u) => u.id === user.id);

      if (existingIndex !== -1) {
        state.users.data.splice(existingIndex, 1);
      }

      state.users.data.unshift(user);
    },
    resetEditedUser: (state) => {
      state.editedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload as PaginationResponse<UserResponse>;
        state.totalRecords = action.payload.total;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as { message: string })?.message ?? "Get all user fail";
      })
      .addCase(fetchUsersById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsersById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload.data;
      })
      .addCase(fetchUsersById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Get user by Id fail";
      })
      .addCase(editUserThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(editUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.editedUser = action.payload.data;
      })
      .addCase(editUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to edit user.";
      });
  },
});

export const { setNewUser, addUserToTop, clearNewUser, setUserList, resetEditedUser } = userSlice.actions;
export default userSlice.reducer;
