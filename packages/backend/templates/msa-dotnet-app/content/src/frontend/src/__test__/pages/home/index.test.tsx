import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import HomePage from '@/pages/Home';
import { useHome } from '@/hooks/useHome';
import { useTableQueryParams } from '@/hooks/useTableQueryParams';
import { ROUTES } from '@/constants/routes';
import { AssignmentStatus } from '@/entities/enums';

// Mock các hooks và components
jest.mock('@/hooks/useHome');
jest.mock('@/hooks/useTableQueryParams');
jest.mock('@/components/Home/HomeTable', () => ({
    __esModule: true,
    default: jest.fn(() => <div data-testid="home-table">Mocked HomeTable</div>)
}));

describe('HomePage Component', () => {
    // Mock data cho các tests
    const mockAssignments = [
        {
            id: '1',
            assetCode: 'LP000001',
            assetName: 'Dell XPS 13',
            assetCategoryName: 'Laptop',
            assignedDate: '2023-06-15T00:00:00',
            status: AssignmentStatus.ACCEPTED
        },
        {
            id: '2',
            assetCode: 'LP000002',
            assetName: 'Macbook Pro 16',
            assetCategoryName: 'Laptop',
            assignedDate: '2023-06-20T00:00:00',
            status: AssignmentStatus.PENDING
        }
    ];

    const mockTableParams = {
        page: 1,
        pageSize: 10,
        sortBy: 'assignedDate',
        direction: -1,
        onPageChange: jest.fn(),
        onSort: jest.fn(),
        sortOrder: -1
    };

    const mockHomeHook = {
        assignments: mockAssignments,
        loading: false,
        error: null,
        totalRecords: 2,
        refreshData: jest.fn()
    };

    beforeEach(() => {
        // Reset mocks trước mỗi test
        jest.clearAllMocks();

        // Set up mocks cho các hooks
        (useTableQueryParams as jest.Mock).mockReturnValue(mockTableParams);
        (useHome as jest.Mock).mockReturnValue(mockHomeHook);
    });

    test('renders homepage with title and data table', () => {
        render(<HomePage />);

        // Kiểm tra tiêu đề trang
        expect(screen.getByText(ROUTES.MY_ASSIGNMENTS.tabletitle)).toBeInTheDocument();

        // Kiểm tra HomeTable được hiển thị
        expect(screen.getByTestId('home-table')).toBeInTheDocument();
    });

    test('passes correct props to HomeTable component', () => {
        render(<HomePage />);

        // Kiểm tra HomeTable được gọi với đúng props
        const HomeTable = require('@/components/Home/HomeTable').default;

        expect(HomeTable).toHaveBeenCalled();
        const callArgs = HomeTable.mock.calls[0][0];

        expect(callArgs.assignments).toEqual(mockAssignments);
        expect(callArgs.loading).toBe(false);
        expect(callArgs.totalRecords).toBe(2);
        expect(callArgs.page).toBe(1);
        expect(callArgs.pageSize).toBe(10);
        expect(callArgs.sortBy).toBe('assignedDate');
        expect(callArgs.direction).toBe(-1);
        expect(callArgs.onDataChanged).toBe(mockHomeHook.refreshData);
    });

    test('displays loading state correctly', () => {
        // Override mock để hiển thị trạng thái loading
        (useHome as jest.Mock).mockReturnValue({
            ...mockHomeHook,
            loading: true
        });

        render(<HomePage />);

        const HomeTable = require('@/components/Home/HomeTable').default;
        expect(HomeTable).toHaveBeenCalled();

        // Kiểm tra prop loading đã được truyền đúng giá trị
        const callArgs = HomeTable.mock.calls[0][0];
        expect(callArgs.loading).toBe(true);
    });

    test('displays error message when error occurs', () => {
        const errorMessage = 'Failed to load assignments';

        // Override mock để hiển thị lỗi
        (useHome as jest.Mock).mockReturnValue({
            ...mockHomeHook,
            error: errorMessage
        });

        render(<HomePage />);

        // Kiểm tra thông báo lỗi được hiển thị
        expect(screen.getByText(errorMessage)).toBeInTheDocument();

        // Kiểm tra HomeTable không được hiển thị
        expect(screen.queryByTestId('home-table')).not.toBeInTheDocument();
    });

    test('calls useHome with correct query parameters', () => {
        render(<HomePage />);

        // Kiểm tra useHome được gọi với đúng tham số
        expect(useHome).toHaveBeenCalledWith({
            page: 1,
            pageSize: 10,
            sortBy: 'assignedDate',
            direction: -1
        });
    });

    test('updates when query parameters change', async () => {
        // Render component
        render(<HomePage />);

        // Mock thay đổi tham số truy vấn
        const updatedTableParams = {
            ...mockTableParams,
            page: 2,
            sortBy: 'assetName',
            direction: 1
        };

        (useTableQueryParams as jest.Mock).mockReturnValue(updatedTableParams);

        // Re-render component với tham số mới
        render(<HomePage />);

        // Kiểm tra useHome được gọi lại với tham số mới
        await waitFor(() => {
            expect(useHome).toHaveBeenCalledWith(
                expect.objectContaining({
                    page: 2,
                    sortBy: 'assetName',
                    direction: 1
                })
            );
        });
    });
});
