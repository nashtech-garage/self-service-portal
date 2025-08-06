import type { AssignableUsersResponse, GetAssignableUsersRequest } from "@/entities/createAssignment";
import { type CreateAssignmentForm } from "@/schemas/createAssignment.schema";
import CustomHeader from "@components/common/CustomHeader/CustomHeader";
import { useToastContext } from "@components/Toast/useToastContext";
import { SORT_OPTION_NAMES, SORT_OPTION_VALUES } from "@constants/pagination";
import { USER_TYPE_NAME } from "@constants/user";
import "@css/CommonTable.scss";
import "@css/Paginator.scss";
import "@css/RadioButton.scss";
import type { AppDispatch, RootState } from "@store";
import { fetchAssignableUsersThunk } from "@store/createAssignmentSlice";
import { debounce } from "lodash";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { RadioButton } from "primereact/radiobutton";
import { useCallback, useEffect, useState } from "react";
import { type UseFormSetValue } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

interface UserSelectorProps {
  setValue: UseFormSetValue<CreateAssignmentForm>;
  initialValue?: number;
  initialName?: string;
}

export const UserSelector = ({ setValue, initialValue, initialName }: UserSelectorProps) => {
  const [assignableUsers, setAssignableUsers] = useState<AssignableUsersResponse[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(initialValue || null);
  const [selectedUserName, setSelectedUserName] = useState<string>(initialName || "");
  const [selectedTempUserId, setSelectedTempUserId] = useState<number | null>(selectedUserId);
  const [selectedTempUser, setSelectedTempUser] = useState<AssignableUsersResponse | null>(null);

  useEffect(() => {
    if (initialValue) {
      setSelectedUserId(initialValue);
      setSelectedTempUserId(initialValue);
      setValue("userId", initialValue, { shouldValidate: true });
    }
    if (initialName) {
      setSelectedUserName(initialName);
    }
  }, [initialValue, initialName, setValue]);

  const [assignableUsersRequest, setAssignableUsersRequest] = useState<GetAssignableUsersRequest>({
    page: 1,
    pageSize: 10,
    sortBy: "fullName",
    direction: SORT_OPTION_NAMES[SORT_OPTION_VALUES.asc],
    keySearch: "",
  });
  const [localSearch, setLocalSearch] = useState(assignableUsersRequest.keySearch || "");
  const { showError } = useToastContext();
  const dispatch = useDispatch<AppDispatch>();
  const pageResponse = useSelector((state: RootState) => state.createAssignment.assignableUsers);
  const loading = useSelector((state: RootState) => state.createAssignment.loading);

  useEffect(() => {
    try {
      dispatch(fetchAssignableUsersThunk(assignableUsersRequest));
      setAssignableUsers(pageResponse?.data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      showError(errorMessage, "Error");
    }
  }, [dispatch, assignableUsersRequest]);

  useEffect(() => {
    if (pageResponse) {
      setAssignableUsers(pageResponse.data || []);
      setTotalRecords(pageResponse.total || 0);
    }
  }, [pageResponse]);

  const handleSearchDebounced = useCallback(
    debounce((value: string) => {
      setAssignableUsersRequest((prev) => ({
        ...prev,
        keySearch: value,
        page: 1,
      }));
    }, 400),
    []
  );

  const handleSort = useCallback((e: any) => {
    const field = e.sortField as string;
    const order =
      e.sortOrder === 1 ? SORT_OPTION_NAMES[SORT_OPTION_VALUES.asc] : SORT_OPTION_NAMES[SORT_OPTION_VALUES.desc];

    setAssignableUsersRequest((prev) => ({
      ...prev,
      sortBy: field,
      direction: order,
    }));
  }, []);

  return (
    <>
      <IconField iconPosition="right" onClick={() => setShowUserModal(true)} className="w-full cursor-pointer">
        <InputIcon className="pi pi-search" />
        <InputText className="h-2rem w-full" value={selectedUserName} readOnly />
      </IconField>
      <Dialog
        header={
          <div className="flex justify-content-between gap-2 mt-4 mx-4 mb-1">
            <span className="text-lg font-bold text-primary">Select User</span>
            <IconField iconPosition="right">
              <InputIcon className="pi pi-search"> </InputIcon>
              <InputText
                className="h-2rem w-16rem"
                value={localSearch || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setLocalSearch(value);
                  handleSearchDebounced(value);
                }}
              />
            </IconField>
          </div>
        }
        visible={showUserModal}
        modal={false}
        style={{ width: "50vw" }}
        onHide={() => setShowUserModal(false)}
        footer={
          <div className="mt-2">
            <Button
              label="Save"
              size="small"
              className="primary h-2rem"
              onClick={() => {
                setSelectedUserId(selectedTempUserId);
                setSelectedUserName(selectedTempUser ? selectedTempUser.fullName : selectedUserName);
                setValue("userId", selectedTempUserId as number, { shouldValidate: true });
                setShowUserModal(false);
              }}
              disabled={selectedTempUserId === null}
            />
            <Button
              label="Cancel"
              severity="secondary"
              outlined
              size="small"
              className="h-2rem"
              onClick={() => {
                setShowUserModal(false);
                setSelectedTempUserId(selectedUserId);
              }}
            />
          </div>
        }
        draggable={false}
        closable={false}
      >
        <DataTable
          key={selectedTempUserId}
          value={assignableUsers}
          size="small"
          dataKey="id"
          onRowClick={(e) => {
            setSelectedTempUserId(e.data.id);
            setSelectedTempUser(e.data as AssignableUsersResponse);
          }}
          className="text-xs"
          tableClassName="am-table"
          rows={assignableUsersRequest.pageSize}
          first={(assignableUsersRequest.page - 1) * assignableUsersRequest.pageSize}
          totalRecords={totalRecords}
          paginator
          lazy
          loading={loading}
          loadingIcon="pi pi-spin pi-spinner"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          pageLinkSize={4}
          paginatorLeft={
            <span className="text-sm">
              {(assignableUsersRequest.page - 1) * assignableUsersRequest.pageSize + 1} to{" "}
              {Math.min(assignableUsersRequest.page * assignableUsersRequest.pageSize, totalRecords)} of {totalRecords}
            </span>
          }
          paginatorClassName="am-paginator justify-content-end"
          onPage={(e) => {
            setAssignableUsersRequest((prev) => ({
              ...prev,
              page: Math.floor(e.first / e.rows) + 1,
              pageSize: e.rows,
            }));
          }}
          onSort={handleSort}
          sortOrder={assignableUsersRequest.direction === SORT_OPTION_NAMES[SORT_OPTION_VALUES.asc] ? 1 : -1}
          sortField={assignableUsersRequest.sortBy}
          scrollable
          scrollHeight="calc(70vh - 100px)"
        >
          <Column
            field="id"
            body={(rowData) => (
              <div className="cell-action flex flex-row gap-2">
                <RadioButton
                  inputId={`user-${rowData.id}`}
                  name="user"
                  value={rowData.id}
                  onChange={(e) => {
                    setSelectedTempUserId(e.value);
                    setSelectedTempUser(rowData);
                  }}
                  checked={selectedTempUserId === rowData.id}
                />
              </div>
            )}
            headerClassName="ignore-header"
            style={{ width: "5%" }}
          ></Column>
          <Column
            header={
              <CustomHeader
                field="staffCode"
                sortField={assignableUsersRequest.sortBy}
                name="Staff Code"
                sortOrder={assignableUsersRequest.direction}
              />
            }
            field="staffCode"
            sortable
            style={{ width: "25%" }}
          ></Column>
          <Column
            header={
              <CustomHeader
                field="fullName"
                sortField={assignableUsersRequest.sortBy}
                name="Full Name"
                sortOrder={assignableUsersRequest.direction}
              />
            }
            field="fullName"
            sortable
            style={{ width: "40%" }}
          ></Column>
          <Column
            header={
              <CustomHeader
                field="userType"
                sortField={assignableUsersRequest.sortBy}
                name="Type"
                sortOrder={assignableUsersRequest.direction}
              />
            }
            body={(item: AssignableUsersResponse) => (
              <div>
                <div className="am-cell render-3-dot">{USER_TYPE_NAME[item.type]}</div>
              </div>
            )}
            field="userType"
            sortable
            style={{ width: "30%" }}
          ></Column>
        </DataTable>
      </Dialog>
    </>
  );
};
