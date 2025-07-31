import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { AssignmentStatus } from '@/entities/enums';
import * as assignmentService from '@/services/assignmentService';
import AssignmentsManagement from '@/pages/AssignmentsManagement';

// Tạo mock function
const fetchAllAssignmentsMock = jest.fn();

// Mock the redux actions
jest.mock('@/store/assignmentSlice', () => {
    return {
        fetchAdminAssignments: jest.fn().mockImplementation((params) => {
            fetchAllAssignmentsMock(params);
            return { type: 'mock-action' };
        }),
        addAssignmentToTop: jest.fn(),
    };
});

// Không mock component AssignmentsManagement nữa để test trực tiếp

// Mock các module có import trong component chính
jest.mock('@/components/common/BaseDropdown', () => ({
    __esModule: true,
    default: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/constants/routes', () => ({
    ROUTES: {
        ASSIGNMENTS: { path: '/assignments' },
        CREATE_ASSIGNMENT: { path: '/assignments/create' },
    },
}));

// Mock the assignmentService
jest.mock('@/services/assignmentService', () => ({
    adminAssignmentService: {
        getAdminAssignments: jest.fn(),
        deleteAssignment: jest.fn(),
        returnAssignment: jest.fn(),
        getAssignmentDetail: jest.fn(),
    },
}));

jest.mock('@/store/createAssignmentSlice', () => ({
    resetCreateAssignmentState: jest.fn(),
}));

jest.mock('@/store/editAssignmentSlice', () => ({
    resetEditAssignmentState: jest.fn(),
}));

// Mock PrimeReact components
jest.mock('primereact/button', () => ({
    Button: ({ label, onClick, className }: any) => (
        <button onClick={onClick} className={className} data-testid={`button-${label?.replace(/\s+/g, '-').toLowerCase()}`}>
            {label}
        </button>
    ),
}));

jest.mock('primereact/calendar', () => ({
    Calendar: ({ value, onChange, placeholder }: any) => (
        <input
            type="text"
            value={value ? value.toString() : ''}
            onChange={(e) => onChange({ value: e.target.value })}
            placeholder={placeholder}
            data-testid={`calendar-${placeholder?.replace(/\s+/g, '-').toLowerCase()}`}
        />
    ),
}));

jest.mock('primereact/inputtext', () => ({
    InputText: (props: any) => (
        <input
            {...props}
            data-testid="search-input"
        />
    ),
}));

jest.mock('primereact/multiselect', () => ({
    MultiSelect: ({ value, options, onChange, placeholder }: any) => (
        <select
            value={value || ""}
            onChange={(e) => onChange({ value: e.target.value })}
            data-placeholder={placeholder}
            data-testid={`multiselect-${placeholder?.replace(/\s+/g, '-').toLowerCase()}`}
        >
            {options?.map((option: any) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    ),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
    useSearchParams: () => [
        {
            get: (param: string) => {
                switch (param) {
                    case 'page':
                        return '1';
                    case 'pageSize':
                        return '15';
                    case 'sortBy':
                        return 'assignedDate';
                    case 'direction':
                        return 'desc';
                    case 'search':
                        return '';
                    default:
                        return null;
                }
            },
            getAll: () => [],
            set: jest.fn(),
            delete: jest.fn(),
            append: jest.fn(),
        },
        jest.fn(),
    ],
}));

// Mock the toast context
jest.mock('@/components/Toast/useToastContext', () => ({
    useToastContext: () => ({
        showSuccess: jest.fn(),
        showError: jest.fn(),
    }),
}));

// Mock AdminAssignmentTable component
jest.mock('@/components/Assignment/AdminAssignmentTable', () => {
    return {
        __esModule: true,
        default: jest.fn(({ assignments, onEdit, onDelete, onPageChange, onSortChange }) => (
            <div data-testid="mock-admin-assignment-table">
                {assignments.map((assignment: any) => (
                    <div key={assignment.id} data-testid={`assignment-${assignment.id}`}>
                        <span>{assignment.assetCode}</span>
                        <span>{assignment.assetName}</span>
                        <button onClick={() => onEdit(assignment)} data-testid={`edit-btn-${assignment.id}`}>
                            Edit
                        </button>
                        <button onClick={() => onDelete(assignment)} data-testid={`delete-btn-${assignment.id}`}>
                            Delete
                        </button>
                    </div>
                ))}
                <button onClick={() => onPageChange({ first: 15, rows: 15 })} data-testid="page-change">
                    Change Page
                </button>
                <button onClick={() => onSortChange('assetName', 'asc')} data-testid="sort-change">
                    Sort
                </button>
            </div>
        )),
    };
});

// Mock BaseModal component
jest.mock('@/components/common/BaseModal/BaseModal', () => {
    return {
        __esModule: true,
        default: jest.fn(({ visible, onConfirm, onClose }) => (
            visible ? (
                <div data-testid="mock-modal">
                    <button onClick={onConfirm} data-testid="confirm-button">Confirm</button>
                    <button onClick={onClose} data-testid="cancel-button">Cancel</button>
                </div>
            ) : null
        )),
    };
});

// Sử dụng createMockStore với bất kỳ Middleware nào
const mockStore = configureStore();

const mockAssignments = [
    {
        id: 1,
        assetCode: 'LP00001',
        assetName: 'Laptop 1',
        assignedTo: 'User 1',
        assignedBy: 'Admin 1',
        assignedDate: '2023-07-10T00:00:00Z',
        state: AssignmentStatus.ACCEPTED,
    },
    {
        id: 2,
        assetCode: 'LP00002',
        assetName: 'Laptop 2',
        assignedTo: 'User 2',
        assignedBy: 'Admin 1',
        assignedDate: '2023-07-11T00:00:00Z',
        state: AssignmentStatus.PENDING,
    },
];

const initialState = {
    adminAssignments: {
        assignments: mockAssignments,
        loading: false,
        error: null,
        totalRecords: 2,
    },
    createAssignment: {
        createdAssignment: null,
    },
    editAssignment: {
        updatedAssignment: null,
    },
};

describe('AdminAssignmentsPage', () => {
    let store: any;

    beforeEach(() => {
        store = mockStore(initialState);

        // Reset các mock
        fetchAllAssignmentsMock.mockClear();

        // Mock các service API
        (assignmentService.adminAssignmentService.getAdminAssignments as jest.Mock).mockResolvedValue({
            data: mockAssignments,
            total: 2,
        });
        (assignmentService.adminAssignmentService.deleteAssignment as jest.Mock).mockResolvedValue({
            message: 'Delete Assignment Successfully',
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render assignments list correctly', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <AssignmentsManagement />
                </BrowserRouter>
            </Provider>
        );

        // Check page title
        expect(screen.getByText('Assignment List')).toBeInTheDocument();

        // Check if the table is rendered with assignments
        expect(screen.getByTestId('mock-admin-assignment-table')).toBeInTheDocument();
        expect(screen.getByTestId('assignment-1')).toBeInTheDocument();
        expect(screen.getByTestId('assignment-2')).toBeInTheDocument();
    });

    it('should render filters correctly', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <AssignmentsManagement />
                </BrowserRouter>
            </Provider>
        );

        // Check if filters are present
        expect(screen.getByTestId('multiselect-state')).toBeInTheDocument();
        expect(screen.getByTestId('calendar-assigned-date')).toBeInTheDocument();
        expect(screen.getByTestId('button-create-new-assignment')).toBeInTheDocument();
    });

    it('should handle search input', async () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <AssignmentsManagement />
                </BrowserRouter>
            </Provider>
        );

        // Get search input
        const searchInput = screen.getByTestId('search-input');

        // Type in search box
        fireEvent.change(searchInput, { target: { value: 'Laptop' } });

        // Wait for debounce
        await waitFor(() => {
            expect(searchInput).toHaveValue('Laptop');
        }, { timeout: 1100 }); // Wait a bit more than the debounce time (1000ms)
    });

    it('should handle page change', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <AssignmentsManagement />
                </BrowserRouter>
            </Provider>
        );

        // Click on page change button
        fireEvent.click(screen.getByTestId('page-change'));

        // Verify that appropriate function was called
        expect(fetchAllAssignmentsMock).toHaveBeenCalled();
    });

    it('should handle sort change', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <AssignmentsManagement />
                </BrowserRouter>
            </Provider>
        );

        // Click on sort change button
        fireEvent.click(screen.getByTestId('sort-change'));

        // Verify that appropriate function was called
        expect(fetchAllAssignmentsMock).toHaveBeenCalled();
    });

    it('should handle delete assignment', async () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <AssignmentsManagement />
                </BrowserRouter>
            </Provider>
        );

        // Click on delete button
        fireEvent.click(screen.getByTestId('delete-btn-2')); // Assignment with PENDING state can be deleted

        // Modal should be visible
        expect(screen.getByTestId('mock-modal')).toBeInTheDocument();

        // Confirm delete
        fireEvent.click(screen.getByTestId('confirm-button'));

        // Check if delete API was called
        await waitFor(() => {
            expect(assignmentService.adminAssignmentService.deleteAssignment).toHaveBeenCalledWith(2);
        });
    });

    it('should cancel delete operation', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <AssignmentsManagement />
                </BrowserRouter>
            </Provider>
        );

        // Click on delete button
        fireEvent.click(screen.getByTestId('delete-btn-2'));

        // Modal should be visible
        expect(screen.getByTestId('mock-modal')).toBeInTheDocument();

        // Cancel delete
        fireEvent.click(screen.getByTestId('cancel-button'));

        // Modal should be closed
        expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });

    it('should handle edit assignment', () => {
        const navigateMock = jest.fn();
        jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigateMock);

        render(
            <Provider store={store}>
                <BrowserRouter>
                    <AssignmentsManagement />
                </BrowserRouter>
            </Provider>
        );

        // Click on edit button for PENDING assignment
        fireEvent.click(screen.getByTestId('edit-btn-2'));

        // Check if navigate was called
        expect(navigateMock).toHaveBeenCalled();
    });

    it('should display error message when there is an error', () => {
        const errorState = {
            ...initialState,
            adminAssignments: {
                ...initialState.adminAssignments,
                error: 'Failed to load assignments',
            },
        };

        const errorStore = mockStore(errorState);

        render(
            <Provider store={errorStore}>
                <BrowserRouter>
                    <AssignmentsManagement />
                </BrowserRouter>
            </Provider>
        );

        // Error message should be displayed
        expect(screen.getByText('Failed to load assignments')).toBeInTheDocument();
    });

    it('should handle failed delete operation', async () => {
        // Mock the service to reject
        (assignmentService.adminAssignmentService.deleteAssignment as jest.Mock).mockRejectedValue(
            new Error('Cannot delete assignment')
        );

        // Create a mock for the toast functions
        const mockShowError = jest.fn();
        const mockShowSuccess = jest.fn();

        // Override the useToastContext mock for this specific test
        jest.spyOn(require('@/components/Toast/useToastContext'), 'useToastContext').mockReturnValue({
            showSuccess: mockShowSuccess,
            showError: mockShowError
        });

        render(
            <Provider store={store}>
                <BrowserRouter>
                    <AssignmentsManagement />
                </BrowserRouter>
            </Provider>
        );

        // Click delete button
        fireEvent.click(screen.getByTestId('delete-btn-2'));

        // Modal should be visible
        expect(screen.getByTestId('mock-modal')).toBeInTheDocument();

        // Confirm delete
        fireEvent.click(screen.getByTestId('confirm-button'));

        // Wait for the API call to be rejected
        await waitFor(() => {
            expect(assignmentService.adminAssignmentService.deleteAssignment).toHaveBeenCalledWith(2);
        });

        // Wait for the error toast to be shown
        await waitFor(() => {
            expect(mockShowError).toHaveBeenCalled();
        });
    });
});
