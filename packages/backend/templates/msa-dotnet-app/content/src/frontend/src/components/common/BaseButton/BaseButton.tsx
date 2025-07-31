import React from "react";
import { Button } from "primereact/button";
import "@css/BaseButton.scss";

export interface BaseButtonProps {
  label?: string;
  icon?: string;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  severity?:
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "help"
    | "danger"
    | "contrast";
  outlined?: boolean;
  raised?: boolean;
  rounded?: boolean;
  text?: boolean;
  type?: "button" | "submit" | "reset";
  size?: "small" | "normal" | "large";
}

const BaseButton: React.FC<BaseButtonProps> = ({
  label,
  icon,
  className = "",
  onClick,
  disabled = false,
  loading = false,
  severity = "secondary",
  outlined = false,
  raised = false,
  rounded = false,
  text = false,
  type = "button",
  size = "normal",
}) => {
  const sizeClass = size !== "normal" ? `p-button-${size}` : "";

  return (
    <Button
      label={label}
      icon={icon}
      className={`base-button ${className} ${sizeClass}`}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      severity={severity}
      outlined={outlined}
      raised={raised}
      rounded={rounded}
      text={text}
      type={type}
    />
  );
};

export default BaseButton;
