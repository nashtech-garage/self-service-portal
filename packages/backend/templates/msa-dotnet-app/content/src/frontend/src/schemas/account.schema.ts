import { z } from "zod";
import { usernameField, passwordField, newPasswordField } from "@/schemas/helpers/fieldValidators.login";

export const loginSchema = z.object({
  username: usernameField,
  password: passwordField,
});

export type LoginForm = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    username: usernameField,
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupForm = z.infer<typeof signupSchema>;

export const changePasswordSchema = z
  .object({
    isChangedPassword: z.boolean(),
    oldPassword: z.string().optional(),
    newPassword: newPasswordField,
  })
  .superRefine((data, ctx) => {
    if (data.isChangedPassword) {
      if (!data.oldPassword?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["oldPassword"],
          message: "Password is required",
        });
      } else {
        const result = newPasswordField.safeParse(data.oldPassword);
        if (!result.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["oldPassword"],
            message: result.error.errors[0].message,
          });
        }
      }
    }
  });

export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
