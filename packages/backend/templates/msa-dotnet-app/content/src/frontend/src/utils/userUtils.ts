import type { SelectOption } from "@/entities/common";
import { GenderEnum, UserTypeEnum } from "@/entities/enums";

export const getUserType = (userType: number | SelectOption | null | undefined): number => {
    if (typeof userType === 'number') {
        return userType;
    }
    return userType?.value ?? UserTypeEnum.STAFF;
};

export const getGenderEnum = (gender: string): number => {
    return gender === "Male" ? GenderEnum.MALE : GenderEnum.FEMALE;
}; 