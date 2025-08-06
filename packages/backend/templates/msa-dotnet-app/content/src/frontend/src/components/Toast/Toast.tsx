/**
 * Toast Component and Hook
 *
 * This file provides a reusable toast notification system using PrimeReact's Toast component.
 * It includes a custom hook (useToast) that provides methods to show different types of notifications.
 */

import { Toast as PrimeToast } from "primereact/toast";
import { useRef } from "react";

/**
 * Props interface for toast notifications
 * @property severity - Type of toast: 'success' | 'info' | 'warn' | 'error'
 * @property summary - Title/header of the toast
 * @property detail - Main message content
 * @property life - Duration in milliseconds before toast disappears
 */
export interface ToastProps {
  severity?: "success" | "info" | "warn" | "error";
  summary?: string;
  detail?: string;
  life?: number;
}

/**
 * Custom hook for managing toast notifications
 * @returns Object containing ToastComponent and methods to show different types of toasts
 */
export const useToast = () => {
  const toastRef = useRef<PrimeToast>(null);

  /**
   * Generic method to show a toast notification
   * @param props - Toast configuration options
   */
  const showToast = ({ severity = "info", summary = "", detail = "", life = 3000 }: ToastProps) => {
    toastRef.current?.show({
      severity,
      summary,
      detail,
      life,
      className: "custom-toast",
    });
  };

  /**
   * Shows a success toast notification
   * @param detail - Main message content
   * @param summary - Optional title (defaults to 'Success')
   */
  const showSuccess = (detail: string, summary?: string) => {
    showToast({
      severity: "success",
      summary: summary || "Success",
      detail,
      life: 3000,
    });
  };

  /**
   * Shows an error toast notification
   * @param detail - Main message content
   * @param summary - Optional title (defaults to 'Error')
   */
  const showError = (detail: string, summary?: string) => {
    showToast({
      severity: "error",
      summary: summary || "Error",
      detail,
      life: 5000,
    });
  };

  /**
   * Shows an info toast notification
   * @param detail - Main message content
   * @param summary - Optional title (defaults to 'Information')
   */
  const showInfo = (detail: string, summary?: string) => {
    showToast({
      severity: "info",
      summary: summary || "Information",
      detail,
      life: 3000,
    });
  };

  /**
   * Shows a warning toast notification
   * @param detail - Main message content
   * @param summary - Optional title (defaults to 'Warning')
   */
  const showWarn = (detail: string, summary?: string) => {
    showToast({
      severity: "warn",
      summary: summary || "Warning",
      detail,
      life: 4000,
    });
  };

  return {
    ToastComponent: () => <PrimeToast ref={toastRef} position="top-right" className="custom-toast" />,
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarn,
  };
};
