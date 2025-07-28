import EditUserForm from "@/components/User/EditUserForm";
import { ROUTES } from "@constants/routes";

const EditUser = () => (
  <div className="">
    <div className="page-header">
      <h2 className="text-primary font-fold">{ROUTES.EDIT_USER.title}</h2>
    </div>
    <div className="mt-4">
      <EditUserForm />
    </div>
  </div>
);

export default EditUser;
