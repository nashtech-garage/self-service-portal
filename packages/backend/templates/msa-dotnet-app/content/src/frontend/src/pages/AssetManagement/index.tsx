import type { AssignmentHistory, BasicAsset } from "@/entities/asset";
import BaseDropdown from "@components/common/BaseDropdown";
import CustomModal from "@components/common/BaseModal/BaseModal";
import { useToastContext } from "@components/Toast/useToastContext";
import { ASSET_STATUS_ENUMS, ASSET_STATUS_NAMES, ASSET_STATUS_OPTIONS } from "@constants/asset";
import { SORT_OPTION_NAMES, SORT_OPTION_VALUES } from "@constants/pagination";
import { ROUTES } from "@constants/routes";
import "@css/CommonDropdown.scss";
import "@css/CommonInput.scss";
import "@css/CommonTable.scss";
import "@css/Paginator.scss";
import { useActionTable } from "@hooks/useAssetManagement";
import { assetService } from "@services/assetService";
import {
  addAssetToTop,
  getDetailAssetThunk,
  getListAssetThunk,
  resetEditedAsset,
  setReduxParams,
} from "@store/assetSlice";
import type { AppDispatch, RootState } from "@store/index";
import { getListCategoriesThunk } from "@store/metaDataSlice";
import { getErrorMessage } from "@utils/errorMessage";
import { formatDate } from "@utils/formatUtils";
import { debounce } from "lodash";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const AssetManagementList = () => {
  const [selectedState, setSelectedState] = useState();
  const [selectedSearchCategory, setSelectedSearchCategory] = useState();
  const [keySearch, setKeySearch] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);
  const [showActionModal, setShowActionModal] = useState<boolean>(false);
  const [showCannotDeleteModal, setShowCannotDeleteModal] = useState<boolean>(false);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const dataAssets = useSelector((state: RootState) => state.assets.assets);
  const asset = useSelector((state: RootState) => state.assets.asset);
  const error = useSelector((state: RootState) => state.assets.error);
  const categories = useSelector((state: RootState) => state.metaData.categories);
  const isLoading = useSelector((state: RootState) => state.assets.isLoading);
  const { params, updateParams } = useActionTable("asset");
  const navigate = useNavigate();
  const editedAsset = useSelector((state: RootState) => state.assets.editedAsset);
  const skipApiCallRef = useRef(false);
  const { showSuccess, showError } = useToastContext();

  useEffect(() => {
    if (editedAsset) {
      if (dataAssets === null || dataAssets === undefined || dataAssets.data.length === 0) {
        dispatch(getListAssetThunk(params));
      }
      dispatch(addAssetToTop(editedAsset));
      dispatch(resetEditedAsset());
      skipApiCallRef.current = true;
    }
  }, [editedAsset, dispatch]);

  useEffect(() => {
    dispatch(getListCategoriesThunk({}));
  }, [dispatch]);

  useEffect(() => {
    if (skipApiCallRef.current) {
      skipApiCallRef.current = false;
      return;
    }
    dispatch(getListAssetThunk(params));
  }, [params, dispatch]);

  const handleShowSelectAsset = (item: BasicAsset) => {
    if (item && item.id) {
      dispatch(getDetailAssetThunk(item.id)).then(() => setVisible(true));
    }
  };

  const debouncedSearch = debounce(() => {
    updateParams({ keySearch, page: 1 });
  }, 500);

  const codeBodyColumn = (item: BasicAsset) => (
    <div onClick={() => handleShowSelectAsset(item)}>
      <span>{item.code}</span>
    </div>
  );

  const nameBodyColumn = (item: BasicAsset) => <span className="render-3-dot">{item.name}</span>;

  const stateBodyColumn = (item: BasicAsset) => (
    <span>{ASSET_STATUS_NAMES[item.state as keyof typeof ASSET_STATUS_NAMES]}</span>
  );

  const CustomHeader = (name: string, field: string, sortOrder: string, sortField?: string) => {
    const isSorted = field === sortField;
    let icon;
    if (!isSorted) {
      icon = <i className="ml-3 pi pi-sort" />;
    } else if (sortOrder === SORT_OPTION_NAMES[SORT_OPTION_VALUES.asc]) {
      icon = <i className="ml-3 pi pi-sort-up-fill" />;
    } else {
      icon = <i className="ml-3 pi pi-sort-down-fill" />;
    }

    return (
      <div className="w-full flex align-items-center bg-transparent">
        <span>{name}</span>
        {icon}
      </div>
    );
  };

  const actionBodyColumn = (item: BasicAsset) => (
    <div className="cell-action flex flex-row gap-2">
      <i
        className={`pi pi-pencil edit-icon ${
          item.state === ASSET_STATUS_ENUMS.assigned
            ? "disabled cursor-not-allowed opacity-50"
            : "cursor-pointer hover:text-blue-600"
        }`}
        onClick={
          item.state === ASSET_STATUS_ENUMS.assigned
            ? undefined
            : () => {
                dispatch(setReduxParams(params));
                navigate(`/asset-management/edit/${item.id}`);
              }
        }
      />

      <i
        className={`pi pi-times-circle delete-icon ${
          item.state === ASSET_STATUS_ENUMS.assigned ? "disabled cursor-not-allowed opacity-50" : "cursor-pointer"
        }`}
        onClick={item.state === ASSET_STATUS_ENUMS.assigned ? undefined : () => handleDeleteClick(item.id as number)}
      />
    </div>
  );

  const handleDeleteClick = async (assetId: number) => {
    setSelectedAssetId(assetId);

    const result = await dispatch(getDetailAssetThunk(assetId));

    const assetDetail = result.payload.data;
    if (assetDetail && assetDetail.history && assetDetail.history.length > 0) {
      setShowCannotDeleteModal(true);
    } else {
      setShowActionModal(true);
    }
  };

  const handleDeleteAction = async () => {
    if (selectedAssetId) {
      try {
        const response = await assetService.deleteAsset(selectedAssetId);
        showSuccess(response.message || "Delete Asset Successfully", "Success");
      } catch (error) {
        const message = getErrorMessage(error, "Failed to delete asset");
        showError(message);
      }

      dispatch(getListAssetThunk(params));
    }
    setShowActionModal(false);
    setSelectedAssetId(null);
  };

  const getActionCannotDeleteModalContent = () => (
    <div>
      <div>
        Cannot delete the asset because it belongs to one or
        <br />
        more historical assignments.
        <br />
        If the asset is not able to be used anymore, please
        <br />
        update its state in{" "}
        <a
          href={`/asset-management/edit/${selectedAssetId}`}
          style={{ color: "rgba(21,146,230,1)" }}
          className="underline cursor-pointer"
        >
          Edit Asset page.
        </a>
      </div>
    </div>
  );

  const renderBodyDate = (item: AssignmentHistory) => <span>{item.date ? formatDate(item.date) : null}</span>;

  const renderBodyReturnDate = (item: AssignmentHistory) => (
    <span>{item.returnDate ? formatDate(item.returnDate) : null}</span>
  );

  const renderDetailAsset = () => (
    <div className="grid" style={{ maxWidth: "50vw", minWidth: "35vw" }}>
      <div className="col-12 md:col-2">Asset Code</div>
      <div className="col-12 md:col-10"> {asset.code}</div>
      <div className="col-12 md:col-2">Asset Name</div>
      <div className="col-12 md:col-10"> {asset.name}</div>
      <div className="col-12 md:col-2">Category</div>
      <div className="col-12 md:col-10"> {asset.categoryName}</div>
      <div className="col-12 md:col-2">Installed Date</div>
      <div className="col-12 md:col-10"> {asset.installedDate ? formatDate(asset.installedDate) : null}</div>
      <div className="col-12 md:col-2">State</div>
      <div className="col-12 md:col-10"> {ASSET_STATUS_NAMES[asset.state as keyof typeof ASSET_STATUS_NAMES]}</div>
      <div className="col-12 md:col-2">Location</div>
      <div className="col-12 md:col-10"> {asset.locationName}</div>
      <div className="col-12 md:col-2">Specification</div>
      <div className="col-12 md:col-10"> {asset.specification}</div>
      <div className="col-12 md:col-2">History</div>
      <div className="col-12 md:col-10">
        <DataTable tableClassName="am-table" value={asset.history} className="w-full">
          <Column
            style={{ width: "25%" }}
            field="date"
            header="Date"
            body={renderBodyDate}
            headerClassName="bg-none text-black"
          ></Column>
          <Column
            style={{ width: "25%" }}
            field="assignedToUsername"
            header="Assigned to"
            headerClassName="bg-none text-black"
          ></Column>
          <Column
            style={{ width: "25%" }}
            field="assignedByUsername"
            header="Assigned By"
            headerClassName="bg-none text-black"
          ></Column>
          <Column
            style={{ width: "25%" }}
            field="returnDate"
            header="Returned date"
            body={renderBodyReturnDate}
            headerClassName="bg-none text-black"
          ></Column>
        </DataTable>
      </div>
    </div>
  );

  useEffect(() => {
    if (error) {
        showError(error, "Error")
    }
  }, [error])

  return (
    <div className="w-full">
      <h2 className="w-full text-primary font-bold">{ROUTES.ASSETS.title}</h2>

      <div className="flex flex-row w-full gap-2 my-4">
        <BaseDropdown className="flex-1 max-h-2rem">
          <MultiSelect
            value={selectedState}
            selectAllLabel="All"
            options={ASSET_STATUS_OPTIONS}
            onChange={(e) => {
              setSelectedState(e.value);
              updateParams({
                states: e.value,
              });
            }}
            optionLabel="name"
            placeholder="State"
            className="h-full w-full"
            maxSelectedLabels={1}
            dropdownIcon="none"
            data-testid="state"
          />
        </BaseDropdown>
        <BaseDropdown className="flex-1 max-h-2rem">
          <MultiSelect
            value={selectedSearchCategory}
            onChange={(e) => {
              setSelectedSearchCategory(e.value);
              updateParams({
                categoryIds: e.value,
              });
            }}
            options={categories}
            optionValue="value"
            optionLabel="name"
            placeholder="Category"
            className="h-full w-full"
            dropdownIcon="none"
            selectAllLabel="All"
            maxSelectedLabels={1}
            selectedItemsLabel="{0} items selected"
            data-testid="category"
          />
        </BaseDropdown>
        <div className="am-search-input p-inputgroup flex-1 max-h-2rem">
          <InputText
            value={keySearch}
            className="max-h-2.1rem"
            onChange={(e) => setKeySearch(e.target.value)}
            onBlur={() => debouncedSearch()}
            data-testid="searchInput"
          />
          <span className="p-inputgroup-addon">
            <i className="pi pi-search"></i>
          </span>
        </div>
        <Button className="primary h-2rem" size="small" onClick={() => navigate(ROUTES.CREATE_ASSETS.path)}>
          Create new asset
        </Button>
      </div>
      <DataTable
        loading={isLoading}
        lazy
        paginator
        rows={params.pageSize}
        first={(params.page - 1) * params.pageSize}
        tableClassName="am-table"
        value={dataAssets?.data}
        sortField={params.sortBy}
        sortOrder={params.direction === "asc" ? 1 : -1}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        paginatorClassName="am-paginator justify-content-end"
        onSort={(e) => {
          updateParams({
            sortBy: e.sortField,
            direction: SORT_OPTION_NAMES[e.sortOrder as keyof typeof SORT_OPTION_NAMES],
          });
        }}
        totalRecords={dataAssets?.total}
        onPage={(e) => {
          updateParams({
            pageSize: e.rows,
            page: (e.page ?? 0) + 1,
          });
        }}
        className="w-full"
      >
        <Column
          style={{ width: "15%" }}
          field="code"
          header={CustomHeader("Asset Code", "code", params.direction, params.sortBy)}
          body={codeBodyColumn}
          headerClassName="bg-none text-black"
          sortable
        ></Column>
        <Column
          field="name"
          header={CustomHeader("Asset Name", "name", params.direction, params.sortBy)}
          body={nameBodyColumn}
          headerClassName="bg-none text-black"
          sortable
        ></Column>
        <Column
          style={{ width: "20%" }}
          field="categoryName"
          header={CustomHeader("Category", "categoryName", params.direction, params.sortBy)}
          headerClassName="bg-none text-black"
          sortable
        ></Column>
        <Column
          style={{ width: "20%" }}
          field="state"
          header={CustomHeader("State", "state", params.direction, params.sortBy)}
          body={stateBodyColumn}
          headerClassName="bg-none text-black"
          sortable
        ></Column>
        <Column
          style={{ width: "2%" }}
          body={actionBodyColumn}
          headerClassName="bg-none ignore-header w-[10%]"
        ></Column>
      </DataTable>

      <CustomModal
        visible={visible}
        title="Detailed Asset Information"
        onClose={() => setVisible(false)}
        onConfirm={() => setVisible(false)}
        content={renderDetailAsset()}
        showCancel={false}
        showCancelHeader={true}
        showOk={false}
      />

      <CustomModal
        visible={showCannotDeleteModal}
        showCancelHeader={true}
        onClose={() => setShowCannotDeleteModal(false)}
        title={"Cannot Delete Asset"}
        content={getActionCannotDeleteModalContent()}
        position="center"
        showCancel={false}
        showOk={false}
      />

      <CustomModal
        visible={showActionModal}
        title={"Confirm Delete Asset"}
        onClose={() => setShowActionModal(false)}
        onConfirm={handleDeleteAction}
        content={<div>Are you sure you want to delete this asset?</div>}
        showCancel={true}
        showOk={true}
        confirmText="Delete"
        footerAlign="left"
      />
    </div>
  );
};

export default AssetManagementList;
