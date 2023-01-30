import { Component, OnInit } from '@angular/core';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { ColumnApi, GridApi } from 'ag-grid-community';
import { FormBuilder } from '@angular/forms';
import { PriceSchedule } from '@models/price-schedule.model';
import { StoreService } from '@shared/services/store/store.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import * as _ from 'lodash';

@Component({
  selector: 'app-price-schedule',
  templateUrl: './price-schedule.component.html',
  styleUrls: ['./price-schedule.component.scss']
})
export class PriceScheduleComponent implements OnInit {
  isAdvanceSearchCollapsed = true;
  isBulkUpdateCollapsed = true;
  departmentDetails: boolean;
  isAddItem: boolean;
  gridApi: GridApi;
  columnApi: ColumnApi;
  currentPriceRowData: any[] = [];
  currentPriceGridOptions: any;
  newPriceScheduleGridOptions: any;
  newPriceScheduleRowData: any[] = [];
  userInfo = this.constants.getUserInfo();
  currentInventory = '';
  unitInCase = '';
  sellingUnits = '';
  buyingCost = '';
  sellingPrice = '';
  unitsCasePriceCost = [{ id: 1, name: 'Equal' }, { id: 2, name: 'Less than Equal to' },
  { id: 3, name: 'Greater than Equal to' }, { id: 4, name: 'Between' }];
  private _priceSchedule: PriceSchedule;
  departmentTypeList: any;
  posSyncStatusList: any;

  priceScheduleForm = this._fb.group({
    posCodeOrDesc: [''],
    sellingUnitStart: [],
    sellingUnitEnd: [],
    unitsInCaseStart: [],
    unitsInCaseEnd: [],
    sellingPriceStart: [],
    sellingPriceEnd: [],
    inventoryValuePriceStart: [],
    inventoryValuePriceEnd: [],
    currentInventoryStart: [],
    currentInventoryEnd: [],
    pMStartCriteria: [],
    pmEndCriteria: [],
    vendorCriteria: [''],
    department: [''],
    locationCriteria: [''],
    posSyncStatus: [0],
    isShowPricing: [true],
    isClick: [true],
    isOnWatchList: [''],
    priceGroup: [null],
    isMultipack: [''],
    isActive: [''],
    SearchBy: [0],
    isShowMultiPackPricing: [true],
    isShowDetails: [true]
  });
  priceGroupList: any;
  departmentList: any;
  vendorList: any;
  storeLocationList: any;
  constructor(private gridService: GridService, private constants: ConstantService, private _fb: FormBuilder,
    private _itemsService: SetupService, private storeService: StoreService) {
    this.currentPriceGridOptions = this.gridService.getGridOption(this.constants.gridTypes.currentPriceScheduleGrid);
    this.newPriceScheduleGridOptions = this.gridService.getGridOption(this.constants.gridTypes.newPriceScheduleGrid);
    this._priceSchedule = this.priceScheduleForm.value;
  }

  ngOnInit() {
    this.getPOSGroup();
    this.getStoreLocation();
    this.getDepartment();
    this.getVendorByCompanyId();
  }
  onGridReady(params) {
    params.api.sizeColumnsToFit();
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }
  getPOSGroup() {
    this._itemsService.getPOSGroupDepartment().subscribe((response) => {
      this.posSyncStatusList = response[0];
      this.priceGroupList = response[1];
      //  this.departmentList = response[2];
      //  this.vendorList = response[3];
    });
  }
  getStoreLocation(): any {
    if (this.storeService.storeLocation) {
      this.storeLocationList = this.storeService.storeLocation;
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.storeLocationList = this.storeService.storeLocation;
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
    this._itemsService.getData(`Department/getAll/${this.userInfo.userName}/${this.userInfo.companyId}`)
      .subscribe(res => {
        const myOrderedArray = _.sortBy(res, o => o.departmentDescription);
        this.departmentList = myOrderedArray;
      }, err => {
        console.log(err);
      });
  }
  onSearchTextBoxChanged() {
    console.log('not working!');
  }
  getDepartmentType() {
    this._itemsService.getData(`DepartmentType/getAll`).subscribe(result => {
      console.log(result);
      this.departmentTypeList = result;
    });
  }
  getVendor() {
    this._itemsService.getData(`Vendor/getAll`).subscribe(result => {
      console.log(result);
      // this.vendorTypeList = result;
    });
  }
  onSearch(params) {
    this._itemsService.postData(`ItemPriceSchedule/getItemSearch`, params).subscribe(result => {
      console.log(result);
    }, error => {
      console.log(error);
    });
  }
}
