import { mockAssetsTest } from "@/data/mockData";
import CustomHeader from "@components/common/CustomHeader/CustomHeader";
import { ASSET_STATUS_NAMES } from "@constants/asset";
import "@css/CommonTable.scss";
import "@css/Paginator.scss";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Tooltip } from "primereact/tooltip";
import React, { useState } from "react";

const TableTemplate: React.FC = () => {
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [sortBy, setSortBy] = useState<string>("code");

  const handleSort = (e: any) => {
    const field = e.sortField as string;
    const order = e.sortOrder === 1 ? "asc" : "desc";
    setSortBy(field);
    setDirection(order);
  };

  const nameBodyColumn = (item) => {
    const tooltipId = `tooltip-${item.id}`;
    return (
      <>
        <span id={tooltipId} className="render-3-dot" data-pr-tooltip={item.name}>
          {item.name}
        </span>
        <Tooltip target={`#${tooltipId}`} />
      </>
    );
  };

  const stateBodyColumn = (item: any) => (
    <span>{ASSET_STATUS_NAMES[item.state as keyof typeof ASSET_STATUS_NAMES]}</span>
  );

  const actionBodyColumn = (item: any) => (
    <div className="cell-action flex flex-row gap-2">
      <i
        className="pi pi-pencil edit-icon"
        onClick={() => {
          // handle navigate to detail
        }}
      />
      <i
        className="pi pi-times-circle delete-icon"
        onClick={() => {
          // handle navigate to detail
        }}
      />
    </div>
  );

  return (
    <div className="">
      <h2 className="text-primary font-bold mb-4">Table Template</h2>
      <div className="mt-2">
        <DataTable
          value={mockAssetsTest}
          className="w-full am-table"
          size="small"
          tableClassName="am-table"
          lazy
          loadingIcon="pi pi-spin pi-spinner"
          paginator
          rows={5}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          paginatorClassName="am-paginator justify-content-end"
          removableSort
          sortOrder={direction === "asc" ? 1 : -1}
          sortField={sortBy}
          onSort={handleSort}
        >
          <Column
            style={{ width: "15%" }}
            field="code"
            header={<CustomHeader field="code" sortField={sortBy} name="Code" sortOrder={direction} />}
            headerClassName="bg-none text-black"
            sortable
          />
          <Column
            field="name"
            header={<CustomHeader field="name" sortField={sortBy} name="Name" sortOrder={direction} />}
            body={nameBodyColumn}
            headerClassName="bg-none text-black"
            sortable
          />
          <Column
            style={{ width: "20%" }}
            field="categoryName"
            header={<CustomHeader field="categoryName" sortField={sortBy} name="Category" sortOrder={direction} />}
            headerClassName="bg-none text-black"
            sortable
          />
          <Column
            style={{ width: "20%" }}
            field="state"
            header={<CustomHeader field="state" sortField={sortBy} name="State" sortOrder={direction} />}
            body={stateBodyColumn}
            headerClassName="bg-none text-black"
            sortable
          />
          <Column style={{ width: "2%" }} body={actionBodyColumn} headerClassName="bg-none ignore-header w-[10%]" />
        </DataTable>
      </div>
    </div>
  );
};

export default TableTemplate;
