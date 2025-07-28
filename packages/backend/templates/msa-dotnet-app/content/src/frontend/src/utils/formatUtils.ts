import { AssignmentStatus } from "@/entities/enums";

export const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

export const assignmentStatusOptions = {
  [AssignmentStatus.PENDING]: {
    label: "Waiting for acceptance",
    color: "#f59e0b",
  },
  [AssignmentStatus.ACCEPTED]: {
    label: "Accepted",
    color: "#10b981",
  },
  [AssignmentStatus.DECLINED]: {
    label: "Declined",
    color: "#ef4444",
  },
  [AssignmentStatus.RETURNED]: {
    label: "Returned",
    color: "#3b82f6",
  },
};

export const paramsSerializer = (params: Record<string, any>) => {
  const queryStrings: string[] = [];

  for (const key in params) {
    const value = params[key];
    if (Array.isArray(value)) {
      value.forEach((v) => {
        queryStrings.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
      });
    } else if (value !== undefined && value !== null) {
      queryStrings.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }

  return queryStrings.join("&");
};
