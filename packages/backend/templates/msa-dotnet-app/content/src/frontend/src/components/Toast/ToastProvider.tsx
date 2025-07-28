import { useToast } from "@components/Toast/Toast";
import { ToastContext } from "@components/Toast/ToastContext";
import { type ReactNode } from "react";

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {toast.ToastComponent()}
      {children}
    </ToastContext.Provider>
  );
};
