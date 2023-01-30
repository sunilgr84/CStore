import { Component, OnInit, Input, SimpleChanges, ViewChild, Output, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';
import { GridService } from '@shared/services/grid/grid.service';
import { GridOptions } from 'ag-grid-community';
import { ConstantService } from '@shared/services/constant/constant.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { routerTransition } from 'src/app/router.animations';
import { FormBuilder } from '@angular/forms';
import { StoreService } from '@shared/services/store/store.service';
import * as _ from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';
import { StoreMessageService } from '@shared/services/commmon/store-message.service';
import { UtilityService } from '@shared/services/utility/utility.service';

@Component({
  selector: 'app-price-group-details',
  templateUrl: './price-group-details.component.html',
  styleUrls: ['./price-group-details.component.scss'],
  animations: [routerTransition(),
  trigger('EnterLeave', [
    state('flyIn', style({ transform: 'translateX(-50%)' })),
    transition(':enter', [
      style({ transform: 'translateX(-50%)' }),
      animate('0.3s ease-in')
    ]),
    transition(':leave', [
      animate('0.3s ease-in', style({ transform: 'translateX(-40%)' }))
    ])
  ])],
})
export class PriceGroupDetailsComponent implements OnInit {
  @Output() refreshParent: EventEmitter<any> = new EventEmitter();
  gridChildApi: any;
  childRowData = [];
  currentChanges: any;
  childGridOptions: GridOptions;
  sliderLeft: boolean | false;
  isAddItem: boolean | false;
  showStoreSelection: boolean | false;
  childGridShowStoreSelection: boolean;
  @ViewChild('itemMasterGrid') itemMasterGrid: any;
  advancedSearchForm = this.fb.group({
    posCodeOrDesc: [null],
    sellingUnits: [''],
    sellingUnitStart: [null], // 0,
    sellingUnitEnd: [null], // 0,
    unitinCase: [0],
    unitsInCaseStart: [null], // 0,
    unitsInCaseEnd: [null], // 0,
    sellingPrice: [0],
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
    pmCriteria: [0],
    locationCriteria: [''],
    vendorCriteria: [null],
    department: [''],
    posSyncStatus: [0], // 0,
    isShowPricing: [null],
    isClick: [true],
    isOnWatchList: [''],
    priceGroup: [], // 0,
    isMultipack: [true],
    isActive: [''],
    searchBy: [0], // 0,
    isShowMultiPackPricing: [false],
    isShowDetails: [false],
    searchByDepat: [true],
    searchByPriceGroup: [false]
  });
  unitsCasePriceCost = [{ id: 1, name: 'Equal' }, { id: 2, name: 'Less than Equal to' },
  { id: 3, name: 'Greater than Equal to' }, { id: 4, name: 'Between' }];
  initialAdvanceForm: any;
  searchByDepatPrice = '';
  storeLocationList: any[];
  isStoreLocationLoading = true;
  storeLocationID = null;
  userInfo = this.constantService.getUserInfo();
  vendorList: any;
  departmentListByUser: any;
  isAdvanceSearchCollapsed = true;
  gridProperties = { showPricing: false, showMultipackPricing: false, showDetails: false };
  advGridOptions: GridOptions;
  advGridApi: any;
  private advGridColumnApi;
  isShowPrice = false;
  storeLocationId;
  subscription: any;
  @Input() childParams: any;
  rowData: any;
  selectedItems = 0;
  value = null;
  price: Number;
  columnName: any;
  selectedItemsIds = '';
  selectedStoreLocationItemIds: any;
  isBWatchList: String;
  Id = null;
  showDelSelItems = false;
  selectedPriceGroup = null;
  selectedParentNode = null;
  childOpen = false;
  selectedStoreForPricing: any;
  childGridshowPricing;
  childGridselectedStoreForPricing: any;
  reinitiate: boolean = true;
  showAddItem: boolean | true;
  constructor(private setupService: SetupService, private toastr: ToastrService, private constantsService: ConstantService,
    private spinner: NgxSpinnerService, private storeMessageService: StoreMessageService,
    private fb: FormBuilder, private storeService: StoreService, private itemService: SetupService,
    private gridService: GridService, private constantService: ConstantService, private utilityService: UtilityService) {
    this.childGridOptions = this.gridService.getGridOption(this.constantService.gridTypes.companyPriceGroupChildGrid);
    this.initialAdvanceForm = this.advancedSearchForm.value;
    this.searchByDepatPrice = 'byPriceGroup';
    this.advGridOptions = this.gridService.getGridOption(this.constantService.gridTypes.priceGrpItemDetailGrid);
  }

  ngOnInit() {
    this.getStoreLocation();
    this.getVendorByCompanyId();
    this.getDepartment();
    this.searchByDepatPrice = 'byDepartment';
    this.storeLocationId = this.constantService.getStoreLocationId();
    this.subscription = this.storeMessageService.getMessage().subscribe(userInf => {
      this.storeLocationId = this.constantService.getStoreLocationId();
    });
  }
  onRowSelected(params) {
    if (params.length === 0) {
      this.showDelSelItems = false;
    } else {
      this.showDelSelItems = true;
    }
    this.selectedItems = params.length;
    this.selectedStoreLocationItemIds = params ? params.map(x => x.data.posCode).join(',') : '';
    this.selectedItemsIds = params ? params.map(x => x.data.itemID).join(',') : '';
  }

  bulkUpdate() {
    /*  if (this.storeLocationID === null) {
       this.toastr.error('Please select store location');
       return;
     } */
    if (this.selectedItems === null || this.selectedItems === 0) {
      this.toastr.error('Please select Items to Update');
      return;
    }
    let storeLocation: any;
    if (this.storeLocationList && this.storeLocationList.length !== 1) {
      storeLocation = this.storeLocationID ?
        this.storeLocationID.map(x => x.storeLocationID).join(',') : '';
    }
    const postData = {
      value: this.value ? this.value : 0,
      isShowPrice: this.isShowPrice,
      price: this.price ? this.price : 0,
      columnName: 'PriceGroup',//this.columnName ? this.columnName : '',
      itemlst: this.selectedItemsIds ? this.selectedItemsIds : 0,
      storelst: storeLocation ? storeLocation : String(this.storeLocationID),
      storelocationitemlst: this.isShowPrice === true ? this.selectedStoreLocationItemIds :
        storeLocation ? storeLocation : String(this.storeLocationID),
      username: this.userInfo.userName,
      CompanyID: this.userInfo.companyId,
      isBWatchList: this.isBWatchList,
      ID: this.Id ? this.Id : 0,
    };
    this.itemService.updateData('Item/BulkUpdate', postData).subscribe(res => {
      if (res === '1') {
        this.selectedItems = null;
        this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
        if (this.currentChanges.childParams) {
          this.childAction(this.currentChanges.childParams.currentValue, "refresh")
        }
        this.getAdvanceSerach("NoLoader");
        this.clearAdvanceSearch();
        this.isAddItem = false;
      } else {
        this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
      }
    }, err => {
      this.spinner.hide();
      this.toastr.error(this.constantService.infoMessages.contactAdmin, this.constantService.infoMessages.error);
      console.log(err);
    });
  }
  setGridHideCol(fieals?, backToList?: boolean) {
    if (this.gridProperties.showPricing && fieals === 'showPricing') {
      this.gridProperties.showMultipackPricing = this.gridProperties.showDetails = false;
      this.isShowPrice = true;
      this.advGridColumnApi.setColumnsVisible(['storeName', 'regularSellPrice', 'unitCostPrice',
        'buyDown', 'regularSellPrice', 'grossProfit', 'currentInventory', 'inventoryValuePrice'], true);
      this.advGridColumnApi.setColumnsVisible(['lastModifiedBy', 'regularPackageSellPrice',
        'lastModifiedDateTime', 'posCodeModifier'], false);
      this.advGridColumnApi.moveColumn('regularSellPrice', 4);
      if (!backToList) { this.getAdvanceSerach(); }
    } else if (this.gridProperties.showMultipackPricing && fieals === 'showMultipackPricing') {
      this.gridProperties.showPricing = this.gridProperties.showDetails = this.isShowPrice = false;
      this.advGridColumnApi.setColumnsVisible(['storeName', 'unitCostPrice', 'regularPackageSellPrice',
        'regularSellPrice', 'grossProfit', 'posCodeModifier'
        , 'posCodeModifierAmount', 'inventoryValuePrice'], true);
      this.advGridColumnApi.setColumnsVisible(['buyDown', 'lastModifiedBy', 'lastModifiedDateTime',
        'currentInventory'], false);
      this.advGridColumnApi.moveColumn('regularSellPrice', 9);
      if (!backToList) { this.getAdvanceSerach(); }

    } else if (this.gridProperties.showDetails && fieals === 'showDetails') {
      this.gridProperties.showPricing = this.gridProperties.showMultipackPricing = this.isShowPrice = false;
      this.advGridColumnApi.setColumnsVisible(['storeName', 'unitCostPrice',
        'regularSellPrice', 'buyDown', 'grossProfit', 'currentInventory', 'posCodeModifier'
        , 'regularPackageSellPrice', 'inventoryValuePrice'], false);
      this.advGridColumnApi.setColumnsVisible(['lastModifiedBy', 'lastModifiedDateTime'], true);
      if (!backToList) { this.getAdvanceSerach(); }

    } else {
      this.defaultGridCol();
    }
  }
  onAdvGridReady(params) {
    this.advGridApi = params.api;
    if (params.api.paginationGetRowCount() === 0)
      params.api.showNoRowsOverlay();
    this.advGridColumnApi = params.columnApi;
    this.defaultGridCol();
    this.setGridHideCol();
    // this.gridProperties.showDetails === true ? this.setGridHideCol('showDetails', true) : null;
    // this.gridProperties.showMultipackPricing === true ? this.setGridHideCol('showMultipackPricing', true) : null;
    this.gridProperties.showPricing === true ? this.setGridHideCol('showPricing', true) : null;
  }
  defaultGridCol() {
    this.isShowPrice = false;
    this.advGridColumnApi.setColumnsVisible(['regularSellPrice', 'unitCostPrice'], true);
    this.advGridColumnApi.setColumnsVisible(['storeName', 'unitCostPrice',
      'buyDown', 'regularSellPrice', 'grossProfit', 'currentInventory', 'posCodeModifier'
      , 'lastModifiedBy', 'regularPackageSellPrice', 'lastModifiedDateTime', 'inventoryValuePrice'], false);
    this.advGridApi.sizeColumnsToFit();
  }
  onChildGridReady(params) {
    this.gridChildApi = params.api;
    setTimeout(() => {
      if (this.childRowData && this.childRowData.length === 0) {
        this.gridChildApi.showNoRowsOverlay();
      } else {
        this.gridChildApi.hideOverlay();
      }
      this.gridChildApi.sizeColumnsToFit();
    }, 500);
  }
  ngOnChanges(changes: SimpleChanges) {
    this.currentChanges = changes
    if (changes.childParams) {
      this.childOpen = true;
      this.selectedParentNode = changes.childParams;
      this.childAction(changes.childParams.currentValue)
    }
  }
  dynamicValidation() {
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

  searchData() {
    this.gridProperties.showPricing = false;
    this.showStoreSelection = false;
    this.selectedStoreForPricing = null;
    this.getAdvanceSerach();
  }
  getAdvanceSerach(NoLoader?) {
    if (!this.dynamicValidation()) {
      this.toastr.warning('Please Select Any Value', 'warning');
      return;
    }
    this.isAdvanceSearchCollapsed = true;
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
    if (this.advancedSearch.sellingPrice === '1') { this.advancedSearchForm.get('sellingPriceEnd').setValue(this.advancedSearchForm.get('sellingPriceStart').value); }
    if (this.advancedSearch.sellingPrice === '2') { this.advancedSearchForm.get('sellingPriceStart').setValue(Number(0)); }
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

    const constLocationList = this.storeLocationList ? this.storeLocationList.map(x => x.storeLocationID).join(',') : '';
    const postData = {
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
      isActive: this.advancedSearchForm.value.isActive === '' ? null : Boolean(this.advancedSearchForm.value.isActive),
      searchBy: this.advancedSearchForm.value.searchBy ? this.advancedSearchForm.value.searchBy : null,
      isShowMultiPackPricing: this.gridProperties.showMultipackPricing ? this.gridProperties.showMultipackPricing : false,
      isShowDetails: this.gridProperties.showDetails ? this.gridProperties.showDetails : false
    };
    if (NoLoader != "NoLoader")
      this.spinner.show();
    this.itemService.postData('Item/getByID', postData).subscribe((response) => {
      if (NoLoader != "NoLoader")
        this.spinner.hide();
      if (response && response['statusCode']) {
        this.rowData = [];
        this.toastr.warning('Unable to fetch record', 'warning');
        return;
      }
      this.rowData = response;
      /*  this.itemMasterGrid['gridOptions'].sideBar = {
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
       }; */
      // this.gridOptions['isSideBarRequired'] = response.length > 10 ? true : false;
      //  this.advGridOptions['isSideBarRequired'] = response.length > 10 ? true : false;
    }, (error) => {
      this.spinner.hide();
      this.rowData = [];
      this.toastr.error('Unable to fetch record');
      console.log(error);
    });
  }
  getDepartment() {
    this.itemService.getData(`Department/getAll/${this.userInfo.userName}/${this.userInfo.companyId}`)
      .subscribe(res => {
        const myOrderedArray = _.sortBy(res, o => o.departmentDescription);
        this.departmentListByUser = myOrderedArray;
      }, err => {
        console.log(err);
      });
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

  bindBulkUpdateStoreLocationID() {
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      this.storeLocationID = this.storeLocationList[0].storeLocationID;
    }
  }
  getStoreLocation(): any {
    if (this.storeService.storeLocation) {
      this.isStoreLocationLoading = false;
      this.storeLocationList = this.storeService.storeLocation;
      this.bindStoreLocationID();
      this.bindBulkUpdateStoreLocationID();
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.storeLocationList = this.storeService.storeLocation;
        this.isStoreLocationLoading = false;
        this.bindStoreLocationID();
        this.bindBulkUpdateStoreLocationID();
      }, (error) => {
        console.log(error);
      });
    }

  }
  clearAdvanceSearch() {
    this.advancedSearchForm.patchValue(this.initialAdvanceForm);
    this.bindStoreLocationID();
  }
  bindStoreLocationID() {
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      this.advancedSearchForm.get('locationCriteria').setValue(this.storeLocationList[0].storeLocationID);
      this.storeLocationID = this.storeLocationList[0].storeLocationID;
    }
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
  get advancedSearch() { return this.advancedSearchForm.value; }
  childAction(params, refresh?) {
    if (params) {
      this.spinner.show();
      this.sliderLeft = false;
      this.selectedPriceGroup = params.data;
      if (this.selectedPriceGroup.FromAPI === 1) {
        this.showAddItem = false;
      } else {
        this.showAddItem = true;
      }
      this.Id = params.data.CompanyPriceGroupID
      this.renderChildGrid(refresh);
    }
  }

  renderChildGrid(refresh?) {
    let url = 'Item/GetAllItemsByPriceGroupID/' + this.selectedPriceGroup.CompanyPriceGroupID;

    if (this.childGridshowPricing || (this.storeLocationList && this.storeLocationList.length == 1)) {
      if ((this.storeLocationList && this.storeLocationList.length == 1)) {
        // this.childGridselectedStoreForPricing = this.storeLocationList[0].storeLocationID;
        this.childGridselectedStoreForPricing = this.storeLocationID;
        this.childGridshowPricing = true;
      }
      url = url + "?StorelocationID=" + this.childGridselectedStoreForPricing;
    }

    this.setupService.getData(url).subscribe(
      (res) => {
        this.spinner.hide();
        res.forEach(element => {
          element["upcCode"] = element["posCode"] + element["checkDigit"];
        });
        this.reloadchildDetailGrid();

        this.childRowData = res;
        if (this.gridChildApi) {
          if (this.childRowData && this.childRowData.length === 0) {
            this.gridChildApi.showNoRowsOverlay();
          } else {
            this.gridChildApi.hideOverlay();
          }
        }
        if (res && res.length > 0 && this.selectedPriceGroup.FromAPI === 1) {
          this.childRowData.map((data) => {
            data.hideDeleteButton = true;
            return data;
          });
        }
        this.sliderLeft = true;
        this.isAddItem = false;
        if (refresh) {
          if (this.selectedItemsIds.length > 0)
            this.selectedParentNode.updatedItemsCount = this.selectedItemsIds.split(",").length;
          this.refreshParent.emit(this.selectedParentNode);
        }
        this.clearAdvanceSearch();
        this.rowData = [];
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }
  closeDetails() {
    this.sliderLeft = false;
  }
  delChildAction(params) {
    this.spinner.show();
    // this.setupService.deleteData('ItemGroup/delete/' + params.data.itemID+"/"+this.Id).subscribe((response) => {
    this.setupService.deleteData('ItemPriceGroup/delete/' + params.data.itemID + "/" + this.Id).subscribe((response) => {
      this.spinner.hide();
      if (response && Number(response) >= 0) {
        this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantsService.infoMessages.success);
        this.childAction(this.childParams, true);
      } else {
        this.toastr.error(this.constantsService.infoMessages.deleteRecordFailed, this.constantsService.infoMessages.error);
      }
    }, (error) => {
      this.spinner.hide();
      this.toastr.error(this.constantsService.infoMessages.deleteRecordFailed, this.constantsService.infoMessages.error);
      console.log(error);
    });
  }
  showGrid() {
    this.rowData = [];
    this.isAddItem = !this.isAddItem;
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      this.gridProperties.showPricing = true;
      // this.setGridHideCol('showPricing');
    }
  }

  showStoreSelectionForPricing() {
    if (this.gridProperties.showPricing)
      this.showStoreSelection = true;
    else
      this.showStoreSelection = false;
  }

  showPricingForStore() {
    this.advancedSearchForm.patchValue({
      locationCriteria: [this.selectedStoreForPricing]
    })
    this.getAdvanceSerach();
  }

  childGridshowPricingForStore() {
    this.renderChildGrid();
    //this.getAdvanceSerach();
  }

  childGridStoreSelectionForPricing() {
    if (this.childGridshowPricing)
      this.childGridShowStoreSelection = true;
    else {
      this.childGridShowStoreSelection = false;
      this.childGridselectedStoreForPricing = undefined;
    }
    this.reloadchildDetailGrid();
  }

  reloadchildDetailGrid() {
    if (this.childGridshowPricing && this.childGridselectedStoreForPricing) {
      this.childGridOptions = this.gridService.getGridOption(this.constantService.gridTypes.companyPriceGroupGridChildColWithSPGrid);
    } else {
      this.childGridOptions = this.gridService.getGridOption(this.constantService.gridTypes.companyPriceGroupChildGrid);
    }
    this.reinitiate = false;
    setTimeout(() => {
      this.reinitiate = true;
    });
  }

  onCellClicked(params) {
    if (params.colDef.field === "upcCode" || params.colDef.field === "posCodeWithCheckDigit") {
      this.utilityService.copyText(params.value);
      this.toastr.success('UPC Code Copied');
    }
    if (params.colDef.field === "description") {
      this.utilityService.copyText(params.value);
      this.toastr.success('Description Copied');
    }
  }
}
