import { default as BaseModal, default as CustomModal } from "@/components/common/BaseModal/BaseModal";
import CustomHeader from "@/components/common/CustomHeader/CustomHeader";
import { adminAssignmentService } from "@/services/assignmentService";
import { formatDate } from "@/utils/formatUtils";
import { useToastContext } from "@components/Toast/useToastContext";
import type { AdminAssignment, DetailAssignment } from "@entities/assignment";
import { AssignmentStatus } from "@entities/enums";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Tooltip } from "primereact/tooltip";
import React, { useEffect, useState } from "react";

interface Props {
  assignments: AdminAssignment[];
  onEdit: (assignment: AdminAssignment) => void;
  onDelete: (assignment: AdminAssignment) => void;
  pagination: { first: number; rows: number; totalRecords: number };
  onPageChange: (e: any) => void;
  loading?: boolean;
  onSortChange?: (sortField: string, sortOrder: "asc" | "desc") => void;
  sortField: string | undefined;
  sortOrder: "asc" | "desc" | undefined;
  onToggleSortOrder: () => void;
  onDataChanged: () => void;
}

const assignmentStatusLabels: Record<AssignmentStatus, string> = {
  [AssignmentStatus.ACCEPTED]: "Accepted",
  [AssignmentStatus.DECLINED]: "Declined",
  [AssignmentStatus.PENDING]: "Waiting for acceptance",
  [AssignmentStatus.RETURNED]: "",
};

const AdminAssignmentTable: React.FC<Props> = ({
  assignments,
  loading,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
  onSortChange,
  sortField,
  sortOrder,
  onToggleSortOrder,
  onDataChanged,
}) => {
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [assignmentDetail, setAssignmentDetail] = useState<DetailAssignment | null>(null);
  const [actionAssignment, setActionAssignment] = useState<AdminAssignment | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const toast = useToastContext();

  const handleReturnClick = (assignment: AdminAssignment, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionAssignment(assignment);
    setShowReturnDialog(true);
  };

  const handleReturnConfirm = async () => {
    if (!actionAssignment || !actionAssignment.id) {
      return;
    }

    try {
      const response = await adminAssignmentService.returnAssignment(actionAssignment.id);
      toast.showSuccess(response.message || "Return request created successfully");
      onDataChanged();
    } catch (error) {
      toast.showError("Failed to create return request");
    } finally {
      setShowReturnDialog(false);
      setActionAssignment(null);
    }
  };

  const handleCancelReturn = () => {
    setShowReturnDialog(false);
    setActionAssignment(null);
  };

  const handleSort = (e: any) => {
    const field = e.sortField as string;
    const order = e.sortOrder === 1 ? "asc" : "desc";
    if (onSortChange) {
      onSortChange(field, order);
    }
  };

  const handleRowClick = (assignment: AdminAssignment) => {
    if (assignment.id) {
      setSelectedAssignmentId(assignment.id);
      setShowDetailModal(true);
    } else {
      console.error("Assignment ID is missing:", assignment);
    }
  };

  const handleHideDetailModal = () => {
    setShowDetailModal(false);
    setSelectedAssignmentId(null);
    setAssignmentDetail(null);
  };

  useEffect(() => {
    const fetchAssignmentDetail = async () => {
      if (!selectedAssignmentId) {
        return;
      }

      try {
        setLoadingDetail(true);
        setErrorDetail(null);
        const response = await adminAssignmentService.getAssignmentDetail(selectedAssignmentId);

        if (response && response.data) {
          setAssignmentDetail(response.data);
        } else {
          setErrorDetail("Invalid response format");
        }
      } catch (err) {
        setErrorDetail("Failed to load assignment details");
      } finally {
        setLoadingDetail(false);
      }
    };

    if (showDetailModal && selectedAssignmentId) {
      fetchAssignmentDetail();
    }
  }, [showDetailModal, selectedAssignmentId]);

  const renderDetailContent = () => {
    if (loadingDetail) {
      return (
        <div className="flex justify-content-center">
          <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }}></i>
        </div>
      );
    }

    if (errorDetail) {
      return <div className="p-error">{errorDetail}</div>;
    }

    if (assignmentDetail) {
      return (
        <div className="grid" style={{ maxWidth: "50vw", minWidth: "35vw" }}>
          <div className="col-12 md:col-4">Asset Code</div>
          <div className="col-12 md:col-8">{assignmentDetail.assetCode}</div>

          <div className="col-12 md:col-4">Asset Name</div>
          <div className="col-12 md:col-8">{assignmentDetail.assetName}</div>

          <div className="col-12 md:col-4">Specification</div>
          <div className="col-12 md:col-8">{assignmentDetail.assetSpecification}</div>

          <div className="col-12 md:col-4">Assigned to</div>
          <div className="col-12 md:col-8">{assignmentDetail.assignedTo}</div>

          <div className="col-12 md:col-4">Assigned by</div>
          <div className="col-12 md:col-8">{assignmentDetail.assignedBy}</div>

          <div className="col-12 md:col-4">Assigned Date</div>
          <div className="col-12 md:col-8">{formatDate(assignmentDetail.assignedDate)}</div>

          <div className="col-12 md:col-4">State</div>
          <div className="col-12 md:col-8">
            {assignmentStatusLabels[assignmentDetail.state] || `State ${assignmentDetail.state}`}
          </div>

          <div className="col-12 md:col-4">Note</div>
          <div className="col-12 md:col-8">{assignmentDetail.note || ""}</div>
        </div>
      );
    }

    return <div className="p-3">No assignment data available</div>;
  };

  const renderActions = (rowData: AdminAssignment) => {
    const returnTooltipId = `admin-return-tooltip-${rowData.id}`;
    const isReturning = Boolean(rowData.isReturningRequested);

    return (
      <div className="cell-action flex flex-row gap-2 justify-content-center">
        <button
          className={`p-button-text border-none bg-transparent p-0 ${rowData.state !== AssignmentStatus.ACCEPTED && rowData.state !== AssignmentStatus.DECLINED ? "cursor-pointer" : "disabled"}`}
          onClick={(e) => {
            e.stopPropagation();
            rowData.state !== AssignmentStatus.ACCEPTED &&
              rowData.state !== AssignmentStatus.DECLINED &&
              onEdit(rowData);
          }}
        >
          <i className="pi pi-pencil"></i>
        </button>
        <button
          className={`p-button-text border-none bg-transparent text-primary p-0 ${rowData.state !== AssignmentStatus.ACCEPTED ? "cursor-pointer" : "disabled"}`}
          onClick={(e) => {
            e.stopPropagation();
            rowData.state !== AssignmentStatus.ACCEPTED && onDelete(rowData);
          }}
        >
          <i className="pi pi-times-circle"></i>
        </button>
        <span id={returnTooltipId}>
          <button
            className="p-button-text border-none bg-transparent p-0"
            disabled={rowData.state !== AssignmentStatus.ACCEPTED || isReturning}
            style={{
              color: rowData.state === AssignmentStatus.ACCEPTED && !isReturning ? "blue" : "black",
              cursor: rowData.state === AssignmentStatus.ACCEPTED && !isReturning ? "pointer" : "not-allowed",
              opacity: rowData.state !== AssignmentStatus.ACCEPTED || isReturning ? 0.4 : 1,
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (rowData.state === AssignmentStatus.ACCEPTED && !isReturning) {
                handleReturnClick(rowData, e as any);
              }
            }}
          >
            <i className="pi pi-replay"></i>
          </button>
        </span>
        {isReturning && (
          <Tooltip
            target={`#${returnTooltipId}`}
            position="left"
            content="This assignment has already request for returning asset"
          />
        )}
      </div>
    );
  };

  const renderAssetCode = (rowData: AdminAssignment) => (
    <div>
      <div className="am-cell">{rowData.assetCode || rowData.assetCode}</div>
    </div>
  );

  const renderAssetName = (rowData: AdminAssignment) => (
    <div>
      <div className="am-cell render-3-dot">{rowData.assetName}</div>
    </div>
  );

  const renderAssignedTo = (rowData: AdminAssignment) => (
    <div>
      <div className="am-cell render-3-dot">{rowData.assignedTo}</div>
    </div>
  );

  const renderAssignedBy = (rowData: AdminAssignment) => (
    <div>
      <div className="am-cell render-3-dot">{rowData.assignedBy}</div>
    </div>
  );

  const renderAssignedDate = (rowData: AdminAssignment) => (
    <div>
      <div className="am-cell">{rowData.assignedDate ? formatDate(rowData.assignedDate) : ""}</div>
    </div>
  );

  const renderState = (rowData: AdminAssignment) => {
    const status = rowData.state;
    const statusLabel = assignmentStatusLabels[status as AssignmentStatus] || `State ${status}`;
    return <div className="am-cell render-3-dot">{statusLabel}</div>;
  };

  return (
    <>
      <DataTable
        value={assignments}
        tableClassName="am-table"
        paginator
        loading={loading}
        lazy
        rows={pagination.rows}
        first={pagination.first}
        totalRecords={pagination.totalRecords}
        onPage={onPageChange}
        className="w-full"
        sortField={sortField || undefined}
        sortOrder={sortOrder === "asc" ? 1 : -1}
        paginatorClassName="am-paginator justify-content-end"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        onSort={handleSort}
        onRowClick={(e) => handleRowClick(e.data)}
        emptyMessage="No assignments found"
      >
        <Column
          field="no"
          header="No."
          body={(_, options) => {
            const number = options.rowIndex + 1;
            return <div className="am-cell">{number}</div>;
          }}
          headerClassName="bg-none text-black"
        />
        <Column
          headerClassName="bg-none text-black"
          field="assetCode"
          header={<CustomHeader field="assetCode" name="Asset Code" sortField={sortField} sortOrder={sortOrder} />}
          sortable
          body={renderAssetCode}
        />
        <Column
          headerClassName="bg-none text-black"
          field="assetName"
          header={<CustomHeader field="assetName" name="Asset Name" sortField={sortField} sortOrder={sortOrder} />}
          body={renderAssetName}
          sortable
        />
        <Column
          headerClassName="bg-none text-black"
          field="assignedTo"
          header={<CustomHeader field="assignedTo" name="Assigned to" sortField={sortField} sortOrder={sortOrder} />}
          body={renderAssignedTo}
          sortable
        />
        <Column
          headerClassName="bg-none text-black"
          field="assignedBy"
          header={<CustomHeader field="assignedBy" name="Assigned by" sortField={sortField} sortOrder={sortOrder} />}
          body={renderAssignedBy}
          sortable
        />
        <Column
          headerClassName="bg-none text-black border-none"
          field="assignedDate"
          header={
            <CustomHeader field="assignedDate" name="Assigned Date" sortField={sortField} sortOrder={sortOrder} />
          }
          body={renderAssignedDate}
          sortable
        />
        <Column
          headerClassName="bg-none text-black"
          field="state"
          header={<CustomHeader field="state" name="State" sortField={sortField} sortOrder={sortOrder} />}
          body={renderState}
          sortable
        />
        <Column headerClassName="bg-none text-black ignore-header" style={{ width: "5%" }} body={renderActions} />
      </DataTable>

      {/* Return Dialog */}
      <CustomModal
        visible={showReturnDialog}
        onClose={handleCancelReturn}
        onConfirm={handleReturnConfirm}
        title="Are you sure?"
        content="Do you want to create a returning request for this asset?"
        confirmText="Yes"
        cancelText="No"
        footerAlign="left"
      />

      {/* Detail Assignment Modal */}
      <BaseModal
        visible={showDetailModal}
        title="Detailed Assignment Information"
        content={renderDetailContent()}
        onClose={handleHideDetailModal}
        showCancel={false}
        showOk={false}
        showCancelHeader={true}
        position="center"
      />
    </>
  );
};

export default AdminAssignmentTable;
