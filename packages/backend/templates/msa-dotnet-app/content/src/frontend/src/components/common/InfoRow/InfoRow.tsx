import React, { ReactNode } from "react";

interface InfoRowProps {
  label: string;
  value: ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => {
  return (
    <div className="flex my-3 align-items-start">
      <span className="font-medium min-w-8rem w-8rem flex-shrink-0">
        {label}
      </span>
      <span className="text-gray-900 font-medium break-words flex-1 pl-3">
        {value}
      </span>
    </div>
  );
};

export default InfoRow;
