import type { Asset, BasicAsset } from "@/entities/asset";
import type { User, UserProfile } from "@/entities/auth";
import type { Category } from "@/entities/category";
import type { UserInfo } from "@/entities/common";
import { AssignmentStatus, UserTypeEnum } from "@/entities/enums";

export const mockUsers: UserProfile[] = [
  {
    userId: 1,
    username: "conganh",
    isChangedPassword: true,
    firstName: "Nguyen",
    lastName: "Cong Anh",
    userType: 2,
  },
  {
    userId: 2,
    username: "hoanghuu",
    isChangedPassword: true,
    firstName: "Nguyen",
    lastName: "Huu Hoang",
    userType: 2,
  },
];

export const mockAssetsTest: BasicAsset[] = [
  {
    id: 1,
    code: "LA0001",
    name: "Laptop Dell XPS",
    categoryName: "Hardware",
    state: 1,
  },
  {
    id: 2,
    code: "ML0002",
    name: "Microsoft Office License Microsoft Office License Microsoft Office License Microsoft Office License Microsoft Office License Microsoft Office License Microsoft Office License Microsoft Office License Microsoft Office License",
    categoryName: "Software",
    state: 1,
  },
  {
    id: 3,
    code: "OC0003",
    name: "Office Chair",
    categoryName: "Furniture",
    state: 1,
  },
  {
    id: 3,
    code: "OC0003",
    name: "Office Chair",
    categoryName: "Furniture",
    state: 1,
  },
  {
    id: 3,
    code: "OC0003",
    name: "Office Chair",
    categoryName: "Furniture",
    state: 1,
  },
  {
    id: 3,
    code: "OC0003",
    name: "Office Chair",
    categoryName: "Furniture",
    state: 1,
  },
  {
    id: 3,
    code: "OC0003",
    name: "Office Chair",
    categoryName: "Furniture",
    state: 1,
  },
  {
    id: 3,
    code: "OC0003",
    name: "Office Chair",
    categoryName: "Furniture",
    state: 1,
  },
];

export const mockUser: User = {
  userId: 1,
  userType: UserTypeEnum.ADMIN,
  accessToken: "mock-token-1",
  refreshToken: "mock-refresh-token-1",
  expireIn: 3600,
  isChangedPassword: false,
};

// Mock user info for UI representation
export const mockUserInfo: UserInfo = {
  id: "1",
  firstName: "Admin",
  lastName: "User",
  username: "admin",
  role: UserTypeEnum.ADMIN,
};

export const mockAssignments: any[] = [
  {
    id: "1",
    assetId: "1",
    assetName: "Laptop Dell XPS",
    assignedTo: {
      id: "2",
      firstName: "Regular",
      lastName: "User",
      username: "user",
      role: UserTypeEnum.STAFF,
    },
    assignedBy: {
      id: "1",
      firstName: "Admin",
      lastName: "User",
      username: "admin",
      role: UserTypeEnum.ADMIN,
    },
    assignedDate: "2024-05-15",
    status: AssignmentStatus.PENDING,
    state: AssignmentStatus.PENDING,
    note: "Please confirm receipt of this laptop",
    specification: "Core i5, 8GB RAM, 750 GB HDD, Windows 8",
  },
  {
    id: "2",
    assetId: "2",
    assetName: "Microsoft Office License",
    assignedTo: {
      id: "2",
      firstName: "Regular",
      lastName: "User",
      username: "user",
      role: UserTypeEnum.STAFF,
    },
    assignedBy: {
      id: "1",
      firstName: "Admin",
      lastName: "User",
      username: "admin",
      role: UserTypeEnum.ADMIN,
    },
    assignedDate: "2024-05-10",
    status: AssignmentStatus.ACCEPTED,
    state: AssignmentStatus.ACCEPTED,
    note: "License key will be emailed separately",
    specification: "Office 365, 5 devices, 1-year subscription",
  },
  {
    id: "3",
    assetId: "3",
    assetName: "Office Chair",
    assignedTo: {
      id: "2",
      firstName: "Regular",
      lastName: "User",
      username: "user",
      role: UserTypeEnum.STAFF,
    },
    assignedBy: {
      id: "1",
      firstName: "Admin",
      lastName: "User",
      username: "admin",
      role: UserTypeEnum.ADMIN,
    },
    assignedDate: "2024-05-01",
    status: AssignmentStatus.RETURNED,
    state: AssignmentStatus.RETURNED,
    note: "Chair was uncomfortable, replaced with ergonomic model",
    specification: "Ergonomic design, adjustable height, lumbar support",
  },
  {
    id: "4",
    assetId: "4",
    assetName: "Wireless Mouse",
    assignedTo: {
      id: "2",
      firstName: "Regular",
      lastName: "User",
      username: "user",
      role: UserTypeEnum.STAFF,
    },
    assignedBy: {
      id: "1",
      firstName: "Admin",
      lastName: "User",
      username: "admin",
      role: UserTypeEnum.ADMIN,
    },
    assignedDate: "2024-04-20",
    status: AssignmentStatus.DECLINED,
    state: AssignmentStatus.DECLINED,
    note: "User already has a wireless mouse",
    specification:
      "Bluetooth 5.0, rechargeable battery, 3 programmable buttons",
  },
  {
    id: "5",
    assetId: "5",
    assetName: "External Monitor",
    assignedTo: {
      id: "2",
      firstName: "Regular",
      lastName: "User",
      username: "user",
      role: UserTypeEnum.STAFF,
    },
    assignedBy: {
      id: "1",
      firstName: "Admin",
      lastName: "User",
      username: "admin",
      role: UserTypeEnum.ADMIN,
    },
    assignedDate: "2024-05-18",
    status: AssignmentStatus.PENDING,
    state: AssignmentStatus.PENDING,
    note: "For work-from-home setup",
    specification: "Core i5, 8GB RAM, 750 GB HDD, Windows 8",
  },
];

export const mockCategory: Category[] = [
  { id: 1, name: "Laptop" },
  { id: 2, name: "Monitor" },
  { id: 3, name: "Keyboard" },
  { id: 4, name: "Mouse" },
  { id: 5, name: "Printer" },
  { id: 6, name: "Scanner" },
  { id: 7, name: "Tablet" },
  { id: 8, name: "Projector" },
  { id: 9, name: "Phone" },
  { id: 10, name: "Headset" },
];

export const mockAssetTest: Asset = {
  id: 1,
  code: "LA0001",
  name: "Laptop Dell XPS",
  categoryId: 1,
  categoryName: "LA0001",
  installedDate: "10/04/2020",
  state: 1,
  specification: "Core i5, 8GB RAM, 750 GB HDD, Windows 8",
  locationId: 1,
  locationName: "HCM",
  history: [
    {
      date: "12/10/2018",
      returnDate: "07/03/2019",
      assignedToId: 4,
      assignedToUsername: "phongnh",
      assignedById: 1,
      assignedByUsername: "admindn",
    },
    {
      date: "10/03/2019",
      returnDate: "22/03/2020",
      assignedToId: 5,
      assignedToUsername: "anhnc",
      assignedById: 1,
      assignedByUsername: "admindn",
    },
  ],
};
