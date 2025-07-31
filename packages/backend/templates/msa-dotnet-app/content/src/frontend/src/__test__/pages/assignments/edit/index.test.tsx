import EditAssignment from "@/pages/AssignmentsManagement/Edit";
import { describe, expect, it, jest } from "@jest/globals";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock các dependencies
jest.mock("@/components/Assignment/EditAssignmentForm", () => ({
    EditAssignmentForm: () => <div data-testid="edit-assignment-form">Edit Assignment Form</div>
}), { virtual: true });

jest.mock("react-redux", () => ({
    useDispatch: () => jest.fn(),
    useSelector: () => ({}),
    Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

jest.mock("react-router-dom", () => ({
    useNavigate: () => jest.fn(),
    useParams: () => ({ assignmentId: "1" }),
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

jest.mock("@/components/Toast/ToastProvider", () => ({
    ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}), { virtual: true });

jest.mock("@/components/Toast/ToastContext", () => ({
    useToastContext: () => ({
        showSuccess: jest.fn(),
        showError: jest.fn(),
    })
}), { virtual: true });

describe("EditAssignment Component", () => {
    it("renders without crashing", () => {
        const { getByTestId } = render(<EditAssignment />);
        expect(getByTestId("edit-assignment-form")).toBeInTheDocument();
    });
});
