import BaseDropdown from "@components/common/BaseDropdown";
import CustomModal from "@components/common/BaseModal/BaseModal";
import { SORT_OPTION_NAMES, SORT_OPTION_VALUES } from "@constants/pagination";
import { ROUTES } from "@constants/routes";
import { USER_GENDER_NAMES, USER_LOCATION_NAMES, USER_TYPE_NAME, USER_TYPE_OPTIONS } from "@constants/user";
import "@css/CommonTable.scss";
import "@css/Paginator.scss";
import "@css/UserManagement.scss";
import type { UserDetail } from "@/entities/user";
import { useActionTableUser } from "@hooks/useUserManagement";
import { userManagementService } from "@services/userManagementService";
import type { AppDispatch, RootState } from "@store/index";
import { addUserToTop, clearNewUser, fetchUsers, resetEditedUser } from "@store/userSlice";
import { formatDate } from "@utils/formatUtils";
import { debounce } from "lodash";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { MultiSelect, type MultiSelectChangeEvent } from "primereact/multiselect";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const UserManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { users, editedUser, loading, totalRecords, newUser } = useSelector((state: RootState) => state.users);
  const [showAssignmentWarning, setShowAssignmentWarning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userSelected, setUserSelected] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const { params, updateParams } = useActionTableUser("user");
  const skipApiCallRef = useRef(false);
  const justAddedOrEditedRef = useRef(false);

  useEffect(() => {
    if (newUser) {
      justAddedOrEditedRef.current = true;
      dispatch(addUserToTop(newUser));
      dispatch(clearNewUser());
    }
  }, [newUser, dispatch]);

  useEffect(() => {
    if (editedUser) {
      justAddedOrEditedRef.current = true;
      dispatch(addUserToTop(editedUser));
      dispatch(resetEditedUser());
    }
  }, [editedUser, dispatch]);

  useEffect(() => {
    if (justAddedOrEditedRef.current) {
      skipApiCallRef.current = true;
      justAddedOrEditedRef.current = false;
      return;
    }

    if (skipApiCallRef.current) {
      skipApiCallRef.current = false;
      return;
    }
    dispatch(fetchUsers(params));
  }, [params, dispatch]);

  const handleDisableUser = (user: UserDetail) => {
    userManagementService.checkAssignmentUser(user.id).then((result) => {
      if (result) {
        setShowAssignmentWarning(true);
      } else {
        setShowConfirmation(true);
        setUserSelected(user.id);
      }
    });
  };

  const CustomHeader = (
    name: string,
    field: string,
    sortOrder: string,
    sortField?: string,
    defaultSortField?: string,
    defaultSortOrder: (typeof SORT_OPTION_NAMES)[keyof typeof SORT_OPTION_NAMES] = SORT_OPTION_NAMES[
      SORT_OPTION_VALUES.asc
    ]
  ) => {
    const isSorted = field === sortField || (!sortField && field === defaultSortField);
    const effectiveSortOrder = sortField ? sortOrder : defaultSortOrder;
    let icon;
    if (!isSorted) {
      icon = <i className="ml-3 pi pi-sort" />;
    } else if (effectiveSortOrder === SORT_OPTION_NAMES[SORT_OPTION_VALUES.asc]) {
      icon = <i className="ml-3 pi pi-sort-up-fill" />;
    } else {
      icon = <i className="ml-3 pi pi-sort-down-fill" />;
    }

    return (
      <div
        className="w-full flex align-items-center bg-transparent"
        style={{ color: isSorted ? "rgba(207, 35, 56, 1)" : "inherit" }}
      >
        <span>{name}</span>
        {icon}
      </div>
    );
  };

  const renderStaffCode = (rowData: UserDetail) => (
    <div
      className="am-cell cursor-pointer"
      style={{ padding: "0px" }}
      onClick={() => {
        handleClickStaffCode(rowData);
      }}
    >
      {rowData.staffCode}
    </div>
  );

  const handleClickStaffCode = async (user: UserDetail) => {
    setSelectedUser(null);
    const data = await userManagementService.getUsersById(user.id);
    setSelectedUser(data.data);
    setShowPopup(true);
  };

  const fullNameBodyColumn = (item: UserDetail) => (
    <div>
      <div className="am-cell render-3-dot">{item.fullName}</div>
    </div>
  );

  const userNameBodyColumn = (item: UserDetail) => (
    <div>
      <div className="am-cell render-3-dot">{item.username}</div>
    </div>
  );

  const joinedDateBodyColumn = (item: UserDetail) => (
    <div>
      <div className="am-cell render-3-dot">{formatDate(item.joinedDate)}</div>
    </div>
  );

  const userTypeBodyColumn = (item: UserDetail) => (
    <div>
      <div className="am-cell render-3-dot">{USER_TYPE_NAME[item.userType]}</div>
    </div>
  );

  const userDetailView = (selectedUser: UserDetail) => (
    <div className="grid grid-cols-2 gap-8 m-0" style={{ minWidth: "420px", maxWidth: "550px" }}>
      <div>
        <p className="mb-2">Staff Code</p>
        <p className="mb-2">Full Name</p>
        <p className="mb-2">Username</p>
        <p className="mb-2">Date of Birth</p>
        <p className="mb-2">Gender</p>
        <p className="mb-2">Joined Date</p>
        <p className="mb-2">Type</p>
        <p className="mb-2">Location</p>
      </div>
      <div>
        <p className="mb-2">{selectedUser.staffCode}</p>
        <p className="mb-2">{selectedUser.fullName}</p>
        <p className="mb-2">{selectedUser.username}</p>
        <p className="mb-2">{formatDate(selectedUser.dateOfBirth)}</p>
        <p className="mb-2">{USER_GENDER_NAMES[selectedUser.gender]}</p>
        <p className="mb-2">{formatDate(selectedUser.joinedDate)}</p>
        <p className="mb-2">{USER_TYPE_NAME[selectedUser.userType]}</p>
        <p className="mb-2">{USER_LOCATION_NAMES[selectedUser.locationId]}</p>
      </div>
    </div>
  );

  const actionBody = (rowData: UserDetail) => (
    <div className="cell-action flex flex-row gap-2 p-0 m-0">
      <i
        className="pi pi-pencil edit-icon cursor-pointer hover:text-blue-600"
        style={{ padding: "0px", margin: "0px", border: "none" }}
        onClick={() => {
          updateParams(params);
          navigate(`/users/edit/${rowData.id}`, { state: params });
        }}
      ></i>

      <i
        className="pi pi-times-circle cursor-pointer hover:text-blue-600 delete-icon"
        style={{ padding: "0px", margin: "0px", border: "none" }}
        onClick={() => {
          handleDisableUser(rowData);
        }}
      ></i>
    </div>
  );

  const handleConfirmDisable = () => {
    userManagementService.disableUser(userSelected).then(() => {
      setShowConfirmation(false);
      dispatch(
        fetchUsers({
          page: params.page,
          pageSize: params.pageSize,
          keySearch: params.keySearch,
          userType: params.userType,
          sortBy: params.sortBy,
          direction: params.direction,
        })
      );
    });
  };

  const debouncedSearch = debounce((value: string) => {
    updateParams({ keySearch: value, page: 1 });
  }, 500);

  const handleSelectType = async (e: MultiSelectChangeEvent) => {
    const selected = e.value;
    setSelectedType(selected);
    updateParams({ userType: selected });
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    if (value == "") {
      dispatch(fetchUsers({}));
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-primary">User List</h2>
      <div className="flex w-full justify-content-between my-4 align-items-center gap-3">
        <BaseDropdown
          className="max-h-2rem col-3"
          children={
            <MultiSelect
              value={selectedType}
              onChange={handleSelectType}
              options={USER_TYPE_OPTIONS}
              optionLabel="name"
              placeholder="Type"
              selectAllLabel="All"
              maxSelectedLabels={2}
              className="w-full align-items-center max-h-2rem border-none"
              style={{ width: "159px", maxHeight: "2rem" }}
              pt={{
                panel: { style: { width: "159px" } },
              }}
              dropdownIcon="none"
            />
          }
        />
        <div className="h-full col-6 flex gap-3 justify-content-flex-end align-items-center">
          <div className="p-inputgroup max-h-2rem flex-1 border-1 border-round-sm border-gray">
            <InputText
              value={searchValue}
              style={{ minWidth: "275px" }}
              className="max-h-2rem border-none"
              onChange={handleSearchChange}
              placeholder="Enter Name or Staff code to search"
            />
            <span
              className="p-inputgroup-addon bg-none border-left-1 border-gray cursor-pointer"
              onClick={() => debouncedSearch(searchValue)}
            >
              <i className="pi pi-search "></i>
            </span>
          </div>
          <Button
            className="primary h-2rem col-4 justify-content-center"
            onClick={() => {
              navigate(ROUTES.CREATE_USER.path);
            }}
          >
            Create New User
          </Button>
        </div>
      </div>
      <DataTable
        paginator
        lazy
        rows={params.pageSize}
        first={(params.page - 1) * params.pageSize}
        totalRecords={totalRecords}
        value={users?.data}
        loading={loading}
        sortField={params.sortBy}
        sortOrder={params.direction === "asc" ? 1 : -1}
        onPage={(e) => {
          updateParams({ pageSize: e.rows, page: (e.page ?? 0) + 1 });
        }}
        onSort={(e) => {
          updateParams({
            sortBy: e.sortField,
            direction: SORT_OPTION_NAMES[e.sortOrder as keyof typeof SORT_OPTION_NAMES],
          });
        }}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        paginatorClassName="am-paginator justify-content-end"
        tableClassName="am-table"
        paginatorPosition="bottom"
      >
        <Column
          headerClassName="bg-none text-black"
          style={{ minWidth: "14%" }}
          field="staffCode"
          header={CustomHeader("Staff Code", "staffCode", params.direction, params.sortBy, "joinedDate", "asc")}
          sortable
          body={renderStaffCode}
        />
        <Column
          headerClassName="bg-none text-black"
          field="fullName"
          header={CustomHeader("Full Name", "fullName", params.direction, params.sortBy, "joinedDate", "asc")}
          body={fullNameBodyColumn}
          sortable
        />
        <Column headerClassName="bg-none text-black" field="username" header="Username" body={userNameBodyColumn} />
        <Column
          headerClassName="bg-none text-black"
          field="joinedDate"
          header={CustomHeader("Joined Date", "joinedDate", params.sortBy, params.sortBy, "joinedDate", "asc")}
          body={joinedDateBodyColumn}
          sortable
        />
        <Column
          headerClassName="bg-none text-black"
          field="userType"
          header={CustomHeader("Type", "userType", params.direction, params.sortBy, "joinedDate", "asc")}
          body={userTypeBodyColumn}
          sortable
        />
        <Column
          headerClassName="bg-none text-black ignore-header "
          body={actionBody}
          headerStyle={{ width: "5%", border: "none" }}
        />
      </DataTable>
      <CustomModal
        visible={showAssignmentWarning}
        title={"Can not disable user"}
        content={
          <>
            <p>
              There are valid assignments belonging to this user. <br />
              Please close all assignments before disabling user.
            </p>
          </>
        }
        onConfirm={() => setShowAssignmentWarning(false)}
        showCancel={false}
        showOk={false}
        position="center"
        showCancelHeader={true}
        onClose={() => setShowAssignmentWarning(false)}
      />
      <CustomModal
        visible={showConfirmation}
        title={"Are you sure?"}
        content={"Do you want to disable this user?"}
        onClose={() => setShowConfirmation(false)}
        onConfirm={() => handleConfirmDisable()}
        showCancel={true}
        confirmText="Disable"
        showOk={true}
      />
      <CustomModal
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        title={"Detail User Information"}
        content={selectedUser && userDetailView(selectedUser)}
        onConfirm={() => setShowPopup(false)}
        showCancel={false}
        showOk={false}
        position="center"
        showCancelHeader={true}
      />
    </div>
  );
};

export default UserManagement;
