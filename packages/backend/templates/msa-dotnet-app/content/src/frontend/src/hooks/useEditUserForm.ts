import { USER_TYPE_ENUM } from "@/constants/user";
import type { SelectOption } from "@/entities/common";
import type { EditUserPayload, UserFormData } from "@/entities/user";
import { userFormSchema } from "@/schemas/user.schema";
import { useToastContext } from "@components/Toast/useToastContext";
import { ROUTES } from "@constants/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { type AppDispatch } from "@store";
import { editUserThunk } from "@store/userSlice";
import { formatDateWithoutTime } from "@utils/datetime";
import { paramsSerializer } from "@utils/formatUtils";
import { getGenderEnum } from "@utils/userUtils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type z from "zod";

const useEditUserForm = (paramsUserList: object) => {
  const dispatch = useDispatch<AppDispatch>();
  const [userId, setUserId] = useState<number>();
  const { showSuccess } = useToastContext();
  const navigate = useNavigate();

  const userTypes: SelectOption[] = [
    { name: "Admin", value: USER_TYPE_ENUM.ADMIN },
    { name: "Staff", value: USER_TYPE_ENUM.STAFF },
  ];
  type FormValues = z.infer<typeof userFormSchema>;

  const today = new Date();
  const defaultDob = new Date();
  defaultDob.setFullYear(today.getFullYear() - 18);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const {
    register,
    formState: { errors },
    formState,
    setValue,
    watch,
    control,
    handleSubmit: hookFormSubmit,
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

  const onSubmit = async (data: UserFormData, paramsUserList: object) => {
    if (!userId || !data.dateOfBirth || !data.joinedDate) {
      return;
    }

    const payload: EditUserPayload = {
      id: userId,
      dateOfBirth: formatDateWithoutTime(data.dateOfBirth),
      gender: getGenderEnum(data.gender),
      joinedDate: formatDateWithoutTime(data.joinedDate),
      userType: Number(data.userType),
    };

    await dispatch(editUserThunk(payload)).unwrap();
    showSuccess("User updated successfully", "Success");
    navigate(`${ROUTES.USERS.path}` + `?${paramsSerializer(paramsUserList)}`);
  };

  const handleSubmit = hookFormSubmit((data) => onSubmit(data as UserFormData, paramsUserList));

  const handleInputChange = (field: keyof UserFormData, value: any) => {
    setValue(field as any, value, { shouldValidate: true });
  };

  return {
    userData,
    errors,
    showConfirmModal,
    userTypes,
    register,
    handleInputChange,
    handleSubmit,
    setShowConfirmModal,
    control,
    formState,
    setValue,
    setUserId,
  };
};

export default useEditUserForm;
