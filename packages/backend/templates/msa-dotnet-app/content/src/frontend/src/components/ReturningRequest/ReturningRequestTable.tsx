import { SORT_OPTION_NAMES, SORT_OPTION_VALUES } from "@/constants/pagination";
import { RETURNING_REQUEST_STATE, RETURNING_REQUEST_STATE_NAME } from "@/constants/returnRequest";
import type { ReturningRequest } from "@/entities/returningRequest";
import type { AppDispatch } from "@/store";
import { fetchReturningRequests } from "@/store/returningRequestSlice";
import CustomModal from "@components/common/BaseModal/BaseModal";
import CustomHeader from "@components/common/CustomHeader/CustomHeader";
import { useToastContext } from "@components/Toast/useToastContext";
import "@css/CommonTable.scss";
import "@css/Paginator.scss";
import { returningRequestService } from "@services/returningRequestService";
import { formatDate } from "@utils/formatUtils";
import { Column } from "primereact/column";
import type { DataTablePageEvent } from "primereact/datatable";
import { DataTable } from "primereact/datatable";
import { Tooltip } from "primereact/tooltip";
import { useState } from "react";
import { useDispatch } from "react-redux";

interface Props {
  returningRequests: ReturningRequest[];
  pagination: { first: number; rows: number; totalRecords: number };
  onPageChange: (e: DataTablePageEvent) => void;
  loading?: boolean;
  sortField: string | undefined;
  sortOrder: number;
  requestParams: any;
  updateParams: (newParams: any) => void;
}

const ReturningRequestTable = ({
  returningRequests,
  loading,
  pagination,
  onPageChange,
  sortField,
  sortOrder,
  requestParams,
  updateParams,
}: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<"complete" | "cancel" | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);

  const { showSuccess } = useToastContext();

  const handleActionClick = (id: number, type: "complete" | "cancel") => {
    setSelectedRequestId(id);
    setActionType(type);
    setShowActionModal(true);
  };

  const handleConfirmAction = async () => {
    if (selectedRequestId && actionType) {
      let response;
      if (actionType === "complete") {
        response = await returningRequestService.completeReturningRequest(selectedRequestId);
      } else {
        response = await returningRequestService.cancelReturningRequest(selectedRequestId);
      }
      const successMessage = response?.message || "Operation completed successfully!";
      showSuccess(successMessage);
      dispatch(fetchReturningRequests(requestParams));
    }
    setShowActionModal(false);
  };

  const getActionModalTitle = () => "Are you sure?";

  const getActionModalContent = () =>
    actionType === "complete"
      ? "Do you want to mark this returning request as 'Completed'?"
      : "Do you want to cancel this returning request?";

  const renderAssetCode = (rowData: ReturningRequest) => (
    <div className="am-cell cursor-pointer">{rowData.assetCode}</div>
  );

  const renderRowIndex = (_rowData: ReturningRequest, options: any) => {
    const rowIndex = options.rowIndex + 1;
    return <div className="am-cell">{rowIndex}</div>;
  };

  const actionBody = (rowData: ReturningRequest) => (
    <div className="cell-action flex flex-row gap-2 p-0 m-0">
      <i
        className={`pi pi-check delete-icon ${rowData.state === RETURNING_REQUEST_STATE.WAITING_FOR_RETURNING ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
        style={{ fontSize: "1rem" }}
        onClick={
          rowData.state === RETURNING_REQUEST_STATE.WAITING_FOR_RETURNING
            ? () => handleActionClick(rowData.id, "complete")
            : undefined
        }
      />

      <i
        className={`pi pi-times decline-icon ${rowData.state === RETURNING_REQUEST_STATE.WAITING_FOR_RETURNING ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
        style={{ fontSize: "1rem" }}
        onClick={
          rowData.state === RETURNING_REQUEST_STATE.WAITING_FOR_RETURNING
            ? () => handleActionClick(rowData.id, "cancel")
            : undefined
        }
      />
    </div>
  );

  const handleSort = (e: any) => {
    const field = e.sortField as string;
    const newDirection =
      requestParams.direction === SORT_OPTION_NAMES[SORT_OPTION_VALUES.asc]
        ? SORT_OPTION_NAMES[SORT_OPTION_VALUES.desc]
        : SORT_OPTION_NAMES[SORT_OPTION_VALUES.asc];

    updateParams({
      sortBy: field,
      direction: newDirection,
    });
  };

  const assetNameBodyColumn = (item: ReturningRequest) => (
    <div>
      <div className="am-cell render-3-dot tooltip-target" data-pr-tooltip={item.assetName} data-pr-position="top">
        {item.assetName}
      </div>
    </div>
  );

  const requestedByBodyColumn = (item: ReturningRequest) => (
    <div>
      <div className="am-cell render-3-dot tooltip-target" data-pr-tooltip={item.requestedBy} data-pr-position="top">
        {item.requestedBy}
      </div>
    </div>
  );

  const assignedDateBodyColumn = (item: ReturningRequest) => {
    const dateText = item.assignedDate ? formatDate(item.assignedDate) : "";
    return (
      <div>
        <div className="am-cell render-3-dot tooltip-target" data-pr-tooltip={dateText} data-pr-position="top">
          {dateText}
        </div>
      </div>
    );
  };

  const acceptedByBodyColumn = (item: ReturningRequest) => {
    const acceptedBy = item.acceptedBy || "";
    return (
      <div>
        <div className="am-cell render-3-dot tooltip-target" data-pr-tooltip={acceptedBy} data-pr-position="top">
          {acceptedBy}
        </div>
      </div>
    );
  };

  const returnedDateBodyColumn = (item: ReturningRequest) => {
    const dateText = item.returnedDate ? formatDate(item.returnedDate!) : "";
    return (
      <div>
        <div className="am-cell render-3-dot tooltip-target" data-pr-tooltip={dateText} data-pr-position="top">
          {dateText}
        </div>
      </div>
    );
  };

  const stateBodyColumn = (item: ReturningRequest) => {
    const stateText = RETURNING_REQUEST_STATE_NAME[item.state];
    return (
      <div>
        <div className="am-cell render-3-dot tooltip-target" data-pr-tooltip={stateText} data-pr-position="top">
          {stateText}
        </div>
      </div>
    );
  };

  return (
    <>
      <Tooltip target=".tooltip-target" showDelay={50} hideDelay={100} />

      <DataTable
        id="am-table"
        value={returningRequests}
        paginator
        alwaysShowPaginator={true}
        paginatorClassName="am-paginator justify-content-end"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        paginatorPosition="bottom"
        lazy
        rows={pagination.rows}
        first={pagination.first}
        totalRecords={pagination.totalRecords}
        onPage={onPageChange}
        tableClassName="am-table"
        className="w-full"
        sortField={sortField || undefined}
        onSort={handleSort}
        loading={loading}
      >
        <Column headerClassName="bg-none text-black" field="no" header="No." body={renderRowIndex} />
        <Column
          headerClassName="bg-none text-black"
          field="assetCode"
          header={<CustomHeader field="assetCode" sortField={sortField} sortOrder={sortOrder ?? 0} name="Asset Code" />}
          sortable
          body={renderAssetCode}
        />
        <Column
          headerClassName="bg-none text-black"
          field="assetName"
          header={<CustomHeader field="assetName" sortField={sortField} sortOrder={sortOrder ?? 0} name="Asset Name" />}
          body={assetNameBodyColumn}
          sortable
        />
        <Column
          headerClassName="bg-none text-black"
          field="requestedBy"
          header={
            <CustomHeader field="requestedBy" sortField={sortField} sortOrder={sortOrder ?? 0} name="Requested by" />
          }
          body={requestedByBodyColumn}
          sortable
        />
        <Column
          headerClassName="bg-none text-black"
          field="assignedDate"
          header={
            <CustomHeader field="assignedDate" sortField={sortField} sortOrder={sortOrder ?? 0} name="Assigned Date" />
          }
          body={assignedDateBodyColumn}
          sortable
        />
        <Column
          headerClassName="bg-none text-black"
          field="acceptedBy"
          header={
            <CustomHeader field="acceptedBy" sortField={sortField} sortOrder={sortOrder ?? 0} name="Accepted by" />
          }
          body={acceptedByBodyColumn}
          sortable
        />
        <Column
          headerClassName="bg-none text-black"
          field="returnedDate"
          header={
            <CustomHeader field="returnedDate" sortField={sortField} sortOrder={sortOrder ?? 0} name="Returned Date" />
          }
          body={returnedDateBodyColumn}
          sortable
        />
        <Column
          headerClassName="bg-none text-black"
          field="state"
          header={<CustomHeader field="state" sortField={sortField} sortOrder={sortOrder ?? 0} name="State" />}
          body={stateBodyColumn}
          sortable
        />
        <Column
          headerClassName="bg-none text-black ignore-header "
          body={actionBody}
          headerStyle={{ width: "10%", border: "none" }}
        />
      </DataTable>
      <CustomModal
        visible={showActionModal}
        onClose={() => setShowActionModal(false)}
        title={getActionModalTitle()}
        content={getActionModalContent()}
        onConfirm={handleConfirmAction}
        showCancel={true}
        confirmText="Yes"
        cancelText="No"
        showOk={true}
        position="center"
        footerAlign="left"
      />
    </>
  );
};

export default ReturningRequestTable;
