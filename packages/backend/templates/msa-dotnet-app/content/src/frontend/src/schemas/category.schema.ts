import { z } from "zod";

export const CategoryCreateSchema = z.object({
  name: z
    .string()
    .nonempty("Name is required")
    .min(2, "Category must be between 2 and 50 characters")
    .max(50, "Category must be between 2 and 50 characters")
    .regex(/^[a-zA-Z0-9'_ ]+$/, {
      message: "Category only allows letters, numbers, apostrophe (') and underscore (_).",
    }),
  prefix: z
    .string()
    .nonempty("Prefix is required")
    .min(2, `Prefix must consist of 2 uppercase letters.`)
    .max(2, `Prefix must consist of 2 uppercase letters.`)
    .regex(/^[A-Z]{2}$/, {
      message: "Prefix must consist of exactly 2 uppercase letters.",
    }),
});
