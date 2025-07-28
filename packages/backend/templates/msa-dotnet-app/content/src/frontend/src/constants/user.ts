export const USER_TYPE_ENUM = {
  ADMIN: 1,
  STAFF: 2,
};

export const USER_TYPE_NAME = {
  [USER_TYPE_ENUM.ADMIN]: "Admin",
  [USER_TYPE_ENUM.STAFF]: "Staff",
} as const;

export const USER_TYPE_OPTIONS = [
  { value: USER_TYPE_ENUM.ADMIN, name: USER_TYPE_NAME[USER_TYPE_ENUM.ADMIN] },
  { value: USER_TYPE_ENUM.STAFF, name: USER_TYPE_NAME[USER_TYPE_ENUM.STAFF] },
];

export const USER_GENDER_ENUMS = {
  MALE: 1,
  FEMALE: 0,
};

export const USER_GENDER_NAMES = {
  [USER_GENDER_ENUMS.MALE]: "Male",
  [USER_GENDER_ENUMS.FEMALE]: "Female",
};

export const USER_LOCATION_ENUM = {
  HN: 1,
  HCM: 2,
  DN: 3,
};

export const USER_LOCATION_NAMES = {
  [USER_LOCATION_ENUM.HCM]: "HCM",
  [USER_LOCATION_ENUM.HN]: "HN",
  [USER_LOCATION_ENUM.DN]: "DN",
};
