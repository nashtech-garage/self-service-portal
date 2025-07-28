import { USER_TYPE_ENUM } from "@/constants/user";
import type { SelectOption } from "@/entities/common";
import type { UserFormData } from "@/entities/user";
import { userFormSchema } from "@/schemas/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";

// type FormValues = {
//   firstName: string;
//   lastName: string;
//   dateOfBirth: Date;
//   gender: "Male" | "Female";
//   joinedDate: Date;
//   userType: number | null;
// };

const useCreateUserForm = (onSubmit: (userData: UserFormData) => void) => {
  const userTypes: SelectOption[] = [
    { name: "Admin", value: USER_TYPE_ENUM.ADMIN },
    { name: "Staff", value: USER_TYPE_ENUM.STAFF },
  ];

  const today = new Date();
  const defaultDob = new Date();
  defaultDob.setFullYear(today.getFullYear() - 18);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");

  type FormValues = z.infer<typeof userFormSchema>;

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    getValues,
    setValue,
    watch,
    control,
    formState,
  } = useForm<FormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: defaultDob,
      gender: "Female",
      joinedDate: today,
      userType: 0,
    },
    mode: "onChange",
  });

  const userData = watch();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    hookFormSubmit(() => {
      setShowConfirmModal(true);
    })(e);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    onSubmit(getValues() as UserFormData);
  };

  const showPasswordDisplay = (password: string) => {
    setGeneratedPassword(password);
    setShowPasswordModal(true);
  };

  const handleInputChange = (field: keyof UserFormData, value: any) => {
    setValue(field as any, value, { shouldValidate: true });
  };

  return {
    userData,
    errors,
    showConfirmModal,
    showPasswordModal,
    generatedPassword,
    userTypes,
    register,
    handleInputChange,
    handleSubmit,
    handleConfirmSubmit,
    setShowConfirmModal,
    setShowPasswordModal,
    showPasswordDisplay,
    control,
    formState,
  };
};

export default useCreateUserForm;
