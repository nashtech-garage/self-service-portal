import ErrorBoundary from "@/components/common/ErrorBoundary";
import Loading from "@/components/common/Loading";
import { ToastProvider } from "@/components/Toast/ToastProvider";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { store } from "./store";

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <ToastProvider>
            <Loading />
            <AppRoutes />
          </ToastProvider>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
