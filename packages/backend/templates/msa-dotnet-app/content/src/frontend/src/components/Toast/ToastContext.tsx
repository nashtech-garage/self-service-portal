import { createContext } from "react";
import { useToast } from "@components/Toast/Toast";

export const ToastContext = createContext<ReturnType<typeof useToast> | null>(null);
