import CustomHeader from "@/components/common/CustomHeader/CustomHeader";
import { useToastContext } from "@/components/Toast/useToastContext";
import { AssignmentStatus } from "@/entities/enums";
import type { HomeAssignmentDetail } from "@/entities/homeAssignment";
import { homeAssignmentService } from "@/services/homeAssignmentService";
import { assignmentStatusOptions, formatDate } from "@/utils/formatUtils";
import CustomModal from "@components/common/BaseModal/BaseModal";
import { Column } from "primereact/column";
import type { DataTableRowClickEvent } from "primereact/datatable";
import { DataTable } from "primereact/datatable";
import { Tooltip } from "primereact/tooltip";
import React, { useState } from "react";
import HomeDetailsDialog from "./HomeDetailsDialog";

interface HomeTableProps {
  assignments: HomeAssignmentDetail[];
  loading: boolean;
  totalRecords: number;
  page: number;
  pageSize: number;
  sortBy?: string;
  direction: number;
  onPageChange: (event: any) => void;
  onSort: (event: any) => void;
  sortOrder: number;
  onDataChanged: () => void;
}

const HomeTable: React.FC<HomeTableProps> = ({
  assignments,
  loading,
  totalRecords,
  page,
  pageSize,
  sortBy,
  onPageChange,
  onSort,
  sortOrder,
  onDataChanged,
}) => {
  // Local state management
  const [selectedAssignment, setSelectedAssignment] = useState<HomeAssignmentDetail>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [actionAssignment, setActionAssignment] = useState<HomeAssignmentDetail>(null);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [declineLoading, setDeclineLoading] = useState(false);
  const toast = useToastContext();

  const handleRowClick = async (event: DataTableRowClickEvent) => {
    const assignment = event.data as HomeAssignmentDetail;

    try {
      setLoadingDetail(true);
      const detailData = await homeAssignmentService.getAssignmentDetail(assignment.id);
      setSelectedAssignment(detailData);
      setDetailsVisible(true);
    } catch (error) {
      console.error("Error fetching assignment detail:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const hideDetailsDialog = () => {
    setDetailsVisible(false);
    setTimeout(() => {
      setSelectedAssignment(null);
    }, 200);
  };

  const handleSort = (event: any) => {
    onSort(event);
  };

  const assetCodeBodyColumn = (rowData: HomeAssignmentDetail) => (
    <div>
      <div className="am-cell render-3-dot">{rowData.assetCode}</div>
    </div>
  );

  const assetNameBodyColumn = (rowData: HomeAssignmentDetail) => (
    <div>
      <div className="am-cell render-3-dot">{rowData.assetName}</div>
    </div>
  );

  const categoryBodyColumn = (rowData: HomeAssignmentDetail) => (
    <div>
      <div className="am-cell render-3-dot">{rowData.assetCategoryName}</div>
    </div>
  );

  const assignedDateBodyColumn = (rowData: HomeAssignmentDetail) => (
    <div>
      <div className="am-cell render-3-dot">{formatDate(rowData.assignedDate)}</div>
    </div>
  );

  const stateBodyColumn = (rowData: HomeAssignmentDetail) => {
    const status = rowData.status || (rowData.state as AssignmentStatus);
    const statusOption =
      status && assignmentStatusOptions[status as AssignmentStatus]
        ? assignmentStatusOptions[status as AssignmentStatus]
        : { label: `State ${rowData.state}` };

    return <div className="am-cell render-3-dot">{statusOption.label}</div>;
  };

  const actionBodyColumn = (rowData: HomeAssignmentDetail) => {
    const returnTooltipId = `return-tooltip-${rowData.id}`;

    return (
      <div className="cell-action flex flex-row gap-2 align-items-center">
        <i
          className={`pi pi-check edit-icon delete-icon ${(rowData.status || rowData.state) !== AssignmentStatus.PENDING ? "disabled" : "cursor-pointer"}`}
          onClick={(e) => {
            e.stopPropagation();
            if ((rowData.status || rowData.state) === AssignmentStatus.PENDING) {
              setActionAssignment(rowData);
              setShowApproveDialog(true);
            }
          }}
        />
        {/* Decline button - only enabled when assignment is in PENDING state */}
        <i
          className={`pi pi-times decline-icon ${(rowData.status || rowData.state) !== AssignmentStatus.PENDING ? "disabled" : "cursor-pointer"}`}
          onClick={(e) => {
            e.stopPropagation();
            if ((rowData.status || rowData.state) === AssignmentStatus.PENDING) {
              setActionAssignment(rowData);
              setShowDeclineDialog(true);
            }
          }}
        />
        {/* Return button - only enabled when assignment is in ACCEPTED state */}
        <span id={returnTooltipId}>
          <i
            className={`pi pi-replay return-icon ${(rowData.status || rowData.state) !== AssignmentStatus.ACCEPTED || rowData.isReturningRequested ? "disabled" : "cursor-pointer"}`}
            onClick={(e) => {
              e.stopPropagation();
              if ((rowData.status || rowData.state) === AssignmentStatus.ACCEPTED) {
                if (!rowData.isReturningRequested) {
                  setActionAssignment(rowData);
                  setShowReturnDialog(true);
                }
              }
            }}
          />
        </span>
        {rowData.isReturningRequested && (
          <Tooltip
            target={`#${returnTooltipId}`}
            position="left"
            content="This assignment has already request for returning asset"
            className="text-xs p-0 m-0"
          />
        )}
      </div>
    );
  };

  const handleApproveConfirm = async () => {
    if (!actionAssignment) {
      return;
    }

    try {
      setAcceptLoading(true);
      const response = await homeAssignmentService.acceptAssignment(actionAssignment.id);

      toast.showSuccess(response.message || "Assignment accepted successfully");

      onDataChanged();
    } catch (error) {
      toast.showError("Failed to accept assignment");
      console.error("Error accepting assignment:", error);
    } finally {
      setAcceptLoading(false);
      setShowApproveDialog(false);
      setActionAssignment(null);
    }
  };

  const handleDeclineConfirm = async () => {
    if (!actionAssignment) {
      return;
    }

    try {
      setDeclineLoading(true);
      const response = await homeAssignmentService.declineAssignment(actionAssignment.id);

      toast.showSuccess(response.message || "Assignment declined successfully");

      onDataChanged();
    } catch (error) {
      toast.showError("Failed to decline assignment");
      console.error("Error declining assignment:", error);
    } finally {
      setDeclineLoading(false);
      setShowDeclineDialog(false);
      setActionAssignment(null);
    }
  };

  const handleReturnConfirm = async () => {
    if (!actionAssignment) {
      return;
    }

    try {
      const response = await homeAssignmentService.returnAssignment(actionAssignment.id);
      toast.showSuccess(response.message || "Return request created successfully");
      onDataChanged();
    } catch (error) {
      toast.showError("Failed to create return request");
      console.error("Error creating return request:", error);
    } finally {
      setShowReturnDialog(false);
      setActionAssignment(null);
    }
  };

  const handleCancelAction = () => {
    setShowApproveDialog(false);
    setShowDeclineDialog(false);
    setShowReturnDialog(false);
    setActionAssignment(null);
  };

  const shouldShowPaginator = totalRecords > pageSize;

  return (
    <>
      <DataTable
        tableClassName="am-table"
        value={assignments}
        className="w-full"
        lazy
        paginator={shouldShowPaginator}
        rows={pageSize}
        first={(page - 1) * pageSize}
        totalRecords={totalRecords}
        onPage={onPageChange}
        onSort={handleSort}
        sortField={sortBy}
        sortOrder={sortOrder as any}
        emptyMessage="No assignments found"
        dataKey="id"
        onRowClick={handleRowClick}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        paginatorClassName="am-paginator justify-content-end"
        paginatorPosition="bottom"
        loading={loading || acceptLoading || declineLoading}
      >
        <Column
          className="whitespace-nowrap overflow-hidden "
          style={{ minWidth: "14%" }}
          field="assetcode"
          header={<CustomHeader field="assetcode" name="Asset Code" sortField={sortBy} sortOrder={sortOrder} />}
          body={assetCodeBodyColumn}
          headerClassName="bg-none text-black"
          sortable={!loading}
        />
        <Column
          className="bg-none text-black "
          style={{ minWidth: "14%" }}
          field="assetname"
          header={<CustomHeader field="assetname" name="Asset Name" sortField={sortBy} sortOrder={sortOrder} />}
          body={assetNameBodyColumn}
          headerClassName="bg-none text-black"
          sortable={!loading}
        />
        <Column
          className="whitespace-nowrap overflow-hidden "
          field="assetcategoryname"
          header={<CustomHeader field="assetcategoryname" name="Category" sortField={sortBy} sortOrder={sortOrder} />}
          body={categoryBodyColumn}
          headerClassName="bg-none text-black"
          sortable={!loading}
        />
        <Column
          className="whitespace-nowrap overflow-hidden "
          field="assignedDate"
          header={<CustomHeader field="assignedDate" name="Assigned Date" sortField={sortBy} sortOrder={sortOrder} />}
          body={assignedDateBodyColumn}
          headerClassName="bg-none text-black"
          sortable={!loading}
        />
        <Column
          className="whitespace-nowrap overflow-hidden "
          field="state"
          header={<CustomHeader field="state" name="State" sortField={sortBy} sortOrder={sortOrder} />}
          body={stateBodyColumn}
          headerClassName="bg-none text-black"
          sortable={!loading}
        />
        <Column className="w-[10%] text-center" body={actionBodyColumn} headerClassName="bg-none ignore-header" />
      </DataTable>

      <HomeDetailsDialog
        visible={detailsVisible}
        onHide={hideDetailsDialog}
        assignment={selectedAssignment}
        loading={loadingDetail}
      />

      <CustomModal
        visible={showApproveDialog}
        onClose={handleCancelAction}
        onConfirm={handleApproveConfirm}
        title="Are you sure?"
        content="Do you want to accept this assignment?"
        confirmText="Accept"
        cancelText="Cancel"
        footerAlign="left"
        className="w-3 border-1"
      />

      <CustomModal
        visible={showDeclineDialog}
        onClose={handleCancelAction}
        onConfirm={handleDeclineConfirm}
        title="Are you sure?"
        content="Do you want to decline this assignment?"
        confirmText="Decline"
        cancelText="Cancel"
        footerAlign="left"
        className="w-3 border-1"
      />

      <CustomModal
        visible={showReturnDialog}
        onClose={handleCancelAction}
        onConfirm={handleReturnConfirm}
        title="Are you sure?"
        content="Do you want to create a returning request for this asset?"
        confirmText="Yes"
        cancelText="No"
        footerAlign="left"
        className="w-3 border-1"
      />
    </>
  );
};

export default HomeTable;
