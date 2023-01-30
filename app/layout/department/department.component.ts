import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { GridService } from 'src/app/shared/services/grid/grid.service';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';
import { GridApi, ColumnApi } from 'ag-grid-community';
import { routerTransition } from 'src/app/router.animations';
import { ToastrService } from 'ngx-toastr';
import { Department } from '../models/department.model';
import { FormMode } from '../models/form-mode.enum';
import { SetupService } from '@shared/services/setupService/setup-service';
import { CommonService } from '@shared/services/commmon/common.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { StoreService } from '@shared/services/store/store.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss'],
  animations: [routerTransition()]
})
export class DepartmentComponent implements OnInit {

  formMode: FormMode = FormMode.ADD;
  selectedDepartment: Department = null;

  departmentDetails = false;
  isBulkUpdateCollapsed = true;
  selectedItems = 0;
  selectedDepartmentIds: any;
  locationDropdownList = [];
  isStoreLocationLoading = true;
  locationDropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 5,
    allowSearchFilter: true
  };

  bulkUpdateForm = this._fb.group({
    updateDataValue: null,
    storeLocationId: null,
    flagValue: null,
    POSSyncStatus: null,
    SalesRestriction: null,
    Tax: null,
    DepartmentTypes: null,
    ActiveFlag: null,
    ProfitMargin: null,
    ProfitPercent: null,
    ProductCode: null,
    AreSpecialDiscountsAllowedFlag:null,
    AllowFoodStampsFlag: null
  });

  userInfo = this.constantService.getUserInfo();
  departmentGridApi: GridApi;
  departmentColumnApi: ColumnApi;
  departmentRowData: any;
  departmentGridOptions: any;
  showLocation = false;
  storeLocationList: any;
  POSSyncStatusList: any;
  salesRestrictionList: any;
  taxList: any;
  departmentTypeList: any;
  updateDataFor = [
    { value: 'POSSyncStatus', name: 'POS Sync Status' },
    // { value: 'IsDepartmentOpen', name: 'Allow Open Sales In Department' },
    // { value: 'IsFractionalQtyAllowedFlag', name: 'Allow Partial Quantity Sales' },
    // { value: 'IsLoyaltyRedeemEligibleFlag', name: 'Allow Loyalty Redeem Sales' },
    // { value: 'IsItemReturnableFlag', name: 'Allow Item Returns' },
    // { value: 'AllowFoodStampsFlag', name: 'Allow Food Stamp Sales' },
    // { value: 'AreSpecialDiscountsAllowedFlag', name: 'Allow Special Discounts' },
    // { value: 'PriceRequiredFlag', name: 'Flexible Pricing For Items' },
    { value: 'SalesRestriction', name: 'Sales Restriction' },
    { value: 'Tax', name: 'Store Tax' },
    { value: 'DepartmentTypes', name: 'Department Types' },
    { value: 'ActiveFlag', name: 'Active' },
    { value: 'ProfitMargin', name: 'Profit Margin' },
    { value: 'ProfitPercent', name: 'Profit Percent' },
    { value: 'ProductCode', name: 'Product Code' },
    { value: 'AreSpecialDiscountsAllowedFlag', name: 'Allow special discounts' },
    { value: 'AllowFoodStampsFlag', name: 'Allow Food stamps' },
  ];
  trueFalseList = [
    { value: 'False', name: 'False' },
    { value: 'True', name: 'True' },
  ];
  isPOSSyncStatus = false;
  isFlagValue = false;
  salesRestriction = false;
  tax = false;
  departmentTypes = false;
  profitMargin = false;
  profitPercent = false;
  productCode = false;
  areSpecialDiscountsAllowedFlag = false;
  allowFoodStampsFlag = false;
  defualtBulkUpdate: any;
  filterText: any = null;
  isStoreTaxLoading: boolean;
  isStoreMulti = true;
  constructor(private _fb: FormBuilder, private gridService: GridService, private constants: ConstantService,
    private _itemsService: SetupService, private _tstr: ToastrService, private constantService: ConstantService,
    private commonService: CommonService, private spinner: NgxSpinnerService, private storeService: StoreService) {
    this.departmentGridOptions = this.gridService.getGridOption(this.constants.gridTypes.departmentGrid);
    this.defualtBulkUpdate = this.bulkUpdateForm.value;
  }

  ngOnInit() {
    this.fetchDepartmentData();
    this.getStoreLocationDetails();
    this.getPOSSyncStatusList();
    this.getDepartmentTypeList();
  }

  onDepartmentGridReady(params) {
    this.departmentGridApi = params.api;
    this.departmentColumnApi = params.columnApi;
    this.commonService.departmentGridOptions = params;
    this.showLocationCol();
  }

  editDepartment(params) {
    params.data.rowIndex = params.rowIndex;
    this.selectedDepartment = params.data;
    this.formMode = FormMode.EDIT;
    this.departmentDetails = true;
  }
  deleteDepartment(params) {
    if (params.data.departmentID === undefined) { return; }
    this.spinner.show();
    this._itemsService.deleteData(`Department/DeleteDepartment/${params.data.departmentID}`).subscribe((data) => {
      this.spinner.hide();
      if (data && data['statusCode']) {
        let errorMessage = '';
        if (data.result && data.result.validationErrors) {
          data.result.validationErrors.forEach(vError => {
            errorMessage += vError.errorMessage;
          });
          this._tstr.error(errorMessage);
        } else {
          this._tstr.error(this.constants.infoMessages.contactAdmin);
        }
        return;
      }
      this.fetchDepartmentData();
      this._tstr.success('Selected department deleted!', 'Deleted!');
    }, (err: any) => {
      this.spinner.hide();
      let errorMessage = '';
      if (err.error.validationErrors) {
        err.error.validationErrors.forEach(vError => {
          errorMessage += vError.errorMessage;
        });
        this._tstr.error(errorMessage);
      } else {
        this._tstr.error(this.constants.infoMessages.contactAdmin);
      }
    });
  }

  forceDelete() {
    // code..
  }
  addDepartmentDetails(show: boolean) {
    this.fetchDepartmentData();
    this.selectedDepartment = null;
    this.formMode = FormMode.ADD;
    this.departmentDetails = show;
  }

  toggleShowLocation() {
    this.showLocation = !this.showLocation;
    this.showLocationCol();
  }
  showLocationCol() {
    this.departmentColumnApi
      .setColumnsVisible(['noOfItems', 'POSDepartmentCode', 'storeName', 'isBlueLaw1Enabled', 'isBlueLaw2Enabled'], this.showLocation);
  }

  getStoreLocationDetails() {
    if (this.storeService.storeLocation) {
      this.isStoreLocationLoading = false;
      this.storeLocationList = this.storeService.storeLocation;

    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.isStoreLocationLoading = false;
        this.storeLocationList = this.storeService.storeLocation;

      }, (error) => {
        console.log(error);
      });
    }
  }

  /**
   * Fetch the Department data from server
   */
  fetchDepartmentData(): void {
    this.spinner.show();
    this._itemsService.getData(`Department/getAll/${this.userInfo.userName}/${this.userInfo.companyId}`).subscribe((data: Department[]) => {
      this.departmentRowData = data;
      this.spinner.hide();
    }, (err) => {
      this.spinner.hide();
      this._tstr.error('Unable to fetch Deprtment data!');
    });
  }

  /**
   * Fetch the Department data from server
   */
  // fetchDeptWithoutLocData(): void {
  //   this._itemsService.getData(`Department/getWithoutDepartmentLocation`).subscribe((data: Department[]) => {
  //     this.deptWithoutLocRowData = data;
  //   }, (err) => {
  //     console.log(err);
  //     this._tstr.error('Unable to fetch Deprtment Without Location data!');
  //   });
  // }


  getPOSSyncStatusList() {
    this._itemsService.getData('POSSyncStatus/get').subscribe((data) => {
      this.POSSyncStatusList = data;
    }, (err) => {
      console.log(err);
    });
  }

  changeSalesRestriction(params, value) {
    this.salesRestrictionList = [];
    this.taxList = [];
    if (value === 'salesRestriction' && params) {
      this.getSalesRestrictionList(params.storeLocationID);
    } else if (value === 'tax' && params) {
      this.getTaxList(params.storeLocationID);
    } else {

    }
  }

  getSalesRestrictionList(storeLocationId) {
    this._itemsService.getData(`StoreLocationSalesRestriction/getByLocationID/${storeLocationId}`).subscribe((data) => {
      if (data && data['statusCode']) {
        this.salesRestrictionList = [];
        return;
      }
      this.salesRestrictionList = data;
    }, (err) => {
      console.log(err);
    });
  }

  getTaxList(storeLocationId) {
    this.isStoreTaxLoading = true;
    this._itemsService.getData(`StoreLocationTax/getByLocationId/${storeLocationId}`).subscribe((data) => {
      this.isStoreTaxLoading = false;
      if (data && data['statusCode']) {
        this.taxList = [];
        return;
      }
      this.taxList = data;
    }, (err) => {
      this.isStoreTaxLoading = false;
      console.log(err);
    });
  }

  getDepartmentTypeList() {
    this._itemsService.getData(`DepartmentType/getAll`).subscribe((data) => {
      this.departmentTypeList = data;
    }, (err) => {
      console.log(err);
    });

  }
  changeUpdateData(params) {
    this.isStoreMulti = true;
    if (!params) {
      this.bulkUpdateForm.patchValue(this.defualtBulkUpdate);
      this.isPOSSyncStatus = false;
      this.salesRestriction = false;
      this.tax = false;
      this.departmentTypes = false;
      this.profitMargin = false;
      this.profitPercent = false;
      this.isFlagValue = false;
      this.productCode = false;
      this.areSpecialDiscountsAllowedFlag = false;
      this.allowFoodStampsFlag = false;
      return;
    }
    switch (params.value) {
      case 'POSSyncStatus':
        this.isPOSSyncStatus = true;
        this.salesRestriction = false;
        this.tax = false;
        this.departmentTypes = false;
        this.profitMargin = false;
        this.profitPercent = false;
        this.isFlagValue = false;
        this.productCode = false;
        this.areSpecialDiscountsAllowedFlag = false;
        this.allowFoodStampsFlag = false;
        this.patchPOSSyncStatusValue();
        return;
      case 'SalesRestriction':
        this.salesRestriction = true;
        this.isPOSSyncStatus = false;
        this.tax = false;
        this.departmentTypes = false;
        this.profitMargin = false;
        this.profitPercent = false;
        this.isFlagValue = false;
        this.productCode = false;
        this.isStoreMulti = false;
        this.areSpecialDiscountsAllowedFlag = false;
        this.allowFoodStampsFlag = false;
        this.patchSalesRestriction();
        return;
      case 'Tax':
        this.tax = true;
        this.salesRestriction = false;
        this.isPOSSyncStatus = false;
        this.departmentTypes = false;
        this.profitMargin = false;
        this.profitPercent = false;
        this.isFlagValue = false;
        this.productCode = false;
        this.isStoreTaxLoading = true;
        this.isStoreMulti = false;
        this.areSpecialDiscountsAllowedFlag = false;
        this.allowFoodStampsFlag = false;
        this.patchTax();
        return;

      case 'DepartmentTypes':
        this.departmentTypes = true;
        this.tax = false;
        this.salesRestriction = false;
        this.isPOSSyncStatus = false;
        this.profitMargin = false;
        this.profitPercent = false;
        this.isFlagValue = false;
        this.productCode = false;
        this.areSpecialDiscountsAllowedFlag = false;
        this.allowFoodStampsFlag = false;
        this.patchDepartmentTypes();
        return;
      case 'ActiveFlag':
        this.isFlagValue = true;
        this.isPOSSyncStatus = false;
        this.tax = false;
        this.departmentTypes = false;
        this.profitMargin = false;
        this.profitPercent = false;
        this.salesRestriction = false;
        this.productCode = false;
        this.areSpecialDiscountsAllowedFlag = false;
        this.allowFoodStampsFlag = false;
        this.patchActiveFlag();
        return;
      case 'ProfitMargin':
        this.profitMargin = true;
        this.departmentTypes = false;
        this.tax = false;
        this.salesRestriction = false;
        this.isPOSSyncStatus = false;
        this.profitPercent = false;
        this.isFlagValue = false;
        this.productCode = false;
        this.areSpecialDiscountsAllowedFlag = false;
        this.allowFoodStampsFlag = false;
        this.patchProfitMargin();
        return;
      case 'ProfitPercent':
        this.profitPercent = true;
        this.profitMargin = false;
        this.departmentTypes = false;
        this.tax = false;
        this.salesRestriction = false;
        this.isPOSSyncStatus = false;
        this.isFlagValue = false;
        this.productCode = false;
        this.areSpecialDiscountsAllowedFlag = false;
        this.allowFoodStampsFlag = false;
        this.patchProfitPercent();
        return;
      case 'ProductCode':
        this.productCode = true;
        this.profitPercent = false;
        this.profitMargin = false;
        this.departmentTypes = false;
        this.tax = false;
        this.salesRestriction = false;
        this.isPOSSyncStatus = false;
        this.isFlagValue = false;
        this.areSpecialDiscountsAllowedFlag = false;
        this.allowFoodStampsFlag = false;
        this.patchProductCode();
        return;

      case 'AreSpecialDiscountsAllowedFlag':
        this.areSpecialDiscountsAllowedFlag = true;
        this.productCode = false;
        this.profitPercent = false;
        this.profitMargin = false;
        this.departmentTypes = false;
        this.tax = false;
        this.salesRestriction = false;
        this.isPOSSyncStatus = false;
        this.isFlagValue = false;
        this.allowFoodStampsFlag = false;
        this.patchAreSpecialDiscountsAllowedFlag();
        return;

      case 'AllowFoodStampsFlag':
        this.allowFoodStampsFlag = true;
        this.productCode = false;
        this.profitPercent = false;
        this.profitMargin = false;
        this.departmentTypes = false;
        this.tax = false;
        this.salesRestriction = false;
        this.isPOSSyncStatus = false;
        this.isFlagValue = false;
        this.areSpecialDiscountsAllowedFlag = false;
        this.patchAllowFoodStampsFlag();
        return;


    }
  }

  patchPOSSyncStatusValue() {
    this.bulkUpdateForm.get('flagValue').setValue(null);
    this.bulkUpdateForm.get('SalesRestriction').setValue(null);
    this.bulkUpdateForm.get('Tax').setValue(null);
    this.bulkUpdateForm.get('DepartmentTypes').setValue(null);
    this.bulkUpdateForm.get('ProfitMargin').setValue(null);
    this.bulkUpdateForm.get('ProfitPercent').setValue(null);
    this.bulkUpdateForm.get('ProductCode').setValue(null);
    this.bulkUpdateForm.get('AreSpecialDiscountsAllowedFlag').setValue(null);
    this.bulkUpdateForm.get('AllowFoodStampsFlag').setValue(null);
  }
  patchSalesRestriction() {
    this.bulkUpdateForm.get('flagValue').setValue(null);
    this.bulkUpdateForm.get('POSSyncStatus').setValue(null);
    this.bulkUpdateForm.get('Tax').setValue(null);
    this.bulkUpdateForm.get('DepartmentTypes').setValue(null);
    this.bulkUpdateForm.get('ProfitMargin').setValue(null);
    this.bulkUpdateForm.get('ProfitPercent').setValue(null);
    this.bulkUpdateForm.get('ProductCode').setValue(null);
    this.bulkUpdateForm.get('AreSpecialDiscountsAllowedFlag').setValue(null);
    this.bulkUpdateForm.get('AllowFoodStampsFlag').setValue(null);
  }
  patchTax() {
    this.bulkUpdateForm.get('flagValue').setValue(null);
    this.bulkUpdateForm.get('POSSyncStatus').setValue(null);
    this.bulkUpdateForm.get('SalesRestriction').setValue(null);
    this.bulkUpdateForm.get('DepartmentTypes').setValue(null);
    this.bulkUpdateForm.get('ProfitMargin').setValue(null);
    this.bulkUpdateForm.get('ProfitPercent').setValue(null);
    this.bulkUpdateForm.get('ProductCode').setValue(null);
    this.bulkUpdateForm.get('AreSpecialDiscountsAllowedFlag').setValue(null);
    this.bulkUpdateForm.get('AllowFoodStampsFlag').setValue(null);
  }
  patchDepartmentTypes() {
    this.bulkUpdateForm.get('flagValue').setValue(null);
    this.bulkUpdateForm.get('POSSyncStatus').setValue(null);
    this.bulkUpdateForm.get('SalesRestriction').setValue(null);
    this.bulkUpdateForm.get('Tax').setValue(null);
    this.bulkUpdateForm.get('ProfitMargin').setValue(null);
    this.bulkUpdateForm.get('ProfitPercent').setValue(null);
    this.bulkUpdateForm.get('ProductCode').setValue(null);
    this.bulkUpdateForm.get('AreSpecialDiscountsAllowedFlag').setValue(null);
    this.bulkUpdateForm.get('AllowFoodStampsFlag').setValue(null);
  }
  patchActiveFlag() {
    this.bulkUpdateForm.get('DepartmentTypes').setValue(null);
    this.bulkUpdateForm.get('POSSyncStatus').setValue(null);
    this.bulkUpdateForm.get('SalesRestriction').setValue(null);
    this.bulkUpdateForm.get('Tax').setValue(null);
    this.bulkUpdateForm.get('ProfitMargin').setValue(null);
    this.bulkUpdateForm.get('ProfitPercent').setValue(null);
    this.bulkUpdateForm.get('ProductCode').setValue(null);
    this.bulkUpdateForm.get('AreSpecialDiscountsAllowedFlag').setValue(null);
    this.bulkUpdateForm.get('AllowFoodStampsFlag').setValue(null);
  }
  patchProfitMargin() {
    this.bulkUpdateForm.get('DepartmentTypes').setValue(null);
    this.bulkUpdateForm.get('POSSyncStatus').setValue(null);
    this.bulkUpdateForm.get('SalesRestriction').setValue(null);
    this.bulkUpdateForm.get('Tax').setValue(null);
    this.bulkUpdateForm.get('flagValue').setValue(null);
    this.bulkUpdateForm.get('ProfitPercent').setValue(null);
    this.bulkUpdateForm.get('ProductCode').setValue(null);
    this.bulkUpdateForm.get('AreSpecialDiscountsAllowedFlag').setValue(null);
    this.bulkUpdateForm.get('AllowFoodStampsFlag').setValue(null);
  }
  patchProfitPercent() {
    this.bulkUpdateForm.get('DepartmentTypes').setValue(null);
    this.bulkUpdateForm.get('POSSyncStatus').setValue(null);
    this.bulkUpdateForm.get('SalesRestriction').setValue(null);
    this.bulkUpdateForm.get('Tax').setValue(null);
    this.bulkUpdateForm.get('flagValue').setValue(null);
    this.bulkUpdateForm.get('ProfitMargin').setValue(null);
    this.bulkUpdateForm.get('ProductCode').setValue(null);
    this.bulkUpdateForm.get('AreSpecialDiscountsAllowedFlag').setValue(null);
    this.bulkUpdateForm.get('AllowFoodStampsFlag').setValue(null);
  }
  patchProductCode() {
    this.bulkUpdateForm.get('DepartmentTypes').setValue(null);
    this.bulkUpdateForm.get('POSSyncStatus').setValue(null);
    this.bulkUpdateForm.get('SalesRestriction').setValue(null);
    this.bulkUpdateForm.get('Tax').setValue(null);
    this.bulkUpdateForm.get('flagValue').setValue(null);
    this.bulkUpdateForm.get('ProfitMargin').setValue(null);
    this.bulkUpdateForm.get('ProfitPercent').setValue(null);
    this.bulkUpdateForm.get('AreSpecialDiscountsAllowedFlag').setValue(null);
    this.bulkUpdateForm.get('AllowFoodStampsFlag').setValue(null);
  }
  patchAreSpecialDiscountsAllowedFlag(){
    this.bulkUpdateForm.get('ProductCode').setValue(null);
    this.bulkUpdateForm.get('DepartmentTypes').setValue(null);
    this.bulkUpdateForm.get('POSSyncStatus').setValue(null);
    this.bulkUpdateForm.get('SalesRestriction').setValue(null);
    this.bulkUpdateForm.get('Tax').setValue(null);
    this.bulkUpdateForm.get('flagValue').setValue(null);
    this.bulkUpdateForm.get('ProfitMargin').setValue(null);
    this.bulkUpdateForm.get('ProfitPercent').setValue(null);
    this.bulkUpdateForm.get('AllowFoodStampsFlag').setValue(null);
  }
  patchAllowFoodStampsFlag(){
    this.bulkUpdateForm.get('ProductCode').setValue(null);
    this.bulkUpdateForm.get('DepartmentTypes').setValue(null);
    this.bulkUpdateForm.get('POSSyncStatus').setValue(null);
    this.bulkUpdateForm.get('SalesRestriction').setValue(null);
    this.bulkUpdateForm.get('Tax').setValue(null);
    this.bulkUpdateForm.get('flagValue').setValue(null);
    this.bulkUpdateForm.get('ProfitMargin').setValue(null);
    this.bulkUpdateForm.get('ProfitPercent').setValue(null);
    this.bulkUpdateForm.get('AreSpecialDiscountsAllowedFlag').setValue(null);
  }

  resetBulkUpdateForm() {
    this.bulkUpdateForm.patchValue(this.defualtBulkUpdate);
    this.productCode = false;
    this.profitPercent = false;
    this.profitMargin = false;
    this.departmentTypes = false;
    this.tax = false;
    this.salesRestriction = false;
    this.isPOSSyncStatus = false;
    this.isFlagValue = false;
    this.selectedDepartmentIds = null;
    this.areSpecialDiscountsAllowedFlag = false;
    this.allowFoodStampsFlag = false;
  }
  get bulkUpdateValue() { return this.bulkUpdateForm.value; }

  updateBulkSelected() {
    
    if (!this.selectedDepartmentIds) {
      this._tstr.error('Please select  department!', this.constantService.infoMessages.error);
      return;
    }
    if (this.bulkUpdateValue.updateDataValue === null || this.bulkUpdateValue.updateDataValue === '') {
      this._tstr.error('Please select update data for', this.constantService.infoMessages.error);
      return;
    }
    if (this.bulkUpdateValue.storeLocationId === null) {
      this._tstr.error('Please select store location', this.constantService.infoMessages.error);
      return;
    }
    let storeLocation = null;
    if (_.isArray(this.bulkUpdateValue.storeLocationId)) {
      // tslint:disable-next-line:max-line-length
      storeLocation = this.bulkUpdateValue.storeLocationId ? this.bulkUpdateValue.storeLocationId.map(x => x.storeLocationID).join(',') : '';

    } else {
      storeLocation = this.bulkUpdateValue.storeLocationId.toString();
    }
    const postData = {
      isShowPrice: false,
      deplst: this.selectedDepartmentIds,
      storelst: storeLocation,
      columnName: this.bulkUpdateValue.updateDataValue ? this.bulkUpdateValue.updateDataValue : '',
      posSyncStatusId: this.bulkUpdateValue.POSSyncStatus ? this.bulkUpdateValue.POSSyncStatus : 0,
      storeID: 0,
      salesTaxID: this.bulkUpdateValue.Tax ? this.bulkUpdateValue.Tax : 0,
      salesRestrictID: this.bulkUpdateValue.SalesRestriction ? this.bulkUpdateValue.SalesRestriction : 0,
      flagValue: this.bulkUpdateValue.flagValue ? this.bulkUpdateValue.flagValue : 0,
      departTypeID: this.bulkUpdateValue.DepartmentTypes ? this.bulkUpdateValue.DepartmentTypes : 0,
      profitPercent: this.bulkUpdateValue.ProfitPercent ? this.bulkUpdateValue.ProfitPercent : 0,
      profitMargin: this.bulkUpdateValue.ProfitMargin ? this.bulkUpdateValue.ProfitMargin : 0,
      productcode: this.bulkUpdateValue.ProductCode ? this.bulkUpdateValue.ProductCode : 0,
      areSpecialDiscountsAllowedFlag: this.bulkUpdateValue.AreSpecialDiscountsAllowedFlag ? this.bulkUpdateValue.AreSpecialDiscountsAllowedFlag : 0,
      allowFoodStampsFlag: this.bulkUpdateValue.AllowFoodStampsFlag ? this.bulkUpdateValue.AllowFoodStampsFlag : 0,
      UserName: this.userInfo.userName,
      CompanyID: this.userInfo.companyId
    };
    this.spinner.show();
    let url;
    if (postData.columnName === 'AreSpecialDiscountsAllowedFlag' || postData.columnName === 'AllowFoodStampsFlag') {
      url = 'StoreLocation/updateBulk?isShowPrice=true&deplst=' +
        postData.deplst + '&columnName=' + postData.columnName +
        '&posSyncStatusId=' + postData.posSyncStatusId + '&flagValue=' + (postData.columnName === 'AreSpecialDiscountsAllowedFlag' ? postData.areSpecialDiscountsAllowedFlag : postData.allowFoodStampsFlag) +
         '&UserName=' + postData.UserName +
        '&CompanyID=' + postData.CompanyID + '';
    }else{
      url = 'StoreLocation/updateBulk?isShowPrice=true&deplst=' +
        postData.deplst + '&storelst=' + postData.storelst + '&columnName=' + postData.columnName +
        '&posSyncStatusId=' + postData.posSyncStatusId + '&storeID=' + postData.storeID + '&salesTaxID='
        + postData.salesTaxID + '&salesRestrictID=' + postData.salesRestrictID + '&flagValue=' + postData.flagValue +
        '&departTypeID=' + postData.departTypeID + '&profitPercent=' + postData.profitPercent + '&profitMargin='
        + postData.profitMargin + '&productcode=' + postData.productcode + '&areSpecialDiscountsAllowedFlag=' + postData.areSpecialDiscountsAllowedFlag + '&allowFoodStampsFlag=' + postData.allowFoodStampsFlag + '&UserName=' + postData.UserName +
        '&CompanyID=' + postData.CompanyID + '';
    }



    this._itemsService.updateData(url, '')
      .subscribe(res => {
        this.spinner.hide();
        if (res === '1') {
          this.resetBulkUpdateForm();
          this.fetchDepartmentData();
          this.selectedItems = 0;
          this._tstr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
        } else {
          this._tstr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
        }
      }, error => {
        this.spinner.hide();
        this._tstr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
        console.log(error);
      });
  }

  onRowSelected(params) {
    this.selectedItems = params.length;
    this.selectedDepartmentIds = params ? params.map(x => x.data.departmentID).join(',') : '';
  }
}


