import { useEffect, useState } from "react";
import { homeAssignmentService } from "@/services/homeAssignmentService";
import type { HomeAssignmentDetail } from "@/entities/homeAssignment";
import type { ListRequestParams } from "@/entities/common";

export const useHome = (queryParams?: ListRequestParams) => {
  const [assignments, setAssignments] = useState<HomeAssignmentDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await homeAssignmentService.getMyAssignments(
          queryParams || {}
        );
        setAssignments(response.data);
        setTotalRecords(response.total);
      } catch (err) {
        console.error("Error fetching assignments:", err);
        setError("Failed to load assignments");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [queryParams, refreshTrigger]);

  return {
    assignments,
    loading,
    error,
    totalRecords,
    refreshData,
  };
};
