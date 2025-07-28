import "@css/BaseModal.scss";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { type CSSProperties, type ReactNode } from "react";
import DialogHeader from "../CustomHeader/DialogHeader";

interface CustomModalProps {
  visible: boolean;
  title: string;
  content: ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  showOk?: boolean;
  showCancelHeader?: boolean;
  draggable?: boolean;
  disableConfirm?: boolean;
  position?: "center" | "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
  footerAlign?: "left" | "center" | "right";
  className?: string;
  style?: CSSProperties;
}

const CustomModal = ({
  visible,
  title,
  content,
  onClose,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
  showCancel = true,
  showOk = true,
  draggable = false,
  showCancelHeader = false,
  disableConfirm = false,
  position,
  footerAlign = "center",
  style = {},
}: CustomModalProps) => {
  const getFooterJustifyClass = () => {
    switch (footerAlign) {
      case "left":
        return "justify-content-start";
      case "right":
        return "justify-content-end";
      case "center":
      default:
        return "justify-content-center";
    }
  };

  const footer = (
    <div className={`custom-modal-footer ${getFooterJustifyClass()}`}>
      {showOk && (
        <Button label={confirmText} className="primary" onClick={onConfirm} disabled={disableConfirm} autoFocus />
      )}
      {showCancel && <Button label={cancelText} severity="secondary" size="small" outlined onClick={onClose} />}
    </div>
  );

  const renderHeader = () => (
    <DialogHeader
      paddingX={4}
      paddingY={1}
      textPosition="text-left"
      contentText={title}
      height="3rem"
      hasBorder={true}
      textClass="text-lg text-primary font-bold font-normal vertical-align-middle"
      onClose={showCancelHeader ? onClose : undefined}
    />
  );

  return (
    <Dialog
      header={renderHeader}
      visible={visible}
      modal
      footer={footer}
      onHide={onClose}
      position={position}
      draggable={draggable}
      closable={false}
      className={`border-1`.trim()}
      style={{ borderRadius: "9px", ...style }}
    >
      <div>{content}</div>
    </Dialog>
  );
};

export default CustomModal;
