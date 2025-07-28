import React from "react";
import "@css/DropdownMenuItem.scss";

interface DropdownMenuItemProps {
  label: string;
  onAction?: () => void;
  isButton?: boolean;
}

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  label,
  onAction,
  isButton = false,
}) => (
  <li>
    {isButton ? (
      <button
        type="button"
        onClick={onAction}
        className="button-dropdown"
      >
        {label}
      </button>
    ) : (
      label
    )}
  </li>
);

export default DropdownMenuItem;