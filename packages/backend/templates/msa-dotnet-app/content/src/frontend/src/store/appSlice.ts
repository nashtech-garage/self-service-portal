/**
 * App Slice
 *
 * This file defines the global application state slice using Redux Toolkit.
 * It manages application-wide states like loading indicators and toast notifications.
 */

import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

/**
 * Type Definitions
 * 
 * @typedef {('success' | 'error' | 'info' | 'warn')} ToastType - Available toast notification types
 * @typedef {Object} ToastMessage - Structure of a toast notification
 * @property {ToastType} severity - Type of toast notification
 * @property {string} summary - Title/header of the toast
 * @property {string} detail - Main message content
 * @typedef {Object} AppState - Global application state
 * @property {boolean} loading - Global loading state
 * @property {ToastMessage | null} toast - Current toast notification
 */
type ToastType = 'success' | 'error' | 'info' | 'warn';

interface ToastMessage {
  severity: ToastType;
  summary: string;
  detail: string;
}

export interface AppState {
  loading: boolean;
  toast: ToastMessage | null;
}

/**
 * Initial state for the app slice
 * Defines default values for loading and toast states
 */
const initialState: AppState = {
  loading: false,
  toast: null,
};

/**
 * App Slice
 *
 * Redux slice that manages global application state.
 * Provides actions for:
 * - Setting loading state
 * - Showing toast notifications
 * - Clearing toast notifications
 */
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    /**
     * Sets the global loading state
     * @param {AppState} state - Current state
     * @param {PayloadAction<boolean>} action - Action containing loading state
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    /**
     * Shows a toast notification
     * @param {AppState} state - Current state
     * @param {PayloadAction<ToastMessage>} action - Action containing toast message
     */
    showToast: (state, action: PayloadAction<ToastMessage>) => {
      state.toast = action.payload;
    },
    /**
     * Clears the current toast notification
     * @param {AppState} state - Current state
     */
    clearToast: (state) => {
      state.toast = null;
    },
  },
});

// Export actions and reducer
export const { setLoading, showToast, clearToast } = appSlice.actions;
export default appSlice.reducer;
