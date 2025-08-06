import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { configureStore } from "@reduxjs/toolkit";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import type { UserDetail } from "@/entities/user";

const mockCheckAssignmentUser = jest.fn().mockImplementation(() => Promise.resolve(false));
const mockDisableUser = jest.fn().mockImplementation(() => Promise.resolve({}));
const mockNavigate = jest.fn();

const mockFetchUsers = jest.fn();

jest.mock("react-router-dom", () => {
    return {
        __esModule: true,
        BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        useNavigate: () => mockNavigate,
        useSearchParams: () => [
            new URLSearchParams("page=1&pageSize=10&sortBy=joinedDate&direction=asc"),
            jest.fn()
        ]
    };
});

jest.mock("@/services/userManagementService", () => {
    return {
        userManagementService: {
            checkAssignmentUser: mockCheckAssignmentUser,
            disableUser: mockDisableUser,
            getUsers: jest.fn().mockImplementation(() => Promise.resolve({
                data: {
                    data: [
                        {
                            id: 1,
                            staffCode: "SD0001",
                            fullName: "Test User",
                            firstName: "Test",
                            lastName: "User",
                            username: "testuser",
                            joinedDate: "2020-01-01",
                            userType: 1,
                            dateOfBirth: "1990-01-01",
                            gender: 1,
                            locationId: 1,
                        }
                    ],
                    total: 20,
                    currentPage: 1,
                    pageSize: 10,
                    lastPage: 2
                }
            })),
            getUsersById: jest.fn().mockImplementation(() => Promise.resolve({
                data: {
                    id: 1,
                    staffCode: "SD0001",
                    fullName: "Test User",
                    firstName: "Test",
                    lastName: "User",
                    username: "testuser",
                    joinedDate: "2020-01-01",
                    userType: 1,
                    dateOfBirth: "1990-01-01",
                    gender: 1,
                    locationId: 1,
                }
            })),
        },
    };
});

jest.mock("@store/userSlice", () => {
    return {
        fetchUsers: jest.fn().mockImplementation((params) => {
            return {
                type: 'user/fetchUsers',
                payload: params
            };
        }),
        addUserToTop: jest.fn().mockImplementation((user) => {
            return {
                type: 'user/addUserToTop',
                payload: user
            };
        }),
        clearNewUser: jest.fn().mockImplementation(() => {
            return {
                type: 'user/clearNewUser'
            };
        }),
        resetEditedUser: jest.fn().mockImplementation(() => {
            return {
                type: 'user/resetEditedUser'
            };
        })
    };
});

import UserManagement from "@pages/Users/Management";
import { BrowserRouter } from "react-router-dom";
import { fetchUsers } from "@store/userSlice";

type UserState = {
    users: {
        data: UserDetail[];
        total: number;
        currentPage: number;
        pageSize: number;
        lastPage: number;
    };
    userList: any[];
    editedUser: any;
    loading: boolean;
    totalRecords: number;
    newUser: any;
    error: any;
    selectedUser: any;
};

const mockUser: UserDetail = {
    id: 1,
    staffCode: "SD0001",
    fullName: "Test User",
    firstName: "Test",
    lastName: "User",
    username: "testuser",
    joinedDate: "2020-01-01",
    userType: 1,
    dateOfBirth: "1990-01-01",
    gender: 1,
    locationId: 1,
};

describe("UserManagement", () => {
    let store = configureStore({
        reducer: {
            users: (state: UserState = {
                users: {
                    data: [mockUser],
                    total: 20,
                    currentPage: 1,
                    pageSize: 10,
                    lastPage: 2
                },
                userList: [],
                editedUser: null,
                loading: false,
                totalRecords: 20,
                newUser: null,
                error: null,
                selectedUser: null,
            }, action: any) => {
                if (action.type === 'user/clearNewUser') {
                    return { ...state, newUser: null };
                }
                if (action.type === 'user/resetEditedUser') {
                    return { ...state, editedUser: null };
                }
                if (action.type === 'user/addUserToTop') {
                    return { ...state, users: { ...state.users, data: [mockUser, ...state.users.data] } };
                }
                if (action.type === 'user/fetchUsers/pending') {
                    return { ...state, loading: true };
                }
                if (action.type === 'user/fetchUsers/fulfilled') {
                    return {
                        ...state,
                        loading: false,
                        users: action.payload,
                        totalRecords: action.payload.total
                    };
                }
                if (action.type === 'user/fetchUsers/rejected') {
                    return { ...state, loading: false, error: action.payload };
                }
                if (action.type === 'user/disableUser/pending') {
                    return { ...state, loading: true };
                }
                if (action.type === 'user/disableUser/fulfilled') {
                    return { ...state, loading: false };
                }
                if (action.type === 'user/disableUser/rejected') {
                    return { ...state, loading: false, error: action.payload };
                }
                return state;
            }
        }
    });

    beforeEach(() => {
        jest.clearAllMocks();
        store = configureStore({
            reducer: {
                users: (state: UserState = {
                    users: {
                        data: [mockUser],
                        total: 20,
                        currentPage: 1,
                        pageSize: 10,
                        lastPage: 2
                    },
                    userList: [],
                    editedUser: null,
                    loading: false,
                    totalRecords: 20,
                    newUser: null,
                    error: null,
                    selectedUser: null,
                }, action: any) => {
                    if (action.type === 'user/clearNewUser') {
                        return { ...state, newUser: null };
                    }
                    if (action.type === 'user/resetEditedUser') {
                        return { ...state, editedUser: null };
                    }
                    if (action.type === 'user/addUserToTop') {
                        return { ...state, users: { ...state.users, data: [mockUser, ...state.users.data] } };
                    }
                    if (action.type === 'user/fetchUsers/pending') {
                        return { ...state, loading: true };
                    }
                    if (action.type === 'user/fetchUsers/fulfilled') {
                        return {
                            ...state,
                            loading: false,
                            users: action.payload,
                            totalRecords: action.payload.total
                        };
                    }
                    if (action.type === 'user/fetchUsers/rejected') {
                        return { ...state, loading: false, error: action.payload };
                    }
                    if (action.type === 'user/disableUser/pending') {
                        return { ...state, loading: true };
                    }
                    if (action.type === 'user/disableUser/fulfilled') {
                        return { ...state, loading: false };
                    }
                    if (action.type === 'user/disableUser/rejected') {
                        return { ...state, loading: false, error: action.payload };
                    }
                    return state;
                }
            }
        });
    });

    const renderComponent = () =>
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <UserManagement />
                </BrowserRouter>
            </Provider>
        );

    it("renders UserManagement component", async () => {
        await act(async () => {
            renderComponent();
        });

        expect(screen.getByText("User List")).toBeInTheDocument();
    });

    it("simulates fetchUsers call on component mount", async () => {
        await act(async () => {
            renderComponent();
        });

        expect(fetchUsers).toHaveBeenCalled();
    });

    it("simulates pagination with Next button click", async () => {
        const dispatchSpy = jest.spyOn(store, 'dispatch');

        await act(async () => {
            renderComponent();
        });

        const nextButton = screen.getByRole('button', { name: /next page/i });
        await act(async () => {
            fireEvent.click(nextButton);
        });

        expect(dispatchSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'user/fetchUsers',
                payload: expect.objectContaining({
                    page: 2
                })
            })
        );
    });

    it("handles loading state correctly", async () => {
        await act(async () => {
            renderComponent();
        });

        await act(async () => {
            store.dispatch({ type: 'user/fetchUsers/pending' });
        });

        expect(store.getState().users.loading).toBe(true);

        await act(async () => {
            store.dispatch({
                type: 'user/fetchUsers/fulfilled',
                payload: {
                    data: [mockUser],
                    total: 20,
                    currentPage: 1,
                    pageSize: 10,
                    lastPage: 2
                }
            });
        });

        expect(store.getState().users.loading).toBe(false);
    });

    it("handles error state correctly", async () => {
        const errorMessage = "Error fetching users";

        await act(async () => {
            renderComponent();
        });

        await act(async () => {
            store.dispatch({ type: 'user/fetchUsers/rejected', payload: errorMessage });
        });

        expect(store.getState().users.error).toBe(errorMessage);
    });

    it("handles newUser in store", async () => {
        const storeWithNewUser = configureStore({
            reducer: {
                users: (state: UserState = {
                    users: {
                        data: [mockUser],
                        total: 20,
                        currentPage: 1,
                        pageSize: 10,
                        lastPage: 2
                    },
                    userList: [],
                    editedUser: null,
                    loading: false,
                    totalRecords: 20,
                    newUser: mockUser,
                    error: null,
                    selectedUser: null,
                }, action: any) => {
                    if (action.type === 'user/clearNewUser') {
                        return { ...state, newUser: null };
                    }
                    if (action.type === 'user/addUserToTop') {
                        return {
                            ...state,
                            users: {
                                ...state.users,
                                data: [mockUser, ...state.users.data]
                            }
                        };
                    }
                    return state;
                }
            }
        });

        await act(async () => {
            render(
                <Provider store={storeWithNewUser}>
                    <BrowserRouter>
                        <UserManagement />
                    </BrowserRouter>
                </Provider>
            );
        });

        expect(storeWithNewUser.getState().users.newUser).toBeNull();
    });

    it("handles editedUser in store", async () => {
        const storeWithEditedUser = configureStore({
            reducer: {
                users: (state: UserState = {
                    users: {
                        data: [mockUser],
                        total: 20,
                        currentPage: 1,
                        pageSize: 10,
                        lastPage: 2
                    },
                    userList: [],
                    editedUser: mockUser,
                    loading: false,
                    totalRecords: 20,
                    newUser: null,
                    error: null,
                    selectedUser: null,
                }, action: any) => {
                    if (action.type === 'user/resetEditedUser') {
                        return { ...state, editedUser: null };
                    }
                    if (action.type === 'user/addUserToTop') {
                        return {
                            ...state,
                            users: {
                                ...state.users,
                                data: [mockUser, ...state.users.data]
                            }
                        };
                    }
                    return state;
                }
            }
        });

        await act(async () => {
            render(
                <Provider store={storeWithEditedUser}>
                    <BrowserRouter>
                        <UserManagement />
                    </BrowserRouter>
                </Provider>
            );
        });

        expect(storeWithEditedUser.getState().users.editedUser).toBeNull();
    });

    it("handles search functionality", async () => {
        const dispatchSpy = jest.spyOn(store, 'dispatch');

        await act(async () => {
            renderComponent();
        });

        const searchInput = screen.getByPlaceholderText("Enter Name or Staff code to search");
        await act(async () => {
            fireEvent.change(searchInput, { target: { value: "test" } });
        });

        const searchButton = screen.getByRole('button', { name: '' }).querySelector('.pi-search');
        if (searchButton) {
            const parentButton = searchButton.closest('.p-inputgroup-addon');
            await act(async () => {
                fireEvent.click(parentButton!);
            });
        }

        expect(dispatchSpy).toHaveBeenCalled();
    });

    it("handles user type selection", async () => {
        await act(async () => {
            renderComponent();
        });
        
        const typeDropdowns = screen.getAllByText("Type");
        const typeDropdown = typeDropdowns[0]; // Lấy element đầu tiên
        await act(async () => {
            fireEvent.click(typeDropdown);
        });
        
        await waitFor(() => {
            const dropdown = document.querySelector(".p-multiselect-panel");
            if (dropdown) {
                const option = dropdown.querySelector('.p-multiselect-item');
                if (option) {
                    act(() => {
                        fireEvent.click(option);
                    });
                }
            }
        });
    });

    it("simulates clicking on staff code to view details", async () => {
        await act(async () => {
            renderComponent();
        });

        const staffCode = screen.getByText("SD0001");
        await act(async () => {
            fireEvent.click(staffCode);
        });

        await waitFor(() => {
            expect(screen.getByText("Detail User Information")).toBeInTheDocument();
        });

        const closeButton = screen.getByLabelText("Close");
        await act(async () => {
            fireEvent.click(closeButton);
        });
    });

    it("simulates disabling a user", async () => {
        mockCheckAssignmentUser.mockImplementation(() => Promise.resolve(false));

        await act(async () => {
            renderComponent();
        });

        const deleteIcon = screen.getByText("SD0001").closest('tr')?.querySelector('.pi-times-circle');
        if (deleteIcon) {
            await act(async () => {
                fireEvent.click(deleteIcon);
            });
        }

        await waitFor(() => {
            expect(screen.getByText("Are you sure?")).toBeInTheDocument();
            expect(screen.getByText("Do you want to disable this user?")).toBeInTheDocument();
        });

        const disableButton = screen.getByText("Disable");
        await act(async () => {
            fireEvent.click(disableButton);
        });

        expect(mockDisableUser).toHaveBeenCalled();
    });

    it("simulates trying to disable a user with assignments", async () => {
        mockCheckAssignmentUser.mockImplementation(() => Promise.resolve(true));

        await act(async () => {
            renderComponent();
        });

        const deleteIcon = screen.getByText("SD0001").closest('tr')?.querySelector('.pi-times-circle');
        if (deleteIcon) {
            await act(async () => {
                fireEvent.click(deleteIcon);
            });
        }

        await waitFor(() => {
            expect(screen.getByText("Can not disable user")).toBeInTheDocument();
        });

        const closeButton = screen.getAllByLabelText("Close")[0];
        await act(async () => {
            fireEvent.click(closeButton);
        });
    });

    it("simulates clicking Create New User button", async () => {
        await act(async () => {
            renderComponent();
        });

        const createButton = screen.getByText("Create New User");
        await act(async () => {
            fireEvent.click(createButton);
        });

        expect(mockNavigate).toHaveBeenCalledWith("/users/create");
    });

    it("simulates sorting functionality", async () => {
        const dispatchSpy = jest.spyOn(store, 'dispatch');

        await act(async () => {
            renderComponent();
        });

        const sortableHeader = screen.getByText("Full Name").closest('div');
        await act(async () => {
            fireEvent.click(sortableHeader!);
        });

        expect(dispatchSpy).toHaveBeenCalled();
    });
});