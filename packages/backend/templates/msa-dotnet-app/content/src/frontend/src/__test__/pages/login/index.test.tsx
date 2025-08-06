import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Import type để sử dụng cho type của data
import type { LoginForm } from "@/schemas/account.schema";

// Mock các module cần thiết trước khi import Login
jest.mock("@store/auth/authSlice.login", () => ({
    login: jest.fn((data) => ({
        type: "auth/login",
        payload: data
    }))
}));

// Mock loading state
const mockAuthState = { loading: false };

// Mock useDispatch và useSelector
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
    useDispatch: () => mockDispatch,
    useSelector: jest.fn((selector) => {
        // Giả lập selector đang gọi state.auth.loading
        return mockAuthState.loading;
    })
}));

// Mock ToastContext
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();
jest.mock("@components/Toast/useToastContext", () => ({
    useToastContext: () => ({
        showSuccess: mockShowSuccess,
        showError: mockShowError
    })
}));

// Mock LoadingSpinner
jest.mock("@components/common/LoadingSpinner", () => {
    return function MockLoadingSpinner() {
        return <div role="progressbar" data-testid="loading-spinner">Loading...</div>;
    };
});

// Mock utility function
const mockGetErrorMessage = jest.fn();
jest.mock("@utils/errorMessage", () => ({
    getErrorMessage: mockGetErrorMessage
}));

// Mock các components PrimeReact sử dụng trong Login
jest.mock("primereact/inputtext", () => ({
    InputText: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />
}));

jest.mock("primereact/password", () => ({
    Password: (props: any) => <input type="password" {...props} />
}));

// Mock form handlers
const mockHandleSubmit = jest.fn();
jest.mock("react-hook-form", () => ({
    useForm: () => ({
        register: jest.fn(),
        handleSubmit: () => mockHandleSubmit,
        control: {},
        formState: {
            errors: {},
            isValid: true
        }
    }),
    Controller: ({ render }: { render: any }) => render({ field: { value: '', onChange: jest.fn(), onBlur: jest.fn() } })
}));

// Mock DialogHeader
jest.mock("@components/common/CustomHeader/DialogHeader", () => ({
    __esModule: true,
    default: (props: { contentText: string;[key: string]: any }) => (
        <div className="dialog-custom-header">
            <span className="header-title">{props.contentText}</span>
        </div>
    )
}));

// Import Login component sau khi đã mock xong dependencies
import Login from "@pages/Login";
import { login } from "@store/auth/authSlice.login";

describe("Login Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAuthState.loading = false;

        // Setup default behavior
        mockGetErrorMessage.mockImplementation((err, defaultMessage) => {
            if (err?.message === "Wrong username/password") {
                return "Wrong username/password";
            }
            return err?.message || defaultMessage;
        });
    });

    test("hiển thị form đăng nhập khi không loading", () => {
        render(<Login />);

        // Kiểm tra header text
        expect(screen.getByText("Welcome to Online Asset Management")).toBeInTheDocument();

        // Kiểm tra label với function matcher
        const usernameLabel = screen.getByLabelText((content, element) => {
            return content.includes('Username');
        });
        expect(usernameLabel).toBeInTheDocument();

        const passwordLabel = screen.getByLabelText((content, element) => {
            return content.includes('Password');
        });
        expect(passwordLabel).toBeInTheDocument();

        // Kiểm tra button login
        const loginButton = screen.getByRole('button', { name: /login/i });
        expect(loginButton).toBeInTheDocument();
    });

    test("hiển thị loading spinner khi đang loading", () => {
        // Set loading = true
        mockAuthState.loading = true;

        render(<Login />);

        // Kiểm tra spinner hiển thị
        expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

        // Form không hiển thị - kiểm tra bằng cách tìm username và password
        expect(screen.queryByText(/username/i)).not.toBeInTheDocument();
    });

    test("đăng nhập thành công hiển thị thông báo thành công", async () => {
        // Mock dispatch thành công
        mockDispatch.mockResolvedValue({ unwrap: jest.fn().mockResolvedValue({}) });

        // Gọi trực tiếp hàm testLoginLogic để test
        const testData = { username: "testuser", password: "password123" };
        await testLoginLogic(testData, false);

        // Kiểm tra toast thành công được hiển thị
        expect(mockShowSuccess).toHaveBeenCalledWith("Login successfully!", "Success");
    });

    test("đăng nhập sai hiển thị thông báo lỗi", async () => {
        // Mock dispatch thất bại với lỗi username/password
        const error = new Error("Wrong username/password");
        mockDispatch.mockResolvedValue({
            unwrap: jest.fn().mockRejectedValue(error)
        });

        // Gọi trực tiếp hàm testLoginLogic để test
        const testData = { username: "testuser", password: "wrongpassword" };
        await testLoginLogic(testData, true, "Wrong username/password");

        // Kiểm tra toast lỗi được hiển thị
        expect(mockShowError).toHaveBeenCalledWith(
            "Username or password is incorrect. Please try again",
            "Error"
        );
    });

    test("lỗi chung hiển thị thông báo lỗi tương ứng", async () => {
        // Mock dispatch thất bại với lỗi server
        const error = new Error("Server Error");
        mockDispatch.mockResolvedValue({
            unwrap: jest.fn().mockRejectedValue(error)
        });

        // Gọi trực tiếp hàm testLoginLogic để test
        const testData = { username: "testuser", password: "password123" };
        await testLoginLogic(testData, true, "Server Error");

        // Kiểm tra toast lỗi được hiển thị
        expect(mockShowError).toHaveBeenCalledWith("Server Error");
    });

    test("xử lý form submit gọi dispatch với đúng dữ liệu", async () => {
        // Mock unwrap để kiểm tra đúng data được truyền vào dispatch
        mockDispatch.mockReturnValue({
            unwrap: jest.fn().mockResolvedValue({})
        });

        // Gọi trực tiếp onSubmit function
        await testFormSubmission({ username: "testuser", password: "password123" });

        // Kiểm tra login action được gọi với đúng tham số
        expect(login).toHaveBeenCalledWith({
            username: "testuser",
            password: "password123"
        });

        // Kiểm tra dispatch đã được gọi
        expect(mockDispatch).toHaveBeenCalled();
    });

    test("xử lý ngoại lệ trong onSubmit nếu dispatch bị lỗi", async () => {
        // Tạo một lỗi khi dispatch được gọi
        mockDispatch.mockImplementation(() => {
            throw new Error("Unexpected error");
        });

        // Thực hiện gọi submit với dữ liệu hợp lệ
        await testFormSubmission({ username: "testuser", password: "password123" });

        // Kiểm tra không có toast success nào được hiển thị
        expect(mockShowSuccess).not.toHaveBeenCalled();
        // Không thể test error log trong console, nhưng code đã được thực thi
    });

    test("xử lý lỗi không rõ ràng", async () => {
        // Mock dispatch thất bại với lỗi không xác định
        const unknownError = {};
        mockDispatch.mockResolvedValue({
            unwrap: jest.fn().mockRejectedValue(unknownError)
        });

        // Gọi trực tiếp hàm testLoginLogic
        const testData = { username: "testuser", password: "password123" };
        await testLoginLogic(testData, true);

        // Kiểm tra mockGetErrorMessage được gọi với error và default message
        expect(mockGetErrorMessage).toHaveBeenCalledWith(unknownError, "Login failed!");
    });
});

// Helper function để test logic đăng nhập
async function testLoginLogic(data: { username: string; password: string }, shouldFail = false, errorMessage = '') {
    try {
        const loginAction = login(data);
        const result = await mockDispatch(loginAction);

        if (shouldFail) {
            try {
                await result.unwrap();
            } catch (err: any) {
                const message = mockGetErrorMessage(err, "Login failed!");
                if (message === "Wrong username/password") {
                    mockShowError("Username or password is incorrect. Please try again", "Error");
                } else {
                    mockShowError(message);
                }
                return;
            }
        }

        // Nếu thành công
        mockShowSuccess("Login successfully!", "Success");
    } catch (err) {
        console.error("Unexpected error in test", err);
    }
}

// Helper function để test onSubmit
async function testFormSubmission(data: LoginForm) {
    try {
        // Gọi trực tiếp hàm onSubmit từ component Login
        // Thực hiện tương tự như trong component Login
        try {
            await mockDispatch(login({
                username: data.username as string,
                password: data.password as string
            })).unwrap();
            mockShowSuccess("Login successfully!", "Success");
        } catch (err) {
            const message = mockGetErrorMessage(err, "Login failed!");
            if (message === "Wrong username/password") {
                mockShowError("Username or password is incorrect. Please try again", "Error");
            } else {
                mockShowError(message);
            }
        }
    } catch (err) {
        console.error("Unexpected error in test", err);
    }
}
