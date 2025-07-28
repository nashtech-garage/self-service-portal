import { getTableConfig } from "@/config/TableConfig";
import { SORT_OPTION_NAMES, SORT_OPTION_VALUES } from "@/constants/pagination";
import type { ListRequestParams } from "@/entities/common";
import { useSearchParams } from "react-router-dom";

export function useTableQueryParams(tableType: string) {
  const [searchParams, setSearchParams] = useSearchParams();
  const config = getTableConfig(tableType);

  const page = parseInt(searchParams.get("page") || config.page.toString(), 10);
  const pageSize = parseInt(searchParams.get("pageSize") || config.pageSize.toString(), 10);
  const sortBy = searchParams.get("sortBy") || config.sortBy;
  const directionParam = searchParams.get("direction");

  // Convert direction using SORT_OPTION_VALUES
  const direction = directionParam
    ? directionParam === "ASC" || directionParam === "asc"
      ? SORT_OPTION_VALUES.asc
      : SORT_OPTION_VALUES.desc
    : config.direction;
  const search = searchParams.get("search") || config.search;

  // Hàm cập nhật query params
  const setTableQueryParams = (params: Partial<ListRequestParams & Record<string, any>>) => {
    const searchValue = params.search !== undefined ? params.search : search;
    const directionValue = params.direction ?? direction;

    // Convert direction to string for URL using SORT_OPTION_NAMES
    const directionString =
      typeof directionValue === "string"
        ? directionValue
        : directionValue === SORT_OPTION_VALUES.asc
          ? SORT_OPTION_NAMES[SORT_OPTION_VALUES.asc]
          : SORT_OPTION_NAMES[SORT_OPTION_VALUES.desc];

    // Preserve existing params and update with new ones
    const currentParams = Object.fromEntries(searchParams.entries());
    const updatedParams = {
      ...currentParams,
      page: (params.page ?? page).toString(),
      pageSize: (params.pageSize ?? pageSize).toString(),
      sortBy: params.sortBy ?? sortBy,
      direction: directionString,
      ...(searchValue ? { search: searchValue } : {}),
      ...Object.fromEntries(
        Object.entries(params).filter(
          ([key, value]) =>
            !["page", "pageSize", "sortBy", "direction", "search"].includes(key) &&
            value !== undefined &&
            value !== null &&
            value !== ""
        )
      ),
    };

    // Remove empty search param if exists
    if (!searchValue) {
      delete updatedParams.search;
    }

    setSearchParams(updatedParams);
  };

  // Handler cho DataTable
  const onPageChange = (event: any) => {
    setTableQueryParams({
      page: (event.page ?? 0) + 1,
      pageSize: event.rows ?? pageSize,
    });
  };

  const onSort = (event: any) => {
    const newDirection = event.sortOrder === SORT_OPTION_VALUES.asc ? SORT_OPTION_VALUES.asc : SORT_OPTION_VALUES.desc;
    setTableQueryParams({
      page,
      sortBy: event.sortField,
      direction: newDirection,
    });
  };

  return {
    page,
    pageSize,
    sortBy,
    direction,
    search,
    setTableQueryParams,
    onPageChange,
    onSort,
  };
}
