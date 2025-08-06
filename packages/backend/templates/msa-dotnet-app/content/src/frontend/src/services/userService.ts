import type { ApiResponse } from "@/entities/api";
import type { CreateUserPayload, CreateUserResponse, UserFormData } from "@/entities/user";
import { store } from "@/store";
import { setNewUser } from "@/store/userSlice";
import { formatDateWithoutTime } from "@/utils/datetime";
import { getGenderEnum, getUserType } from "@/utils/userUtils";
import axiosInstance from "./axiosInterceptorService";

export const userService = {
    createUser(userData: UserFormData): Promise<ApiResponse<CreateUserResponse>> {
        const payload: CreateUserPayload = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            dateOfBirth: formatDateWithoutTime(userData.dateOfBirth),
            gender: getGenderEnum(userData.gender),
            joinedDate: formatDateWithoutTime(userData.joinedDate),
            userType: getUserType(userData.userType)
        };

        return axiosInstance.post<ApiResponse<CreateUserResponse>>('/user-management', payload)
            .then(response => {
                const { data } = response;
                if (data.status === 201 && data.data) {
                    store.dispatch(setNewUser(data.data));
                }
                return data;
            });
    }
};