import type { SelectOption } from "@/entities/common";
import { useToastContext } from "@components/Toast/useToastContext";
import { ASSET_EDIT_STATE } from "@constants/asset";
import { ROUTES } from "@constants/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { assetEditFormSchema } from "@schemas/asset.schema";
import { type AppDispatch } from "@store";
import { editAssetThunk } from "@store/assetSlice";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type z from "zod";

/**
 * Custom hook để quản lý form chỉnh sửa asset
 */
const useEditAssetForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { showSuccess } = useToastContext();

  // Các tùy chọn trạng thái cho asset
  const stateOptions: SelectOption[] = [
    {
      name: "available",
      value: ASSET_EDIT_STATE.available,
    },
    {
      name: "not Available",
      value: ASSET_EDIT_STATE.notAvailable,
    },
    {
      name: "waiting for recycling",
      value: ASSET_EDIT_STATE.waitingForRecycling,
    },
    {
      name: "recycled",
      value: ASSET_EDIT_STATE.recycled,
    },
  ];

  type AssetFormData = z.infer<typeof assetEditFormSchema>;

  const {
    register,
    formState: { errors },
    handleSubmit: hookFormSubmit,
    setValue,
    watch,
    control,
    formState,
    reset,
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetEditFormSchema),
    defaultValues: {
      id: 0,
      name: "",
      specifications: "",
      installedDate: new Date(),
      state: ASSET_EDIT_STATE.available, // Trạng thái mặc định
    },
    mode: "onChange",
  });

  const assetData = watch();

  const onSubmit = async (data: AssetFormData) => {
    const payload = {
      id: data.id,
      name: data.name,
      specification: data.specifications,
      installedDate: data.installedDate.toISOString(),
      state: data.state,
    };

    await dispatch(editAssetThunk(payload)).unwrap();
    showSuccess("Asset updated successfully", "Success");
    navigate(ROUTES.ASSETS.path);
  };

  const handleSubmit = hookFormSubmit(onSubmit);

  const handleInputChange = (field: keyof AssetFormData, value: any) => {
    setValue(field, value, { shouldValidate: true });
  };

  const updateFormWithAssetData = (assetData: any) => {
    if (assetData && assetData.id) {
      reset({
        id: assetData.id,
        name: assetData.name || "",
        specifications: assetData.specification || "",
        installedDate: assetData.installedDate ? new Date(assetData.installedDate) : new Date(),
        state: assetData.state,
      });
    }
  };

  return {
    assetData,
    errors,
    register,
    control,
    handleSubmit,
    handleInputChange,
    formState,
    stateOptions,
    setValue,
    watch,
    updateFormWithAssetData,
  };
};

export default useEditAssetForm;
