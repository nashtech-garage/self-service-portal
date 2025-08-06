import { z } from "zod";

const getIdField = () => z.number().int().min(1, "ID must be a positive integer");

const getNameField = () =>
  z
    .string()
    .min(2, `Name must be between 2 and 50 characters`)
    .nonempty(`Name is required`)
    .max(50, `Name must be between 2 and 50 characters`)
    .regex(/^[a-zA-Z0-9'_ ]+$/, {
      message: "Name only allows letters, numbers, apostrophe (') and underscore (_)",
    });

const getCategoryField = () =>
  z
    .number()
    .min(1, `Category required.`)
    .refine((val) => !isNaN(Number(val)), {
      message: "Category ID must be a positive integer",
    });

const getSpecificationsField = () =>
  z
    .string()
    .nonempty("Specification is required.")
    .min(2, `Specification must be between 2 and 500 characters`)
    .max(500, `Specification must be between 2 and 500 characters`)
    .regex(/^[a-zA-Z0-9'_ ]+$/, {
      message: "Specification only allows letters, numbers, apostrophe (') and underscore (_).",
    });

const getInstalledDateField = () =>
  z
    .date({
      required_error: "Date is required",
      invalid_type_error: "Invalid date format",
    })
    .max(new Date(), {
      message: "Installed date cannot be in the future.",
    });

const getStateField = () =>
  z
    .literal(1)
    .or(z.literal(2))
    .refine((val) => val === 1 || val === 2, {
      message: "State must be either Available or NotAvailable.",
    });

const getStateEditField = () => z.number().int().nonnegative();

export {
  getCategoryField,
  getIdField,
  getInstalledDateField,
  getNameField,
  getSpecificationsField,
  getStateEditField,
  getStateField,
};
