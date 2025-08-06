import { dateOfBirthField, genderField, getNameField } from "@/schemas/helpers/fieldValidators.user";
import { isAtLeast18YearsOld, isAtMost60YearsOld, isWeekend } from "@/utils/datetime";
import { z } from "zod";

export const userFormSchema = z
  .object({
    firstName: getNameField("firstName"),
    lastName: getNameField("lastName"),
    dateOfBirth: dateOfBirthField,
    gender: genderField,
    joinedDate: z.date().refine(
      (date) => {
        return !isWeekend(date);
      },
      {
        message: "Joined date is Saturday or Sunday. Please select a different date",
      }
    ),
    userType: z.coerce
      .number()
      .nullable()
      .refine((val) => val !== 0, {
        message: "Type is required",
      }),
  })
  .superRefine((data, ctx) => {
    if (data.dateOfBirth && data.joinedDate && data.joinedDate < data.dateOfBirth) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Joined date is not later than Date of Birth. Please select a different date",
        path: ["joinedDate"],
      });
    }

    if (data.dateOfBirth && data.joinedDate) {
      if (!isAtLeast18YearsOld(data.dateOfBirth, data.joinedDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "User is under 18. Please select a different date",
          path: ["joinedDate"],
        });
      }

      if (!isAtMost60YearsOld(data.dateOfBirth, data.joinedDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "User is over 60. Please select a different date",
          path: ["joinedDate"],
        });
      }
    }
  });

export type UserFormSchema = z.infer<typeof userFormSchema>;
