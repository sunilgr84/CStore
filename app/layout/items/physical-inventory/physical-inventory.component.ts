import { Component, OnInit } from '@angular/core';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { GridOptions } from 'ag-grid-community';
import { SetupService } from '@shared/services/setupService/setup-service';
import { FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment';
import { StoreService } from '@shared/services/store/store.service';

@Component({
  selector: 'app-physical-inventory',
  templateUrl: './physical-inventory.component.html',
  styleUrls: ['./physical-inventory.component.scss']
})
export class PhysicalInventoryComponent implements OnInit {
  gridOptions: GridOptions;
  gridApi: any;
  rowData: any;
  filterText: any;
  stores: any;
  storeLocationDropdownSettings: any;
  storeList: any;
  departmentList: any;
  checkeByList: any;
  isDepartmentLoading = true;
  isCheckByLoading = true;
  currentDate = this.pipe.transform(new Date(), 'MM-dd-yyyy hh:mm');
  userInfo = this.constants.getUserInfo();
  _startDate = moment().format('MM-DD-YYYY');
  _endDate = moment().format('MM-DD-YYYY');
  selectedDateRange:any;
  physicalInventorySearchForm = this._fb.group({
    startDate: this._startDate,
    endDate: this._endDate,
    storelocationId: '',
    checkeBy: '',
    departmentIDs: '',
    companyID: 0,
  });

  constructor(private gridService: GridService, private constantService: ConstantService, private setupService: SetupService,
    private constants: ConstantService, private _fb: FormBuilder, private pipe: DatePipe,
    private spinner: NgxSpinnerService, private storeService: StoreService) {
    this.gridOptions = this.gridService.getGridOption(this.constantService.gridTypes.physicalInventoryGrid);
  }
  ngOnInit() {
    this.getStoreList();
    this.getDepartmentList();
    this.getCompanyUserList();
  }
  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }
  getStoreList() {
    if (this.storeService.storeLocation) {
      this.storeList = this.storeService.storeLocation;
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.storeList = this.storeService.storeLocation;
      }, (error) => {
        console.log(error);
      });
    }
  }
  getDepartmentList() {
    if (this.storeService.departmentList) {
      this.isDepartmentLoading = false;
      this.departmentList = this.storeService.departmentList;
    } else {
      this.storeService.getDepartment(this.userInfo.companyId,this.userInfo.userName).subscribe(
          (response) => {
            this.isDepartmentLoading = false;
            this.departmentList = this.storeService.departmentList;
          });
    }
  }
  
  getCompanyUserList() {
    this.setupService.getData('Users/GetUsersByCompanyId/CompanyId/' + this.userInfo.companyId).subscribe(
      (response) => {
        this.checkeByList = response;
        this.isCheckByLoading = false;
      });
  }
 
  physicalInventorySearch() {
    console.log(this.physicalInventorySearchForm.value);
    const storeLocationIdObj = this.physicalInventorySearchForm.value.storelocationId ?
      this.physicalInventorySearchForm.value.storelocationId.map(x => x).join(',') : '';
    const departmentIDsObj = this.physicalInventorySearchForm.value.departmentIDs ?
      this.physicalInventorySearchForm.value.departmentIDs.map(x => x).join(',') : '';
    const checkedByObj = this.physicalInventorySearchForm.value.checkeBy ?
      this.physicalInventorySearchForm.value.checkeBy.map(x => x).join(',') : '';
    const postData = {
      ...this.physicalInventorySearchForm.value,
      storelocationId: storeLocationIdObj,
      departmentIDs: departmentIDsObj,
      companyID: this.userInfo.companyId,
      checkeBy: checkedByObj,
      isPhysicalInvSummary: true,
    };

    this.spinner.show();
    this.setupService.postData(`ItemPhysicalInventory/getPhysicalInventory`, postData)
      .subscribe(res => {
        this.spinner.hide();
        console.log(res);
        this.rowData = res;
      }, err => {
        this.spinner.hide();
        this.rowData = [];
        console.log(err);
      });
  }
  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this._startDate = this.selectedDateRange.fDate;
    this._endDate = this.selectedDateRange.tDate;
    this.physicalInventorySearchForm.get('startDate').setValue(this.selectedDateRange.fDate);
    this.physicalInventorySearchForm.get('endDate').setValue(this.selectedDateRange.tDate);
  }
}
