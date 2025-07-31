import InputWrapper from "@components/common/InputWrapper";
import { ASSET_CREATE_STATE, ASSET_CREATE_STATE_NAMES } from "@constants/asset";
import { ROUTES } from "@constants/routes";
import "@css/CreateUser.scss";
import "@css/RadioButton.scss";
import useCreateAssetForm from "@hooks/useCreateAssetForm";
import { CategoryCreateSchema } from "@schemas/category.schema";
import { type AppDispatch, type RootState } from "@store";
import { clearCategoryMessage, fetchCategories, fetchCreateCategories } from "@store/categorySlice";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { ProgressSpinner } from "primereact/progressspinner";
import { RadioButton } from "primereact/radiobutton";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const CreateAssetForm = () => {
  const navigate = useNavigate();
  const isLoading = useSelector((state: RootState) => state.assets.isLoading);
  const dispatch = useDispatch<AppDispatch>();
  const category = useSelector((state: RootState) => state.categories.categories);
  const { message: categoryMessage, error: categoryError } = useSelector((state: RootState) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, []);

  const [nameCategory, setNameCategory] = useState("");
  const [prefixCategory, setPrefixCategory] = useState("");

  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [createCategoryErrors, setCreateCategoryErrors] = useState<{
    name?: string;
    prefix?: string;
    success?: string;
  }>({});

  const {
    handleSubmit,
    register,
    control,
    getValues,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useCreateAssetForm();

  const onCreateCategory = async (e: React.FormEvent, category: string, prefix: string) => {
    e.stopPropagation();
    const result = CategoryCreateSchema.safeParse({
      name: category,
      prefix: prefix,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setCreateCategoryErrors({
        name: fieldErrors.name?.[0],
        prefix: fieldErrors.prefix?.[0],
      });

      return;
    }
    setCreateCategoryErrors({});

    await dispatch(fetchCreateCategories({ category, prefix }));
    await dispatch(fetchCategories());
  };

  useEffect(() => {
    if (categoryMessage) {
      setCreateCategoryErrors({ success: categoryMessage });
      dispatch(clearCategoryMessage());
    }
    if (categoryError) {
      setCreateCategoryErrors({ name: categoryError });
      dispatch(clearCategoryMessage());
    }
  }, [categoryMessage, categoryError, dispatch]);

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
          <InputText id="nameAsset" className=" h-2rem" disabled={isLoading} {...register("name")} />
        </InputWrapper>
        <InputWrapper
          title={"Category"}
          labelClassName="align-self-start"
          htmlFor="categoryAsset"
          error={errors.categoryId?.message}
        >
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Dropdown
                {...field}
                id="categoryAsset"
                options={category}
                optionLabel="name"
                filter
                filterPlaceholder="Search Category"
                pt={{ filterInput: { className: "h-2rem" } }}
                className="dropdown-panel h-2rem align-items-center"
                disabled={isLoading}
                panelFooterTemplate={
                  !showAddCategoryForm ? (
                    <div
                      style={{ borderTop: "1px solid #e5e7eb" }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Button
                        className="text-primary font-italic underline"
                        text
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAddCategoryForm(true);
                        }}
                      >
                        Add new category
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="flex align-items-start justify-content-between p-2"
                      style={{ borderTop: "1px solid #e5e7eb" }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <div>
                        <div>
                          <InputText
                            placeholder="New category"
                            className="h-2rem"
                            style={{ width: "9.3rem" }}
                            value={nameCategory}
                            onChange={(e) => {
                              e.stopPropagation();
                              setNameCategory(e.target.value);
                            }}
                          />
                          <InputText
                            placeholder="NC"
                            className="h-2rem"
                            style={{ width: "3.2rem" }}
                            value={prefixCategory}
                            onChange={(e) => {
                              e.stopPropagation();
                              setPrefixCategory(e.target.value);
                            }}
                          />
                        </div>
                        <div style={{ maxWidth: "200px" }}>
                          {createCategoryErrors.name && (
                            <small
                              className="p-error block mt-1 ml-1"
                              style={{
                                minHeight: "0.5rem",
                                lineHeight: "1.5",
                                overflow: "visible",
                                color: "#d32f2f",
                                wordBreak: "break-word",
                                whiteSpace: "normal",
                                transition: "all 0.2s ease",
                              }}
                            >
                              {createCategoryErrors.name}
                            </small>
                          )}
                          {createCategoryErrors.prefix && (
                            <small
                              className="p-error block mt-1 ml-1"
                              style={{
                                minHeight: "0.5rem",
                                lineHeight: "1.5",
                                overflow: "visible",
                                color: "#d32f2f",
                                wordBreak: "break-word",
                                whiteSpace: "normal",
                                transition: "all 0.2s ease",
                              }}
                            >
                              {createCategoryErrors.prefix}
                            </small>
                          )}
                          {createCategoryErrors.success && (
                            <small
                              className="p-error block mt-1 ml-1"
                              style={{
                                minHeight: "0.5rem",
                                lineHeight: "1.5",
                                overflow: "visible",
                                color: "#32a852",
                                wordBreak: "break-word",
                                whiteSpace: "normal",
                                transition: "all 0.2s ease",
                              }}
                            >
                              {createCategoryErrors.success}
                            </small>
                          )}
                        </div>
                      </div>
                      <Button
                        icon="pi pi-check"
                        text
                        className="text-primary"
                        style={{ padding: "0.25rem", width: "2rem" }}
                        onClick={(e) => {
                          onCreateCategory(e, nameCategory, prefixCategory);
                        }}
                      />
                      <Button
                        icon="pi pi-times"
                        text
                        style={{ padding: "0.25rem", width: "2rem" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setNameCategory("");
                          setPrefixCategory("");
                          setShowAddCategoryForm(false);
                          setCreateCategoryErrors({});
                        }}
                      />
                    </div>
                  )
                }
                onChange={(e) => {
                  e.stopPropagation();
                  field.onChange(e.value);
                }}
                value={field.value}
              />
            )}
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
            autoResize={false}
          />
        </InputWrapper>

        <InputWrapper
          title={"Installed Date"}
          labelClassName="align-self-start"
          htmlFor="installedDateAsset"
          error={errors.installedDate?.message}
        >
          <IconField iconPosition="right" style={{ display: "flex", alignItems: "center" }}>
            <Calendar
              name="installedDate"
              id="installedDateAsset"
              value={getValues("installedDate")}
              onChange={(e) => {
                setValue("installedDate", e.value as Date);
                trigger("installedDate");
              }}
              dateFormat="dd/mm/yy"
              className="h-2rem w-full"
              disabled={isLoading}
              showIcon={false}
            />
            <InputIcon className="pi pi-calendar" />
          </IconField>
        </InputWrapper>

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
                    value={ASSET_CREATE_STATE.available}
                    onChange={(e) => field.onChange(e.value)}
                    checked={field.value === ASSET_CREATE_STATE.available}
                    disabled={isLoading}
                    defaultChecked={true}
                  />
                  <label htmlFor="availableAsset" className="text-sm ml-2">
                    {ASSET_CREATE_STATE_NAMES[ASSET_CREATE_STATE.available]}
                  </label>
                </div>
                <div>
                  <RadioButton
                    inputId="notAvailableAsset"
                    name={field.name}
                    value={ASSET_CREATE_STATE.notAvailable}
                    onChange={(e) => field.onChange(e.value)}
                    checked={field.value === ASSET_CREATE_STATE.notAvailable}
                    disabled={isLoading}
                  />
                  <label htmlFor="notAvailableAsset" className="text-sm ml-2">
                    {ASSET_CREATE_STATE_NAMES[ASSET_CREATE_STATE.notAvailable]}
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
export default CreateAssetForm;
