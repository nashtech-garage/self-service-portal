import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "primeicons/primeicons.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.css";
import "primeflex/primeflex.css";
import { PrimeReactProvider } from "primereact/api";
import "@css/main.scss";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PrimeReactProvider>
      <App />
    </PrimeReactProvider>
  </StrictMode>
);
