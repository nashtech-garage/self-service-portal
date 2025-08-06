import InputWrapper from "@/components/common/InputWrapper";
import type { ApiResponse } from "@/entities/api";
import type { UpdateAssignmentResponse } from "@/entities/assignment";
import { type AppDispatch } from "@/store";
import { useToastContext } from "@components/Toast/useToastContext";
import { ROUTES } from "@constants/routes";
import "@css/CreateUser.scss";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type CreateAssignmentForm as CreateAssignmentFormType,
  createAssignmentSchema,
} from "@schemas/createAssignment.schema";
import { type RootState } from "@store";
import { getAssignmentDetailThunk, resetEditAssignmentState, updateAssignmentThunk } from "@store/editAssignmentSlice";
import { formatDateWithoutTime } from "@utils/datetime";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputTextarea } from "primereact/inputtextarea";
import { ProgressSpinner } from "primereact/progressspinner";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { AssetSelector } from "@/components/Assignment/assetSelector";
import { UserSelector } from "@/components/Assignment/userSelector";
import { useEffect } from "react";

export const EditAssignmentForm = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isValid },
  } = useForm<CreateAssignmentFormType>({
    resolver: zodResolver(createAssignmentSchema),
    mode: "onChange",
  });

  const assignedDate = watch("assignedDate");
  const dispatch = useDispatch<AppDispatch>();
  const { showSuccess, showError } = useToastContext();
  const navigate = useNavigate();
  const isLoading = useSelector((state: RootState) => state.editAssignment.loadingUpdate);
  const assignmentDetail = useSelector((state: RootState) => state.editAssignment.assignmentDetail);

  useEffect(() => {
    if (assignmentId) {
      dispatch(getAssignmentDetailThunk(parseInt(assignmentId)));
    }
  }, [assignmentId, dispatch]);

  useEffect(() => {
    if (assignmentDetail) {
      setValue("userId", assignmentDetail.userId);
      setValue("assetId", assignmentDetail.assetId);
      setValue("assignedDate", new Date(assignmentDetail.assignedDate));
      setValue("note", assignmentDetail.note || "");
    }
  }, [assignmentDetail, setValue]);

  const onSubmit = async (data: CreateAssignmentFormType) => {
    if (!isValid || !assignmentId) {
      return;
    }

    const payload = {
      id: parseInt(assignmentId),
      data: {
        ...data,
        assignedDate: formatDateWithoutTime(data.assignedDate)!,
      },
    };

    dispatch(updateAssignmentThunk(payload)).then((action) => {
      if (updateAssignmentThunk.rejected.match(action)) {
        const errorMessage = action.error.message || "An unexpected error occurred during update assignment";
        showError(errorMessage, "Error");
        return;
      }

      const { message } = action.payload as ApiResponse<UpdateAssignmentResponse>;
      showSuccess(message, "Success");
      navigate(ROUTES.ASSIGNMENTS.path);
    });
  };

  const handleCancel = () => {
    dispatch(resetEditAssignmentState());
    navigate(ROUTES.ASSIGNMENTS.path);
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
            <span className="text-primary font-medium">Updating assignment...</span>
          </div>
        )}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="create-user-form mt-2 flex flex-column w-6 gap-2"
          style={{ maxWidth: "400px" }}
        >
          <h2 className="text-lg text-primary font-bold">Edit Assignment</h2>
          <InputWrapper title="User" labelClassName="align-self-start" error={errors.userId?.message}>
            <UserSelector
              setValue={setValue}
              initialValue={assignmentDetail?.userId}
              initialName={assignmentDetail?.fullName}
            />
          </InputWrapper>
          <InputWrapper title="Asset" labelClassName="align-self-start" error={errors.assetId?.message}>
            <AssetSelector
              setValue={setValue}
              initialValue={assignmentDetail?.assetId}
              initialName={assignmentDetail?.assetName}
            />
          </InputWrapper>

          <InputWrapper title="Assigned Date" labelClassName="align-self-start" error={errors.assignedDate?.message}>
            <IconField iconPosition="right">
              <Calendar
                inputId="assignedDate"
                className="h-2rem w-full"
                minDate={assignmentDetail?.assignedDate ? new Date(assignmentDetail.assignedDate) : new Date()}
                maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
                dateFormat="dd/mm/yy"
                showIcon={false}
                onChange={(e) => {
                  setValue("assignedDate", e.value as Date, { shouldValidate: true });
                  trigger("assignedDate");
                }}
                value={assignedDate}
              />
              <InputIcon className="pi pi-calendar" />
            </IconField>
          </InputWrapper>
          <InputWrapper title="Note" labelClassName="align-self-start" error={errors.note?.message}>
            <InputTextarea className="w-full" rows={2} {...register("note")} />
          </InputWrapper>
          <div className="flex justify-content-end gap-2">
            <Button className="primary" size="small" type="submit" disabled={!isValid} onClick={handleSubmit(onSubmit)}>
              Save
            </Button>
            <Button severity="secondary" size="small" type="button" outlined onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};
