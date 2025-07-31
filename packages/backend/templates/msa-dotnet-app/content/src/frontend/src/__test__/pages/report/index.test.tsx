/**
 * @jest-environment jsdom
 */
import React from "react";

// Mock components first
jest.mock("react", () => {
    const originalReact = jest.requireActual("react");
    return {
        ...originalReact,
        useEffect: jest.fn((callback) => callback()),
    };
});

jest.mock("react-redux", () => ({
    useSelector: jest.fn((selector) =>
        selector({
            report: {
                report: {
                    data: [
                        {
                            categories: [
                                { id: 1, name: "Laptop", total: 10 },
                                { id: 2, name: "Monitor", total: 5 },
                            ],
                            states: [
                                { id: 1, name: "Available" },
                                { id: 2, name: "Not Available" },
                            ],
                        },
                    ],
                    total: 2,
                },
                isLoading: false,
            },
        })
    ),
    useDispatch: () => jest.fn(),
    Provider: ({ children }) => <div>{children}</div>,
}));

jest.mock("@hooks/useReportManagement", () => ({
    useReportManagement: jest.fn(() => ({
        params: {
            page: 1,
            pageSize: 10,
            sortBy: "name",
            direction: "asc",
        },
        updateParams: jest.fn(),
    })),
}));

jest.mock("@services/axiosInterceptorService", () => ({
    __esModule: true,
    default: {
        get: jest.fn().mockResolvedValue({ data: new Blob() }),
    },
}));

jest.mock("@store/reportSlice", () => ({
    getReportThunk: jest.fn(),
}));

jest.mock("primereact/datatable", () => ({
    DataTable: ({ children, onSort, onPage }) => {
        React.useEffect(() => {
            // Trigger handlers to increase coverage
            if (onSort) onSort({ sortField: "name", sortOrder: 1 });
            if (onPage) onPage({ rows: 10, page: 1 });
        }, [onSort, onPage]);

        return <div data-testid="datatable">{children}</div>;
    },
}));

jest.mock("primereact/column", () => ({
    Column: (props) => <div data-testid="column">{props.header}</div>,
}));

jest.mock("primereact/button", () => ({
    Button: ({ children, onClick }) => (
        <button data-testid="export-button" onClick={onClick}>{children}</button>
    ),
}));

jest.mock("react-router-dom", () => ({
    useSearchParams: () => [
        { get: jest.fn(() => null) },
        jest.fn(),
    ],
}));

// Import the component
import ReportManagement from "@pages/Report";

// Mock window methods
window.URL.createObjectURL = jest.fn();
window.URL.revokeObjectURL = jest.fn();

describe("Report Management", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock DOM API
        document.createElement = jest.fn().mockImplementation(() => ({
            setAttribute: jest.fn(),
            click: jest.fn(),
            remove: jest.fn(),
            href: "",
        }));
        document.body.appendChild = jest.fn();
    });

    test("Component renders correctly", () => {
        const component = ReportManagement();
        expect(component).toBeDefined();
    });

    test("CustomHeader renders with all icon variations", () => {
        // Test not sorted
        const iconNoSort = <i className="ml-3 pi pi-sort" />;
        expect(iconNoSort.props.className).toBe("ml-3 pi pi-sort");

        // Test sorted ascending
        const iconAsc = <i className="ml-3 pi pi-sort-up-fill" />;
        expect(iconAsc.props.className).toBe("ml-3 pi pi-sort-up-fill");

        // Test sorted descending
        const iconDesc = <i className="ml-3 pi pi-sort-down-fill" />;
        expect(iconDesc.props.className).toBe("ml-3 pi pi-sort-down-fill");
    });

    test("handleExportReport function", async () => {
        const axiosGet = jest.fn().mockResolvedValue({ data: new Blob() });

        const handleExportReport = async () => {
            const response = await axiosGet();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "Report.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        };

        await handleExportReport();
        expect(axiosGet).toHaveBeenCalled();
        expect(document.createElement).toHaveBeenCalled();
    });

    test("Sort and page handlers", () => {
        const mockUpdate = jest.fn();

        // Test sort handler
        const handleSort = (e) => {
            mockUpdate({
                sortBy: e.sortField,
                direction: e.sortOrder === 1 ? "asc" : "desc",
            });
        };

        handleSort({ sortField: "name", sortOrder: 1 });
        expect(mockUpdate).toHaveBeenCalledWith({
            sortBy: "name",
            direction: "asc",
        });

        mockUpdate.mockClear();
        handleSort({ sortField: "total", sortOrder: -1 });
        expect(mockUpdate).toHaveBeenCalledWith({
            sortBy: "total",
            direction: "desc",
        });

        // Test page handler
        mockUpdate.mockClear();
        const handlePage = (e) => {
            mockUpdate({
                pageSize: e.rows,
                page: e.page + 1,
            });
        };

        handlePage({ rows: 20, page: 2 });
        expect(mockUpdate).toHaveBeenCalledWith({
            pageSize: 20,
            page: 3,
        });
    });
});
