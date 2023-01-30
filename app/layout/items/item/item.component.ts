import { Component, OnInit, ViewChild } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { ConstantService } from '@shared/services/constant/constant.service';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { StoreService } from '@shared/services/store/store.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { CommonService } from '@shared/services/commmon/common.service';
import { MessageService } from '@shared/services/commmon/message-Service';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { timeout } from 'rxjs/operators';
import { GridApi } from 'ag-grid-community';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  animations: [routerTransition()]
})
export class ItemComponent implements OnInit {
  headerSelected = false;
  showGrid = false;
  showUPCGrid = false;
  showUPCForm = false;
  upcGridData: any;
  upcGridApi: any;
  upcGridOptions: any;
  postData: any;
  isAdvanceSearch = false;
  isBulkUpdate = false;
  filterText = '';
  searchByDepatPrice = '';
  @ViewChild('itemMasterGrid') itemMasterGrid: any;
  @ViewChild('sellingPriceModal') sellingPriceModal: any;
  @ViewChild('validateAddUPCModal') validateAddUPCModal: any;
  @ViewChild('setUOMModal') setUOMModal: any;
  userInfo = this.constantService.getUserInfo();
  gridProperties = { showPricing: false, showMultipackPricing: false, showDetails: false };
  isBulkUpdateCollapsed = true;
  isAdvanceSearchCollapsed = true;
  isAddItem: boolean;
  _itemId: any;
  _upcCode: any;
  isSearch = false;
  departmentDetails: any;
  // grid
  gridOptions: any;
  gridApi: GridApi;
  private gridColumnApi;
  rowData: any = [];
  storeLocationList: any[];
  isShowGrid: boolean;
  isLoading = true;
  isStoreLocationLoading = true;
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
    vendorCriteria: [null],
    department: [''],
    posSyncStatus: [null], // 0,
    isShowPricing: [null],
    isClick: [true],
    isOnWatchList: [''],
    priceGroup: [], // 0,
    isMultipack: [true],
    isActive: [null],
    searchBy: [0], // 0,
    isShowMultiPackPricing: [false],
    isShowDetails: [false],
    searchByDepat: [true],
    searchByPriceGroup: [false],
    showPricing: [false],
    showMultipackPricing: [false],
    UOM_ID: [0] //for both pack and carton
  });

  frmShowUPCGrid = this.fb.group({
    UPCStoreLocationID: [],
    UPCDepartmentID: 0,
    UPCSPrice: 0,
  });
  priceGroupList: any;
  posSyncStatusList: any;
  unitsCasePriceCost = [{ id: '1', name: 'Equal' }, { id: '2', name: 'Less than Equal to' },
  { id: '3', name: 'Greater than Equal to' }, { id: '4', name: 'Between' }];
  // dropdown data
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
    { name: 'Items with Parent / Child', id: 10 }
  ];
  // dropdown data
  updateData = [
    { id: 'IsActive', name: 'Active' },
    { id: 'Department', name: 'Department' },
    { id: 'CurrentInv', name: 'Current Inventory' },
    { id: 'SellingPrice', name: 'Selling Price' },
    { id: 'Buying', name: 'Buying Cost' },
    { id: 'SellingUnits', name: 'Selling Units' },
    { id: 'UnitOfMeasurement', name: 'Unit Of Measurement' },
    { id: 'UnitsInCase', name: 'Units In Case' },
    { id: 'BuyDownAmt', name: 'Buy Down' },
    // { id: 'RackAllowance', name: 'Rack Allowance' },
    // { id: 'ProfitMargin', name: 'Profit Margin' },
    { id: 'PriceGroup', name: 'Price Group' },
    { id: 'PriceByFixedAmount', name: 'Price By Fixed Amount' },
    { id: 'PriceByPercent', name: 'Price By Percentage' },
    { id: 'POSSyncStatus', name: 'POS Sync Status' },
    { id: 'IsOnWatchList', name: 'Track Item' },
    { id: 'Multipack', name: 'Multipack' },
    // { id: 18, name: 'Stock Transfer' },
    { id: 'PriceByBuyingCostByFixedAmount', name: 'By Buying Cost By Fixed Amount' },
    { id: 'PriceByBuyingCostByPercent', name: 'By Buying Cost By Percentage' },
  ];
  activeUpdateList = [
    { id: false, name: 'False' },
    { id: true, name: 'True' },
  ];
  isHideActive = true;
  isHideCurretnInventory = true;
  isHideOnlyNumber = true;
  isHideDollerNumber = true;
  priceByFixedAmount = false;
  isHidePOSSyncStatus = true;
  isHideDepartment = true;
  isHideUOM = true;
  isHideMultipack = true;
  isHidePriceGroup = true;
  departmentList: any;
  vendorList: any;
  isBWatchList: String;
  departmentListByUser: any;
  possyncstatsusid: any;
  posSyncStatusID = 0;
  departmentid = 0;
  value = null;
  columnName: any;
  storeLocationID = null;
  uomId: any;
  price: Number;
  initialAdvanceForm: any;
  selectedItems = 0;
  selectedItemsIds = '';
  uomList: any;
  isShowPrice = false;
  selectedStoreLocationItemIds: any;
  UPCSelectedPriceGroup: any = []
  Id = null;
  isHidePositiveValue = true;
  showDelSelItems = false;
  isSamePage = false;
  notificationStoreId = 0;
  // departmentTypeList: any;
  sellingPriceValidations: any;
  addUPCCodeValidations: any;
  bulkUpdateData: any;
  addUPCCodesData: any;
  itemStatus: any = {
    new: 0,
    newStatusCounts: [],
    current: 0,
    currentStatusCounts: [],
    pushToPOS: 0,
    pushToPOSStatusCounts: [],
    inProgress: 0,
    inProgressStatusCounts: [],
    error: 0,
    errorStatusCounts: [],
    suspended: 0,
    suspendedStatusCounts: [],
  };
  constructor(private gridService: PaginationGridService, private constantService: ConstantService,
    private itemService: SetupService, private fb: FormBuilder, private spinner: NgxSpinnerService,
    private storeService: StoreService, private toastr: ToastrService, private router: Router, private commonService: CommonService, private messageService: MessageService, private modalService: NgbModal) {
    if (localStorage.getItem('notification')) {
      this.notificationStoreId = parseInt(localStorage.getItem('notification'));
      localStorage.removeItem('notification');
    }
    this.messageService.getNotification().subscribe((res) => {
      this.notificationStoreId = res.storeId;
      if (this.isSamePage)
        this.searchByStoreForPushToPOS();
      else
        this.ngOnInit();
    });
    this.gridOptions = this.gridService.getGridOption(this.constantService.gridTypes.itemDetailGrid);
    this.upcGridOptions = this.gridService.getGridOption(this.constantService.gridTypes.itemUPCDetailGrid);
    this.initialAdvanceForm = this.advancedSearchForm.value;
    this.commonService.storageItem = null;
    this.searchByDepatPrice = 'byPriceGroup';
  }

  ngOnInit() {
    this.getPOSGroup();
    this.getStoreLocation();
    this.getVendorByCompanyId();
    this.getDepartment();
    this.getUOM();

    this.openAdvanceSearch();
    this.fetchUPCGridData();
    this.fetchItemStatus();
    if (this.commonService.advItemSearch.isBackTolist) {
      setTimeout((e) => {
        this.advancedSearchForm.patchValue(this.commonService.advItemSearch.advaSearchOptions);
        this.rowData = this.commonService.advItemSearch.gridValues;
        this.isAdvanceSearchCollapsed = true;
        this.isAdvanceSearch = false;
        this.showGrid = true;
        this.commonService.advItemSearch.isBackTolist = false;
      }, 3000);
    }
    // if(this.pushToPOSStoreId > 0)
    //   this.searchByStoreForPushToPOS();
    //selectSearchBy('byDepartment')
  }
  searchByStoreForPushToPOS() {
    this.advancedSearchForm.patchValue(this.initialAdvanceForm);
    this.searchByDepatPrice === 'byDepartment'
    if (this.storeLocationList && this.storeLocationList.find(k => k.storeLocationID === this.notificationStoreId)) {
      const arr = this.storeLocationList.filter(k => k.storeLocationID === this.notificationStoreId);
      this.advancedSearchForm.get('locationCriteria').setValue(arr);
      this.storeLocationID = arr;
    }
    if (this.posSyncStatusList && this.posSyncStatusList.find(k => k.posSyncStatusCode == 'Error'))
      this.advancedSearchForm.get('posSyncStatus').setValue(this.posSyncStatusList.filter(k => k.posSyncStatusCode == 'Error')[0].posSyncStatusID)
    this.searchByDepatPrice = 'byDepartment';
    this.getAdvancedSearch();
    this.notificationStoreId = 0;
    this.isSamePage = true;
  }
  selectSearchBy(name) {
    if (!this.notificationStoreId) {
      this.clearAdvanceSearch();
      this.searchByDepatPrice = name;
    }
    // if (this.commonService.advItemSearch.isBackTolist) {
    //   this.advancedSearchForm.patchValue(this.commonService.advItemSearch.advaSearchOptions);
    //   // this.rowData = this.commonService.advItemSearch.gridValues;
    // }
  }
  getStoreLocation(): any {
    if (this.storeService.storeLocation) {
      this.isStoreLocationLoading = false;
      this.storeLocationList = this.storeService.storeLocation;
      this.bindStoreLocationID();
      this.bindBulkUpdateStoreLocationID();
      if (this.notificationStoreId > 0 && !this.isLoading)
        this.searchByStoreForPushToPOS();
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.storeLocationList = this.storeService.storeLocation;
        this.isStoreLocationLoading = false;
        this.bindStoreLocationID();
        this.bindBulkUpdateStoreLocationID();
        if (this.notificationStoreId > 0 && !this.isLoading)
          this.searchByStoreForPushToPOS();
      }, (error) => {
        console.log(error);
      });
    }

  }
  getVendorByCompanyId() {
    if (this.storeService.vendorList) {
      this.vendorList = this.storeService.vendorList;
    } else {
      this.storeService.getVendorList(this.userInfo.companyId).subscribe((response) => {
        this.vendorList = this.storeService.vendorList;
      }, (error) => {
        console.log(error);
      });
    }
  }
  getDepartment() {
    this.itemService.getData(`Department/GetByfuel/${this.userInfo.userName}/${this.userInfo.companyId}/false`)
      .subscribe(res => {
        const myOrderedArray = _.sortBy(res, o => o.departmentDescription);
        this.departmentListByUser = myOrderedArray;
      }, err => {
        console.log(err);
      });
  }
  // convenience getter for easy access to form fields
  get advancedSearch() { return this.advancedSearchForm.value; }
  addItems() {
    this._itemId = null;
    this.isAddItem = true;
  }

  bindStoreLocationID() {
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      this.advancedSearchForm.get('locationCriteria').setValue(this.storeLocationList[0].storeLocationID);
      this.storeLocationID = this.storeLocationList[0].storeLocationID;
    }
  }

  setGridHideCol(fieals?, backToList?: boolean) {
    // if (this.rowData && this.rowData.length <= 0) {
    //   this.gridProperties.showPriscing = this.gridProperties.showDetails = this.gridProperties.showMultipackPricing = false;
    //   return;
    // }
    //this.gridColumnApi.resetColumnState();
    if (this.gridColumnApi) {
      if (this.gridProperties.showPricing && fieals === 'showPricing') {
        this.showGrid = false;
        this.gridProperties.showMultipackPricing = this.gridProperties.showDetails = false;
        this.isShowPrice = true;
        this.gridColumnApi.setColumnsVisible(['StoreName', 'UnitsInCase', 'SellingUnits', 'InventoryValuePrice', 'UnitCostPrice',
          'BuyDownAmt', 'RegularSellPrice', 'GrossProfit', 'CurrentInventory', 'SRP'], true);
        this.gridColumnApi.setColumnsVisible(['LastModifiedBy', 'RegularPackageSellPrice',
          'LastModifiedDateTime', 'POSCodeModifier'], false);
        this.gridColumnApi.moveColumn('UnitsInCase', 4);
        this.gridColumnApi.moveColumn('RegularSellPrice', 5);

        if (!backToList) {
          //this.getAdvancedSearch();
          setTimeout(() => {
            this.showGrid = true;
          });

        }
      } else if (this.gridProperties.showMultipackPricing && fieals === 'showMultipackPricing') {
        this.showGrid = false;
        this.gridProperties.showPricing = this.gridProperties.showDetails = this.isShowPrice = false;
        this.gridColumnApi.setColumnsVisible(['StoreName', 'UnitCostPrice', 'RegularPackageSellPrice',
          'RegularSellPrice', 'GrossProfit', 'POSCodeModifier'
          , 'POSCodeModifierAmount', 'InventoryValuePrice'], true);
        this.gridColumnApi.setColumnsVisible(['BuyDownAmt', 'SRP', 'LastModifiedBy', 'LastModifiedDateTime',
          'CurrentInventory'], false);
        this.gridColumnApi.moveColumn('RegularSellPrice', 9);
        if (!backToList) {
          //this.getAdvancedSearch();
          setTimeout(() => {
            this.showGrid = true;
          });

        }

      } else if (this.gridProperties.showDetails && fieals === 'showDetails') {
        this.showGrid = false;
        this.gridProperties.showPricing = this.gridProperties.showMultipackPricing = this.isShowPrice = false;
        this.gridColumnApi.setColumnsVisible(['StoreName', 'UnitCostPrice',
          'BuyDownAmt', 'SRP', 'RegularSellPrice', 'GrossProfit', 'CurrentInventory', 'POSCodeModifier'
          , 'RegularPackageSellPrice', 'InventoryValuePrice'], false);
        this.gridColumnApi.setColumnsVisible(['LastModifiedBy', 'LastModifiedDateTime'], true);
        if (!backToList) {
          //this.getAdvancedSearch();
          setTimeout(() => {
            this.showGrid = true;
          });

        }

      } else {
        this.defaultGridCol();
      }
    }
  }

  setGridHideColumns(fieals?, backToList?: boolean) {
    // if (this.rowData && this.rowData.length <= 0) {
    //   this.gridProperties.showPriscing = this.gridProperties.showDetails = this.gridProperties.showMultipackPricing = false;
    //   return;
    // }
    if (this.gridProperties.showPricing) {
      this.gridProperties.showMultipackPricing = this.gridProperties.showDetails = false;
      this.isShowPrice = true;
      this.gridColumnApi.setColumnsVisible(['StoreName', 'UnitCostPrice',
        'BuyDownAmt', 'SRP', 'RegularSellPrice', 'GrossProfit', 'CurrentInventory', 'InventoryValuePrice'], true);
      this.gridColumnApi.setColumnsVisible(['LastModifiedBy', 'RegularPackageSellPrice',
        'LastModifiedDateTime', 'POSCodeModifier'], false);
      this.gridColumnApi.moveColumn('StoreName', 1);
      // this.gridColumnApi.moveColumn('InventoryValuePrice', 4);
      // this.gridColumnApi.moveColumn('RegularSellPrice', 5);
      // this.gridColumnApi.moveColumn('GrossProfit', 6);
      this.getAdvancedSearch();
      // if (!backToList) { this.getAdvancedSearch(); }
    } else if (this.gridProperties.showMultipackPricing) {
      this.gridProperties.showPricing = this.gridProperties.showDetails = this.isShowPrice = false;
      this.gridColumnApi.setColumnsVisible(['StoreName', 'UnitCostPrice', 'RegularPackageSellPrice',
        'RegularSellPrice', 'GrossProfit', 'POSCodeModifier'
        , 'POSCodeModifierAmount', 'InventoryValuePrice'], true);
      this.gridColumnApi.setColumnsVisible(['BuyDownAmt', 'SRP', 'LastModifiedBy', 'LastModifiedDateTime',
        'CurrentInventory'], false);
      this.gridColumnApi.moveColumn('StoreName', 1);
      this.gridColumnApi.moveColumn('RegularSellPrice', 9);
      this.getAdvancedSearch();
      // if (!backToList) { this.getAdvancedSearch(); }

    } else if (this.gridProperties.showDetails) {
      this.gridProperties.showPricing = this.gridProperties.showMultipackPricing = this.isShowPrice = false;
      this.gridColumnApi.setColumnsVisible(['StoreName', 'UnitCostPrice',
        'BuyDownAmt', 'SRP', 'RegularSellPrice', 'GrossProfit', 'CurrentInventory', 'POSCodeModifier'
        , 'RegularPackageSellPrice', 'InventoryValuePrice'], false);
      this.gridColumnApi.setColumnsVisible(['LastModifiedBy', 'LastModifiedDateTime'], true);
      this.getAdvancedSearch();
      // if (!backToList) { this.getAdvancedSearch(); }

    } else {
      this.defaultGridCol();
    }
  }

  defaultGridCol() {
    this.isShowPrice = false;
    this.gridColumnApi.setColumnsVisible(['RegularSellPrice', 'UnitCostPrice'], true);
    this.gridColumnApi.setColumnsVisible(['StoreName', 'UnitCostPrice',
      'BuyDownAmt', 'SRP', 'RegularSellPrice', 'GrossProfit', 'CurrentInventory', 'POSCodeModifier'
      , 'LastModifiedBy', 'RegularPackageSellPrice', 'LastModifiedDateTime', 'InventoryValuePrice'], false);
    this.gridApi.sizeColumnsToFit();
    this.getAdvancedSearch()
  }

  ServerSideDatasource() {
    return {
      getRows: (params) => {
        this.getSearchData(params);
      },
    };
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.defaultGridCol();
    this.setGridHideColumns();
    var datasource = this.ServerSideDatasource();
    this.gridApi.setServerSideDatasource(datasource);
    this.gridApi.sizeColumnsToFit();
    // else 
    //   this.gridColumnApi.autoSizeColumns(['Description','DepartmentDescription']);
    // this.gridProperties.showDetails === true ? this.setGridHideCol('showDetails', true) : null;
    // this.gridProperties.showMultipackPricing === true ? this.setGridHideCol('showMultipackPricing', true) : null;
    // this.gridProperties.showPricing === true ? this.setGridHideCol('showPricing', true) : null;
  }

  onUPCGridReady(params) {
    this.upcGridApi = params.api;
    this.upcGridApi.sizeColumnsToFit();
  }

  backtoList() {
    this.isAddItem = false;
  }

  getUOM() {
    this.itemService.getData('UOM/getAll').subscribe((response) => {
      this.uomList = response;
    }, (error) => {
      console.log(error);
    });
  }

  getSerachData() {
    // this.isSearch = this.isShowGrid = true;
    this.itemService.getData('Item/getItemMasters').subscribe((response) => {
      if (response) {
        this.rowData = response;
        this.itemMasterGrid['gridOptions'].sideBar = {
          toolPanels: [
            {
              id: 'columns',
              labelDefault: 'Columns',
              labelKey: 'columns',
              iconKey: 'columns',
              toolPanel: 'agColumnsToolPanel',
              toolPanelParams: {
                suppressRowGroups: true,
                suppressValues: true,
                suppressPivots: true,
                suppressPivotMode: true,
                suppressSideButtons: true,
                suppressColumnFilter: true,
                suppressColumnSelectAll: true,
                suppressColumnExpandAll: true
              }
            }
          ],
          defaultToolPanel: 'columns'
        };
        this.gridOptions['isSideBarRequired'] = response.length > 10 ? true : false;
      }
    });
  }
  clearAdvanceSearch() {
    this.advancedSearchForm.patchValue(this.initialAdvanceForm);
    this.bindStoreLocationID();
  }
  dynamicValidation() {
    if (this.searchByDepatPrice === 'byPriceGroup') {
      if (!this.advancedSearchForm.get('posCodeOrDesc').value && !this.advancedSearchForm.get('priceGroup').value
        && !this.advancedSearchForm.get('locationCriteria').value) {
        return false;
      }
    }
    if (this.searchByDepatPrice === 'byDepartment') {
      if (!this.advancedSearchForm.get('posCodeOrDesc').value && (!this.advancedSearchForm.get('department').value
        || this.advancedSearchForm.get('department').value.length === 0)
        && (!this.advancedSearchForm.get('locationCriteria').value || this.advancedSearchForm.get('locationCriteria').value.length === 0) &&
        (!this.advancedSearchForm.get('vendorCriteria').value || this.advancedSearchForm.get('vendorCriteria').value.length === 0)) {
        return false;
      }
    }
    return true;
  }
  openSearch() {
    if (this.advancedSearchForm.value.priceGroup) {
      let selectedProceGroup = this.priceGroupList.filter(r => r.CompanyPriceGroupID === this.advancedSearchForm.value.priceGroup);
      if (selectedProceGroup.length > 0 && selectedProceGroup[0].FromAPI === 1) {
        this.modalService.dismissAll();
        this.modalService.open(this.setUOMModal, { size: 'lg', keyboard: false, backdrop: 'static', centered: true });
      }
      else {
        this.getAdvancedSearch();
      }
    }
    else {
      this.getAdvancedSearch();
    }

  }
  setUOM(UOM_ID) {
    this.modalService.dismissAll();
    this.advancedSearchForm.get('UOM_ID').setValue(UOM_ID);
    this.getAdvancedSearch();
  }
  getAdvancedSearch(isFrom?) {
    this.showUPCGrid = false;
    if (this.gridApi) {
      this.gridOptions.paginationPageSize = 25;
    }
    this.headerSelected = false;
    this.headerChange('');
    this.isAdvanceSearchCollapsed = true;
    this.isAdvanceSearch = false;
    let storeLocation: any;
    if (this.storeLocationList && this.storeLocationList.length !== 1) {
      storeLocation = this.advancedSearchForm.value.locationCriteria ?
        this.advancedSearchForm.value.locationCriteria.map(x => x.storeLocationID).join(',') : '';
    } else {
      storeLocation = this.advancedSearchForm.value.locationCriteria;
    }
    const vendoeLst = this.advancedSearchForm.value.vendorCriteria ?
      this.advancedSearchForm.value.vendorCriteria.map(x => x.vendorID).join(',') : '';
    const departmentLst = this.advancedSearchForm.value.department ?
      this.advancedSearchForm.value.department.map(x => x.departmentID).join(',') : '';

    // sellingUnit
    // tslint:disable-next-line:max-line-length
    if (this.advancedSearch.sellingUnits === '1') { this.advancedSearchForm.get('sellingUnitEnd').setValue(this.advancedSearchForm.get('sellingUnitStart').value); }
    if (this.advancedSearch.sellingUnits === '2') { this.advancedSearchForm.get('sellingUnitStart').setValue(Number(0)); }
    if (this.advancedSearch.sellingUnits === '3') { this.advancedSearchForm.get('sellingUnitEnd').setValue(10000); }

    // unitsInCase
    // tslint:disable-next-line:max-line-length
    if (this.advancedSearch.unitinCase === '1') { this.advancedSearchForm.get('unitsInCaseEnd').setValue(this.advancedSearchForm.get('unitsInCaseStart').value); }
    if (this.advancedSearch.unitinCase === '2') { this.advancedSearchForm.get('unitsInCaseStart').setValue(Number(0)); }
    if (this.advancedSearch.unitinCase === '3') { this.advancedSearchForm.get('unitsInCaseEnd').setValue(10000); }


    // sellingPrice
    // tslint:disable-next-line:max-line-length
    if (this.advancedSearch.sellingPrice === '1') {
      this.advancedSearchForm.get('sellingPriceEnd').setValue(this.advancedSearchForm.get('sellingPriceStart').value);
    }
    if (this.advancedSearch.sellingPrice === '2') { this.advancedSearchForm.get('sellingPriceStart').setValue(null); }
    if (this.advancedSearch.sellingPrice === '3') { this.advancedSearchForm.get('sellingPriceEnd').setValue(10000); }

    // inventoryValuePriceEnd
    // tslint:disable-next-line:max-line-length
    if (this.advancedSearch.inventoryValuePrice === '1') { this.advancedSearchForm.get('inventoryValuePriceEnd').setValue(this.advancedSearchForm.get('inventoryValuePriceStart').value); }
    if (this.advancedSearch.inventoryValuePrice === '2') { this.advancedSearchForm.get('inventoryValuePriceStart').setValue(Number(0)); }
    if (this.advancedSearch.inventoryValuePrice === '3') { this.advancedSearchForm.get('inventoryValuePriceEnd').setValue(10000); }


    // currentInventory
    // tslint:disable-next-line:max-line-length
    if (this.advancedSearch.currentInventory === '1') { this.advancedSearchForm.get('currentInventoryEnd').setValue(this.advancedSearchForm.get('currentInventoryStart').value); }
    if (this.advancedSearch.currentInventory === '2') { this.advancedSearchForm.get('currentInventoryStart').setValue(Number(0)); }
    if (this.advancedSearch.currentInventory === '3') { this.advancedSearchForm.get('currentInventoryEnd').setValue(10000); }

    // Profit margin
    // tslint:disable-next-line:max-line-length
    if (this.advancedSearch.pmCriteria === '1') { this.advancedSearchForm.get('pmEndCriteria').setValue(this.advancedSearchForm.get('pMStartCriteria').value); }
    if (this.advancedSearch.pmCriteria === '2') { this.advancedSearchForm.get('pMStartCriteria').setValue(Number(0)); }
    if (this.advancedSearch.pmCriteria === '3') { this.advancedSearchForm.get('pmEndCriteria').setValue(10000); }
    const constLocationList = (this.storeLocationList && this.storeLocationList.length > 0) ? this.storeLocationList.map(x => x.storeLocationID).join(',') : '';
    this.postData = {
      companyID: this.userInfo.companyId,
      posCodeOrDesc: this.advancedSearchForm.value.posCodeOrDesc ? this.advancedSearchForm.value.posCodeOrDesc : '',
      sellingUnitStart: this.advancedSearch.sellingUnits ? this.advancedSearchForm.value.sellingUnitStart : null,
      sellingUnitEnd: this.advancedSearch.sellingUnits ? this.advancedSearchForm.value.sellingUnitEnd : null,
      unitsInCaseStart: this.advancedSearch.unitinCase ? this.advancedSearchForm.value.unitsInCaseStart : null,
      unitsInCaseEnd: this.advancedSearch.unitinCase ? this.advancedSearchForm.value.unitsInCaseEnd : null,
      sellingPriceStart: this.advancedSearch.sellingPrice ? this.advancedSearchForm.value.sellingPriceStart : null,
      sellingPriceEnd: this.advancedSearch.sellingPrice ? this.advancedSearchForm.value.sellingPriceEnd : null,
      inventoryValuePriceStart: this.advancedSearch.inventoryValuePrice ? this.advancedSearchForm.value.inventoryValuePriceStart : null,
      inventoryValuePriceEnd: this.advancedSearch.inventoryValuePrice ? this.advancedSearchForm.value.inventoryValuePriceEnd : null,
      currentInventoryStart: this.advancedSearch.currentInventory ? this.advancedSearchForm.value.currentInventoryStart : null,
      currentInventoryEnd: this.advancedSearch.currentInventory ? this.advancedSearchForm.value.currentInventoryEnd : null,
      pMStartCriteria: this.advancedSearch.pmCriteria ? this.advancedSearchForm.value.pMStartCriteria : null,
      pmEndCriteria: this.advancedSearch.pmCriteria ? this.advancedSearchForm.value.pmEndCriteria : null,
      locationCriteria: this.advancedSearch.locationCriteria ? storeLocation : constLocationList,
      vendorCriteria: vendoeLst ? vendoeLst : '',
      department: departmentLst ? departmentLst : '',
      posSyncStatus: this.advancedSearchForm.value.posSyncStatus ? this.advancedSearchForm.value.posSyncStatus : '',
      isShowPricing: this.gridProperties.showPricing ? this.gridProperties.showPricing : false,
      isClick: this.advancedSearchForm.value.isClick ? this.advancedSearchForm.value.isClick : true,
      isOnWatchList: this.advancedSearchForm.value.isOnWatchList === '' ? null : Boolean(this.advancedSearchForm.value.isOnWatchList),
      priceGroup: this.advancedSearchForm.value.priceGroup ? this.advancedSearchForm.value.priceGroup : null,
      isMultipack: this.gridProperties.showMultipackPricing ? this.gridProperties.showMultipackPricing : false,
      isActive: (this.advancedSearchForm.value.isActive === '' || this.advancedSearchForm.value.isActive === null) ? null : Boolean(this.advancedSearchForm.value.isActive),
      searchBy: this.advancedSearchForm.value.searchBy ? this.advancedSearchForm.value.searchBy : null,
      UOM_ID: this.advancedSearchForm.value.UOM_ID,
      isShowMultiPackPricing: this.gridProperties.showMultipackPricing ? this.gridProperties.showMultipackPricing : false,
      isShowDetails: this.gridProperties.showDetails ? this.gridProperties.showDetails : false
    };
    if (this.showGrid) this.gridApi.purgeServerSideCache([]);
    else {
      setTimeout(() => {
        this.showGrid = true;
      });
    }
    if (this.advancedSearchForm.value.priceGroup) {
      let selectedProceGroup = this.priceGroupList.filter(r => r.CompanyPriceGroupID === this.advancedSearchForm.value.priceGroup);
      if (selectedProceGroup.length > 0 && selectedProceGroup[0].FromAPI === 1) {
        this.showUPCGrid = true;
        let UOM_ID = 0;
        if (this.advancedSearchForm.get('UOM_ID').value) {
          UOM_ID = this.advancedSearchForm.get('UOM_ID').value
        }

        this.itemService.getData('CompanyPriceGroup/getNewUPCCode?CompanyID=' +
          this.userInfo.companyId + '&CompanyPriceGroupID=' + selectedProceGroup[0].CompanyPriceGroupID + '&UOM_ID=' + UOM_ID).subscribe((response) => {
            if (response && response['statusCode']) {
              this.priceGroupList = [];
              this.gridOptions.paginationPageSize = 25;
              return;
            } else {
              this.gridOptions.paginationPageSize = 5;
            }
            this.upcGridApi.setRowData(response);
            this.upcGridData = response;
          }, (error) => {
            console.log(error);
          });
      }
    }
  }

  getSearchData(params) {
    this.spinner.show();
    const noOfRecords = params.request.endRow - params.request.startRow;
    const pageNumber =
      params.request.startRow === 0
        ? 1
        : params.request.startRow / noOfRecords + 1;
    let url =
      'item/getitems?PageNumber=' + pageNumber + '&noOfRecords=' + noOfRecords;
    if (this.filterText) url += '&searchValue=' + this.filterText;
    if (params && params.request) {
      if (params.request.sortModel.length > 0)
        url += '&sortColumn=' + params.request.sortModel[0].colId + '&sortOrder=' + params.request.sortModel[0].sort;
    }
    this.itemService.postData(url, this.postData).subscribe((response) => {
      this.spinner.hide();
      if (response) {
        if (response['statusCode'] || !response.length) {
          this.rowData = [];
          params.successCallback(this.rowData, 0);
          this.gridApi.hideOverlay();
          this.gridApi.showNoRowsOverlay();
          return;
        }
        this.gridApi.hideOverlay();
        this.rowData = response;
        let itemIds = response.map(a => a.ItemID);
        params.successCallback(this.rowData, response[0].TotalRecordCount);
        setTimeout(() => {
          this.headerChange(itemIds);
        }, 100)
      }
    }, (error) => {
      this.spinner.hide();
      this.rowData = [];
      this.toastr.error('Unable to fetch record', this.constantService.infoMessages.error);
      console.log(error);
    });
  }
  getPOSGroup() {
    this.itemService.getPOSGroupDepartment().subscribe((response) => {
      this.isLoading = false;
      this.posSyncStatusList = response[0];
      this.priceGroupList = response[1];
      this.priceGroupList.forEach(element => {
        if (element.FromAPI) {
          element.CompanyPriceGroupName += " (Altria)"
        }
      });
      if (this.notificationStoreId > 0 && !this.isStoreLocationLoading)
        this.searchByStoreForPushToPOS();
      //    const myOrderedArray = _.sortBy(response[2], o => o.departmentDescription);
      //   this.departmentListByUser = myOrderedArray;
      //   this.vendorList = response[3];
    });
  }
  getPriceGroupCompany() {
    this.itemService.getData('CompanyPriceGroup/getByCompanyID/' +
      this.userInfo.companyId).subscribe((response) => {
        if (response && response['statusCode']) {
          this.priceGroupList = [];
          return;
        }
        this.priceGroupList = response;
        this.priceGroupList.forEach(element => {
          if (element.FromAPI) {
            element.CompanyPriceGroupName += " (Altria)"
          }
        });
      }, (error) => {
        console.log(error);
      });
  }
  getMasterGridData() {
    this.isShowGrid = true;
  }
  editAction(params) {
    this._itemId = params.data.ItemID;
    this._upcCode = params.data.POSCodeWithCheckDigit;
    this.commonService.storageItem = { itemID: this._itemId, upcCode: this._upcCode };
    this.commonService.advItemSearch.advaSearchOptions = {
      ...this.advancedSearchForm.value
    };
    this.commonService.advItemSearch.gridValues = this.rowData;
    this.commonService.advItemSearch.isBackTolist = false;
    this.router.navigate(['items/add-item']);
    // this.isAddItem = true;
  }


  historyAction(params) {
    this._itemId = params.data.ItemID;
    this._upcCode = params.data.POSCodeWithCheckDigit;
    this.commonService.storageItem = { itemID: this._itemId, upcCode: this._upcCode, navigateToItemHistory: true };
    this.commonService.advItemSearch.advaSearchOptions = {
      ...this.advancedSearchForm.value
    };
    this.commonService.advItemSearch.gridValues = this.rowData;
    this.commonService.advItemSearch.isBackTolist = false;
    this.router.navigate(['items/add-item']);
  }

  activityAction(params) {
    this._itemId = params.data.ItemID;
    this._upcCode = params.data.POSCodeWithCheckDigit;
    this.commonService.storageItem = { itemID: this._itemId, upcCode: this._upcCode, navigateToSalesActivity: true };
    this.commonService.advItemSearch.advaSearchOptions = {
      ...this.advancedSearchForm.value
    };
    this.commonService.advItemSearch.gridValues = this.rowData;
    this.commonService.advItemSearch.isBackTolist = false;
    this.router.navigate(['items/add-item']);
  }

  delAction(params) {
    // let requestData = {
    //   "itemid": params.data.itemID,
    //   "isStoreDelete": this.gridProperties.showDetails,
    //   "isShowPricing": this.gridProperties.showPricing,
    //   "isMultiPackPrice": this.gridProperties.showMultipackPricing,
    //   "MutiPackItemID": params.data.multipackItemID,
    //   "loclst": "",
    //   "storeLocationItemID": 
    // };
    this.spinner.show();
    this.itemService.deleteData(`Item/delete?itemid=` + params.data.ItemID + `&isStoreDelete=` + this.gridProperties.showDetails + `&isShowPricing=` + this.gridProperties.showPricing + `&isMultiPackPrice=` + this.gridProperties.showMultipackPricing + `&MultiPackItemID=` + params.data.MultipackItemID + `&loclst=` + params.data.StoreLocationID + `&storeLocationItemID=` + params.data.StoreLocationItemID).
      subscribe((response: any) => {
        if (response && response === "1") {
          this.spinner.hide();
          this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
          this.rowData = this.rowData.filter(r => r.ItemID !== params.data.ItemID);
        } else {
          this.spinner.hide();
          this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.contactAdmin);
      });
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
      this.priceByFixedAmount = false;
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
    this.priceByFixedAmount = false;
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
        this.priceByFixedAmount = false;
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
        this.priceByFixedAmount = false;
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
        this.priceByFixedAmount = false;
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
        this.isHideDollerNumber = true;
        this.isHideOnlyNumber = true;
        this.priceByFixedAmount = false;
        return 0;
      case updateData.unitsInCase:
        this.showOnlyNumberInputField();
        return 0;
      case updateData.buyDown:
        this.showPositiveInputField();
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
        this.showDollerNegativeInputField();
        return 0;
      case updateData.priceByPercentage:
        this.showPositiveInputField();
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
        this.priceByFixedAmount = false;
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
        this.priceByFixedAmount = false;
        return 0;
      case updateData.stockTransfer:
        return 0;
      case updateData.byCostByFixedAmount:
        this.showPositiveInputField();
        return 0;
      case updateData.byBuyingCostByPercentage:
        this.showPositiveInputField();
        return 0;
    }
  }
  bindBulkUpdateStoreLocationID() {
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      this.storeLocationID = this.storeLocationList[0].storeLocationID;
    }
  }
  bulkUpdate() {
    if (this.storeLocationID === null) {
      this.toastr.error('Please select store location', this.constantService.infoMessages.error);
      return;
    }
    if (this.selectedItems === null || this.selectedItems === 0) {
      this.toastr.error('Please select items to update', this.constantService.infoMessages.error);
      return;
    }
    if (this.isBWatchList === null && this.isHideActive == false) {
      this.toastr.error('Please select active state', this.constantService.infoMessages.error);
      return;
    }
    this.isBulkUpdate = false;
    let storeLocation: any;
    if (this.storeLocationList && this.storeLocationList.length !== 1) {
      storeLocation = this.storeLocationID ?
        this.storeLocationID.map(x => x.storeLocationID).join(',') : '';
    }
    this.bulkUpdateData = {
      value: this.value ? this.value : 0,
      isShowPrice: this.isShowPrice,
      price: this.price ? this.price : 0,
      columnName: this.columnName ? this.columnName : '',
      itemlst: this.selectedItemsIds ? this.selectedItemsIds : 0,
      storelst: storeLocation ? storeLocation : String(this.storeLocationID),
      storelocationitemlst: this.isShowPrice === true ? this.selectedStoreLocationItemIds :
        storeLocation ? storeLocation : String(this.storeLocationID),
      username: this.userInfo.userName,
      CompanyID: this.userInfo.companyId,
      isBWatchList: this.isBWatchList,
      ID: this.Id ? this.Id : 0,
    };

    if (this.columnName == "SellingPrice") {
      let a = this.validateSellingPrice();
    } else {
      this.executeBulkUpdate();
    }
  }

  executeBulkUpdate() {
    let postData = this.bulkUpdateData;
    this.modalService.dismissAll();
    if (postData.hasOwnProperty("itemlst") && postData.itemlst == "") {
      this.toastr.error(this.constantService.infoMessages.updateRecordFailed, "No items to update");
    } else {
      this.spinner.show();
      this.itemService.updateData('Item/BulkUpdate', postData).subscribe(res => {
        this.spinner.hide();
        if (res === '1') {
          this.selectedItems = null;
          this.headerSelected = false;
          this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
          this.getAdvancedSearch();
        } else {
          this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
        }
      }, err => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.contactAdmin, this.constantService.infoMessages.error);
        console.log(err);
      });
    }
  }

  validateSellingPrice() {
    let postData = {
      storeLocationID: this.bulkUpdateData.storelst,
      itemID: this.bulkUpdateData.itemlst,
      mrp: this.bulkUpdateData.value
    }

    this.spinner.show();
    this.itemService.validateSellingPrice("Buydown/verifyMRPForStoreLocation", postData).subscribe(res => {
      this.spinner.hide();
      if (res.length === 0) {
        this.executeBulkUpdate();
      } else {
        if (res.data.length === 0) {
          this.executeBulkUpdate();
        } else {
          this.sellingPriceValidations = res.data;
          this.modalService.dismissAll();
          this.modalService.open(this.sellingPriceModal, { size: 'lg', keyboard: false, backdrop: 'static', centered: true });
        }
      }
    });
  }

  proceedBulkUpdate() {
    this.sellingPriceValidations.forEach(element => {
      for (var key in this.bulkUpdateData) {
        if (this.bulkUpdateData.hasOwnProperty(key)) {
          if (key == "itemlst") {
            let itemsids = this.bulkUpdateData[key].split(",");
            let itemindex = itemsids.map(String).indexOf(element.ItemID.toString());
            if (itemindex > -1) {
              itemsids.splice(itemindex, 1);
              this.bulkUpdateData[key] = itemsids.join();
            }
          }
        }
      }
    });
    this.executeBulkUpdate();
  }





  patchColumnsValue() {
    this.value = 0;
    this.departmentid = 0;
    this.posSyncStatusID = 0;
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
    this.priceByFixedAmount = false;
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
    this.priceByFixedAmount = false;
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
  showDollerNegativeInputField() {
    this.patchColumnsValue();
    this.isHideActive = true;
    this.isHideCurretnInventory = true;
    this.isHideUOM = true;
    this.isHideDepartment = true;
    this.isHideMultipack = true;
    this.isHidePriceGroup = true;
    this.isHidePositiveValue = true;
    this.isHideOnlyNumber = true;
    this.isHidePOSSyncStatus = true;
    this.isHideDollerNumber = true;
    this.priceByFixedAmount = true;
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
      this.advancedSearchForm.get('sellingPriceStart').setValue(null);
      this.advancedSearchForm.get('sellingPriceEnd').setValue(null);
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
      this.advancedSearchForm.get('pMStartCriteria').setValue(null);
      this.advancedSearchForm.get('pmEndCriteria').setValue(null);
    }

  }

  onRowSelected(params) {
    if (params.length === 0) {
      this.showDelSelItems = false;
    } else {
      this.showDelSelItems = true;
    }
    this.selectedItems = params.length;
    this.selectedStoreLocationItemIds = params ? params.map(x => x.data.StoreLocationItemID).join(',') : '';
    this.selectedItemsIds = params ? params.map(x => x.data.ItemID).join(',') : '';
  }

  onUPCRowSelected(params) {
    let selectedNodes = this.upcGridApi.getSelectedNodes();
    this.UPCSelectedPriceGroup = selectedNodes.map(node => node.data);
    if (this.UPCSelectedPriceGroup.length > 0) {
      this.showUPCForm = true;
    } else {
      this.showUPCForm = false;
    }
  }

  headerChange(itemIds?) {
    const checked = this.headerSelected;
    if (this.gridApi) {
      this.gridApi.forEachNode(function (rowNode) {
        if (itemIds && rowNode.data) {
          if (itemIds.find(k => k === rowNode.data.ItemID))
            rowNode.setSelected(checked);
        }
        else
          rowNode.setSelected(checked);
        // var updated = rowNode.data;
        // updated.itemCheck = true;
        // rowNode.setData(updated);
      });
    }
  }
  selectAllRows() {

  }
  deSelectAllRows() {
    // this.selectedItems = 0;
    // this.gridApi.api.deSelectAllRows();
  }
  selectStore() {
    this.storeLocationID = this.advancedSearchForm.value.locationCriteria;
  }

  deleteSelectedItems() {
    let selectedRows = this.gridApi.getSelectedRows();
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
      this.itemService.deleteData(`Item/DeleteSelected?itemid=` + selectedItems + `&isStoreDelete=` + this.gridProperties.showDetails + `&isShowPricing=` + this.gridProperties.showPricing + `&isMultiPackPrice=` + this.gridProperties.showMultipackPricing + `&multiPackItemList=` + selectedMutiPackItemIds + `&loclst=` + selectedStoreLocationIds + `&storeLocationItemID=` + selectedStoreLocationItemIds).
        subscribe((response: any) => {
          if (response && response === "1") {
            this.spinner.hide();
            this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
            selectedRows.forEach((value) => {
              this.rowData = this.rowData.filter(r => r.ItemID !== value.ItemID);
            });
          } else {
            this.spinner.hide();
            this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
          }
        }, error => {
          this.spinner.hide();
          this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.contactAdmin);
        });
      this.storeLocationID ?
        this.storeLocationID.map(x => x.storeLocationID).join(',') : '';
    }
  }
  suspendSelectedItems() {
    let selectedRows = this.gridApi.getSelectedRows();
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
      this.itemService.postData(`Item/SuspendItem`, postData).
        subscribe((response: any) => {
          if (response.status && response.status === 1) {
            selectedRows.forEach((value) => {
              this.rowData.filter(r => { if (r.ItemID == value.ItemID) { r.ActiveFlag = false; } });
            });
            this.gridApi.deselectAll();
            this.gridApi.purgeServerSideCache([]);
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
    let selectedRows = this.gridApi.getSelectedRows();
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
      this.itemService.postData(`Item/ItemRecovery`, postData).
        subscribe((response: any) => {
          if (response.status && response.status === 1) {
            selectedRows.forEach((value) => {
              this.rowData.filter(r => { if (r.ItemID == value.ItemID) { r.ActiveFlag = true; } });
            });
            this.gridApi.deselectAll();
            this.gridApi.purgeServerSideCache([]);
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
  suspendAction(event) {
    this.spinner.show();
    let postData = [{
      itemId: event.data.ItemID,
      username: this.userInfo.userName
    }];
    this.itemService.postData(`Item/SuspendItem`, postData).
      subscribe((response: any) => {
        if (response.status && response.status === 1) {
          var rowNode = this.gridApi.getRowNode(event.node.id);
          let rowData = event.data;
          rowData.activeFlag = false;
          rowNode.setData(rowData);
          this.gridApi.purgeServerSideCache([]);
          //this.gridApi.redrawRows(rowNode);
          this.spinner.hide();
          this.toastr.success("Item suspended successfully", this.constantService.infoMessages.success);
        } else {
          this.spinner.hide();
          this.toastr.error("Item suspension failed", this.constantService.infoMessages.error);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.contactAdmin);
      });
  }

  recoverAction(event) {
    this.spinner.show();
    let postData = [{
      itemId: event.data.ItemID,
      username: this.userInfo.userName,
      WithMultipackItem: true
    }];
    this.itemService.postData(`Item/ItemRecovery`, postData).
      subscribe((response: any) => {
        if (response.status && response.status === 1) {
          var rowNode = this.gridApi.getRowNode(event.node.id);
          let rowData = event.data;
          rowData.activeFlag = true;
          rowNode.setData(rowData);
          this.gridApi.purgeServerSideCache([]);
          //this.gridApi.redrawRows(rowNode);
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
  openBulkUpdate() {
    //  this.columnName = null;
    this.value = null;
    this.Id = null;
    this.isBWatchList = null;
    this.price = null;
    this.isAdvanceSearch = false;
    this.isBulkUpdate = !this.isBulkUpdate;
  }
  openAdvanceSearch() {
    this.isBulkUpdate = false;
    this.isAdvanceSearch = !this.isAdvanceSearch;
    //resetting default values
    // this.searchByDepatPrice = 'byPriceGroup';
    // this.advancedSearchForm.get('department').setValue('');
    // this.advancedSearchForm.get('priceGroup').setValue(null);
    // this.advancedSearchForm.get('locationCriteria').setValue('');
    // this.advancedSearchForm.get('vendorCriteria').setValue(null);
    // this.advancedSearchForm.get('isActive').setValue(null);
    // this.advancedSearchForm.get('posSyncStatus').setValue(null);
    // this.advancedSearchForm.get('searchBy').setValue(0);
    // this.advancedSearchForm.get('sellingPrice').setValue(null);
    // this.advancedSearchForm.get('sellingPriceStart').setValue(null);
    // this.advancedSearchForm.get('sellingPriceEnd').setValue(null);
    // this.advancedSearchForm.get('pMStartCriteria').setValue(null);
    // this.advancedSearchForm.get('pmEndCriteria').setValue(null);
    // this.advancedSearchForm.get('pmCriteria').setValue(null);
  }
  onColumnResized(params) {
    if (params.source === 'uiColumnDragged' && params.finished) {
      this.gridApi.sizeColumnsToFit();
    }
  }

  clickAddUPCCOde() {
    if (this.UPCSelectedPriceGroup.length == 0) {
      this.toastr.error("select UPC code", this.constantService.infoMessages.error);
      return;
    }
    if (this.frmShowUPCGrid.value.UPCDepartmentID == 0) {
      this.toastr.error("select Department", this.constantService.infoMessages.error);
      return;
    }
    if (this.frmShowUPCGrid.value.UPCSPrice == 0) {
      this.toastr.error("select Price", this.constantService.infoMessages.error);
      return;
    }
    if (this.frmShowUPCGrid.value.UPCStoreLocationID == undefined) {
      this.toastr.error("select store location", this.constantService.infoMessages.error);
      return;
    }
    else if (this.frmShowUPCGrid.value.UPCStoreLocationID.length == 0) {
      this.toastr.error("select store location", this.constantService.infoMessages.error);
      return;
    }

    this.addUPCCodesData = {
      "username": this.userInfo.userName,
      "departmentID": this.frmShowUPCGrid.value.UPCDepartmentID.departmentID,
      "companyID": this.userInfo.companyId,
      "departmentdesc": this.frmShowUPCGrid.value.UPCDepartmentID.departmentDescription,
      "posDtls": this.UPCSelectedPriceGroup,
      "storeLocationID": this.frmShowUPCGrid.value.UPCStoreLocationID.map(x => x.storeLocationID).join(','),
      "sellingPrice": this.frmShowUPCGrid.value.UPCSPrice,
      "conversionFactor": 10
    }
    console.log(this.addUPCCodesData);
    this.validateAddUPCCode();

  }
  validateAddUPCCode() {
    if (this.addUPCCodesData) {
      this.spinner.show();
      this.itemService.validateSellingPrice("Buydown/verifyMRPForStoreLocationNewUPC", this.addUPCCodesData).subscribe(res => {
        this.spinner.hide();
        if (res.length === 0) {
          this.executeAddUPCCode();
        } else {
          console.log(res);
          this.addUPCCodeValidations = res;
          this.modalService.dismissAll();
          this.modalService.open(this.validateAddUPCModal, { size: 'lg', keyboard: false, backdrop: 'static', centered: true });
        }
      });
    } else {
      this.toastr.error("Error!", this.constantService.infoMessages.error);
    }
  }

  executeAddUPCCode() {
    this.modalService.dismissAll();
    this.spinner.show();
    this.itemService.postData('Item/addNewUPCCode', this.addUPCCodesData).subscribe(res => {
      this.spinner.hide();
      if (res.status == 200) {
        this.resetUPCForm();
        this.fetchUPCGridData();
        this.toastr.success("New Item added.", this.constantService.infoMessages.success);
      } else {
        this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
      }
    }, err => {
      this.spinner.hide();
      this.toastr.error(this.constantService.infoMessages.contactAdmin, this.constantService.infoMessages.error);
      console.log(err);
    });
  }

  proceedAddUPCCode() {
    console.log(this.addUPCCodeValidations, this.addUPCCodesData);
    let filteredItems = [];
    this.addUPCCodeValidations.forEach(validationItem => {
      const removeIndex = this.addUPCCodesData.posDtls.findIndex(item => item.UPC === validationItem.UPC);
      this.addUPCCodesData.posDtls.splice(removeIndex, 1);
    });
    if (this.addUPCCodesData.posDtls.length === 0) {
      this.toastr.error("No items to add", this.constantService.infoMessages.error);
    } else {
      this.executeAddUPCCode();
    }
  }

  resetUPCForm() {
    this.frmShowUPCGrid = this.fb.group({
      UPCStoreLocationID: [],
      UPCDepartmentID: 0,
      UPCSPrice: 0,
    });
  }

  fetchUPCGridData() {
    this.itemService.getData('CompanyPriceGroup/getNewUPCCode?CompanyID=' +
      this.userInfo.companyId).subscribe((response) => {
        if (response && response['statusCode']) {
          this.priceGroupList = [];
          return;
        }
        if (response.length > 0) {
          this.showUPCGrid = true;
          setTimeout(() => {
            this.upcGridApi.setRowData(response);
            this.upcGridData = response;
          }, 1000);
        }
      }, (error) => {
        console.log(error);
      });
  }

  fetchItemStatus() {
    this.itemService.getData('CompanyPriceGroup/getItemStatusCount?CompanyId=' +
      this.userInfo.companyId).subscribe((response) => {
        if (response && response['statusCode']) {
          this.itemStatus = {
            new: 0,
            newStatusCounts: [],
            current: 0,
            currentStatusCounts: [],
            pushToPOS: 0,
            pushToPOSStatusCounts: [],
            inProgress: 0,
            inProgressStatusCounts: [],
            error: 0,
            errorStatusCounts: [],
            suspended: 0,
            suspendedStatusCounts: [],
          };
          return;
        }
        if (response.length > 0) {
          response.forEach(element => {
            this.itemStatus.new = this.itemStatus.new + Number(element.New);
            this.itemStatus.newStatusCounts.push(element.StoreName + " - " + Number(element.New));
            this.itemStatus.current = this.itemStatus.current + Number(element.Current);
            this.itemStatus.currentStatusCounts.push(element.StoreName + " - " + Number(element.Current));
            this.itemStatus.pushToPOS = this.itemStatus.pushToPOS + Number(element.PushToPOS);
            this.itemStatus.pushToPOSStatusCounts.push(element.StoreName + " - " + Number(element.PushToPOS));
            this.itemStatus.inProgress = this.itemStatus.inProgress + Number(element.InProgress);
            this.itemStatus.inProgressStatusCounts.push(element.StoreName + " - " + Number(element.InProgress));
            this.itemStatus.error = this.itemStatus.error + Number(element.Error);
            this.itemStatus.errorStatusCounts.push(element.StoreName + " - " + Number(element.Error));
            this.itemStatus.suspended = this.itemStatus.suspended + Number(element.Suspended);
            this.itemStatus.suspendedStatusCounts.push(element.StoreName + " - " + Number(element.Suspended));
          });
        }
      }, (error) => {
        console.log(error);
      });
  }
}