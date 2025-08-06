import { useToastContext } from "@/components/Toast/useToastContext";
import type { CreateUserFormRef } from "@/components/User/CreateUserForm";
import CreateUserForm from "@/components/User/CreateUserForm";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import type { UserFormData } from "@/entities/user";
import { userService } from "@/services/userService";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateUser = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastContext();
  const createUserFormRef = useRef<CreateUserFormRef>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (userData: UserFormData) => {
    setIsLoading(true);
    userService
      .createUser(userData)
      .then((result) => {
        if (createUserFormRef.current && result.data.rawPassword) {
          createUserFormRef.current.showPasswordDisplay(result.data.rawPassword);
        }
        showSuccess(`User has been created successfully`, "Success");
      })
      .catch((error) => {
        const errorMessage = error.message || "Unable to create user";
        showError(errorMessage, "Error");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleCancel = () => {
    navigate("/users");
  };

  return (
    <div className="relative">
      <div className="page-header">
        <h2 className="text-primary font-fold">Create New User</h2>
      </div>

      <div className="mt-4 relative">
        {isLoading && (
          <div className="absolute top-0 left-0 w-full h-full bg-white-alpha-60 flex align-items-center justify-content-center z-5">
            <LoadingSpinner />
          </div>
        )}
        <CreateUserForm onSubmit={handleSubmit} onCancel={handleCancel} ref={createUserFormRef} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default CreateUser;
