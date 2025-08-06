import InputWrapper from "@components/common/InputWrapper";
import { useToastContext } from "@components/Toast/useToastContext";
import { ASSET_EDIT_STATE, ASSET_EDIT_STATE_NAMES } from "@constants/asset";
import { ROUTES } from "@constants/routes";
import "@css/CreateUser.scss";
import "@css/RadioButton.scss";
import useEditAssetForm from "@hooks/useEditAssetForm";
import { type AppDispatch, type RootState } from "@store";
import { getDetailAssetThunk } from "@store/assetSlice";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { ProgressSpinner } from "primereact/progressspinner";
import { RadioButton } from "primereact/radiobutton";
import { useEffect } from "react";
import { Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const EditAssetForm = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const isLoading = useSelector((state: RootState) => state.assets.isLoading);
  const asset = useSelector((state: RootState) => state.assets.asset);
  const { error } = useSelector((state: RootState) => state.assets);
  const { showError } = useToastContext();

  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isValid },
    setValue, // Thêm setValue để có thể set data vào form
  } = useEditAssetForm();

  // Load asset data khi component mount
  useEffect(() => {
    if (id && !isNaN(Number(id))) {
      dispatch(getDetailAssetThunk(Number(id)));
    } else {
      navigate(ROUTES.ASSETS.path);
    }
  }, [dispatch, id, navigate]);

  // Set form data khi asset data được load
  useEffect(() => {
    if (asset && asset.id) {
      setValue("id", asset.id, { shouldValidate: true });
      setValue("name", asset.name || "", { shouldValidate: true });
      setValue("specifications", asset.specification || "", { shouldValidate: true });
      setValue("installedDate", asset.installedDate ? new Date(asset.installedDate) : new Date(), {
        shouldValidate: true,
      });
      setValue("state", Number(asset.state), { shouldValidate: true });
    }
  }, [asset, setValue]);

  useEffect(() => {
    if (error) {
      showError(error);
      navigate(ROUTES.ASSETS.path);
    }
  }, [error, navigate, showError]);

  return (
    <>
      {isLoading && (
        <div
          className="flex flex-column align-items-center justify-content-center gap-2"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            zIndex: 10,
          }}
        >
          <ProgressSpinner />
        </div>
      )}
      <form
        className="create-user-form mt-2 flex flex-column w-6"
        onSubmit={handleSubmit}
        style={{ gap: "0.5rem", maxWidth: "400px" }}
      >
        <InputWrapper htmlFor="nameAsset" title={"Name"} labelClassName="align-self-start" error={errors.name?.message}>
          <InputText id="nameAsset" className="h-2rem" disabled={isLoading} {...register("name")} />
        </InputWrapper>

        <InputWrapper title={"Category"} labelClassName="align-self-start" htmlFor="categoryAsset">
          <Dropdown
            id="categoryAsset"
            optionLabel="name"
            placeholder={asset?.categoryName || "Select category"}
            pt={{ filterInput: { className: "h-2rem" } }}
            className="dropdown-panel h-2rem align-items-center"
            disabled={true}
            value={asset?.categoryName}
          />
        </InputWrapper>

        <InputWrapper
          title={"Specification"}
          labelClassName="align-self-start"
          htmlFor="specificationAsset"
          error={errors.specifications?.message}
        >
          <InputTextarea
            {...register("specifications")}
            name="specifications"
            id="specificationAsset"
            cols={35}
            rows={3}
            className="text-md w-full fixed-textarea"
            style={{ height: "120px", resize: "none" }}
            disabled={isLoading}
          />
        </InputWrapper>

        <Controller
          name="installedDate"
          control={control}
          render={({ field }) => (
            <InputWrapper
              title={"Installed Date"}
              labelClassName="align-self-start"
              htmlFor="installedDate"
              error={errors.installedDate?.message}
            >
              <IconField iconPosition="right" style={{ display: "flex", alignItems: "center" }}>
                <Calendar
                  id="installedDate"
                  {...field}
                  dateFormat="dd/mm/yy"
                  className="h-2rem w-full"
                  disabled={isLoading}
                  showButtonBar
                />
                <InputIcon className="pi pi-calendar" />
              </IconField>
            </InputWrapper>
          )}
        />

        <InputWrapper
          title={"State"}
          labelClassName="align-self-start"
          error={errors.state?.message}
          htmlFor="stateAsset"
        >
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <>
                <div className="mb-2">
                  <RadioButton
                    inputId="availableAsset"
                    name={field.name}
                    value={ASSET_EDIT_STATE.available}
                    onChange={(e) => field.onChange(e.value)}
                    checked={field.value === ASSET_EDIT_STATE.available}
                    disabled={isLoading}
                  />
                  <label htmlFor="availableAsset" className="text-sm ml-2">
                    {ASSET_EDIT_STATE_NAMES[ASSET_EDIT_STATE.available]}
                  </label>
                </div>
                <div className="mb-2">
                  <RadioButton
                    inputId="notAvailableAsset"
                    name={field.name}
                    value={ASSET_EDIT_STATE.notAvailable}
                    onChange={(e) => field.onChange(e.value)}
                    checked={field.value === ASSET_EDIT_STATE.notAvailable}
                    disabled={isLoading}
                  />
                  <label htmlFor="notAvailableAsset" className="text-sm ml-2">
                    {ASSET_EDIT_STATE_NAMES[ASSET_EDIT_STATE.notAvailable]}
                  </label>
                </div>
                <div className="mb-2">
                  <RadioButton
                    inputId="waitingForRecyclingAsset"
                    name={field.name}
                    value={ASSET_EDIT_STATE.waitingForRecycling}
                    onChange={(e) => field.onChange(e.value)}
                    checked={field.value === ASSET_EDIT_STATE.waitingForRecycling}
                    disabled={isLoading}
                  />
                  <label htmlFor="waitingForRecyclingAsset" className="text-sm ml-2">
                    {ASSET_EDIT_STATE_NAMES[ASSET_EDIT_STATE.waitingForRecycling]}
                  </label>
                </div>
                <div>
                  <RadioButton
                    inputId="recycledAsset"
                    name={field.name}
                    value={ASSET_EDIT_STATE.recycled}
                    onChange={(e) => field.onChange(e.value)}
                    checked={field.value === ASSET_EDIT_STATE.recycled}
                    disabled={isLoading}
                  />
                  <label htmlFor="recycledAsset" className="text-sm ml-2">
                    {ASSET_EDIT_STATE_NAMES[ASSET_EDIT_STATE.recycled]}
                  </label>
                </div>
              </>
            )}
          />
        </InputWrapper>

        <div className="flex justify-content-end gap-2">
          <Button className="primary" size="small" disabled={!isValid || isLoading} type="submit">
            Save
          </Button>
          <Button
            severity="secondary"
            size="small"
            outlined
            disabled={isLoading}
            type="button"
            onClick={() => navigate(ROUTES.ASSETS.path)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
};

export default EditAssetForm;
