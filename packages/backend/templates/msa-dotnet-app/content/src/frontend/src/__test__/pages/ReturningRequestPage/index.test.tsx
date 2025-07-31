import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { RETURNING_REQUEST_STATE } from '@/constants/returnRequest';

// Khai báo mockUpdateParams trước khi sử dụng
const mockUpdateParams = jest.fn();

// Mock useReturnRequest hook
jest.mock('@/hooks/useReturnRequest', () => ({
    useReturnRequest: jest.fn().mockReturnValue({
        params: {
            page: 1,
            pageSize: 15,
            sortBy: 'assignedDate',
            direction: 'desc',
            keySearch: '',
            states: [],
            returnedDate: null,
        },
        updateParams: mockUpdateParams,
    }),
}));

// Mock redux actions
const fetchReturningRequestsMock = jest.fn();
jest.mock('@/store/returningRequestSlice', () => ({
    fetchReturningRequests: jest.fn().mockImplementation((params) => {
        fetchReturningRequestsMock(params);
        return { type: 'mock-action' };
    }),
}));

// Đảm bảo import component sau khi đã mock các dependencies
import ReturningRequestPage from '@/pages/ReturningRequest';

// Mock datetime utils
jest.mock('@/utils/datetime', () => ({
    createAdjustedDate: jest.fn((date) => date),
    formatDateForApi: jest.fn(() => '2023-07-15'),
}));

// Mock các component con
jest.mock('@components/ReturningRequest/ReturningRequestTable', () => ({
    __esModule: true,
    default: jest.fn(({ onPageChange }) => (
        <div data-testid="returning-request-table">
            <button data-testid="page-change-button" onClick={() => onPageChange({ page: 1, rows: 10 })}>
                Change Page
            </button>
        </div>
    )),
}));

// Mock components thành phần
jest.mock('primereact/calendar', () => ({
    Calendar: ({ value, onChange, placeholder }: { value: Date | null; onChange: (e: { value: Date | null }) => void; placeholder?: string }) => (
        <div>
            <input
                data-testid="calendar-input"
                value={value ? value.toString() : ''}
                onChange={(e) => onChange({ value: new Date(e.target.value) })}
                placeholder={placeholder}
            />
            <button data-testid="clear-date-button" onClick={() => onChange({ value: null })}>
                Clear Date
            </button>
        </div>
    ),
}));

jest.mock('primereact/inputtext', () => ({
    InputText: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
        <input
            data-testid="search-input"
            {...props}
        />
    ),
}));

jest.mock('primereact/multiselect', () => ({
    MultiSelect: ({ value, onChange, placeholder }: { value: number[] | null; onChange: (e: { value: number[] }) => void; placeholder?: string }) => (
        <select
            data-testid="state-select"
            onChange={(e) => onChange({ value: [parseInt(e.target.value)] })}
            value={(value || []).map(String)}
        >
            <option value={RETURNING_REQUEST_STATE.WAITING_FOR_RETURNING}>Waiting for returning</option>
            <option value={RETURNING_REQUEST_STATE.COMPLETED}>Completed</option>
        </select>
    ),
}));

jest.mock('@components/common/BaseDropdown', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="base-dropdown">{children}</div>,
}));

const mockStore = configureStore();

const mockReturningRequests = [
    {
        id: 1,
        assetCode: 'LP00001',
        assetName: 'Laptop 1',
        requestedBy: 'User 1',
        assignedDate: '2023-07-10T00:00:00Z',
        acceptedBy: 'Admin 1',
        returnedDate: '2023-07-15T00:00:00Z',
        state: RETURNING_REQUEST_STATE.WAITING_FOR_RETURNING,
    },
    {
        id: 2,
        assetCode: 'LP00002',
        assetName: 'Laptop 2',
        requestedBy: 'User 2',
        assignedDate: '2023-07-11T00:00:00Z',
        acceptedBy: 'Admin 1',
        returnedDate: '2023-07-16T00:00:00Z',
        state: RETURNING_REQUEST_STATE.COMPLETED,
    },
];

const initialState = {
    returningRequest: {
        data: mockReturningRequests,
        loading: false,
        error: null,
        totalRecords: 2,
        currentPage: 1,
        pageSize: 15,
        lastPage: 1,
    },
};

describe('ReturningRequestPage', () => {
    let store: any;

    beforeEach(() => {
        store = mockStore(initialState);
        fetchReturningRequestsMock.mockClear();
        mockUpdateParams.mockClear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders returning request page correctly', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <ReturningRequestPage />
                </BrowserRouter>
            </Provider>
        );

        expect(screen.getByTestId('returning-request-table')).toBeInTheDocument();
        expect(screen.getByTestId('base-dropdown')).toBeInTheDocument();
        expect(screen.getByTestId('calendar-input')).toBeInTheDocument();
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
        expect(fetchReturningRequestsMock).toHaveBeenCalled();
    });

    it('should handle search input and Enter key', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <ReturningRequestPage />
                </BrowserRouter>
            </Provider>
        );

        const searchInput = screen.getByTestId('search-input');
        fireEvent.change(searchInput, { target: { value: 'Laptop' } });
        fireEvent.keyDown(searchInput, { key: 'Enter' });

        expect(mockUpdateParams).toHaveBeenCalledWith({
            keySearch: 'Laptop',
            page: 1,
        });
    });

    it('should handle state filter change', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <ReturningRequestPage />
                </BrowserRouter>
            </Provider>
        );

        const stateSelect = screen.getByTestId('state-select');
        fireEvent.change(stateSelect, { target: { value: RETURNING_REQUEST_STATE.WAITING_FOR_RETURNING } });

        expect(mockUpdateParams).toHaveBeenCalledWith({
            states: [RETURNING_REQUEST_STATE.WAITING_FOR_RETURNING],
            page: 1,
        });
    });

    it('should handle returned date filter change', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <ReturningRequestPage />
                </BrowserRouter>
            </Provider>
        );

        const dateInput = screen.getByTestId('calendar-input');
        fireEvent.change(dateInput, { target: { value: '2023-07-15' } });

        expect(mockUpdateParams).toHaveBeenCalledWith({
            returnedDate: '2023-07-15',
            page: 1,
        });
    });

    it('should handle clear returned date filter', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <ReturningRequestPage />
                </BrowserRouter>
            </Provider>
        );

        const clearDateButton = screen.getByTestId('clear-date-button');
        fireEvent.click(clearDateButton);

        expect(mockUpdateParams).toHaveBeenCalledWith({
            returnedDate: null,
            page: 1,
        });
    });

    it('should handle page change', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <ReturningRequestPage />
                </BrowserRouter>
            </Provider>
        );

        const pageChangeButton = screen.getByTestId('page-change-button');
        fireEvent.click(pageChangeButton);

        expect(mockUpdateParams).toHaveBeenCalledWith({
            page: 2,
            pageSize: 10,
        });
    });
});
