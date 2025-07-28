// src/frontend/src/pages/ReturningRequest/ReturningRequestPage.tsx

import { useReturnRequest } from "@/hooks/useReturnRequest";
import type { AppDispatch, RootState } from "@/store";
import { fetchReturningRequests } from "@/store/returningRequestSlice";
import ReturningRequestTable from "@components/ReturningRequest/ReturningRequestTable";
import BaseDropdown from "@components/common/BaseDropdown";
import { SORT_OPTION_NAMES, SORT_OPTION_VALUES } from "@constants/pagination";
import { RETURNING_REQUEST_STATE_OPTIONS } from "@constants/returnRequest";
import { ROUTES } from "@constants/routes";
import "@css/CommonDropdown.scss";
import "@css/CommonInput.scss";
import "@css/CommonTable.scss";
import "@css/Paginator.scss";
import { createAdjustedDate, formatDateForApi } from "@utils/datetime";
import { debounce } from "lodash";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ReturningRequestPage = () => {
  //ReduxRedux
  const dispatch = useDispatch<AppDispatch>();
  const { data: returningRequests, loading, totalRecords } = useSelector((state: RootState) => state.returningRequest);
  //QueryParamQueryParam
  const { params, updateParams } = useReturnRequest("returningRequest");
  //KeySearch
  const [keySearch, setKeySearch] = useState<string>("");
  const [lastSearchValue, setLastSearchValue] = useState<string>(""); // Track last search to prevent duplicates
  const [localStateFilter, setLocalStateFilter] = useState<number[]>(params.states || []);
  const [localReturnedDate, setLocalReturnedDate] = useState<Date | null>(
    params.returnedDate ? new Date(params.returnedDate) : null
  );

  const debouncedSearch = debounce((searchValue: string) => {
    // Only update if search value actually changed
    if (searchValue !== lastSearchValue) {
      setLastSearchValue(searchValue);
      updateParams({ keySearch: searchValue, page: 1 });
    }
  }, 500);

  useEffect(() => {
    setLocalStateFilter(params.states || []);
    setLocalReturnedDate(params.returnedDate ? new Date(params.returnedDate) : null);
    dispatch(fetchReturningRequests(params));
  }, [dispatch, params]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setKeySearch(e.target.value);
  };

  const handleSearchClick = () => {
    // Only search if value actually changed
    if (keySearch !== lastSearchValue) {
      debouncedSearch(keySearch);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && keySearch !== lastSearchValue) {
      setLastSearchValue(keySearch);
      updateParams({ keySearch, page: 1 });
    }
  };

  const handleStateFilterChange = (selectedStates: number[]) => {
    setLocalStateFilter(selectedStates);
    updateParams({
      states: selectedStates.length > 0 ? selectedStates : null,
      page: 1,
    });
  };

  const handleReturnedDateChange = (e: { value: Date | null | undefined }) => {
    if (e.value) {
      const adjustedDate = createAdjustedDate(e.value);
      setLocalReturnedDate(adjustedDate);
      updateParams({
        returnedDate: formatDateForApi(adjustedDate),
        page: 1,
      });
    } else {
      setLocalReturnedDate(null);
      updateParams({
        returnedDate: null,
        page: 1,
      });
    }
  };

  return (
    <div className="w-full">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-primary">{ROUTES.RETURNING_REQUESTS.tabletitle}</h1>
      </div>

      <div className="flex justify-content-between align-items-center my-3">
        <div className="filter-section flex gap-3  justify-content-between">
          <div className="flex gap-3">
            <BaseDropdown className="flex-1 max-h-2rem">
              <MultiSelect
                value={localStateFilter}
                selectAllLabel="All"
                options={RETURNING_REQUEST_STATE_OPTIONS}
                onChange={(e) => handleStateFilterChange(e.value)}
                placeholder="State"
                className="h-full w-full"
                maxSelectedLabels={1}
                dropdownIcon="none"
                selectedItemsLabel="{0} selected"
                optionLabel="name"
                optionValue="value"
              />
            </BaseDropdown>
          </div>

          <div className="mr-3 w-12rem">
            <div className="am-search-input am-dropdown-filter border-round-md border-1 flex align-items-center w-full h-2rem">
              <Calendar
                value={localReturnedDate}
                onChange={handleReturnedDateChange}
                placeholder="Returned Date"
                className="h-full w-full"
                showIcon={false}
                dateFormat="dd/mm/yy"
                inputClassName="border-none"
                inputStyle={{
                  boxShadow: "none",
                  width: "9rem",
                  height: "1.89rem",
                }}
              />
              <span
                className="p-inputgroup-addon bg-none border-left-1 border-none h-full cursor-pointer"
                style={{ borderColor: "black" }}
                onClick={() => {
                  setLocalReturnedDate(null);
                  updateParams({
                    returnedDate: null,
                    page: 1,
                  });
                }}
                title="Clear date"
              >
                {localReturnedDate ? <i className="pi pi-times"></i> : <i className="pi pi-calendar-clock"></i>}
              </span>
            </div>
          </div>
        </div>

        <div className="w-20rem">
          <div className="am-search-input p-inputgroup border-1 border-round-md w-full h-2rem">
            <InputText
              value={keySearch}
              className="border-none h-full"
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Search by asset code, asset name or requester"
            />
            <span
              className="p-inputgroup-addon bg-none border-left-1 border-none cursor-pointer"
              onClick={handleSearchClick}
              title="Search"
            >
              <i className="pi pi-search"></i>
            </span>
          </div>
        </div>
      </div>

      <ReturningRequestTable
        returningRequests={returningRequests}
        pagination={{
          first: (params.page - 1) * params.pageSize,
          rows: params.pageSize,
          totalRecords,
        }}
        onPageChange={(event: any) => {
          updateParams({
            page: (event.page ?? 0) + 1,
            pageSize: event.rows,
          });
        }}
        loading={loading}
        sortField={params.sortBy}
        sortOrder={
          (params.direction === SORT_OPTION_NAMES[SORT_OPTION_VALUES.asc]
            ? SORT_OPTION_VALUES.asc
            : SORT_OPTION_VALUES.desc) as any
        }
        requestParams={params}
        updateParams={updateParams}
      />
    </div>
  );
};

export default ReturningRequestPage;
