import React from "react";
import type { ReactNode } from "react";
import { Dialog } from "primereact/dialog";
import BaseButton from "../BaseButton/BaseButton";
import DialogHeader from "../CustomHeader/DialogHeader";
import "@css/BaseDialog.scss";

export interface BaseDialogProps {
  visible: boolean;
  onHide: () => void;
  title?: string;
  titleClassName?: string;
  children: ReactNode;
  className?: string;
  classHeader?: string;
  style?: React.CSSProperties;
  showHeader?: boolean;
  showFooter?: boolean;
  footer?: ReactNode;
  width?: string;
  maxWidth?: string;
  dismissableMask?: boolean;
  closeOnEscape?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  statusLabel?: string;
  statusColor?: string;
}

const BaseDialog: React.FC<BaseDialogProps> = ({
  visible,
  onHide,
  title,
  titleClassName = "",
  children,
  className = "",
  classHeader = "",
  style = {},
  showHeader = true,
  showFooter = false,
  footer,
  width = "600px",
  maxWidth = "95vw",
  dismissableMask = true,
  closeOnEscape = true,
  draggable = false,
  resizable = false,
  statusLabel,
  statusColor,
}) => {
  const defaultStyle = {
    width,
    maxWidth,
    borderRadius: "8px",
    ...style,
  };

  const renderHeader = () => {
    if (!showHeader) {
      return null;
    }

    // Combine title with status label if both exist
    let displayTitle = title || "";
    if (statusLabel && statusColor) {
      displayTitle = `${title || ""} [${statusLabel}]`;
    }

    return (
      <DialogHeader
        paddingX={4}
        paddingY={1}
        textPosition="text-left"
        contentText={displayTitle}
        height="3rem"
        hasBorder={true}
        textClass={`text-lg text-primary font-bold font-normal vertical-align-middle ${titleClassName}`}
        onClose={onHide}
        className={classHeader}
      />
    );
  };

  const renderFooter = () => {
    if (!showFooter) {
      return null;
    }

    if (footer) {
      return footer;
    }

    return (
      <div className="base-dialog-footer">
        <BaseButton
          label="Cancel"
          onClick={onHide}
          severity="secondary"
          outlined
          className="mr-2"
        />
        <BaseButton label="Confirm" onClick={onHide} severity="success" />
      </div>
    );
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      style={defaultStyle}
      className={`base-dialog ${className}`}
      showHeader={false}
      footer={renderFooter()}
      dismissableMask={dismissableMask}
      draggable={draggable}
      resizable={resizable}
      closeOnEscape={closeOnEscape}
    >
      {renderHeader()}
      <div className="base-dialog-content">{children}</div>
    </Dialog>
  );
};

export default BaseDialog;
