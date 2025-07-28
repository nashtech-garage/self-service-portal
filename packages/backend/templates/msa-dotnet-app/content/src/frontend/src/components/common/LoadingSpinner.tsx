import React from "react";
import { ProgressSpinner } from "primereact/progressspinner";

const LoadingSpinner: React.FC = () => {
  return (
    <div
      className="flex align-items-center justify-content-center" style={{ height: "50vh" }}
    >
      <ProgressSpinner strokeWidth="4" />
    </div>
  );
};

export default LoadingSpinner;
