import { describe, expect, it } from "@jest/globals";
import type { AnyAction } from "@reduxjs/toolkit";
import reducer, { clearToast, setLoading, showToast, type AppState } from "@store/appSlice";

const initialState: AppState = {
  loading: false,
  toast: null,
};

describe("appSlice reducer", () => {
  it("should handle initial state", () => {
    expect(reducer(undefined, {} as AnyAction)).toEqual(initialState);
  });

  it("should handle setLoading", () => {
    // Test setting loading to true
    let state = reducer(initialState, setLoading(true));
    expect(state.loading).toBe(true);

    // Test setting loading to false
    state = reducer(state, setLoading(false));
    expect(state.loading).toBe(false);
  });

  it("should handle showToast", () => {
    const mockToast = {
      severity: "success" as const,
      summary: "Success",
      detail: "Operation completed successfully",
    };

    const state = reducer(initialState, showToast(mockToast));
    expect(state.toast).toEqual(mockToast);
  });

  it("should handle showToast with different severities", () => {
    const severities = ["success", "error", "info", "warn"] as const;

    severities.forEach((severity) => {
      const mockToast = {
        severity,
        summary: `${severity.charAt(0).toUpperCase() + severity.slice(1)} Message`,
        detail: `This is a ${severity} message`,
      };

      const state = reducer(initialState, showToast(mockToast));
      expect(state.toast).toEqual(mockToast);
    });
  });

  it("should handle clearToast", () => {
    // First set a toast
    const mockToast = {
      severity: "success" as const,
      summary: "Success",
      detail: "Operation completed successfully",
    };
    let state = reducer(initialState, showToast(mockToast));
    expect(state.toast).toEqual(mockToast);

    // Then clear it
    state = reducer(state, clearToast());
    expect(state.toast).toBeNull();
  });

  it("should handle multiple actions in sequence", () => {
    // Start with initial state
    let state = reducer(initialState, setLoading(true));
    expect(state.loading).toBe(true);
    expect(state.toast).toBeNull();

    // Show a toast while loading
    const mockToast = {
      severity: "info" as const,
      summary: "Processing",
      detail: "Please wait...",
    };
    state = reducer(state, showToast(mockToast));
    expect(state.loading).toBe(true);
    expect(state.toast).toEqual(mockToast);

    // Clear loading and toast
    state = reducer(state, setLoading(false));
    state = reducer(state, clearToast());
    expect(state.loading).toBe(false);
    expect(state.toast).toBeNull();
  });
});
