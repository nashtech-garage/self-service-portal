import { Component, type ErrorInfo, type ReactNode} from "react";
import { Button } from "primereact/button";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            error,
            errorInfo
        });
    }

    private handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex align-items-center justify-content-center min-h-screen bg-gray-100">
                    <div className="surface-card p-4 shadow-2 border-round w-full lg:w-6" style={{ maxWidth: '90vw' }}>
                        <div className="text-center mb-5">
                            <div className="text-900 text-3xl font-medium mb-3">Oops! Something went wrong</div>
                            <div className="text-600 font-medium line-height-3 break-words">
                                {this.state.error?.message}
                            </div>
                        </div>
                        <div className="flex justify-content-center">
                            <Button 
                                label="Try Again" 
                                icon="pi pi-refresh" 
                                onClick={this.handleReset}
                                className="p-button-primary"
                            />
                        </div>
                        {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                            <div className="mt-4 p-3 border-round surface-ground overflow-auto" style={{ maxHeight: '300px' }}>
                                <pre className="text-sm text-600 whitespace-pre-wrap break-words">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;