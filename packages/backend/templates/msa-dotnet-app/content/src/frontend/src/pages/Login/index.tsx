import { useToastContext } from "@components/Toast/useToastContext";
import DialogHeader from "@components/common/CustomHeader/DialogHeader";
import InputWrapper from "@components/common/InputWrapper";
import LoadingSpinner from "@components/common/LoadingSpinner";
import "@css/Login.scss";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LoginForm } from "@/schemas/account.schema";
import { loginSchema } from "@/schemas/account.schema";
import type { AppDispatch, RootState } from "@store";
import { login } from "@store/auth/authSlice.login";
import { getErrorMessage } from "@utils/errorMessage";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((state: RootState) => state.auth.loading);
  const { showSuccess, showError } = useToastContext();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await dispatch(login({ username: data.username as string, password: data.password as string })).unwrap();
      showSuccess("Login successfully!", "Success");
    } catch (err) {
      const message = getErrorMessage(err, "Login failed!");
      if (message === "Wrong username/password") {
        showError("Username or password is incorrect. Please try again", "Error");
      } else {
        showError(message);
      }
    }
  };

  return (
    <div className="flex flex-column justify-content-center align-items-center min-h-screen">
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="flex flex-column w-23rem border-round shadow-2 h-full">
          <DialogHeader
            paddingX={3}
            paddingY={1}
            textPosition="text-center"
            contentText="Welcome to Online Asset Management"
            height="3rem"
            hasBorder={true}
            className="login-dialog-header"
          />
          <div className="flex-grow-1 flex justify-content-center align-items-center">
            <form onSubmit={handleSubmit(onSubmit)} className="border-round-bottom-md border-1 h-full w-full p-4">
              <InputWrapper
                title={
                  <>
                    Username <span className="text-primary">*</span>
                  </>
                }
                error={errors.username?.message}
                htmlFor="username"
                labelClassName="text-sm"
                inputClassName="w-13rem"
              >
                <InputText
                  id="username"
                  {...register("username")}
                  className={`input-field w-full ${errors.username ? "p-invalid" : ""}`}
                />
              </InputWrapper>

              <InputWrapper
                title={
                  <>
                    Password <span className="text-primary">*</span>
                  </>
                }
                error={errors.password?.message}
                htmlFor="password"
                labelClassName="text-sm"
              >
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Password
                      id="password"
                      toggleMask
                      feedback={false}
                      className={`input-field ${errors.password ? "p-invalid" : ""}`}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </InputWrapper>

              <div className="flex align-items-center justify-content-end form-actions">
                <button type="submit" className="btn-submit text-white" disabled={!isValid}>
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
