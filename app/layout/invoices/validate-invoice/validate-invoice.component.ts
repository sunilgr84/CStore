import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { GridOptions } from 'ag-grid-community';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { FormBuilder } from '@angular/forms';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { StoreService } from '@shared/services/store/store.service';

@Component({
  selector: 'app-validate-invoice',
  templateUrl: './validate-invoice.component.html',
  styleUrls: ['./validate-invoice.component.scss'],
  animations: [routerTransition()]
})
export class ValidateInvoiceComponent implements OnInit {
  isAdvanceSearchCollapsed = true;
  storeLocationList: any;
  vendorList: any;
  invoiceStatusList: any;
  paymentSourceList: any;
  fromDate = new Date();
  gridOption: GridOptions;
  rowData: any;
  isStoreLocationLoading = true;
  isVendorLoading = true;
  isInvoiceStatusLoading = true;
  userInfo = this.constantService.getUserInfo();
  currentDate = moment().format('MM-DD-YYYY');
  startDate = this.currentDate;
  endDate = this.currentDate;
  selectedDateRange:any;
  filterText: string;
  validateInvoiceForm = this._fb.group({
    storeLocationID: [],
    vendorID: [],
    invoiceStatusID: [],
    paymentSourceID: [],
    dtFromCriteria: this.currentDate,
    dtToCriteria: this.currentDate,
    invoiceNo: null,
  });

  initialValidateInvoiceFormValue: any;
  constructor(private gridService: GridService, private constantService: ConstantService, private spinner: NgxSpinnerService,
    private setupService: SetupService, private _fb: FormBuilder, private storeService: StoreService) {
    this.gridOption = this.gridService.getGridOption(this.constantService.gridTypes.validateInvoiceGrid);
    this.initialValidateInvoiceFormValue = this.validateInvoiceForm.value;
  }

  ngOnInit() {
    this.getStoreLocationList();
    this.getVendorList();
    this.getInvoiceStausList();
    this.getPaymentSourceList();
  }
  onGridReady(params) {
    params.api.sizeColumnsToFit();
  }
  getStoreLocationList() {
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
  getVendorList() {
    if (this.storeService.vendorList) {
      this.isVendorLoading = false;
      this.vendorList = this.storeService.vendorList;
    } else {
      this.storeService.getVendorList(this.userInfo.companyId).subscribe((response) => {
        this.isVendorLoading = false;
        this.vendorList = this.storeService.vendorList;
      }, (error) => {
        console.log(error);
      });
    }
  }
  getInvoiceStausList() {
    this.setupService.getData('InvoiceStatus/GetAll').subscribe((response) => {
      this.invoiceStatusList = response;
      this.isInvoiceStatusLoading = false;
    });
  }
  getPaymentSourceList() {
    this.setupService.getData(`PaymentSource/getListByCompanyID/${this.userInfo.companyId}`).subscribe((response) => {
      this.paymentSourceList = response;
    });
  }
  resetValidateInvoice() {
    this.validateInvoiceForm.patchValue(this.initialValidateInvoiceFormValue);
  }


  get validateFormValue() { return this.validateInvoiceForm.value; }

  searchValidateInvoice() {
    const postData = {
      locationCriteria: this.validateFormValue.storeLocationID ? this.validateFormValue.storeLocationID : '',
      vendorCriteria: this.validateFormValue.vendorID ? this.validateFormValue.vendorID : '',
      statusCriteria: this.validateFormValue.invoiceStatusID ? this.validateFormValue.invoiceStatusID : '',
      paymentSourceIDs: this.validateFormValue.paymentSourceID ? this.validateFormValue.paymentSourceID : '',
      dtFromCriteria: this.validateFormValue.dtFromCriteria,
      dtToCriteria: this.validateFormValue.dtToCriteria,
      invoiceNo: this.validateFormValue.invoiceNo ? this.validateFormValue.invoiceNo : '',
      companyID: this.userInfo.companyId,
      userName: this.userInfo.userName
    };
    this.spinner.show();
    this.setupService.getData('Invoice/GetValidateInvoice?locationCriteria=' + postData.locationCriteria + '&vendorCriteria=' +
      postData.vendorCriteria + '&statusCriteria=' + postData.statusCriteria + '&paymentSourceIDs=' + postData.paymentSourceIDs +
      '&dtFromCriteria=' + postData.dtFromCriteria + '&dtToCriteria=' + postData.dtToCriteria + '&invoiceNo=' + postData.invoiceNo +
      '&CompanyID=' + postData.companyID + '&UserName=' + postData.userName).subscribe((response) => {
        this.spinner.hide();
        if (response && response['statusCode']) {
          this.rowData = [];
          return;
        }
        this.rowData = response;
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });
  }
  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.startDate = this.selectedDateRange.fDate;
    this.endDate = this.selectedDateRange.tDate;
    this.validateInvoiceForm.get('dtFromCriteria').setValue(this.selectedDateRange.fDate);
    this.validateInvoiceForm.get('dtToCriteria').setValue(this.selectedDateRange.tDate);
  }
}
