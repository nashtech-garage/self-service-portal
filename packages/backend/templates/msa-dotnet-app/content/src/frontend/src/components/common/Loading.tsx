import { ProgressSpinner } from "primereact/progressspinner";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

const Loading = () => {
  const loading = useSelector((state: RootState) => state.app.loading);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/50 z-50">
      <ProgressSpinner strokeWidth="4" />
    </div>
  );
};

export default Loading;
