import AdminAssignmentTable from "@/components/Assignment/AdminAssignmentTable";
import BaseDropdown from "@/components/common/BaseDropdown";
import type { AdminAssignment, AdminAssignmentListRequest } from "@/entities/assignment";
import type { AppDispatch, RootState } from "@/store";
import { addAssignmentToTop, fetchAdminAssignments } from "@/store/assignmentSlice";
import { resetCreateAssignmentState } from "@/store/createAssignmentSlice";
import CustomModal from "@components/common/BaseModal/BaseModal";
import { useToastContext } from "@components/Toast/useToastContext";
import { ROUTES } from "@constants/routes";
import "@css/CommonDropdown.scss";
import "@css/CommonInput.scss";
import "@css/CommonTable.scss";
import "@css/Paginator.scss";
import { AssignmentStatus } from "@/entities/enums";
import { adminAssignmentService } from "@services/assignmentService";
import { resetEditAssignmentState } from "@store/editAssignmentSlice";
import "primeicons/primeicons.css";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

interface AdminAssignmentsPageProps {
  assignments: AdminAssignment[];
  loading: boolean;
  error: string | null;
  totalRecords: number;
  fetchAllAssignments: (params: AdminAssignmentListRequest) => void;
}

const stateOptions = [
  { label: "Accepted", value: AssignmentStatus.ACCEPTED },
  { label: "Declined", value: AssignmentStatus.DECLINED },
  { label: "Waiting for acceptance", value: AssignmentStatus.PENDING },
];

const AdminAssignmentsPage: React.FC<AdminAssignmentsPageProps> = ({
  assignments,
  loading,
  error,
  totalRecords,
  fetchAllAssignments,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState<string>("");

  const navigate = useNavigate();

  const dispatch = useDispatch<AppDispatch>();
  const createdAssignment = useSelector((state: RootState) => state.createAssignment.createdAssignment);
  const updatedAssignment = useSelector((state: RootState) => state.editAssignment.updatedAssignment);

  // Get params from URL or use defaults
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "15");
  const sortField = searchParams.get("sortBy") || "assignedDate";
  const sortOrder = (searchParams.get("direction") || "desc") as "asc" | "desc";
  const keySearch = searchParams.get("search") || "";

  // For state filter, we need to parse the array from URL
  const stateParam = searchParams.getAll("state");
  const stateFilter = stateParam.length > 0 ? stateParam.map((s) => parseInt(s)) : null;

  // For date, we need to parse it back to a Date object
  const assignedDateParam = searchParams.get("assignedDate");
  const assignedDate = assignedDateParam ? new Date(assignedDateParam.split("T")[0]) : null;

  const first = (page - 1) * pageSize;

  const [isModalDeleteVisible, setIsModalDeleteVisible] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | undefined>(undefined);
  const { showSuccess, showError } = useToastContext();

  // Initialize searchValue from URL params when component mounts
  useEffect(() => {
    setSearchValue(keySearch);
  }, []);

  // update searchValue when keySearch changes
  useEffect(() => {
    setSearchValue(keySearch);
  }, [keySearch]);

  // Debounce effect for search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchValue !== keySearch) {
        updateSearchParams({ search: searchValue, page: 1 });
      }
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [searchValue, keySearch]);

  useEffect(() => {
    if (createdAssignment) {
      if (assignments.length === 0) {
        loadAssignments();
      }
      dispatch(addAssignmentToTop(createdAssignment));
      dispatch(resetCreateAssignmentState());
    } else if (updatedAssignment) {
      if (assignments.length === 0) {
        loadAssignments();
      }
      dispatch(addAssignmentToTop(updatedAssignment));
      dispatch(resetEditAssignmentState());
    } else {
      loadAssignments();
    }
  }, [searchParams]);

  const updateSearchParams = (newParams: Record<string, any>) => {
    const updatedParams = new URLSearchParams(searchParams);

    // Handle each parameter type appropriately
    Object.entries(newParams).forEach(([key, value]) => {
      if (key === "state" && Array.isArray(value)) {
        updatedParams.delete("state");
        if (value && value.length > 0) {
          value.forEach((v) => updatedParams.append("state", v.toString()));
        }
      } else if (key === "assignedDate" && value instanceof Date) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const day = String(value.getDate()).padStart(2, "0");
        updatedParams.set(key, `${year}-${month}-${day}T00:00:00Z`);
      } else if (value !== undefined && value !== null) {
        updatedParams.set(key, value.toString());
      } else {
        updatedParams.delete(key);
      }
    });

    setSearchParams(updatedParams);
  };

  const loadAssignments = () => {
    fetchAllAssignments({
      page,
      pageSize,
      sortBy: sortField,
      direction: sortOrder,
      search: keySearch,
      states: stateFilter && stateFilter.length > 0 ? stateFilter : undefined,
      assignedDate: assignedDate
        ? `${assignedDate.getFullYear()}-${String(assignedDate.getMonth() + 1).padStart(2, "0")}-${String(assignedDate.getDate()).padStart(2, "0")}T00:00:00Z`
        : undefined,
    });
  };

  const handlePageChange = (event: any) => {
    updateSearchParams({
      page: Math.floor(event.first / event.rows) + 1,
      pageSize: event.rows,
    });
  };

  const handleSortChange = (sortField: string, sortOrder: "asc" | "desc") => {
    // Map frontend field names to backend field names
    let backendSortField;
    switch (sortField?.toLowerCase()) {
      case "assetcode":
        backendSortField = "assetCode";
        break;
      case "assetname":
        backendSortField = "assetName";
        break;
      case "assignedto":
        backendSortField = "assignedTo";
        break;
      case "assignedby":
        backendSortField = "assignedBy";
        break;
      case "assigneddate":
        backendSortField = "assignedDate";
        break;
      case "state":
        backendSortField = "state";
        break;
      default:
        backendSortField = "assignedDate";
    }

    updateSearchParams({
      sortBy: backendSortField,
      direction: sortOrder,
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleStateChange = (e: any) => {
    updateSearchParams({ state: e.value, page: 1 });
  };

  const handleDateChange = (e: any) => {
    if (e.value) {
      const selectedDate = new Date(e.value);
      selectedDate.setHours(0, 0, 0, 0);
      updateSearchParams({ assignedDate: selectedDate, page: 1 });
    } else {
      updateSearchParams({ assignedDate: null, page: 1 });
    }
  };

  const handleEdit = (assignment: AdminAssignment) => {
    // Navigate to edit assignment page with assignment ID
    if (assignment.id) {
      navigate(`${ROUTES.ASSIGNMENTS.path}/edit/${assignment.id}`);
    }
  };

  const handleDelete = (assignment: AdminAssignment) => {
    // handle delete assignment
    setSelectedAssignmentId(assignment.id);
    setIsModalDeleteVisible(true);
  };

  const handleConfirmDelete = async (assignmentId: number | undefined) => {
    if (assignmentId) {
      try {
        const response = await adminAssignmentService.deleteAssignment(assignmentId);
        showSuccess(response.message || "Delete Assignment Successfully", "Success");
        loadAssignments();
      } catch (error) {
        showError(
          error instanceof Error ? error.message : "An unexpected error occurred while deleting the assignment",
          "Error"
        );
      }
    }
    setIsModalDeleteVisible(false);
  };

  // add sort by no. order toggle
  const handleToggleSortOrder = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    updateSearchParams({
      direction: newSortOrder,
    });
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="w-full">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-primary">Assignment List</h1>
      </div>
      <div className="filter-section flex gap-3 my-4 justify-content-between">
        <div className="flex gap-3 ">
          <BaseDropdown className="flex-1 max-h-2rem">
            <MultiSelect
              value={stateFilter}
              options={stateOptions}
              onChange={handleStateChange}
              placeholder="State"
              className="h-full w-full"
              selectAllLabel="All"
              dropdownIcon="none"
              maxSelectedLabels={1}
              selectedItemsLabel="{0} selected"
            />
          </BaseDropdown>
          <div className="am-dropdown-filter border-round-md border-1 flex align-items-center flex-1 max-h-2rem">
            <Calendar
              value={assignedDate}
              onChange={handleDateChange}
              placeholder="Assigned Date"
              className="h-full w-full"
              showIcon={false}
              dateFormat="dd/mm/yy"
              inputClassName="border-none"
              inputStyle={{ boxShadow: "none", borderColor: "var(--text-primary)", width: "9rem" }}
            />
            <span
              className="p-inputgroup-addon bg-none border-left-1 border-none h-full"
              style={{ borderColor: "black" }}
            >
              <i className="pi pi-calendar-clock"></i>
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="p-inputgroup max-h-2rem min-w-10rem flex-1 border-1 border-round-md border-black">
            <InputText value={searchValue} className="max-h-2rem border-none" onChange={handleSearch} />
            <span className="p-inputgroup-addon bg-none border-left-1 border-none">
              <i className="pi pi-search"></i>
            </span>
          </div>
          <Button
            label="Create new assignment"
            className="primary h-2rem"
            onClick={() => navigate(ROUTES.CREATE_ASSIGNMENT.path)}
          />
        </div>
      </div>
      <AdminAssignmentTable
        assignments={assignments}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        pagination={{
          first,
          rows: pageSize,
          totalRecords,
        }}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
        sortField={sortField}
        sortOrder={sortOrder}
        onToggleSortOrder={handleToggleSortOrder}
        onDataChanged={loadAssignments}
      />
      <CustomModal
        visible={isModalDeleteVisible}
        title="Are you sure?"
        content="Are you sure you want to delete this assignment?"
        onClose={() => {
          if (selectedAssignmentId) {
            // Reset selected assignment ID when modal is closed
            setSelectedAssignmentId(undefined);
          }
          setIsModalDeleteVisible(false);
        }}
        onConfirm={() => {
          // Add delete logic here
          handleConfirmDelete(selectedAssignmentId);
        }}
        confirmText="Delete"
        cancelText="Cancel"
        showCancel={true}
        showOk={true}
        footerAlign="left"
      ></CustomModal>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  assignments: state.adminAssignments.assignments,
  loading: state.adminAssignments.loading,
  error: state.adminAssignments.error,
  totalRecords: state.adminAssignments.totalRecords,
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  fetchAllAssignments: (params: AdminAssignmentListRequest) => dispatch(fetchAdminAssignments(params)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AdminAssignmentsPage);
