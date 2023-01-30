import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { GridOptions } from 'ag-grid-community';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { FormBuilder } from '@angular/forms';
import * as moment from 'moment';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { TestService } from '@shared/services/test/test.service';
import { StoreService } from '@shared/services/store/store.service';
@Component({
  selector: 'app-reconcile-house',
  templateUrl: './reconcile-house.component.html',
  styleUrls: ['./reconcile-house.component.scss'],
  animations: [routerTransition()]
})
export class ReconcileHouseComponent implements OnInit {
  rowData: any = [];
  gridOption: GridOptions;
  storeLocationList: any;
  fromDate = moment().add(-1, 'week').format('MM-DD-YYYY');
  toDate = moment().format('MM-DD-YYYY');
  payInHouseToDate = moment().format('MM-DD-YYYY');
  isAddNew = false;
  filterText: string;
  paymentTypeList: any;
  selectedDateRange: any;
  advSearchForm = this.fb.group({
    storeLocationID: null,
    houseAccountID: null,
    fromDate: moment().add(-1, 'week').format('MM-DD-YYYY'),
    toDate: moment().format('MM-DD-YYYY'),
  });
  reconcileHouseForm = this.fb.group({
    payInHouseChargesID: 0,
    houseAccountID: null,
    amountPaid: null,
    paymentType: null,
    checkNo: '',
    createdBy: '',
    createdDateTime: '',
    lastModifiedBy: '',
    lastModifiedDateTime: '',
    storeLocationID: null,
    paidDate: '',
    accountName: '',
    creditLimit: null,
    usedAmount: null,
    storeName: '',
    rowID: null,
    dueDate: this.payInHouseToDate,
    dueAmount: null,

    balanceDue: null,
  });
  advSearchInitialFormValue: any;
  houseAccountList: any;
  isHouseAccountLoading = true;
  isStoreLocationLoading = true;
  userInfo = this.constantService.getUserInfo();
  isPaymentTypeLoading = true;
  isEditMode: boolean;
  reconcileHouseInitialFormValue: any;
  isSubmited: boolean;
  constructor(private gridService: GridService, private constantService: ConstantService,
    private fb: FormBuilder, private setupService: SetupService,
    private toastr: ToastrService, private spinner: NgxSpinnerService,
    private storeService: StoreService) {
    this.gridOption = this.gridService.getGridOption(this.constantService.gridTypes.reconcileHouseGrid);
    this.advSearchInitialFormValue = this.advSearchForm.value;
    this.reconcileHouseInitialFormValue = this.reconcileHouseForm.value;
  }

  ngOnInit() {
    this.getHouseAccountList();
    this.getStoreLocationList();
    this.getPaymentTypeList();
    this.advSearch();
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
  getHouseAccountList() {
    this.setupService.getData(`HouseAccount/GetAll?CompanyID=${this.userInfo.companyId}`)
      .subscribe((response) => {
        if (response && response['statusCode']) {
          this.isHouseAccountLoading = false;
          this.houseAccountList = [];
          return;
        }
        this.houseAccountList = response;
        this.isHouseAccountLoading = false;
      });
  }
  getPaymentTypeList() {
    this.setupService.getData(`PaymentSource/getListByCompanyID/${this.userInfo.companyId}`).subscribe(res => {
      this.isPaymentTypeLoading = false;
      if (res && res['statusCode']) {
        this.paymentTypeList = [];
        return;
      }
      this.paymentTypeList = res;
    });
  }
  AddMore() {
    this.isAddNew = true;
    this.resetReconcileHouseForm();
  }
  dateChange(event, control) {
    if (control === 'payInHouseToDate') {
      this.reconcileHouseForm.get('paidDate').setValue(event.formatedDate);
      this.payInHouseToDate = event.formatedDate;
    }
  }
  resetAdvSearch() {
    this.advSearchForm.patchValue(this.advSearchInitialFormValue);
  }
  advSearch() {
    const postData = {
      ...this.advSearchForm.value,
      storeLocationID: this.advSearchForm.value.storeLocationID ? this.advSearchForm.value.storeLocationID : '',
      houseAccountID: this.advSearchForm.value.houseAccountID ? this.advSearchForm.value.houseAccountID : '',
      dueOrPayment: 0,
      payinChargeID: 0
    };
    this.spinner.show();
    this.setupService.getData('PayInHouseCharges/get?storeLocationID=' + postData.storeLocationID +
      '&houseAcountsID=' + postData.houseAccountID + '&startDate=' + postData.fromDate + '&endDate=' + postData.toDate
      + '&dueOrPayment=' + postData.dueOrPayment + '&payinChargeID=' + postData.payinChargeID + '&CompanyID=' + this.userInfo.companyId)
      .subscribe((response) => {
        this.spinner.hide();
        if (response && response['statusCode']) {
          this.rowData = [];
          return;
        }
        this.rowData = response;
      }, (error) => {
        this.spinner.hide();
        console.log(error);
        this.toastr.error(this.constantService.infoMessages.error);
      });
  }

  editAction(params) {
    this.reconcileHouseForm.patchValue(params.data);
    this.payInHouseToDate = params.data.paidDate;
    this.isAddNew = true;
    this.isEditMode = true;
  }

  resetReconcileHouseForm() {
    this.isEditMode = false;
    this.reconcileHouseForm.patchValue(this.reconcileHouseInitialFormValue);
    this.payInHouseToDate = moment().format('MM-DD-YYYY');
  }

  saveAndEditClose() {
    this.saveAndEdit(() => { this.isAddNew = false; this.advSearch(); });
  }
  saveAndEdit(callBack = () => { }) {

    const postData = {
      ...this.reconcileHouseForm.value,
      createdBy: this.userInfo.companyId,
      createdDateTime: new Date(),
      lastModifiedBy: this.userInfo.companyId,
      lastModifiedDateTime: new Date(),
    };
    this.isSubmited = true;
    if (this.reconcileHouseForm.valid) {
      if (this.isEditMode) {
        this.spinner.show();
        this.setupService.updateData(`PayInHouseCharges/update`, postData).subscribe(res => {
          console.log(res);
          this.spinner.hide();
          if (res && Number(res) === 1) {
            callBack();
            this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
          } else {
            this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
          }
        }, (error) => {
          this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
          this.spinner.hide();
          console.log(error);
        });
      } else {
        this.spinner.show();
        this.setupService.postData(`PayInHouseCharges/addNew`, postData).subscribe(res => {
          this.spinner.hide();
          if (res && res.payInHouseChargesID > 0) {
            this.isEditMode = true;
            this.reconcileHouseForm.get('payInHouseChargesID').setValue(res.payInHouseChargesID);
            this.reconcileHouseForm.get('dueAmount').setValue(res.dueAmount);
            callBack();
            this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
          } else {
            this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
          }
        }, (error) => {
          this.spinner.hide();
          this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
          console.log(error);
        });
      }
    }
  }
  deleteAction(params) {
    this.spinner.show();
    this.setupService.deleteData(`PayInHouseCharges?id=${params.data.payInHouseChargesID}`).subscribe(res => {
      this.spinner.hide();
      console.log(res);
      if (res && res === 1) {
        this.advSearch();
        this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
      } else {
        this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
      }
    }, (error) => {
      this.spinner.hide();
      this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
      console.log(error);
    });
  }


  getCreditBalance(params) {
    this.setupService.getData(`HouseAccount/GetCreditBalance/${params.houseAccountID}`).subscribe(res => {
      if (res && res['statusCode']) {
        return;
      }
      let CreditUsed: number;
      console.log(res);
      if (res) {
        CreditUsed = Number(res[0].creditLimit) - Number(res[0].remainingCreditLimit);
        this.reconcileHouseForm.get('dueAmount').setValue(CreditUsed);
      }
    }, (error) => {
      console.log(error);
    });
  }

  setBalanceDueAmount(params) {
    let balDue: number;
    balDue = Number(this.reconcileHouseForm.get('dueAmount').value) - Number(params.target.value);
    this.reconcileHouseForm.get('balanceDue').setValue(balDue);
  }
  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.fromDate = this.selectedDateRange.fDate;
    this.toDate = this.selectedDateRange.tDate;
    this.advSearchForm.get('fromDate').setValue(this.selectedDateRange.fDate);
    this.advSearchForm.get('toDate').setValue(this.selectedDateRange.tDate);
  }
}