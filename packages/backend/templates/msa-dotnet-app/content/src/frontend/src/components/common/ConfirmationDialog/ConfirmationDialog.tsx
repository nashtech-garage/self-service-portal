import React from "react";
import BaseDialog from "@/components/common/BaseDialog/BaseDialog";
import { Button } from "primereact/button";

interface ConfirmationDialogProps {
  visible: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  visible,
  onHide,
  onConfirm,
  title,
  message,
  confirmLabel = "Yes",
  cancelLabel = "No",
}) => (
  <BaseDialog
    visible={visible}
    onHide={onHide}
    title={title}
    showFooter={false}
    width="450px"
    className="confirmation-dialog"
  >
    <div className="confirmation-content">
      <p className="confirmation-message ">{message}</p>
      <div className="dialog-buttons flex justify-content-start gap-3 mt-3">
        <Button
          label={confirmLabel}
          onClick={onConfirm}
          className="border-none border-round-sm"
          style={{ backgroundColor: "#dc3545", color: "white" }}
          size="small"
        />
        <Button
          label={cancelLabel}
          onClick={onHide}
          className="text-color-secondary border-round-sm "
          style={{
            backgroundColor: "white",
            borderColor: "#6c757d",
            color: "#6c757d",
            border: "1px solid",
          }}
          size="small"
        />
      </div>
    </div>
  </BaseDialog>
);

export default ConfirmationDialog;
