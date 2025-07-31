import { SORT_OPTION_NAMES, SORT_OPTION_VALUES } from "@constants/pagination";
import "@css/CommonTable.scss";
import "@css/Paginator.scss";
import type { AssetState } from "@/entities/report";
import { useReportManagement } from "@hooks/useReportManagement";
import axiosInstance from "@services/axiosInterceptorService";
import type { AppDispatch, RootState } from "@store";
import { getReportThunk } from "@store/reportSlice";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const ReportManagement = () => {
  const report = useSelector((state: RootState) => state.report.report);
  const isLoading = useSelector((state: RootState) => state.report.isLoading);
  const dispatch = useDispatch<AppDispatch>();
  const { params, updateParams } = useReportManagement();

  const CustomHeader = (name: string, field: string, sortOrder: string, sortField?: string) => {
    const isSorted = field === sortField;
    let icon;
    if (!isSorted) {
      icon = <i className="ml-3 pi pi-sort" />;
    } else if (sortOrder === SORT_OPTION_NAMES[SORT_OPTION_VALUES.asc]) {
      icon = <i className="ml-3 pi pi-sort-up-fill" />;
    } else {
      icon = <i className="ml-3 pi pi-sort-down-fill" />;
    }

    return (
      <div className="w-full flex align-items-center bg-transparent">
        <span>{name}</span>
        {icon}
      </div>
    );
  };

  useEffect(() => {
    dispatch(getReportThunk(params));
  }, [dispatch, params]);

  const renderStateColumn = (state: AssetState) => (
    <Column
      headerClassName="bg-none text-black"
      field={state.id?.toString()}
      style={{ width: "12%" }}
      header={CustomHeader(state.name ?? "", state.id?.toString() ?? "", params.direction, params.sortBy)}
      sortable
    />
  );

  const handleExportReport = async () => {
    const response = await axiosInstance.get("/report/export", {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    link.setAttribute("download", "Report Document.xlsx");
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2 className="text-primary font-bold mb-4">Report</h2>
      <div className="w-full flex justify-content-end my-4">
        <Button className="primary" onClick={handleExportReport}>
          Export
        </Button>
      </div>
      <DataTable
        loading={isLoading}
        paginator
        lazy
        rows={params.pageSize}
        first={(params.page - 1) * params.pageSize}
        tableClassName="am-table"
        value={report?.data[0].categories}
        sortField={params.sortBy}
        sortOrder={params.direction === "asc" ? 1 : -1}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        paginatorClassName="am-paginator justify-content-end"
        onSort={(e) => {
          updateParams({
            sortBy: e.sortField,
            direction: SORT_OPTION_NAMES[e.sortOrder as keyof typeof SORT_OPTION_NAMES],
          });
        }}
        totalRecords={report?.total}
        onPage={(e) => {
          updateParams({
            pageSize: e.rows,
            page: (e.page ?? 0) + 1,
          });
        }}
        className="w-full"
      >
        <Column
          headerClassName="bg-none text-black"
          field="name"
          body={(item) => <span className="render-3-dot">{item.name}</span>}
          header={CustomHeader("Category", "name", params.direction, params.sortBy)}
          style={{ width: "15%" }}
          sortable
        />
        <Column
          headerClassName="bg-none text-black"
          field="total"
          header={CustomHeader("Total", "total", params.direction, params.sortBy)}
          sortable
          style={{ width: "10%" }}
        />
        {report?.data?.[0]?.states && report?.data[0]?.states.map((state) => renderStateColumn(state))}
      </DataTable>
    </div>
  );
};

export default ReportManagement;
