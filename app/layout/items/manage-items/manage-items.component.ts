import { Component, OnInit, ViewChild } from '@angular/core';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { StoreService } from '@shared/services/store/store.service';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormControl } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin } from 'rxjs';
import { slice as _slice } from 'lodash';
import { MessageService } from '@shared/services/commmon/message-Service';

@Component({
  selector: 'app-manage-items',
  templateUrl: './manage-items.component.html',
  styleUrls: ['./manage-items.component.scss'],
})
export class ManageItemsComponent implements OnInit {
  viewType: any = '';
  postData: any;
  showGrid = false;
  isAdvanceSearchOpen: boolean = false;
  isSearchByPriceGroupsOpen: boolean = false;
  isBulkUpdateOpen: boolean = false;
  isItemPanelOpen: boolean = false;
  isItemPanelHidden: boolean = false;
  itemId: any = null;
  additionalActions: any = {
    navigateToItemHistory: false,
    navigateToSalesActivity: false,
    navigateToItem: false
  };
  _upcCode: any = null;
  userInfo = this.constantService.getUserInfo();
  gridProperties = {
    showPricing: false,
    showMultipackPricing: false,
    showDetails: false,
  };
  advanceSearchGridOptions: any;
  advanceSearchGridAPI: any;
  advanceSearchGridRowData: any[];
  departmentListByUser: any;
  vendorList: any;
  priceGroupList: any[];
  isStoreLocationLoading: boolean = true;
  storeLocationList: any;
  storeLocationID = null;
  showBulkUpdateStoreSelection: boolean = true;
  posSyncStatusList: any;
  searchText = null;
  advancedSearchForm = this.fb.group({
    posCodeOrDesc: [null],
    sellingUnits: [''],
    sellingUnitStart: [null], // 0,
    sellingUnitEnd: [null], // 0,
    unitinCase: [0],
    unitsInCaseStart: [null], // 0,
    unitsInCaseEnd: [null], // 0,
    sellingPrice: [null],
    sellingPriceStart: [null], // 0,
    sellingPriceEnd: [null], // 0,
    inventoryValuePrice: [0],
    inventoryValuePriceStart: [null], // 0,
    inventoryValuePriceEnd: [null], // 0,
    currentInventory: [0],
    currentInventoryStart: [null], // 0,
    currentInventoryEnd: [null], // 0,
    pMStartCriteria: [null], // 0,
    pmEndCriteria: [null], // 0,
    pmCriteria: [null],
    locationCriteria: [''],
    priceGroupLocationCriteria: [null],
    vendorCriteria: [null],
    department: [''],
    posSyncStatus: [null], // 0,
    isShowPricing: [true],
    isClick: [true],
    isOnWatchList: [''],
    priceGroup: [], // 0,
    isMultipack: [true],
    isActive: [''],
    searchBy: [null], // 0,
    isShowMultiPackPricing: [false],
    isShowDetails: [false],
    searchByDepat: [true],
    searchByPriceGroup: [false],
  });
  unitsCasePriceCost = [
    { id: 1, name: 'Equal' },
    { id: 2, name: 'Less than Equal to' },
    { id: 3, name: 'Greater than Equal to' },
    { id: 4, name: 'Between' },
  ];
  activeUpdateList = [
    { id: false, name: 'False' },
    { id: true, name: 'True' },
  ];
  updateData = [
    { id: 'IsActive', name: 'Active' },
    { id: 'Department', name: 'Department' },
    { id: 'CurrentInv', name: 'Current Inventory' },
    { id: 'SellingPrice', name: 'Selling Price' },
    { id: 'Buying', name: 'Buying Cost' },
    { id: 'SellingUnits', name: 'Selling Units' },
    { id: 'UnitOfMeasurement', name: 'Unit Of Measurement' },
    { id: 'UnitsInCase', name: 'Units In Case' },
    { id: 'BuyDown', name: 'Buy Down' },
    { id: 'PriceGroup', name: 'Price Group' },
    { id: 'PriceByFixedAmount', name: 'Price By Fixed Amount' },
    { id: 'PriceByPercent', name: 'Price By Percentage' },
    { id: 'POSSyncStatus', name: 'POS Sync Status' },
    { id: 'IsOnWatchList', name: 'Track Item' },
    { id: 'Multipack', name: 'Multipack' },
    {
      id: 'PriceByBuyingCostByFixedAmount',
      name: 'By Buying Cost By Fixed Amount',
    },
    { id: 'PriceByBuyingCostByPercent', name: 'By Buying Cost By Percentage' },
  ];
  searchByList = [
    { name: 'None', id: 0 },
    { name: 'Unknown Department', id: 1 },
    { name: 'Top 50 selling items', id: 2 },
    { name: 'Least 50 selling Items', id: 3 },
    { name: 'Items with no Selling Units', id: 4 },
    { name: 'Items with no Cost Price', id: 5 },
    { name: 'Items with no Selling Price', id: 6 },
    { name: 'Item with no Units in a case', id: 7 },
    { name: 'Items with no Description', id: 8 },
    { name: 'Items without Store location', id: 9 },
    { name: 'Items with Parent / Child', id: 10 },
  ];
  panelTitle: string =
    'Please fill in the form below to add a new item to the catalog';
  priceGroupPanelTitle: string = 'Price Group Items';
  selectedTableSize: any;
  recordsCount: number | 0;
  pageCount: number | 10;

  itemByPriceGroupGridOptions: any;
  itemByPriceGroupGridAPI: any;
  isPriceGroupItemPanelOpen: any = false;
  isPriceGroupItemPanelHidden: any = false;

  // showShowPricing: boolean;
  // showShowPricingTable: boolean;
  showItemSearchBox: boolean;
  sidebarTitle: string | 'Add Item';
  selectedItems: any;
  selectedStoreLocationItemIds: any;
  selectedItemsIds: any;

  value = null;
  isHideActive = true;
  isHideCurretnInventory = true;
  isHideOnlyNumber = true;
  isHideDollerNumber = true;
  isHidePOSSyncStatus = true;
  isHideDepartment = true;
  isHideUOM = true;
  isHideMultipack = true;
  isHidePriceGroup = true;
  isHidePositiveValue = true;

  posSyncStatusID = 0;
  departmentid = 0;
  uomId: any;
  price: Number;
  isBWatchList: String;
  Id = null;
  uomList: any;
  columnName: any;

  headerSelected: boolean = false;
  showBulkUpdate: boolean = false;
  showDelSelItems: boolean = false;
  oldSellingPriceValue: any;
  //show pricing grid options
  // @ViewChild('showPricingGrid') showPricingGrid;
  // to get selected data callback is as below
  // this.showPricingGrid.getSelectedData();

  // showPricingGridRowData: any = [];
  // showPricingGridTotalCount: number = 0;
  // showPricingGridOptions: CGOptions = {
  //   // groupBy: {
  //   //   label: 'CompanyStoreGroupName',
  //   //   key: 'CompanyStoreGroupID',
  //   // },
  //   enableServerPagination: true,
  //   enableCheckbox: true,
  //   onPageChange: (currentPage, perPageRecords) => {
  //     this.fetchShowPricingGridData(currentPage, perPageRecords);
  //   },
  //   onInit: (currentPage, perPageRecords) => {
  //     this.fetchShowPricingGridData(currentPage, perPageRecords);
  //   },
  // };

  // showPricingGridColData: CGColData[] = [
  //   // {
  //   //   headerName: 'Store Group',
  //   //   dataKey: 'CompanyStoreGroupName',
  //   // },
  //   {
  //     headerName: 'Item',
  //     dataKey: 'POSCodeWithCheckDigit',
  //     cellType: 'customUPCCell'
  //   },
  //   // {
  //   //   headerName: 'Description',
  //   //   dataKey: 'Description',
  //   // },
  //   {
  //     headerName: 'Department',
  //     dataKey: 'DepartmentDescription',
  //   },
  //   {
  //     headerName: 'Store',
  //     dataKey: 'StoreName',
  //   },
  //   // {
  //   //   headerName: 'Sell Units',
  //   //   dataKey: 'SellingUnits',
  //   //   cellType: 'pricingCell'
  //   // },
  //   // {
  //   //   headerName: 'Unit(s) In Case',
  //   //   dataKey: 'UnitsInCase',
  //   //   cellType: 'pricingCell'
  //   // },
  //   {
  //     headerName: 'Selling Price',
  //     dataKey: 'RegularSellPrice',
  //     cellType: 'pricingCell'
  //   },
  //   {
  //     headerName: 'Action',
  //     cellType: 'actionCell',
  //     cellParams: {
  //       onEdit: (data) => {
  //         let itemData = {
  //           data: data
  //         };
  //         this.editAction(itemData);
  //       },
  //       onDelete: (data) => {
  //         let itemData = {
  //           data: data
  //         };
  //         this.deleteAction(itemData);
  //       },
  //       itemHistory: (data) => {
  //         let itemData = {
  //           data: data
  //         };
  //         this.itemHistory(itemData);
  //       },
  //       salesActivity: (data) => {
  //         let itemData = {
  //           data: data
  //         };
  //         this.salesActivity(itemData);
  //       },
  //       suspend: (data) => {
  //         let itemData = {
  //           data: data
  //         };
  //         this.suspendAction(itemData);
  //       },
  //     },
  //   },
  // ];
  isConfirmRemoveOpen: boolean = false;
  removeData: any;

  sidePanelsList: any[];

  constructor(
    private messageService: MessageService,
    private constantService: ConstantService,
    private storeService: StoreService,
    private paginationGridService: PaginationGridService,
    private setupService: SetupService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService
  ) {
    // this.showShowPricing = true;
    this.showItemSearchBox = true;
    this.advanceSearchGridOptions = this.paginationGridService.getGridOption(
      this.constantService.gridTypes.manageItemsGrid
    );
    this.itemByPriceGroupGridOptions = this.paginationGridService.getGridOption(
      this.constantService.gridTypes.itemByPriceGroupGrid
    );
    this.selectedTableSize = 50;
  }

  onGridReady(params) {
    this.advanceSearchGridAPI = params.api;
    this.advanceSearchGridAPI.deselectAll();
    if (this.viewType === 'byPriceGroup') {
      this.searchByPriceGroups();
    } else {
      var datasource = this.ServerSideDatasource();
      this.advanceSearchGridAPI.setServerSideDatasource(datasource);
      this.advanceSearchGridAPI.sizeColumnsToFit();
    }
  }
  handleConfirmRemoveClose(e) {
    if (e == 'confirm') {
      this.spinner.show();
      let postData = {
        userName: this.userInfo.userName,
        itemId: this.removeData.data.ItemID
      }
      this.setupService.postData(`Item/ItemDeletion`, postData).
        subscribe((response: any) => {
          if (response && response.status == 1) {
            this.toastr.success(this.constantService.infoMessages.suspendRecord, this.constantService.infoMessages.success);
            this.getAdvancedSearch('')
          } else {
            this.spinner.hide();
            this.toastr.error(this.constantService.infoMessages.suspendRecordFailed, this.constantService.infoMessages.error);
          }
        }, error => {
          this.spinner.hide();
          this.toastr.error(this.constantService.infoMessages.suspendRecordFailed, this.constantService.infoMessages.contactAdmin);
        });
    }
    this.isConfirmRemoveOpen = false;
    this.removeData = null;
  }

  onRowSelected(params) {
    let selectedRows = params.api.getSelectedNodes();
    if (selectedRows.length === 0) {
      this.showDelSelItems = false;
      this.showBulkUpdate = false;
    } else {
      if (this.viewType === 'byPriceGroup') {
        this.showDelSelItems = false;
        this.showBulkUpdate = true;
      } else {
        this.showDelSelItems = true;
        this.showBulkUpdate = true;
      }
    }
    this.selectedItems = selectedRows.length;
    this.selectedStoreLocationItemIds = selectedRows
      ? selectedRows.map((x) => x.data.StoreLocationItemID).join(',')
      : '';
    if (this.viewType === 'byPriceGroup') {
      this.selectedItemsIds = selectedRows
        ? selectedRows.map((x) => x.data.groupID).join(',')
        : '';
    } else {
      this.selectedItemsIds = selectedRows
        ? selectedRows.map((x) => x.data.ItemID).join(',')
        : '';
    }
  }
  getUOM() {
    this.setupService.getData('UOM/getAll').subscribe(
      (response) => {
        this.uomList = response;
      },
      (error) => {
        console.log(error);
      }
    );
  }
  changeUpdateData(params) {
    if (!params) {
      this.patchColumnsValue();
      this.isHideActive = true;
      this.isHideCurretnInventory = true;
      this.isHideOnlyNumber = true;
      this.isHideDollerNumber = true;
      this.isHidePOSSyncStatus = true;
      this.isHideMultipack = true;
      this.isHideUOM = true;
      this.isHideDepartment = true;
      this.isHidePositiveValue = true;
      this.isHidePriceGroup = true;
      return;
    }
    const updateData = {
      active: 'Active',
      department: 'Department',
      curretnInventory: 'Current Inventory',
      sellingPrice: 'Selling Price',
      buyingCost: 'Buying Cost',
      sellingUnits: 'Selling Units',
      unitOfMeasurement: 'Unit Of Measurement',
      unitsInCase: 'Units In Case',
      buyDown: 'Buy Down',
      rackAllowance: 'Rack Allowance',
      profitMargin: 'Profit Margin',
      priceGroup: 'Price Group',
      priceByFixedAmount: 'Price By Fixed Amount',
      priceByPercentage: 'Price By Percentage',
      pOSSyncStatus: 'POS Sync Status',
      trackItem: 'Track Item',
      multipack: 'Multipack',
      stockTransfer: 'Stock Transfer',
      byCostByFixedAmount: 'By Buying Cost By Fixed Amount',
      byBuyingCostByPercentage: 'By Buying Cost By Percentage',
    };

    switch (params.name) {
      case updateData.active:
        this.patchColumnsValue();
        this.isHideActive = false;
        this.isHideCurretnInventory = true;
        this.isHidePOSSyncStatus = true;
        this.isHideMultipack = true;
        this.isHideUOM = true;
        this.isHideDepartment = true;
        this.isHidePositiveValue = true;
        this.isHidePriceGroup = true;
        this.isHideOnlyNumber = true;
        this.isHideDollerNumber = true;
        return 0;
      case updateData.department:
        this.patchColumnsValue();
        this.isHideDepartment = false;
        this.isHideCurretnInventory = true;
        this.isHidePOSSyncStatus = true;
        this.isHideMultipack = true;
        this.isHideUOM = true;
        this.isHideActive = true;
        this.isHidePriceGroup = true;
        this.isHidePositiveValue = true;
        this.isHideOnlyNumber = true;
        this.isHideDollerNumber = true;
        return 0;
      case updateData.priceGroup:
        this.patchColumnsValue();
        this.isHideDepartment = true;
        this.isHideCurretnInventory = true;
        this.isHidePOSSyncStatus = true;
        this.isHideMultipack = true;
        this.isHideUOM = true;
        this.isHideActive = true;
        this.isHidePriceGroup = false;
        this.isHidePositiveValue = true;
        this.isHideOnlyNumber = true;
        this.isHideDollerNumber = true;
        return 0;
      case updateData.curretnInventory:
        this.showInputField();
        return 0;
      case updateData.sellingPrice:
        this.showDollerInputField();
        return 0;
      case updateData.buyingCost:
        this.showDollerInputField();
        // this.showPositiveInputField();
        return 0;
      case updateData.sellingUnits:
        // this.showPositiveInputField();
        this.showOnlyNumberInputField();
        return 0;
      case updateData.unitOfMeasurement:
        this.isHideActive = true;
        this.isHideCurretnInventory = true;
        this.isHideUOM = false;
        this.isHideDepartment = true;
        this.isHideMultipack = true;
        this.isHidePOSSyncStatus = true;
        this.isHidePositiveValue = true;
        this.isHidePriceGroup = true;
        this.isHideOnlyNumber = true;
        this.isHideDollerNumber = true;
        return 0;
      case updateData.unitsInCase:
        this.showOnlyNumberInputField();
        return 0;
      case updateData.buyDown:
        this.showDollerInputField();
        return 0;
      case updateData.rackAllowance:
        this.showPositiveInputField();
        return 0;
      case updateData.profitMargin:
        this.showPositiveInputField();
        return 0;
      case updateData.priceGroup:
        return 0;
      case updateData.priceByFixedAmount:
        // this.showInputField();
        this.showDollerInputField();
        return 0;
      case updateData.priceByPercentage:
        this.showDollerInputField();
        // this.showPositiveInputField();
        return 0;
      case updateData.pOSSyncStatus:
        this.patchColumnsValue();
        this.isHideDepartment = true;
        this.isHideCurretnInventory = true;
        this.isHidePOSSyncStatus = false;
        this.isHideMultipack = true;
        this.isHideUOM = true;
        this.isHideActive = true;
        this.isHidePositiveValue = true;
        this.isHidePriceGroup = true;
        this.isHideOnlyNumber = true;
        this.isHideDollerNumber = true;
        return 0;
      case updateData.trackItem:
        this.patchColumnsValue();
        this.isHideActive = false;
        this.isHideCurretnInventory = true;
        this.isHidePOSSyncStatus = true;
        this.isHideMultipack = true;
        this.isHideUOM = true;
        this.isHideDepartment = true;
        this.isHidePositiveValue = true;
        this.isHidePriceGroup = true;
        this.isHideOnlyNumber = true;
        return 0;
      case updateData.multipack:
        this.patchColumnsValue();
        this.isHideActive = true;
        this.isHideCurretnInventory = true;
        this.isHidePOSSyncStatus = true;
        this.isHideDepartment = true;
        this.isHideUOM = true;
        this.isHideMultipack = false;
        this.isHidePriceGroup = true;
        this.isHidePositiveValue = true;
        this.isHideOnlyNumber = true;
        this.isHideDollerNumber = true;
        return 0;
      case updateData.stockTransfer:
        return 0;
      case updateData.byCostByFixedAmount:
        this.showDollerInputField();
        return 0;
      case updateData.byBuyingCostByPercentage:
        this.showDollerInputField();
        return 0;
    }
  }
  patchColumnsValue() {
    this.value = 0;
    this.departmentid = 0;
    this.posSyncStatusID = null;
    this.uomId = 0;
    this.isBWatchList = null;
    this.price = 0;
    this.Id = null;
  }
  showInputField() {
    this.patchColumnsValue();
    this.isHideActive = true;
    this.isHideCurretnInventory = false;
    this.isHideUOM = true;
    this.isHideDepartment = true;
    this.isHideMultipack = true;
    this.isHidePriceGroup = true;
    this.isHidePositiveValue = true;
    this.isHidePOSSyncStatus = true;
    this.isHideOnlyNumber = true;
    this.isHideDollerNumber = true;
  }
  showPositiveInputField() {
    this.patchColumnsValue();
    this.isHideActive = true;
    this.isHideCurretnInventory = true;
    this.isHideUOM = true;
    this.isHideDepartment = true;
    this.isHideMultipack = true;
    this.isHidePriceGroup = true;
    this.isHidePositiveValue = false;
    this.isHidePOSSyncStatus = true;
    this.isHideOnlyNumber = true;
    this.isHideDollerNumber = true;
  }
  showOnlyNumberInputField() {
    this.patchColumnsValue();
    this.isHideActive = true;
    this.isHideCurretnInventory = true;
    this.isHideUOM = true;
    this.isHideDepartment = true;
    this.isHideMultipack = true;
    this.isHidePriceGroup = true;
    this.isHidePositiveValue = true;
    this.isHideOnlyNumber = false;
    this.isHidePOSSyncStatus = true;
    this.isHideDollerNumber = true;
  }
  showDollerInputField() {
    this.patchColumnsValue();
    this.value = 0.00;
    this.isHideActive = true;
    this.isHideCurretnInventory = true;
    this.isHideUOM = true;
    this.isHideDepartment = true;
    this.isHideMultipack = true;
    this.isHidePriceGroup = true;
    this.isHidePositiveValue = true;
    this.isHideOnlyNumber = true;
    this.isHidePOSSyncStatus = true;
    this.isHideDollerNumber = false;
  }
  clearBulkUpdate() {
    //resetting default values
    this.columnName = null;
    this.storeLocationID = null;
    this.isBWatchList = null;
    this.Id = null;
    this.value = null;
    this.price = null;
    this.isHideActive = true;
    this.isHideCurretnInventory = true;
    this.isHideOnlyNumber = true;
    this.isHideDollerNumber = true;
    this.isHidePOSSyncStatus = true;
    this.isHideDepartment = true;
    this.isHideUOM = true;
    this.isHideMultipack = true;
    this.isHidePriceGroup = true;
    this.isHidePositiveValue = true;
  }
  bulkUpdate() {
    if (this.storeLocationID === null) {
      this.toastr.error('Please select store location');
      return;
    }
    if (this.selectedItems === null || this.selectedItems === 0) {
      this.toastr.error('Please select Items to Update');
      return;
    }
    let storeLocation: any;
    if (this.storeLocationList && this.storeLocationList.length !== 1) {
      storeLocation = this.storeLocationID
        ? this.storeLocationID.map((x) => x.storeLocationID).join(',')
        : '';
    }
    const postData = {
      value: this.value ? this.value : 0,
      isShowPrice: this.advancedSearchForm.value.isShowPricing ? true : false,
      price: this.price ? this.price : 0,
      columnName: this.columnName ? this.columnName : '',
      itemlst: this.selectedItemsIds ? this.selectedItemsIds : 0,
      storelst: storeLocation ? storeLocation : String(this.storeLocationID),
      storelocationitemlst:
        this.advancedSearchForm.value.isShowPricing === true
          ? this.selectedStoreLocationItemIds
          : storeLocation
            ? storeLocation
            : String(this.storeLocationID),
      username: this.userInfo.userName,
      CompanyID: this.userInfo.companyId,
      isBWatchList: this.isBWatchList,
      ID: this.Id ? this.Id : 0,
    };
    this.spinner.show();
    this.setupService.updateData('Item/BulkUpdate', postData).subscribe(
      (res) => {
        this.spinner.hide();
        if (res === '1') {
          this.showDelSelItems = false;
          this.showBulkUpdate = false;
          this.selectedItems = 0;
          this.isBulkUpdateOpen = false;
          this.selectedItemsIds = null;
          this.advanceSearchGridAPI.deselectAll();
          this.toastr.success(
            this.constantService.infoMessages.updatedRecord,
            this.constantService.infoMessages.success
          );
          this.getAdvancedSearch('byPriceGroup');
        } else {
          this.toastr.error(
            this.constantService.infoMessages.updateRecordFailed,
            this.constantService.infoMessages.error
          );
        }
      },
      (err) => {
        this.spinner.hide();
        this.toastr.error(
          this.constantService.infoMessages.contactAdmin,
          this.constantService.infoMessages.error
        );
        console.log(err);
      }
    );
  }

  onChange(params) {
    if (params && params.itemID) {
      // this.advanceSearchGridAPI.forEachNode((rowNode) => {
      //   if (rowNode.data.ItemID == params.itemID) {
      //var rowNode = this.advanceSearchGridAPI.getRowNode(params.itemID);
      // var newData = {
      //   ItemID: params.itemID,
      //   POSCodeWithCheckDigit: params.posCode,
      //   Description: params.description,
      //   DepartmentDescription: params.departmentDescription,
      //   DepartmentID: params.departmentID,
      //   SellingUnits: params.sellingUnits,
      //   UnitsInCase: params.unitsInCase,
      //   UnitCostPrice: params.unitCostPrice,
      //   ActiveFlag: params.activeFlag,
      // };
      // rowNode.setData(newData);
      // this.advanceSearchGridAPI.redrawRows(rowNode);
      // }
      // });
      this.getAdvancedSearch('');
    }
  }

  ServerSideDatasource() {
    return {
      getRows: (params) => {
        this.getSearchData(params);
      },
    };
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.messageService.sendMessage("expanded_collaps");
    });
    this.getDepartment();
    this.getStoreLocation();
    this.getVendorByCompanyId();
    this.getPOSGroup();
    this.getUOM();
  }

  // showPriceChange($event) {
  //   if ($event.target.checked) {
  //     this.selectedItems = 0;
  //     this.showDelSelItems = false;
  //     this.selectedItemsIds = null;
  //     this.getAdvancedSearch('');
  //   } else {
  //     this.selectedItems = 0;
  //     this.showDelSelItems = false;
  //     this.selectedItemsIds = null;
  //     this.getAdvancedSearch('');
  //   }
  // }

  onRowSelectedCustomGrid(event: any) {
    let selectedRows = event;
    if (selectedRows.length === 0) {
      this.showDelSelItems = false;
      this.showBulkUpdate = false;
    } else {
      this.showDelSelItems = true;
      this.showBulkUpdate = true;
    }
    this.selectedItems = selectedRows.length;
    this.selectedStoreLocationItemIds = selectedRows
      ? selectedRows.map((x) => x.StoreLocationItemID).join(',')
      : '';
    this.selectedItemsIds = selectedRows
      ? selectedRows.map((x) => x.ItemID).join(',')
      : '';
  }

  handleItemOpenClose(isOpen: boolean, id: any = null, title?) {
    this.toastr.clear();
    this.sidePanelsList = [];
    if (title) {
      this.sidebarTitle = title;
    }
    this.isItemPanelOpen = isOpen;
    setTimeout(() => {
      //added for handling fresh creation of add/edit forms
      this.isItemPanelHidden = isOpen;
    });
    this.itemId = id;
    setTimeout(() => {
      if (this.advanceSearchGridAPI)
        this.advanceSearchGridAPI.sizeColumnsToFit();
    });
  }

  get advancedSearch() {
    return this.advancedSearchForm.value;
  }

  getDepartment() {
    // this.spinner.show();
    this.setupService
      .getData(
        `Department/GetByfuel/${this.userInfo.userName}/${this.userInfo.companyId}/false`
      )
      .subscribe(
        (res) => {
          // this.spinner.hide();
          const myOrderedArray = _.sortBy(res, (o) => o.departmentDescription);
          this.departmentListByUser = myOrderedArray;
        },
        (err) => {
          this.spinner.hide();
          console.log(err);
        }
      );
  }

  getVendorByCompanyId() {
    if (this.storeService.vendorList) {
      this.vendorList = this.storeService.vendorList;
    } else {
      this.spinner.show();
      this.storeService.getVendorList(this.userInfo.companyId).subscribe(
        (response) => {
          this.spinner.hide();
          this.vendorList = this.storeService.vendorList;
        },
        (error) => {
          this.spinner.hide();
          console.log(error);
        }
      );
    }
  }

  // getPriceGroupsByCompanyId() {
  //   this.setupService.getData('CompanyPriceGroup/getByCompanyID/' +
  //     this.userInfo.companyId).subscribe((response) => {
  //       if (response && response['statusCode']) {
  //         this.priceGroupList = [];
  //         return;
  //       }
  //       this.priceGroupList = response;
  //     }, (error) => {
  //       console.log(error);
  //     });
  // }

  getStoreLocation(): any {
    if (this.storeService.storeLocation) {
      this.isStoreLocationLoading = false;
      this.storeLocationList = this.storeService.storeLocation;
      this.bindStoreLocationID();
      this.bindBulkUpdateStoreLocationID();
    } else {
      this.spinner.show();
      this.storeService
        .getStoreLocation(this.userInfo.companyId, this.userInfo.userName)
        .subscribe(
          (response) => {
            this.spinner.hide();
            this.storeLocationList = this.storeService.storeLocation;
            this.isStoreLocationLoading = false;
            this.bindStoreLocationID();
            this.bindBulkUpdateStoreLocationID();
          },
          (error) => {
            this.spinner.hide();
            console.log(error);
          }
        );
    }
  }

  bindStoreLocationID() {
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      this.advancedSearchForm
        .get('locationCriteria')
        .setValue(this.storeLocationList[0].storeLocationID);
      this.storeLocationID = this.storeLocationList[0].storeLocationID;
      // this.showShowPricing = false;
      // this.advancedSearchForm.get('isShowPricing').setValue(true);
      // this.getAdvancedSearch('');
      // this.advanceSearchGridOptions = this.paginationGridService.getGridOption(this.constantService.gridTypes.manageItemsPricingGrid);
      // this.showPricingGridColData = _.reject(this.showPricingGridColData, ['headerName', 'Store']);
    }
  }

  bindBulkUpdateStoreLocationID() {
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      this.storeLocationID = this.storeLocationList[0].storeLocationID;
    }
  }

  getPOSGroup() {
    forkJoin(
      this.setupService.getData('POSSyncStatus/get'),
      this.setupService.getData(
        'CompanyPriceGroup/getByCompanyID/' + this.userInfo.companyId
      )
    ).subscribe((response) => {
      this.posSyncStatusList = response[0];
      // this.posSyncStatusList.unshift({
      //   posSyncStatusID: 0,
      //   posSyncStatusCode: 'All',
      // });
      this.priceGroupList = response[1];
    });
  }

  editAction(params, navigateTo?: 'Item History' | 'Sales Activity') {
    if (this.viewType === 'byPriceGroup') {
      params.noSave = false;
      params.data.rowEditingStarted = true;
      this.advanceSearchGridAPI.startEditingCell({
        rowIndex: params.rowIndex,
        colKey: 'buyingCost',
      });
      params.api.refreshCells({
        columns: ['value'],
        rowNodes: [params.node],
        force: true,
      });
    } else {
      params.data.rowEditingStarted = undefined;
      params.noSave = true;
      this.isItemPanelOpen = true;
      //added for handling fresh creation of add/edit forms
      this.isItemPanelHidden = true;
      this.itemId = params.data.ItemID;
      this._upcCode = params.data.POSCodeWithCheckDigit;
      this.sidebarTitle = 'Edit Item';
      this.sidePanelsList = [
        { panelName: "Item History" },
        { panelName: "Sales Activity" }
      ];
      this.additionalActions = {
        navigateToItemHistory: false,
        navigateToSalesActivity: false,
        navigateToItem: false
      };
      if (navigateTo) {
        if (navigateTo === 'Item History') {
          this.additionalActions.navigateToItemHistory = true;
        } else if (navigateTo === 'Sales Activity') {
          this.additionalActions.navigateToSalesActivity = true;
        }
      }
    }
  }

  cancelAction(params) {
    params.noSave = true;
    params.data.rowEditingStarted = false;
    if (this.viewType === 'byPriceGroup') {
      params.api.refreshCells({
        columns: ['value'],
        rowNodes: [params.node],
        force: true,
      });
      this.advanceSearchGridAPI.stopEditing();
    } else {
      let oldValue = params.data.RegularSellPrice;
      this.advanceSearchGridAPI.stopEditing();
      params.data.RegularSellPrice = oldValue;
      params.api.refreshCells({
        columns: ['value', 'RegularSellPrice'],
        rowNodes: [params.node],
        force: true,
      });
    }
  }

  saveAction(params) {
    if (this.viewType === 'byPriceGroup') {
      this.spinner.show();
      this.advanceSearchGridAPI.stopEditing();
      this.setupService
        .updateData(
          'StorePriceGroup/update/' +
          params.data.storeLocationID +
          '/' +
          params.data.groupID +
          '/' +
          params.data.sellingPrice +
          '/' +
          params.data.buyingCost,
          {}
        )
        .subscribe(
          (res) => {
            this.spinner.hide();
            if (res === '1') {
              this.toastr.success(
                this.constantService.infoMessages.updatedRecord,
                this.constantService.infoMessages.success
              );
            } else {
              this.toastr.error(
                this.constantService.infoMessages.updateRecordFailed,
                this.constantService.infoMessages.error
              );
            }
          },
          (error) => {
            this.spinner.hide();
            console.log(error);
          }
        );
    } else {
      this.advanceSearchGridAPI.stopEditing();
      const postData = {
        value: Number(params.data.RegularSellPrice),
        isShowPrice: false,
        price: 0,
        columnName: 'SellingPrice',
        itemlst: String(params.data.ItemID),
        storelst: String(params.data.StoreLocationID),
        storelocationitemlst: String(params.data.StoreLocationID),
        username: this.userInfo.userName,
        CompanyID: this.userInfo.companyId,
        isBWatchList: this.isBWatchList,
        ID: 0,
      };
      this.spinner.show();
      this.setupService.updateData('Item/BulkUpdate', postData).subscribe(
        (res) => {
          this.spinner.hide();
          if (res === '1') {
            params.data.rowEditingStarted = false;
            params.api.refreshCells({
              columns: ['value'],
              rowNodes: [params.node],
              force: true,
            }); this.toastr.success(
              this.constantService.infoMessages.updatedRecord,
              this.constantService.infoMessages.success
            );
            this.getAdvancedSearch('');
          } else {
            this.toastr.error(
              this.constantService.infoMessages.updateRecordFailed,
              this.constantService.infoMessages.error
            );
          }
        },
        (err) => {
          this.spinner.hide();
          this.toastr.error(
            this.constantService.infoMessages.contactAdmin,
            this.constantService.infoMessages.error
          );
          console.log(err);
        }
      );
    }
  }

  dynamicValidation(criteria) {
    if (criteria === 'byPriceGroup') {
      if (!this.advancedSearchForm.get('priceGroupLocationCriteria').value) {
        return false;
      }
    }
    if (criteria === 'byDepartment') {
      if (
        !this.advancedSearchForm.get('priceGroup').value &&
        !this.advancedSearchForm.get('sellingPrice').value &&
        !this.advancedSearchForm.get('posSyncStatus').value &&
        !this.advancedSearchForm.get('posCodeOrDesc').value &&
        (!this.advancedSearchForm.get('department').value ||
          this.advancedSearchForm.get('department').value.length === 0) &&
        (!this.advancedSearchForm.get('locationCriteria').value ||
          this.advancedSearchForm.get('locationCriteria').value.length === 0) &&
        (!this.advancedSearchForm.get('vendorCriteria').value ||
          this.advancedSearchForm.get('vendorCriteria').value.length === 0)
      ) {
        return false;
      }
    }
    return true;
  }

  onFilterTextBoxChanged() {
    this.advanceSearchGridAPI.setQuickFilter(this.searchText);
  }

  getAdvancedSearch(criteria: string) {
    this.showDelSelItems = false;
    this.showBulkUpdate = false;
    this.headerSelected = false;
    this.selectedItems = 0;
    this.selectedStoreLocationItemIds = '';
    this.selectedItemsIds = '';
    if (!this.dynamicValidation(criteria)) {
      this.toastr.warning('Please Select Any Value', 'warning');
      return;
    }
    if (criteria !== 'byPriceGroup' && criteria !== 'byDepartment' && (this.advancedSearchForm.value.posCodeOrDesc === null || this.advancedSearchForm.value.posCodeOrDesc.trim() === '')) {
      this.toastr.warning('Enter UPC or Item Description', 'warning');
      return;
    }
    if (this.viewType !== criteria) this.showGrid = false;
    this.viewType = criteria;
    this.headerChange('');
    //this.isAdvanceSearchCollapsed = true;
    if (criteria === 'byPriceGroup') {
      this.showItemSearchBox = false;
      // this.showShowPricing = false;
      if (this.storeLocationList && this.storeLocationList.length > 1) {
        this.advanceSearchGridOptions = this.paginationGridService.getGridOption(
          this.constantService.gridTypes.manageItemsByPriceGrpGrid
        );
      } else {
        this.advanceSearchGridOptions = this.paginationGridService.getGridOption(
          this.constantService.gridTypes.manageItemsByPriceGrpGridSingleStore
        );
      }
      if (this.showGrid) {
        this.searchByPriceGroups();
      } else {
        setTimeout(() => {
          this.showGrid = true;
        });
      }
    } else {
      this.advancedSearchForm.value.priceGroupLocationCriteria = new FormControl(
        ''
      );
      this.showGrid = false;
      setTimeout(() => {
        // if (this.advancedSearchForm.value.isShowPricing) {
        if (this.storeLocationList && this.storeLocationList.length > 1) {
          this.advanceSearchGridOptions = this.paginationGridService.getGridOption(
            this.constantService.gridTypes.manageItemsPricingGrid
          );
        } else {
          this.advanceSearchGridOptions = this.paginationGridService.getGridOption(
            this.constantService.gridTypes.manageItemsPricingGridWithoutStore
          );
        }
        this.advanceSearchGridOptions.paginationPageSize = this.selectedTableSize ? Number(this.selectedTableSize) : this.advanceSearchGridOptions.paginationPageSize;
        this.showGrid = true;
        if (this.advanceSearchGridAPI)
          this.advanceSearchGridAPI.sizeColumnsToFit();
        this.postData = this.fetchAdvSearchPostData();
        if (this.showGrid && this.advanceSearchGridAPI) this.advanceSearchGridAPI.purgeServerSideCache([]);
        else {
          setTimeout(() => {
            this.showGrid = true;
            if (this.advanceSearchGridAPI)
              this.advanceSearchGridAPI.sizeColumnsToFit();
          });
        }
      });
    }
  }

  fetchAdvSearchPostData() {
    let storeLocation: any;
    if (this.storeLocationList && this.storeLocationList.length !== 1) {
      storeLocation = this.advancedSearchForm.value.locationCriteria
        ? this.advancedSearchForm.value.locationCriteria
          .map((x) => x.storeLocationID)
          .join(',')
        : '';
    } else {
      storeLocation = this.advancedSearchForm.value.locationCriteria;
    }
    const vendoeLst = this.advancedSearchForm.value.vendorCriteria
      ? this.advancedSearchForm.value.vendorCriteria
        .map((x) => x.vendorID)
        .join(',')
      : '';
    const departmentLst = this.advancedSearchForm.value.department
      ? this.advancedSearchForm.value.department
        .map((x) => x.departmentID)
        .join(',')
      : '';
    const constLocationList = this.storeLocationList
      ? this.storeLocationList.map((x) => x.storeLocationID).join(',')
      : '';
    let advSearchPostData: any = {
      companyID: this.userInfo.companyId,
      posCodeOrDesc: this.advancedSearchForm.value.posCodeOrDesc
        ? this.advancedSearchForm.value.posCodeOrDesc
        : '',
      sellingUnitStart: this.advancedSearch.sellingUnits
        ? this.advancedSearchForm.value.sellingUnitStart
        : null,
      sellingUnitEnd: this.advancedSearch.sellingUnits
        ? this.advancedSearchForm.value.sellingUnitEnd
        : null,
      unitsInCaseStart: this.advancedSearch.unitinCase
        ? this.advancedSearchForm.value.unitsInCaseStart
        : null,
      unitsInCaseEnd: this.advancedSearch.unitinCase
        ? this.advancedSearchForm.value.unitsInCaseEnd
        : null,
      sellingPriceStart: this.advancedSearch.sellingPrice
        ? this.advancedSearchForm.value.sellingPriceStart
        : null,
      sellingPriceEnd: this.advancedSearch.sellingPrice
        ? this.advancedSearchForm.value.sellingPriceEnd
        : null,
      inventoryValuePriceStart: this.advancedSearch.inventoryValuePrice
        ? this.advancedSearchForm.value.inventoryValuePriceStart
        : null,
      inventoryValuePriceEnd: this.advancedSearch.inventoryValuePrice
        ? this.advancedSearchForm.value.inventoryValuePriceEnd
        : null,
      currentInventoryStart: this.advancedSearch.currentInventory
        ? this.advancedSearchForm.value.currentInventoryStart
        : null,
      currentInventoryEnd: this.advancedSearch.currentInventory
        ? this.advancedSearchForm.value.currentInventoryEnd
        : null,
      pMStartCriteria: this.advancedSearch.pmCriteria
        ? this.advancedSearchForm.value.pMStartCriteria
        : null,
      pmEndCriteria: this.advancedSearch.pmCriteria
        ? this.advancedSearchForm.value.pmEndCriteria
        : null,
      locationCriteria: this.advancedSearch.locationCriteria
        ? storeLocation
        : constLocationList,
      vendorCriteria: vendoeLst ? vendoeLst : '',
      department: departmentLst ? departmentLst : '',
      posSyncStatus: this.advancedSearchForm.value.posSyncStatus
        ? this.advancedSearchForm.value.posSyncStatus
        : '',
      isShowPricing: this.advancedSearchForm.value.isShowPricing
        ? this.advancedSearchForm.value.isShowPricing
        : true,
      isClick: this.advancedSearchForm.value.isClick
        ? this.advancedSearchForm.value.isClick
        : true,
      isOnWatchList:
        this.advancedSearchForm.value.isOnWatchList === '' ||
          this.advancedSearchForm.value.isOnWatchList === null
          ? null
          : JSON.parse(
            this.advancedSearchForm.value.isOnWatchList.toLowerCase()
          ),
      priceGroup: this.advancedSearchForm.value.priceGroup
        ? this.advancedSearchForm.value.priceGroup
        : null,
      isMultipack: this.gridProperties.showMultipackPricing
        ? this.gridProperties.showMultipackPricing
        : false,
      isActive:
        this.advancedSearchForm.value.isActive === '' ||
          this.advancedSearchForm.value.isActive === null
          ? null
          : JSON.parse(this.advancedSearchForm.value.isActive.toLowerCase()),
      searchBy: this.advancedSearchForm.value.searchBy
        ? this.advancedSearchForm.value.searchBy
        : null,
      isShowMultiPackPricing: this.gridProperties.showMultipackPricing
        ? this.gridProperties.showMultipackPricing
        : false,
      isShowDetails: this.gridProperties.showDetails
        ? this.gridProperties.showDetails
        : false,
    };
    return advSearchPostData;
  }

  getSearchData(params) {
    const noOfRecords = params.request.endRow - params.request.startRow;
    const pageNumber =
      params.request.startRow === 0
        ? 1
        : params.request.startRow / noOfRecords + 1;
    this.spinner.show();
    let url =
      'item/getitems?PageNumber=' + pageNumber + '&noOfRecords=' + noOfRecords;
    if (this.searchText) url += '&searchValue=' + this.searchText;
    this.setupService.postData(url, this.postData).subscribe(
      (response) => {
        this.spinner.hide();
        if (response && response['statusCode']) {
          this.advanceSearchGridAPI.showNoRowsOverlay();
          params.successCallback([], 0);
          if (this.isAdvanceSearchOpen) {
            this.isAdvanceSearchOpen = false;
          }
          this.toastr.warning('Unable to fetch record', 'warning');
          return;
        }
        this.recordsCount = 0;
        if (response.length > 0) {
          this.advanceSearchGridAPI.hideOverlay();
          this.selectedItems = 0;
          this.advanceSearchGridAPI.deselectAll();
          this.isAdvanceSearchOpen = false;
          this.recordsCount = response[0].TotalRecordCount;
          if (Number(this.selectedTableSize) > this.recordsCount) {
            this.pageCount = this.recordsCount;
          } else {
            this.pageCount = Number(this.selectedTableSize);
          }
          let itemIds = response.map(a => a.ItemID);
          params.successCallback(response, response[0].TotalRecordCount);
          setTimeout(() => {
            if (this.advanceSearchGridAPI)
              this.advanceSearchGridAPI.sizeColumnsToFit();
            this.headerChange(itemIds);
          }, 100)
        } else {
          this.advanceSearchGridAPI.showNoRowsOverlay();
          params.successCallback([], 0);
          if (this.isAdvanceSearchOpen) {
            this.isAdvanceSearchOpen = false;
          }
        }
      },
      (error) => {
        this.spinner.hide();
        this.recordsCount = 0;
        this.toastr.error('Unable to fetch record');
        console.log(error);
      }
    );
  }

  selectUnits(formControl) {
    if (formControl === 'sellingUnits') {
      this.advancedSearchForm.get('sellingUnitStart').setValue(0);
      this.advancedSearchForm.get('sellingUnitEnd').setValue(0);
    }
    if (formControl === 'unitinCase') {
      this.advancedSearchForm.get('unitsInCaseStart').setValue(0);
      this.advancedSearchForm.get('unitsInCaseEnd').setValue(0);
    }
    if (formControl === 'sellingPrice') {
      this.advancedSearchForm.get('sellingPriceStart').setValue(0);
      this.advancedSearchForm.get('sellingPriceEnd').setValue(0);
    }
    if (formControl === 'inventoryValuePrice') {
      this.advancedSearchForm.get('inventoryValuePriceStart').setValue(0);
      this.advancedSearchForm.get('inventoryValuePriceEnd').setValue(0);
    }
    if (formControl === 'currentInventory') {
      this.advancedSearchForm.get('currentInventoryStart').setValue(0);
      this.advancedSearchForm.get('currentInventoryEnd').setValue(0);
    }
    if (formControl === 'pmCriteria') {
      this.advancedSearchForm.get('pMStartCriteria').setValue(0);
      this.advancedSearchForm.get('pmEndCriteria').setValue(0);
    }
  }

  selectStore() {
    this.storeLocationID = this.advancedSearchForm.value.locationCriteria;
  }

  hideSearch(from) {
    if (from == 'isAdvanceSearchOpen') {
      // this.isAdvanceSearchOpen = false;
      this.advancedSearchForm.reset();
    } else {
      this.isSearchByPriceGroupsOpen = false;
    }
  }

  openSearch(from) {
    if (from == 'isAdvanceSearchOpen') {
      this.isAdvanceSearchOpen = !this.isAdvanceSearchOpen;
      this.isSearchByPriceGroupsOpen = false;
      this.isBulkUpdateOpen = false;
      // this.showShowPricing = true;
      this.showItemSearchBox = true;
      // this.advancedSearchForm.reset();
      this.advancedSearchForm.value.priceGroupLocationCriteria = new FormControl(
        ''
      );
    } else if (from == 'isSearchByPriceGroupsOpen') {
      if (this.storeLocationList && this.storeLocationList.length === 1) {
        this.advancedSearchForm.get('priceGroupLocationCriteria').setValue(this.storeLocationList[0].storeLocationID);
        this.getAdvancedSearch('byPriceGroup');
      }
      this.isAdvanceSearchOpen = false;
      this.isBulkUpdateOpen = false;
      this.isSearchByPriceGroupsOpen = !this.isSearchByPriceGroupsOpen;
    } else {
      this.isAdvanceSearchOpen = false;
      this.isSearchByPriceGroupsOpen = false;
      this.isBulkUpdateOpen = !this.isBulkUpdateOpen;
      if (this.storeLocationList && this.storeLocationList.length === 1) {
        this.storeLocationID = this.storeLocationList[0].storeLocationID;
        this.showBulkUpdateStoreSelection = false;
      }
      if (this.viewType === 'byPriceGroup') {
        this.updateData = [
          { id: 'SellingPrice', name: 'Selling Price' },
          { id: 'Buying', name: 'Buying Cost' }
        ];
      } else {
        this.updateData = [
          { id: 'IsActive', name: 'Active' },
          { id: 'Department', name: 'Department' },
          { id: 'CurrentInv', name: 'Current Inventory' },
          { id: 'SellingPrice', name: 'Selling Price' },
          { id: 'Buying', name: 'Buying Cost' },
          { id: 'SellingUnits', name: 'Selling Units' },
          { id: 'UnitOfMeasurement', name: 'Unit Of Measurement' },
          { id: 'UnitsInCase', name: 'Units In Case' },
          { id: 'BuyDown', name: 'Buy Down' },
          { id: 'PriceGroup', name: 'Price Group' },
          { id: 'PriceByFixedAmount', name: 'Price By Fixed Amount' },
          { id: 'PriceByPercent', name: 'Price By Percentage' },
          { id: 'POSSyncStatus', name: 'POS Sync Status' },
          { id: 'IsOnWatchList', name: 'Track Item' },
          { id: 'Multipack', name: 'Multipack' },
          {
            id: 'PriceByBuyingCostByFixedAmount',
            name: 'By Buying Cost By Fixed Amount',
          },
          { id: 'PriceByBuyingCostByPercent', name: 'By Buying Cost By Percentage' },
        ];
      }
    }
  }

  defaultTableSize() {
    this.advanceSearchGridAPI.paginationSetPageSize(
      Number(this.selectedTableSize)
    );
  }

  searchByPriceGroups() {
    this.spinner.show();
    this.setupService
      .getData(
        'StorePriceGroup/GetStorePriceGroupsByStoreLocation/' +
        this.advancedSearchForm.value.priceGroupLocationCriteria
      )
      .subscribe(
        (response) => {
          this.hideSearch('isSearchByPriceGroupsOpen');
          this.advanceSearchGridAPI.setRowData(response);
          this.advanceSearchGridAPI.sizeColumnsToFit();
          this.spinner.hide();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  onAdvanceSearchGridCellClicked(event) {
    if (event.colDef.field === 'itemCount') {
      this.isPriceGroupItemPanelHidden = true;
      this.isPriceGroupItemPanelOpen = true;
      this.searchItemsByPriceGroupId(event.data);
    }
  }

  handlePriceGroupItemOpenClose(isOpen: boolean) {
    this.isPriceGroupItemPanelOpen = isOpen;
    setTimeout(() => {
      this.isPriceGroupItemPanelHidden = isOpen;
    });
  }

  searchItemsByPriceGroupId(params) {
    this.spinner.show();
    this.setupService
      .getData(
        'StoreLocationItem/getStoreLocationItemByStoreLocationAndGroupID/' +
        params.storeLocationID +
        '/' +
        params.groupID
      )
      .subscribe(
        (response) => {
          if (response && response.length > 0) {
            this.advanceSearchGridAPI.hideOverlay();
            this.itemByPriceGroupGridAPI.setRowData(response);
          } else {
            this.advanceSearchGridAPI.showNoRowsOverlay();
          }
          this.itemByPriceGroupGridAPI.sizeColumnsToFit();
          this.spinner.hide();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  onPriceGroupGridReady(params) {
    this.itemByPriceGroupGridAPI = params.api;
  }

  onPaginationClick(params) {
    this.pageCount =
      params.api.paginationGetCurrentPage() *
      params.api.paginationGetPageSize() +
      params.api.paginationGetPageSize();
    if (this.pageCount > params.api.paginationGetRowCount())
      this.pageCount = params.api.paginationGetRowCount();
    this.recordsCount = params.api.paginationGetRowCount();
  }

  // fetchShowPricingGridData(currentPage: any, perPageRecords: any) {
  //   this.spinner.show();
  //   let showPricingPostData = this.fetchAdvSearchPostData();
  //   this.setupService
  //     .postData(
  //       'item/getitems?PageNumber=' +
  //       currentPage +
  //       '&noOfRecords=' +
  //       perPageRecords,
  //       showPricingPostData
  //     )
  //     .subscribe(
  //       (response) => {
  //         this.spinner.hide();
  //         if (response && response['statusCode']) {
  //           this.toastr.warning('Unable to fetch record', 'warning');
  //           return;
  //         }
  //         // this.showPricingGridRowData = response;
  //         // this.showPricingGridTotalCount = response[0] ? response[0].TotalRecordCount : 0;
  //         // this.showPricingGridOptions.totalRecords = response[0].TotalRecordCount;
  //         // this.showPricingGridColData = response;
  //       },
  //       (error) => {
  //         this.spinner.hide();
  //         this.toastr.error('Unable to fetch record');
  //         console.log(error);
  //       }
  //     );
  // }
  suspendAction(event) {
    this.spinner.show();
    let postData = {
      itemId: event.data.ItemID,
      username: this.userInfo.userName
    }
    this.setupService.postData(`Item/ItemDeletion`, postData).
      subscribe((response: any) => {
        if (response.status && response.status === 1) {
          var rowNode = this.advanceSearchGridAPI
            .getRowNode(event.node.id);
          let rowData = event.data;
          rowData.ActiveFlag = false;
          rowNode.setData(rowData);
          this.advanceSearchGridAPI.redrawRows(rowNode);
          this.spinner.hide();
          this.toastr.success("Item Suspended Successfully", this.constantService.infoMessages.success);
        } else {
          this.spinner.hide();
          this.toastr.error("Item Suspension Failed", this.constantService.infoMessages.error);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.contactAdmin);
      });
  }

  recoverAction(event) {
    this.spinner.show();
    let postData = {
      itemId: event.data.ItemID,
      username: this.userInfo.userName,
      withMultipackItem: false
    }
    this.setupService.postData(`Item/ItemRecovery`, postData).
      subscribe((response: any) => {
        if (response.status && response.status === 1) {
          var rowNode = this.advanceSearchGridAPI.getRowNode(event.node.id);
          let rowData = event.data;
          rowData.ActiveFlag = true;
          rowNode.setData(rowData);
          this.advanceSearchGridAPI.redrawRows(rowNode);
          this.spinner.hide();
          this.toastr.success("Item Recovered Successfully", this.constantService.infoMessages.success);
        } else {
          this.spinner.hide();
          this.toastr.error("Item Recovery Failed", this.constantService.infoMessages.error);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.contactAdmin);
      });
  }

  deleteAction(params) {
    this.spinner.show();
    this.setupService.deleteData(`Item/delete?itemid=` + params.data.ItemID + `&isStoreDelete=` + this.gridProperties.showDetails + `&isShowPricing=` + this.gridProperties.showPricing + `&isMultiPackPrice=` + this.gridProperties.showMultipackPricing + `&MultiPackItemID=` + params.data.MultipackItemID + `&loclst=` + params.data.StoreLocationID + `&storeLocationItemID=` + params.data.StoreLocationItemID).
      subscribe((response: any) => {
        if (response && response === "1") {
          this.spinner.hide();
          this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
          this.advanceSearchGridAPI.purgeServerSideCache([]);
        } else {
          this.spinner.hide();
          this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.contactAdmin);
      });
  }

  headerChange(itemIds?) {
    const checked = this.headerSelected;
    if (this.advanceSearchGridAPI) {
      this.advanceSearchGridAPI.forEachNode(function (rowNode) {
        rowNode.setSelected(checked);
      });
    }
  }

  deleteSelectedItems() {
    let selectedRows = this.advanceSearchGridAPI.getSelectedRows();
    if (selectedRows.length === 0) {
      this.spinner.hide();
      this.toastr.error(this.constantService.infoMessages.selectOneRecord, this.constantService.infoMessages.error);
    } else {
      this.spinner.show();
      let selectedItems = "";
      let selectedStoreLocationIds = "";
      let selectedMutiPackItemIds = "";
      let selectedStoreLocationItemIds = "";
      if (selectedRows.length === 1) {
        selectedItems = selectedRows[0].ItemID;
        selectedStoreLocationIds = selectedRows[0].StoreLocationID;
        selectedMutiPackItemIds = selectedRows[0].MultipackItemID;
        selectedStoreLocationItemIds = selectedRows[0].StoreLocationItemID;
      } else {
        selectedItems = selectedRows ? selectedRows.map(x => x.ItemID).join(',') : '';
        selectedStoreLocationIds = selectedRows ? selectedRows.map(x => x.StoreLocationID).join(',') : '';
        selectedMutiPackItemIds = selectedRows ? selectedRows.map(x => x.MultipackItemID).join(',') : '';
        selectedStoreLocationItemIds = selectedRows ? selectedRows.map(x => x.StoreLocationItemID).join(',') : '';
      }
      this.setupService.deleteData(`Item/DeleteSelected?itemid=` + selectedItems + `&isStoreDelete=` + this.gridProperties.showDetails + `&isShowPricing=` + this.gridProperties.showPricing + `&isMultiPackPrice=` + this.gridProperties.showMultipackPricing + `&multiPackItemList=` + selectedMutiPackItemIds + `&loclst=` + selectedStoreLocationIds + `&storeLocationItemID=` + selectedStoreLocationItemIds).
        subscribe((response: any) => {
          if (response && response === "1") {
            this.spinner.hide();
            this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
            this.advanceSearchGridAPI.purgeServerSideCache([]);
          } else {
            this.spinner.hide();
            this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
          }
        }, error => {
          this.spinner.hide();
          this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.contactAdmin);
        });
    }
  }
  suspendSelectedItems() {
    let selectedRows = this.advanceSearchGridAPI.getSelectedRows();
    if (selectedRows.length === 0) {
      this.spinner.hide();
      this.toastr.error(this.constantService.infoMessages.selectOneRecord, this.constantService.infoMessages.error);
    } else {
      let postData = [];
      if (selectedRows.length === 1) {
        if (!selectedRows[0].ActiveFlag) {
          this.toastr.error('The item is already suspended', this.constantService.infoMessages.error);
          return;
        }
        else {
          this.spinner.show();
          postData.push({
            itemId: selectedRows[0].ItemID,
            username: this.userInfo.userName
          });
        }
      } else {
        for (let i = 0; i < selectedRows.length; i++) {
          postData.push({
            itemId: selectedRows[i].ItemID,
            username: this.userInfo.userName
          });
        }
      }
      this.setupService.postData(`Item/SuspendItem`, postData).
        subscribe((response: any) => {
          if (response.status && response.status === 1) {
            // selectedRows.forEach((value) => {
            //   this.rowData.filter(r => { if (r.ItemID == value.ItemID) { r.ActiveFlag = false; } });
            // });
            this.advanceSearchGridAPI.deselectAll();
            this.advanceSearchGridAPI.purgeServerSideCache([]);
            //this.gridApi.redrawRows();
            this.spinner.hide();
            this.toastr.success("Item(s) suspended successfully", this.constantService.infoMessages.success);
          } else {
            this.spinner.hide();
            this.toastr.error("Item(s) suspension failed", this.constantService.infoMessages.error);
          }
        }, error => {
          this.spinner.hide();
          this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.contactAdmin);
        });
    }
  }
  recoverSelectedItems() {
    let selectedRows = this.advanceSearchGridAPI.getSelectedRows();
    if (selectedRows.length === 0) {
      this.spinner.hide();
      this.toastr.error(this.constantService.infoMessages.selectOneRecord, this.constantService.infoMessages.error);
    } else {
      let postData = [];
      if (selectedRows.length === 1) {
        if (selectedRows[0].ActiveFlag) {
          this.toastr.error('The Item is not suspended yet', this.constantService.infoMessages.error);
          return;
        }
        else {
          this.spinner.show();
          postData.push({
            itemId: selectedRows[0].ItemID,
            username: this.userInfo.userName,
            WithMultipackItem: true
          });
        }
      } else {
        for (let i = 0; i < selectedRows.length; i++) {
          postData.push({
            itemId: selectedRows[i].ItemID,
            username: this.userInfo.userName,
            WithMultipackItem: true
          });
        }
      }
      this.setupService.postData(`Item/ItemRecovery`, postData).
        subscribe((response: any) => {
          if (response.status && response.status === 1) {
            // selectedRows.forEach((value) => {
            //   this.rowData.filter(r => { if (r.ItemID == value.ItemID) { r.ActiveFlag = true; } });
            // });
            this.advanceSearchGridAPI.deselectAll();
            this.advanceSearchGridAPI.purgeServerSideCache([]);
            //this.gridApi.redrawRows();
            this.spinner.hide();
            this.spinner.hide();
            this.toastr.success("Item recovered successfully", this.constantService.infoMessages.success);
          } else {
            this.spinner.hide();
            this.toastr.error("Item recovery failed", this.constantService.infoMessages.error);
          }
        }, error => {
          this.spinner.hide();
          this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.contactAdmin);
        });

    }
  }

  itemHistory(params) {
    this.editAction(params, 'Item History');
  }

  salesActivity(params) {
    this.editAction(params, 'Sales Activity');
  }

  onPanelSelection(params) {
    this.additionalActions = {
      navigateToItemHistory: false,
      navigateToSalesActivity: false,
      navigateToItem: false
    };
    if (!params) {
      this.additionalActions.navigateToItem = true;
    } else if (params.panelName === 'Item History') {
      this.additionalActions.navigateToItemHistory = true;
    } else if (params.panelName === 'Sales Activity') {
      this.additionalActions.navigateToSalesActivity = true;
    }
  }

  onRowEditingStarted(params) {
    this.oldSellingPriceValue = params.data.RegularSellPrice;
    params.data.rowEditingStarted = true;
    params.noSave = false;
    params.api.refreshCells({
      columns: ['value'],
      rowNodes: [params.node],
      force: true,
    });
  }

  onRowEditingStopped(params) {
    params.data.rowEditingStarted = false;
    params.data.RegularSellPrice = this.oldSellingPriceValue;
    params.noSave = true;
    params.api.refreshCells({
      columns: ['value', 'RegularSellPrice'],
      rowNodes: [params.node],
      force: true,
    });
  }

  preventInput(event, min, max) {
    let input = this.value === "" ? 0 : parseInt(this.value);
    if (input < min || input > max) {
      event.preventDefault()
      this.value = parseInt(input.toString().substring(0, max.toString().length));
    }
  }

  preventDecimalInput(event, min, max) {
    let input = this.value === "" ? 0 : Number(this.value);
    if (input < min || input > max) {
      event.preventDefault()
      this.value = parseInt(input.toString().substring(0, parseInt(max).toString().length));
    }
  }
}
