import { cloneElement, isValidElement, useRef, type ReactElement, type ReactNode } from "react";

interface BaseDropdownProps {
  children: ReactNode;
  className?: string;
}

const BaseDropdown = (props: BaseDropdownProps) => {
  // For testing
  const dropdownRef = useRef<any>(null);

  // For testing
  const handleTriggerClick = () => {
    const trigger = dropdownRef.current?.overlayRef?.previousSibling;
    if (trigger) {
      trigger.click();
    }
  };

  // For testing
  const childWithRef =
    isValidElement(props.children) && typeof props.children.type !== "string"
      ? cloneElement(props.children as ReactElement<any>, { ref: dropdownRef })
      : props.children;

  return (
    <div className={`am-dropdown-filter border-round-md border-1 flex align-items-center ${props.className}`}>
      {childWithRef}
      <button type="button" className="bg-transparent border-none cursor-pointer" onClick={handleTriggerClick}>
        <i className="pi pi-filter-fill"></i>
      </button>
    </div>
  );
};

export default BaseDropdown;
