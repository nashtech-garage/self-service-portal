import CreateAssetForm from "@components/Asset/CreateAssetForm";

document.title = "Create New Asset";
const CreateAssetPage = () => {
  return (
    <div className="w-full">
      <h2 className="text-primary">Create New Asset</h2>
      <CreateAssetForm />
    </div>
  );
};
export default CreateAssetPage;
