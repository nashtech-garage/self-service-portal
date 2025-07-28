import { getTableConfig } from "@config/TableConfig";
import { SORT_OPTION_NAMES } from "@constants/pagination";
import type { RootState } from "@store";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

export const useActionTable = (tableName: string) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const config = getTableConfig(tableName);
  const defaultParams = {
    pageSize: parseInt(searchParams.get("pageSize") || config.pageSize.toString()),
    direction: searchParams.get("direction") || SORT_OPTION_NAMES[config.direction],
    page: parseInt(searchParams.get("page") || config.page.toString()),
    sortBy: searchParams.get("sortBy") || config.sortBy.toString(),
    keySearch: searchParams.get("keySearch") || null,
  };
  const reduxParams = useSelector((state: RootState) => state.assets.reduxParams);
  const [params, setParams] = useState(reduxParams ?? defaultParams);

  const updateParams = (newParams: object) => {
    const merged = { ...params, ...newParams };
    setParams(merged);

    const filteredParams = Object.fromEntries(
      Object.entries(merged)
        .filter(([, v]) => v !== null && v !== undefined)
        .map(([k, v]) => [k, String(v)])
    );

    setSearchParams(filteredParams);
  };

  return {
    params,
    updateParams,
    defaultParams,
  };
};
