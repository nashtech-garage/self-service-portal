import { AssignmentStatus } from "@/entities/enums";
export const ASSIGNMENT_STATUS_OPTIONS = [
  { value: AssignmentStatus.PENDING, name: "Waiting for acceptance" },
  { value: AssignmentStatus.ACCEPTED, name: "Accepted" },
  { value: AssignmentStatus.DECLINED, name: "Declined" },
  { value: AssignmentStatus.RETURNED, name: "Returned" },
];

export const ADMIN_ASSIGNMENT_STATUS = [
  { value: AssignmentStatus.PENDING, name: "Waiting for acceptance" },
  { value: AssignmentStatus.ACCEPTED, name: "Accepted" },
  { value: AssignmentStatus.DECLINED, name: "Declined" },
];