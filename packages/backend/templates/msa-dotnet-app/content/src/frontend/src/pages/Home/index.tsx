import HomeTable from "@/components/Home/HomeTable";
import { ROUTES } from "@/constants/routes";
import type { GetHomeAssignmentsRequest } from "@/entities/homeAssignment";
import { useHome } from "@/hooks/useHome";
import { useTableQueryParams } from "@/hooks/useTableQueryParams";
import "@css/CommonTable.scss";
import "@css/Paginator.scss";
import "primeicons/primeicons.css";
import React, { useMemo } from "react";

const HomePage: React.FC = () => {
  const { page, pageSize, sortBy, direction, onPageChange, onSort } = useTableQueryParams("assignment");

  const queryParams: GetHomeAssignmentsRequest = useMemo(
    () => ({
      page,
      pageSize,
      sortBy,
      direction,
    }),
    [page, pageSize, sortBy, direction]
  );

  const { assignments, loading, error, totalRecords, refreshData } =
    useHome(queryParams);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="w-full">
      <h2 className="text-primary font-bold mb-4">
        {ROUTES.MY_ASSIGNMENTS.tabletitle}
      </h2>

      <HomeTable
        assignments={assignments}
        loading={loading}
        totalRecords={totalRecords}
        page={page}
        pageSize={pageSize}
        sortBy={sortBy}
        direction={direction}
        onPageChange={onPageChange}
        onSort={onSort}
        sortOrder={direction}
        onDataChanged={refreshData}
      />
    </div>
  );
};

export default HomePage;
