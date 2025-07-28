import type { CreateAsset } from "@/entities/asset";
import type { SelectOption } from "@/entities/common";
import { useToastContext } from "@components/Toast/useToastContext";
import { ASSET_CREATE_STATE } from "@constants/asset";
import { ROUTES } from "@constants/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { assetFormSchema } from "@schemas/asset.schema";
import { type AppDispatch, type RootState } from "@store";
import { createAssetThunk, resetState } from "@store/assetSlice";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type z from "zod";

const useCreateAssetForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastContext();
  const { error: assetError, message: assetMessage } = useSelector((state: RootState) => state.assets);
  const state: SelectOption[] = [
    {
      name: "available",
      value: ASSET_CREATE_STATE.available,
    },
    {
      name: "not Available",
      value: ASSET_CREATE_STATE.notAvailable,
    },
  ];

  type AssetFormData = z.infer<typeof assetFormSchema>;

  const {
    register,
    formState: { errors },
    handleSubmit: hookFormSubmit,
    setValue,
    watch,
    control,
    formState,
    getValues,
    trigger,
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: "",
      categoryId: 0,
      specifications: "",
      installedDate: undefined,
      state: ASSET_CREATE_STATE.available as 1 | 2,
    },
    mode: "onChange",
  });

  const assetData = watch();

  const onSubmit = async (data: AssetFormData) => {
    const formatted: CreateAsset = {
      name: data.name,
      categoryId: data.categoryId,
      specification: data.specifications,
      installedDate: data.installedDate.toISOString(),
      state: data.state,
    };
    await dispatch(createAssetThunk(formatted));
  };

  useEffect(() => {
    if (assetMessage) {
      showSuccess(assetMessage);
      dispatch(resetState());
      navigate(ROUTES.ASSETS.path);
    }
    if (assetError) {
      showError(assetError);
      dispatch(resetState());
    }
  }, [assetMessage, assetError, dispatch]);

  const handleSubmit = hookFormSubmit(onSubmit);

  const handleInputChange = (field: keyof AssetFormData, value: any) => {
    setValue(field, value, { shouldValidate: true });
  };

  return {
    assetData,
    errors,
    register,
    control,
    handleSubmit,
    handleInputChange,
    formState,
    state,
    getValues,
    setValue,
    trigger,
  };
};

export default useCreateAssetForm;
