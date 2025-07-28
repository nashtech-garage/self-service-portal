import { AssetSelector } from "@/components/Assignment/assetSelector";
import { UserSelector } from "@/components/Assignment/userSelector";
import InputWrapper from "@/components/common/InputWrapper";
import { useToastContext } from "@/components/Toast/useToastContext";
import { ROUTES } from "@/constants/routes";
import "@css/CreateUser.scss";
import type { ApiResponse } from "@/entities/api";
import type { CreateAssignmentRequest, CreateAssignmentResponse } from "@/entities/createAssignment";
import { type CreateAssignmentForm, createAssignmentSchema } from "@/schemas/createAssignment.schema";
import { type AppDispatch } from "@/store";
import { createAssignmentThunk } from "@/store/createAssignmentSlice";
import { formatDateWithoutTime } from "@/utils/datetime";
import { zodResolver } from "@hookform/resolvers/zod";
import { type RootState } from "@store";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputTextarea } from "primereact/inputtextarea";
import { ProgressSpinner } from "primereact/progressspinner";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const CreateAssignment = () => {
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<CreateAssignmentForm>({
    resolver: zodResolver(createAssignmentSchema),
    mode: "onChange",
    defaultValues: {
      assignedDate: new Date(),
    },
  });

  const assignedDate = watch("assignedDate");
  const dispatch = useDispatch<AppDispatch>();
  const { showSuccess, showError } = useToastContext();
  const navigate = useNavigate();
  const isLoading = useSelector((state: RootState) => state.createAssignment.loadingCreate);

  const onSubmit = async (data: CreateAssignmentForm) => {
    if (!isValid) {
      return;
    }

    const payload = {
      ...data,
      assignedDate: formatDateWithoutTime(data.assignedDate)!,
    };
    dispatch(createAssignmentThunk(payload as CreateAssignmentRequest)).then((action) => {
      if (createAssignmentThunk.rejected.match(action)) {
        const errorMessage = action.error.message || "An unexpected error occurred during create assignment";
        showError(errorMessage, "Error");
        return;
      }

      const { message } = action.payload as ApiResponse<CreateAssignmentResponse>;
      showSuccess(message, "Success");
      navigate(ROUTES.ASSIGNMENTS.path);
    });
  };

  return (
    <>
      <div className="relative" style={{ position: "relative" }}>
        {/* Loading Spinner Overlay */}
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
            <span className="text-primary font-medium">Creating assignment...</span>
          </div>
        )}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="create-user-form mt-2 flex flex-column w-6 gap-2"
          style={{ maxWidth: "400px" }}
        >
          <h2 className="text-lg text-primary font-bold">Create Assignment</h2>
          <InputWrapper title="User" labelClassName="align-self-start" error={errors.userId?.message}>
            <UserSelector setValue={setValue} />
          </InputWrapper>
          <InputWrapper title="Asset" labelClassName="align-self-start" error={errors.assetId?.message}>
            <AssetSelector setValue={setValue} />
          </InputWrapper>

          <InputWrapper title="Assigned Date" labelClassName="align-self-start" error={errors.assignedDate?.message}>
            <IconField iconPosition="right">
              <Calendar
                inputId="assignedDate"
                className="h-2rem w-full"
                minDate={new Date()}
                maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
                dateFormat="dd/mm/yy"
                showIcon={false}
                onChange={(e) => setValue("assignedDate", e.value as Date)}
                value={assignedDate}
              />
              <InputIcon className="pi pi-calendar" />
            </IconField>
          </InputWrapper>
          <InputWrapper title="Note" labelClassName="align-self-start" error={errors.note?.message}>
            <InputTextarea className="w-full" rows={2} {...register("note")} />
          </InputWrapper>
          <div className="flex justify-content-end gap-2">
            <Button className="primary" size="small" type="submit" disabled={!isValid}>
              Save
            </Button>
            <Button
              severity="secondary"
              size="small"
              type="button"
              outlined
              onClick={() => navigate(ROUTES.ASSIGNMENTS.path)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateAssignment;
