import z from "zod";
import {
  getIdField,
  getCategoryField,
  getInstalledDateField,
  getNameField,
  getSpecificationsField,
  getStateEditField,
  getStateField,
} from "./helpers/fieldValidators.asset";

export const assetFormSchema = z.object({
  name: getNameField(),
  categoryId: getCategoryField(),
  specifications: getSpecificationsField(),
  installedDate: getInstalledDateField(),
  state: getStateField(),
});
export const assetEditFormSchema = z.object({
  id: getIdField(),
  name: getNameField(),
  specifications: getSpecificationsField(),
  installedDate: getInstalledDateField(),
  state: getStateEditField(),
});

export type AssetFormData = z.infer<typeof assetFormSchema>;
