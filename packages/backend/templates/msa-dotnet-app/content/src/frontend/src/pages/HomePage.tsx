import { Button } from "primereact/button";

export default function HomePage() {
  
  return (
    <div className="p-4">
      <h1 className="text-primary mb-4">🏠 Home Page</h1>
      <div className="card">
        <p className="text-main mb-3">Welcome you to HomePage!</p>
        <Button label="Click me" icon="pi pi-check" className="primary" />
      </div>      
    </div>
  );
}