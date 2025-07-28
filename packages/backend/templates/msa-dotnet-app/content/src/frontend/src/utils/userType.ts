import { USER_TYPE_ENUM, USER_TYPE_NAME } from "@constants/user";

export function mapUserTypeToRole(userType: number) {
  const safeType = userType ?? USER_TYPE_ENUM.STAFF;
  return USER_TYPE_NAME[safeType];
}