import { Card } from "primereact/card";

const Forbidden = () => (
  <Card title="Error 403 - Forbidden" className="text-primary">
    <p className="text-xl mt-4 text-black-alpha-80">You don’t have permission to access this page.</p>
  </Card>
);

export default Forbidden;
