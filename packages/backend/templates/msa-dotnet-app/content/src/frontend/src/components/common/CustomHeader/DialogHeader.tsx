import "@css/BaseDialog.scss";
import { Button } from "primereact/button";
import type React from "react";

type DialogHeaderProps = {
  paddingX?: number;
  paddingY?: number;
  textPosition?: "text-left" | "text-center" | "text-right" | "text-justify";
  borderRound?: "border-round" | "border-round-md" | "border-round-lg" | "border-round-xl";
  contentText: string;
  height?: string;
  textClass?: string;
  hasBorder?: boolean;
  onClose?: () => void;
  className?: string;
};

const DialogHeader: React.FC<DialogHeaderProps> = ({
  paddingX = 3,
  paddingY = 1,
  textPosition = "text-center",
  contentText,
  height = "3rem",
  textClass = "text-base text-primary font-bold font-normal vertical-align-middle",
  hasBorder = true,
  onClose,
  className,
}) => {
  const validPaddingValues = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const px = validPaddingValues.includes(paddingX) ? paddingX : 3;
  const py = validPaddingValues.includes(paddingY) ? paddingY : 1;

  const baseClasses = `dialog-custom-header align-items-center px-${px} py-${py} ${textPosition} bg-gray ${
    hasBorder ? "border-1" : "border-0"
  } h-${height}`;

  const layoutClasses = onClose ? "flex justify-between" : "";

  return (
    <div className={`${baseClasses} ${layoutClasses} ${className}`}>
      <span className={`${textClass} header-title`}>{contentText}</span>
      {onClose && (
        <Button
          icon="pi pi-times"
          className="p-button-outlined p-button-sm border-2 text-primary ml-auto header-close-button"
          onClick={onClose}
          aria-label="Close"
        />
      )}
    </div>
  );
};

export default DialogHeader;
