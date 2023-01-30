import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SetupService } from '@shared/services/setupService/setup-service';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import * as moment from 'moment';
import { StoreService } from '@shared/services/store/store.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-promotion-report',
  templateUrl: './promotion-report.component.html',
  styleUrls: ['./promotion-report.component.scss']
})
export class PromotionReportComponent implements OnInit {

  inputDOB: any;
  LocationList: any;
  startDate = moment().format('MM-DD-YYYY');
  endDate = moment().format('MM-DD-YYYY');
  selectedDateRange: any;
  userInfo = this.constantService.getUserInfo();
  priceGroupList: any = [];
  departmentList: any = [];
  storeLocationList: any[];
  promotionsRowData: any = [];
  promotionsGridOptions: any;
  promotionsGridAPI: any;
  promotionReportForm = this.fb.group({
    startDate: this.startDate,
    endDate: this.endDate,
    departmentIds: '',
    priceGroupIds: '',
    storeLocation: null
  });

  constructor(private fb: FormBuilder, private setupService: SetupService, private constantService: ConstantService,
    private gridService: GridService, private storeService: StoreService, private toastr: ToastrService, private spinner: NgxSpinnerService) {
    this.promotionsGridOptions = this.gridService.getGridOption(this.constantService.gridTypes.dayReconPromotionsDetailGrid);
    this.promotionsGridOptions.headerHeight = 40;
  }

  ngOnInit() {
    this.getStoreLocationList();
    this.getPriceGroupByCompany();
    this.getDepartmentList();
  }

  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.startDate = this.selectedDateRange.fDate;
    this.endDate = this.selectedDateRange.tDate;
  }

  getStoreLocationList() {
    if (this.storeService.storeLocation) {
      this.storeLocationList = this.storeService.storeLocation;
      this.setLocationId();
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.storeLocationList = this.storeService.storeLocation;
        this.setLocationId();
      }, (error) => {
        console.log(error);
      });
    }
  }

  setLocationId() {
    if (this.storeLocationList.length === 1) {
      this.promotionReportForm.get('storeLocation').setValue(this.storeLocationList[0].storeLocationID);
    }
  }
  getPriceGroupByCompany() {
    this.setupService.getData('CompanyPriceGroup/getByCompanyID/' +
      this.userInfo.companyId).subscribe((response) => {
        if (response && response['statusCode']) {
          this.priceGroupList = [];
          return;
        }
        this.priceGroupList = response;
      }, (error) => {
        console.log(error);
      });
  }

  getDepartmentList() {
    this.setupService.getData(`Department/GetByfuel/${this.userInfo.userName}/${this.userInfo.companyId}/false`).subscribe(res => {
      if (res && res['statusCode']) {
        this.departmentList = [];
      }
      this.departmentList = res;
    });
  }

  searchPromotionsReport() {
    this.spinner.show();
    if (this.promotionReportForm.value.storeLocation === null) {
      this.toastr.error("Store Selection Required", this.constantService.infoMessages.error);
      return;
    }
    let selectedDepartments = this.promotionReportForm.value.departmentIds ?
      this.promotionReportForm.value.departmentIds.map(x => x.departmentID).join(',') : '';
    if (selectedDepartments !== '') selectedDepartments = '&DepartmentIds=' + selectedDepartments;
    let selectedPriceGroups = this.promotionReportForm.value.priceGroupIds ? this.promotionReportForm.value.priceGroupIds.map(x => x.CompanyPriceGroupID).join(',') : '';
    if (selectedPriceGroups !== '') selectedPriceGroups = '&PriceGroupIds=' + selectedPriceGroups;
    this.setupService.getData('PromotionReport/PromotionsReportBySearchFilter?StorelocationId=' + this.promotionReportForm.value.storeLocation + '&fromdate=' + this.startDate + '&todate=' + this.endDate + selectedDepartments + selectedPriceGroups)
      .subscribe((response) => {
        this.spinner.hide();
        if (response.status === 1) {
          this.promotionsRowData = response.data.details;
          this.promotionsGridAPI.sizeColumnsToFit();
        }
      }, (error) => {
        console.log(error);
      });
  }

  onPromotionsGridReady(params) {
    this.promotionsGridAPI = params.api;
    this.promotionsGridAPI.gridOptionsWrapper.gridOptions.groupRowInnerRenderer = function (params) { return params.node.allLeafChildren[0].data.departmentDescription; };
    params.api.sizeColumnsToFit();
  }
}
