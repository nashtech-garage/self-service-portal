import React from "react";
import { SORT_OPTION_NAMES, SORT_OPTION_VALUES } from "@constants/pagination";

interface CustomHeaderProps {
  field: string;
  sortField: string | number | undefined;
  sortOrder: number | string | undefined;
  name: string;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  field,
  sortField,
  sortOrder,
  name,
}) => {
  const isSorted = field === sortField;
  let icon: React.JSX.Element;

  if (!isSorted) {
    icon = <i className="ml-3 pi pi-sort" />;
  } else {
    const isAscending =
      sortOrder === SORT_OPTION_VALUES.asc ||
      sortOrder === SORT_OPTION_NAMES[SORT_OPTION_VALUES.asc];

    if (isAscending) {
      icon = <i className="ml-3 pi pi-sort-up-fill" />;
    } else {
      icon = <i className="ml-3 pi pi-sort-down-fill" />;
    }
  }

  return (
    <div className="w-full flex align-items-center bg-transparent">
      <span>{name}</span>
      {icon}
    </div>
  );
};

export default CustomHeader;
