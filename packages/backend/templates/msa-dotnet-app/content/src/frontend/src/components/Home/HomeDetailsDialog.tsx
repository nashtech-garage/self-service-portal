import LoadingSpinner from "@/components/common/LoadingSpinner";
import { AssignmentStatus } from "@/entities/enums";
import type { HomeAssignmentDetail } from "@/entities/homeAssignment";
import { assignmentStatusOptions, formatDate } from "@/utils/formatUtils";
import React from "react";
import BaseDialog from "../common/BaseDialog/BaseDialog";
import InfoRow from "../common/InfoRow/InfoRow";

interface HomeDetailsDialogProps {
  visible: boolean;
  onHide: () => void;
  assignment: HomeAssignmentDetail | null;
  loading?: boolean;
}

const HomeDetailsDialog: React.FC<HomeDetailsDialogProps> = ({
  visible,
  onHide,
  assignment,
  loading = false,
}) => {
  if (!assignment) {
    return null;
  }

  // Map state to status enum if status is not already set
  const status = assignment.status || assignment.state;

  // Get status label safely with fallback
  const getStatusLabel = () => {
    if (status && assignmentStatusOptions[status as AssignmentStatus]) {
      return assignmentStatusOptions[status as AssignmentStatus].label;
    }
    return `State ${assignment.state}`;
  };

  // Get username from either string or object
  const getUsername = (user: any) => {
    if (typeof user === "string") {
      return user;
    }
    return user?.username || "Unknown";
  };

  return (
    <BaseDialog
      visible={visible}
      onHide={onHide}
      title="Detailed Assignment Information "
      className="overflow-hidden "
      width="500px"
    >
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="p-2 w-full max-h-60vh overflow-y-auto">
          <InfoRow label="Asset Name" value={assignment.assetName} />
          <InfoRow label="Asset Code" value={assignment.assetCode} />
          <InfoRow label="Status" value={getStatusLabel()} />
          <InfoRow
            label="Specification"
            value={
              assignment.assetSpecification ||
              assignment.specification ||
              "No specification provided"
            }
          />
          <InfoRow
            label="Assignment Date"
            value={formatDate(assignment.assignedDate)}
          />
          <InfoRow
            label="Assigned By"
            value={getUsername(assignment.assignedBy)}
          />
          <InfoRow
            label="Assigned To"
            value={getUsername(assignment.assignedTo)}
          />
          <InfoRow label="Note" value={assignment.note} />
        </div>
      )}
    </BaseDialog>
  );
};

export default HomeDetailsDialog;
