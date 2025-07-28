import { z } from "zod";

export const createAssignmentSchema = z.object({
  assetId: z
    .number({
      required_error: "Asset is required",
      invalid_type_error: "Asset must be a number",
    })
    .int(),
  userId: z
    .number({
      required_error: "Assignee is required",
      invalid_type_error: "AssignedTo must be a number",
    })
    .int(),
  assignedDate: z
    .date({
      required_error: "Assigned date is required",
      invalid_type_error: "Assigned date must be a valid date",
    })
    .refine(
      (date) => {
        const now = new Date();
        const oneYearAhead = new Date();
        oneYearAhead.setFullYear(now.getFullYear() + 1);
        return date <= oneYearAhead;
      },
      {
        message: "Assigned date cannot be more than 1 year in the future",
      }
    ),

  note: z
    .string()
    .max(500, {
      message: "Note must be less than or 500 characters",
    })
    .optional(),
});

export type CreateAssignmentForm = z.infer<typeof createAssignmentSchema>;
