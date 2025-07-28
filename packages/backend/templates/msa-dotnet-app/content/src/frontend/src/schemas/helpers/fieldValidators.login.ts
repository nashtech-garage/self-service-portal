import { z } from "zod";
import { UPPERCASE_REGEX, LOWERCASE_REGEX, DIGIT_REGEX, SPECIAL_CHAR_REGEX } from "@constants/regex";

export const usernameField = z.string().trim().nonempty("Username is required");

export const passwordField = z.string().nonempty("Password is required");

export const oldPasswordField = z.string().nonempty("Password is required");

export const newPasswordField = z.preprocess(
  (val) => (val === undefined || val === null ? "" : val),
  z
    .string()
    .nonempty("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be at most 100 characters")
    .refine((val) => UPPERCASE_REGEX.test(val), {
      message: "Password must contain at least one uppercase letter",
    })
    .refine((val) => LOWERCASE_REGEX.test(val), {
      message: "Password must contain at least one lowercase letter",
    })
    .refine((val) => DIGIT_REGEX.test(val), {
      message: "Password must contain at least one digit",
    })
    .refine((val) => SPECIAL_CHAR_REGEX.test(val), {
      message: "Password must contain at least one special character",
    })
) as z.ZodType<string, any>;
