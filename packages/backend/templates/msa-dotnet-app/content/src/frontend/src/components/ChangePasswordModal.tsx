import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Password } from "primereact/password";
import CustomModal from "@components/common/BaseModal/BaseModal";
import InputWrapper from "./common/InputWrapper";
import { authService } from "@services/authService";
import { useToastContext } from "@components/Toast/useToastContext";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "@utils/errorMessage";
import { changePasswordSchema, type ChangePasswordForm } from "@schemas";
import { markPasswordChanged } from "@store/auth/authSlice.login";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "@store/appSlice";
import type { RootState } from "@store";
import { zodResolver } from "@hookform/resolvers/zod";

interface ChangePasswordModalProps {
  isChangedPassword?: boolean;
  visible: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isChangedPassword, visible, onClose }) => {
  const dispatch = useDispatch();
  const loading = useSelector((state: RootState) => state.app.loading);
  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    reset,
    setError,
  } = useForm<ChangePasswordForm>({
    mode: "onChange",
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      isChangedPassword: !!isChangedPassword,
    },
  });
  const [ready, setReady] = useState(false);
  const { showSuccess, showError } = useToastContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (visible) {
      setTimeout(() => setReady(true), 100);
    } else {
      setReady(false);
    }
  }, [visible]);

  const onSubmit = async (data: ChangePasswordForm) => {
    if (loading) {
      return;
    }
    dispatch(setLoading(true));
    try {
      if (data.isChangedPassword) {
        await authService.changePassword(data.oldPassword!, data.newPassword);
        showSuccess("Password changed successfully!", "Success");
      } else {
        await authService.firstChangePassword(data.newPassword);
        showSuccess("Password changed successfully!", "Success");
        dispatch(markPasswordChanged());
      }

      reset();
      onClose();
      navigate("/home");
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Change password failed!");
      if (message === "Wrong password") {
        setError("oldPassword", { type: "manual", message: "Password is incorrect" });
      } else {
        showError(message, "Error");
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  const content = () => (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 16 }}>
          {!isChangedPassword && (
            <>
              This is the first time you logged in.
              <br />
              You have to change your password to continue.
            </>
          )}
        </div>
        {isChangedPassword && (
          <InputWrapper
            title="Old password"
            error={errors.oldPassword?.message}
            htmlFor="oldPassword"
            wrapperClassName="gap-6 flex flex-column lg:flex-row"
            labelClassName="align-self-center min-w-[140px] flex-shrink-0"
            inputClassName="w-full lg:w-full"
          >
            <Controller
              name="oldPassword"
              control={control}
              render={({ field }) => (
                <Password
                  id="oldPassword"
                  feedback={false}
                  toggleMask
                  className={`input-field w-full ${errors.newPassword ? "p-invalid" : ""}`}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  maxLength={100}
                />
              )}
            />
          </InputWrapper>
        )}
        <InputWrapper
          title="New password"
          error={errors.newPassword?.message}
          htmlFor="newPassword"
          wrapperClassName="gap-6 flex flex-column lg:flex-row"
          labelClassName="align-self-center min-w-[140px] flex-shrink-0"
          inputClassName="w-full lg:w-full"
        >
          <Controller
            name="newPassword"
            control={control}
            render={({ field }) => (
              <Password
                id="newPassword"
                feedback={false}
                toggleMask
                className={`input-field w-full ${errors.newPassword ? "p-invalid" : ""}`}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                maxLength={100}
              />
            )}
          />
        </InputWrapper>
      </div>
    </div>
  );

  return (
    <CustomModal
      visible={visible}
      title="Change password"
      content={content()}
      onClose={() => onClose()}
      onConfirm={handleSubmit(onSubmit)}
      confirmText={loading ? "Saving..." : "Save"}
      cancelText={isChangedPassword ? "Cancel" : ""}
      showCancel={!!isChangedPassword}
      position="center"
      disableConfirm={!isValid}
    />
  );
};

export default ChangePasswordModal;
