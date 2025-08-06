import InputWrapper from "@/components/common/InputWrapper";
import type { GenderOption } from "@/entities/common";
import { type AppDispatch, type RootState } from "@/store";
import SelectDropdown from "@components/common/SelectDropdown";
import { useToastContext } from "@components/Toast/useToastContext";
import { ROUTES } from "@constants/routes";
import { USER_GENDER_NAMES } from "@constants/user";
import "@css/CreateUser.scss";
import "@css/RadioButton.scss";
import useEditUserForm from "@hooks/useEditUserForm";
import { fetchUsersById } from "@store/userSlice";
import "primeflex/primeflex.css";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { ProgressSpinner } from "primereact/progressspinner";
import { RadioButton } from "primereact/radiobutton";
import { classNames } from "primereact/utils";
import { useEffect } from "react";
import { Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export interface EditUserFormRef {
  showPasswordDisplay: () => void;
}

const genderOptions: GenderOption[] = [
  { value: "Female", label: "Female" },
  { value: "Male", label: "Male" },
];

const EditUserForm = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const isLoading = useSelector((state: RootState) => state.users.loading);
  const user = useSelector((state: RootState) => state.users.selectedUser);
  const { error } = useSelector((state: RootState) => state.users);
  const { showError } = useToastContext();
  const location = useLocation();
  const paramsUserList = location.state;

  const {
    userTypes,
    register,
    handleInputChange,
    handleSubmit,
    control,
    formState: { errors, isValid },
    setValue,
    setUserId,
  } = useEditUserForm(paramsUserList);

  useEffect(() => {
    if (id && !isNaN(Number(id))) {
      dispatch(fetchUsersById(Number(id)));
    } else {
      navigate(ROUTES.USERS.path);
    }
  }, [dispatch, navigate, id]);

  useEffect(() => {
    if (user) {
      setUserId(user.id);
      setValue("firstName", user.firstName, { shouldValidate: true });
      setValue("lastName", user.lastName || "", { shouldValidate: true });
      setValue("dateOfBirth", user.dateOfBirth ? new Date(user.dateOfBirth) : new Date(), {
        shouldValidate: true,
      });
      setValue("gender", USER_GENDER_NAMES[user.gender] as "Male" | "Female", { shouldValidate: true });
      setValue("joinedDate", user.joinedDate ? new Date(user.joinedDate) : new Date(), {
        shouldValidate: true,
      });
      setValue("userType", Number(user.userType), { shouldValidate: true });
    }
  }, [user, setValue, setUserId]);

  useEffect(() => {
    if (error) {
      showError(error);
      navigate(ROUTES.USERS.path);
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
        onSubmit={handleSubmit}
        className="create-user-form mt-2 flex flex-column gap-2"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <InputWrapper
          wrapperClassName="gap-2 flex flex-column lg:flex-row "
          title="First Name"
          error={errors.firstName?.message}
          htmlFor="firstName"
          labelClassName="align-self-start"
          inputClassName="w-full lg:w-full"
        >
          <InputText
            id="firstName"
            {...register("firstName", {
              onChange: (e) => {
                if (e.target.value.length <= 50) {
                  handleInputChange("firstName", e.target.value);
                }
              },
            })}
            className={classNames("h-2rem w-full", { "p-invalid": errors.firstName })}
            disabled={true}
            maxLength={50}
          />
        </InputWrapper>

        <InputWrapper
          wrapperClassName="gap-2 flex flex-column lg:flex-row "
          title="Last Name"
          error={errors.lastName?.message}
          htmlFor="lastName"
          labelClassName="align-self-start"
          inputClassName="w-full lg:w-full"
        >
          <InputText
            id="lastName"
            {...register("lastName", {
              onChange: (e) => {
                if (e.target.value.length <= 50) {
                  handleInputChange("lastName", e.target.value);
                }
              },
            })}
            className={classNames("h-2rem w-full", { "p-invalid": errors.lastName })}
            disabled={true}
            maxLength={50}
          />
        </InputWrapper>

        <InputWrapper
          wrapperClassName="gap-2 flex flex-column lg:flex-row "
          title="Date of Birth"
          error={errors.dateOfBirth?.message}
          htmlFor="dateOfBirth"
          labelClassName="align-self-start"
          inputClassName="w-full lg:w-full"
        >
          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
              <IconField iconPosition="right">
                <Calendar
                  {...field}
                  id={field.name}
                  inputId={field.name}
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  dateFormat="dd/mm/yy"
                  className={classNames("h-2rem custom-calendar w-full", { "p-invalid": errors.dateOfBirth })}
                  disabled={isLoading}
                  showOnFocus={true}
                />
                <InputIcon className="pi pi-calendar"></InputIcon>
              </IconField>
            )}
          />
        </InputWrapper>

        <InputWrapper
          wrapperClassName="gap-2 flex flex-column lg:flex-row "
          title="Gender"
          error={errors.gender?.message}
          labelClassName="align-self-start"
          inputClassName="w-full lg:w-full"
        >
          <div className="gender-options flex align-items-center flex-wrap">
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <>
                  {genderOptions.map((option) => (
                    <div className="gender-option flex align-items-center mr-3 mb-1" key={option.value}>
                      <RadioButton
                        inputId={`gender-${option.value}`}
                        name={field.name}
                        value={option.value}
                        onChange={(e) => field.onChange(e.value)}
                        checked={field.value === option.value}
                        disabled={isLoading}
                        className={classNames({ "p-invalid": errors.gender })}
                      />
                      <label
                        htmlFor={`gender-${option.value}`}
                        className={`gender-label ml-2 ${option.value === "Female" ? "text-red-600" : "text-yellow-900"}`}
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </>
              )}
            />
          </div>
        </InputWrapper>

        <InputWrapper
          wrapperClassName="gap-2 flex flex-column lg:flex-row "
          title="Joined Date"
          error={errors.joinedDate?.message}
          htmlFor="joinedDate"
          labelClassName="align-self-start"
          inputClassName="w-full lg:w-full"
        >
          <Controller
            name="joinedDate"
            control={control}
            render={({ field }) => (
              <IconField iconPosition="right">
                <Calendar
                  id={field.name}
                  inputId={field.name}
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  dateFormat="dd/mm/yy"
                  className={classNames("h-2rem custom-calendar w-full", { "p-invalid": errors.joinedDate })}
                  disabled={isLoading}
                  showOnFocus={true}
                />
                <InputIcon className="pi pi-calendar"></InputIcon>
              </IconField>
            )}
          />
        </InputWrapper>

        <InputWrapper
          wrapperClassName="gap-2 flex flex-column lg:flex-row "
          title="Type"
          error={errors.userType?.message}
          htmlFor="userType"
          labelClassName="align-self-start"
          inputClassName="w-full lg:w-full"
        >
          <Controller
            name="userType"
            control={control}
            render={({ field }) => (
              <SelectDropdown
                id={field.name}
                value={field.value}
                options={userTypes}
                onChange={(e) => field.onChange(e.value)}
                optionLabel="name"
                placeholder="Select a type"
                error={!!errors.userType}
                disabled={isLoading}
              />
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
            onClick={() => navigate(ROUTES.USERS.path)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
};

export default EditUserForm;
