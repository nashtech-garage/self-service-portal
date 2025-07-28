import { SORT_OPTION_VALUES } from "@/constants/pagination";

export interface TableConfig {
  page: number;
  pageSize: number;
  sortBy: string;
  direction: number;
  search: string;
}

export const PAGINATION_CONFIGS: Record<string, TableConfig> = {
  assignment: {
    page: 1,
    pageSize: 15,
    sortBy: "assignedDate",
    direction: SORT_OPTION_VALUES.desc,
    search: "",
  },
  user: {
    page: 1,
    pageSize: 15,
    sortBy: "joinedDate",
    direction: SORT_OPTION_VALUES.asc,
    search: "",
  },
  asset: {
    page: 1,
    pageSize: 15,
    sortBy: "createdAt",
    direction: SORT_OPTION_VALUES.desc,
    search: "",
  },
  category: {
    page: 1,
    pageSize: 20,
    sortBy: "categoryName",
    direction: SORT_OPTION_VALUES.asc,
    search: "",
  },
  report: {
    page: 1,
    pageSize: 15,
    sortBy: "name",
    direction: SORT_OPTION_VALUES.asc,
    search: "",
  },
  returningRequest: {
    page: 1,
    pageSize: 15,
    sortBy: "assignedDate",
    direction: SORT_OPTION_VALUES.desc,
    search: "",
  },
  assignableAsset: {
    page: 1,
    pageSize: 10,
    sortBy: "code",
    direction: SORT_OPTION_VALUES.asc,
    search: "",
  },
  assignableUser: {
    page: 1,
    pageSize: 10,
    sortBy: "fullName",
    direction: SORT_OPTION_VALUES.asc,
    search: "",
  },
};

export const getTableConfig = (tableName: string): TableConfig =>
  PAGINATION_CONFIGS[tableName] || PAGINATION_CONFIGS.assignment;
