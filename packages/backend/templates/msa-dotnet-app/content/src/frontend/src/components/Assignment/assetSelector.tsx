import type { AssignableAssetsResponse, GetAssignableAssetsRequest } from "@/entities/createAssignment";
import { type CreateAssignmentForm } from "@/schemas/createAssignment.schema";
import CustomHeader from "@components/common/CustomHeader/CustomHeader";
import { useToastContext } from "@components/Toast/useToastContext";
import { SORT_OPTION_NAMES, SORT_OPTION_VALUES } from "@constants/pagination";
import "@css/CommonTable.scss";
import "@css/Paginator.scss";
import "@css/RadioButton.scss";
import type { AppDispatch, RootState } from "@store";
import { fetchAssignableAssetsThunk } from "@store/createAssignmentSlice";
import { debounce } from "lodash";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { RadioButton } from "primereact/radiobutton";
import { Tooltip } from "primereact/tooltip";
import { useCallback, useEffect, useState } from "react";
import { type UseFormSetValue } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

interface AssetSelectorProps {
  setValue: UseFormSetValue<CreateAssignmentForm>;
  initialValue?: number;
  initialName?: string;
}

export const AssetSelector = ({ setValue, initialValue, initialName }: AssetSelectorProps) => {
  const [assignableAssets, setAssignableAssets] = useState<AssignableAssetsResponse[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [showAssetModal, setShowAssetModal] = useState<boolean>(false);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(initialValue || null);
  const [selectedAssetName, setSelectedAssetName] = useState(initialName || "");
  const [selectedTempAssetId, setSelectedTempAssetId] = useState<number | null>(selectedAssetId);
  const [selectedTempAsset, setSelectedTempAsset] = useState<AssignableAssetsResponse | null>(null);

  useEffect(() => {
    if (initialValue) {
      setSelectedAssetId(initialValue);
      setSelectedTempAssetId(initialValue);
      setValue("assetId", initialValue, { shouldValidate: true });
    }
    if (initialName) {
      setSelectedAssetName(initialName);
    }
  }, [initialValue, initialName, setValue]);

  const [assignableAssetsRequest, setAssignableAssetsRequest] = useState<GetAssignableAssetsRequest>({
    page: 1,
    pageSize: 10,
    sortBy: "code",
    direction: SORT_OPTION_NAMES[SORT_OPTION_VALUES.asc],
  });
  const [localSearch, setLocalSearch] = useState(assignableAssetsRequest.keySearch || "");

  const { showError } = useToastContext();
  const dispatch = useDispatch<AppDispatch>();
  const pageResponse = useSelector((state: RootState) => state.createAssignment.assignableAssets);
  const loading = useSelector((state: RootState) => state.createAssignment.loading);

  useEffect(() => {
    try {
      dispatch(fetchAssignableAssetsThunk(assignableAssetsRequest));
      setAssignableAssets(pageResponse?.data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      showError(errorMessage, "Error");
    }
  }, [dispatch, assignableAssetsRequest]);

  useEffect(() => {
    if (pageResponse) {
      setAssignableAssets(pageResponse.data || []);
      setTotalRecords(pageResponse.total || 0);
    }
  }, [pageResponse]);

  const handleSearchDebounced = useCallback(
    debounce((value: string) => {
      setAssignableAssetsRequest((prev) => ({
        ...prev,
        keySearch: value,
        page: 1,
      }));
    }, 400),
    []
  );

  const handleSort = (e: any) => {
    const field = e.sortField as string;
    const order =
      e.sortOrder === 1 ? SORT_OPTION_NAMES[SORT_OPTION_VALUES.asc] : SORT_OPTION_NAMES[SORT_OPTION_VALUES.desc];

    setAssignableAssetsRequest((prev) => ({
      ...prev,
      sortBy: field,
      direction: order,
    }));
  };

  return (
    <>
      <IconField iconPosition="right" onClick={() => setShowAssetModal(true)} className="w-full cursor-pointer">
        <InputIcon className="pi pi-search" />
        <InputText className="h-2rem w-full" value={selectedAssetName} readOnly />
      </IconField>
      <Dialog
        header={
          <div className="flex justify-content-between gap-2 mt-4 mx-4 mb-1">
            <span className="text-lg font-bold text-primary">Select Asset</span>
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
        visible={showAssetModal}
        modal={false}
        style={{ width: "50vw" }}
        onHide={() => setShowAssetModal(false)}
        footer={
          <div className="mt-2">
            <Button
              label="Save"
              size="small"
              className="primary h-2rem"
              onClick={() => {
                setShowAssetModal(false);
                setSelectedAssetId(selectedTempAssetId);
                setSelectedAssetName(selectedTempAsset ? selectedTempAsset.name : selectedAssetName);
                setValue("assetId", selectedTempAssetId as number, { shouldValidate: true });
              }}
              disabled={selectedTempAssetId === null}
            />
            <Button
              label="Cancel"
              severity="secondary"
              outlined
              size="small"
              className="h-2rem"
              onClick={() => {
                setShowAssetModal(false);
                setSelectedTempAssetId(selectedAssetId);
              }}
            />
          </div>
        }
        draggable={false}
        closable={false}
      >
        <DataTable
          key={selectedTempAssetId}
          value={assignableAssets}
          size="small"
          dataKey="id"
          onRowClick={(e) => {
            setSelectedTempAssetId(e.data.id);
            setSelectedTempAsset(e.data as AssignableAssetsResponse);
          }}
          className="text-xs am-table"
          rows={assignableAssetsRequest.pageSize}
          first={(assignableAssetsRequest.page - 1) * assignableAssetsRequest.pageSize}
          totalRecords={totalRecords}
          paginator
          lazy
          loading={loading}
          loadingIcon="pi pi-spin pi-spinner"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          pageLinkSize={4}
          paginatorLeft={
            <span className="text-sm">
              {(assignableAssetsRequest.page - 1) * assignableAssetsRequest.pageSize + 1} to{" "}
              {Math.min(assignableAssetsRequest.page * assignableAssetsRequest.pageSize, totalRecords)} of{" "}
              {totalRecords}
            </span>
          }
          paginatorClassName="am-paginator justify-content-end"
          onPage={(e) => {
            setAssignableAssetsRequest((prev) => ({
              ...prev,
              page: Math.floor(e.first / e.rows) + 1,
              pageSize: e.rows,
            }));
          }}
          onSort={handleSort}
          sortOrder={assignableAssetsRequest.direction === SORT_OPTION_NAMES[SORT_OPTION_VALUES.asc] ? 1 : -1}
          sortField={assignableAssetsRequest.sortBy}
          scrollable
          scrollHeight="calc(70vh - 100px)"
        >
          <Column
            field="id"
            body={(rowData) => (
              <div className="cell-action">
                <RadioButton
                  inputId={`asset-${rowData.id}`}
                  name="asset"
                  value={rowData.id}
                  onChange={(e) => {
                    setSelectedTempAssetId(e.value);
                    setSelectedTempAsset(rowData);
                  }}
                  checked={selectedTempAssetId === rowData.id}
                />
              </div>
            )}
            headerClassName="ignore-header"
            style={{ width: "5%" }}
          ></Column>
          <Column
            header={
              <CustomHeader
                field="code"
                sortField={assignableAssetsRequest.sortBy}
                name="Asset Code"
                sortOrder={assignableAssetsRequest.direction}
              />
            }
            field="code"
            sortable
            style={{ width: "22%" }}
          ></Column>
          <Column
            header={
              <CustomHeader
                field="name"
                sortField={assignableAssetsRequest.sortBy}
                name="Asset Name"
                sortOrder={assignableAssetsRequest.direction}
              />
            }
            body={(rowData) => {
              const tooltipId = `tooltip-${rowData.code}`;
              return (
                <>
                  <span id={tooltipId} className="text-xs render-3-dot" data-pr-tooltip={rowData.name}>
                    {rowData.name}
                  </span>
                  <Tooltip target={`#${tooltipId}`} className="text-xs" />
                </>
              );
            }}
            field="name"
            sortable
            style={{ width: "48%" }}
          ></Column>
          <Column
            header={
              <CustomHeader
                field="categoryName"
                sortField={assignableAssetsRequest.sortBy}
                name="Category"
                sortOrder={assignableAssetsRequest.direction}
              />
            }
            field="categoryName"
            sortable
            style={{ width: "25%" }}
          ></Column>
        </DataTable>
      </Dialog>
    </>
  );
};
