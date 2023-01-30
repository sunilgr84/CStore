import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ConstantService } from '@shared/services/constant/constant.service';
import { GridService } from '@shared/services/grid/grid.service';
import { FormBuilder } from '@angular/forms';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ToastrService } from 'ngx-toastr';
import { TestService } from '@shared/services/test/test.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { StoreService } from '@shared/services/store/store.service';

@Component({
  selector: 'app-network-summary',
  templateUrl: './network-summary.component.html',
  styleUrls: ['./network-summary.component.scss']
})
export class NetworkSummaryComponent implements OnInit {

  storeLocationList: any;
  _storeLocationId: any;
  _date = moment().format('MM-DD-YYYY');
  _fromDate = moment().format('MM-DD-YYYY');
  _toDate = moment().format('MM-DD-YYYY');
  selectedDateRange:any;
  _settlementDate = moment().format('MM-DD-YYYY');
  gridOptions: any;
  rowData: any = [];
  isShowAddNetworkSummary = false;
  searchNetworkForm = this.fb.group({
    storeLocationID: [],
    fromDate: this._fromDate,
    toDate: this._toDate,
    Batches: ['0'],
    FuelReconID: [],
  });
  addNetworkForm = this.fb.group({
    businessDayNetworkSummaryID: 0,
    storeLocationID: [],
    businessDate: this._date,
    batchNumber: [''],
    grossAmount: [],
    processingFeeAmount: [],
    netAmount: 0,
    fuelReconcilationID: null,
    lastModifiedBy: '',
    lastModifiedDateTime: '',
    createdBy: '',
    createdDateTime: '',
    storeName: '',
    isBatchSetteled: [false],
    settlementDate: ''
  });
  userInfo = this.constantsService.getUserInfo();
  isEdit: boolean;
  isShowSettlementDate: boolean;
  isBatchSetteledList = [
    { id: false, name: 'False' },
    { id: true, name: 'True' },
  ];
  initialFormValue: any;
  submitted: boolean;
  filterText: string;
  isLoading = true;
  constructor(private gridService: GridService, private constantsService: ConstantService, private fb: FormBuilder,
    private setupService: SetupService, private toastr: ToastrService, private storeService: StoreService,
    private spinner: NgxSpinnerService) {
    this.gridOptions = this.gridService.getGridOption(this.constantsService.gridTypes.networkSummaryGrid);
    this.initialFormValue = this.addNetworkForm.value;
  }

  ngOnInit() {
    this.getStoreLocationList();
    this.searchNetworkSummary();
  }
  gridReady(params) {
    params.api.sizeColumnsToFit();
  }
  getStoreLocationList() {
    if (this.storeService.storeLocation) {
      this.isLoading = false;
      this.storeLocationList = this.storeService.storeLocation;
      if (this.storeLocationList && this.storeLocationList.length === 1) {
        this.addNetworkForm.get('storeLocationID').setValue(this.storeLocationList[0].storeLocationID);
        this.searchNetworkForm.get('storeLocationID').setValue(this.storeLocationList[0].storeLocationID);
      }
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.isLoading = false;
        this.storeLocationList = this.storeService.storeLocation;
        if (this.storeLocationList && this.storeLocationList.length === 1) {
          this.addNetworkForm.get('storeLocationID').setValue(this.storeLocationList[0].storeLocationID);
          this.searchNetworkForm.get('storeLocationID').setValue(this.storeLocationList[0].storeLocationID);
        }
      }, (error) => {
        console.log(error);
      });
    }
  }
  addNewNetworkSummary() {
    this.isShowAddNetworkSummary = true;
    this.resetNetworkSummary();
  }
  resetNetworkSummary() {
    this.addNetworkForm.patchValue(this.initialFormValue);
    this.isEdit = false;
    this._date = moment().format('MM-DD-YYYY');
    this._settlementDate = moment().format('MM-DD-YYYY');
    this.isShowSettlementDate = false;
    this.submitted = false;
  }
  dateChange(event, controls) {
    if (controls === 'businessDate') {
      this.addNetworkForm.get('businessDate').setValue(event.formatedDate);
      this._date = event.formatedDate;
    }
   
    if (controls === 'settlementDate') {
      this.addNetworkForm.get('settlementDate').setValue(event.formatedDate);
      this._settlementDate = event.formatedDate;
    }
  }

  searchNetworkSummary() {
    const postData = {
      ...this.searchNetworkForm.value,
      storeLocationID: this.searchNetworkForm.value.storeLocationID ? this.searchNetworkForm.value.storeLocationID : 0,
      Batches: this.searchNetworkForm.value.Batches ? this.searchNetworkForm.value.Batches : 0,
    };
    this.spinner.show();
    // tslint:disable-next-line:max-line-length
    this.setupService.getData(`BusinessDayNetworkSummary/GetNetworkSummary?storeLocationID=${postData.storeLocationID}&fromDate=${postData.fromDate}&toDate=${postData.toDate}&Batches=${postData.Batches}&FuelReconID=0&CompanyID=${this.userInfo.companyId}&ExtraId=0`)
      .subscribe((response) => {
        this.rowData = response;
        this.spinner.hide();
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });
  }

  checkSettlementDate(event) {
    event.id === true ? this.isShowSettlementDate = true :
      this.isShowSettlementDate = false, this.addNetworkForm.get('settlementDate').setValue('');
  }
  get networkSummary() { return this.addNetworkForm.controls; }

  saveAndClose() {
    this.save(() => { this.isShowAddNetworkSummary = false; this.searchNetworkSummary(); });
  }
  save(callBack = () => { }) {
    this.submitted = true;
    const postDataArray = [];
    const postData = {
      ...this.addNetworkForm.value,
      lastModifiedBy: this.userInfo.userName,
      lastModifiedDateTime: new Date(),
      createdBy: this.userInfo.userName,
      createdDateTime: new Date(),
      storeLocationID: this.storeLocationList.length === 1 ?
        this.storeLocationList[0].storeLocationID : this.addNetworkForm.value.storeLocationID,
      fuelReconcilationID: this.addNetworkForm.value.fuelReconcilationID ? this.addNetworkForm.value.fuelReconcilationID : null,
      grossAmount: this.addNetworkForm.value.grossAmount ? this.addNetworkForm.value.grossAmount : 0,
      isBatchSetteled: this.addNetworkForm.value.isBatchSetteled ? this.addNetworkForm.value.isBatchSetteled : 0,
      processingFeeAmount: this.addNetworkForm.value.processingFeeAmount ? this.addNetworkForm.value.processingFeeAmount : 0,
    };
    postDataArray.push(postData);
    if (this.addNetworkForm.valid) {
      if (this.isEdit) {
        this.spinner.show();
        this.setupService.updateData(`BusinessDayNetworkSummary/UpdateBusinessNetworkSummary`, postData)
          .subscribe((response) => {
            this.spinner.hide();
            if (response === '1') {
              callBack();
              this.toastr.success(this.constantsService.infoMessages.updatedRecord, this.constantsService.infoMessages.success);
            } else {
              this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, this.constantsService.infoMessages.error);
            }
          }, (error) => {
            this.spinner.hide();
            console.log(error);
            this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, this.constantsService.infoMessages.error);
          });
      } else {
        this.spinner.show();
        this.setupService.postData('BusinessDayNetworkSummary', postDataArray).subscribe((response) => {
          this.spinner.hide();
          if (response === '1') {
            callBack();
            this.isEdit = true;
            this.toastr.success(this.constantsService.infoMessages.addedRecord, this.constantsService.infoMessages.success);
          } else {
            this.toastr.error(this.constantsService.infoMessages.addRecordFailed, this.constantsService.infoMessages.error);
          }
        }, (error) => {
          console.log(error);
          this.spinner.hide();
          this.toastr.error(this.constantsService.infoMessages.addRecordFailed, this.constantsService.infoMessages.error);
        });
      }
    }
  }
  edit(params) {
    this.isShowAddNetworkSummary = true;
    this.isEdit = true;
    this.addNetworkForm.patchValue(params.data);
    this._date = params.data.businessDate;
  }

  delete(params) {
    this.spinner.show();
    this.setupService.deleteData(`BusinessDayNetworkSummary?id=${params.data.businessDayNetworkSummaryID}`).subscribe((response) => {
      this.spinner.hide();
      if (response) {
        this.searchNetworkSummary();
        this.toastr.success(this.constantsService.infoMessages.deletedRecord, this.constantsService.infoMessages.success);
      } else {
        this.toastr.error(this.constantsService.infoMessages.deleteRecordFailed, this.constantsService.infoMessages.error);
      }
    }, (error) => {
      this.spinner.hide();
      console.log(error);
      this.toastr.error(this.constantsService.infoMessages.deleteRecordFailed, this.constantsService.infoMessages.error);
    });
  }

  backToList() {
    this.searchNetworkSummary();
    this.isShowAddNetworkSummary = false;
  }
  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this._fromDate = this.selectedDateRange.fDate;
    this._toDate = this.selectedDateRange.tDate;
    this.searchNetworkForm.get('fromDate').setValue(this.selectedDateRange.fDate);
    this.searchNetworkForm.get('toDate').setValue(this.selectedDateRange.tDate);
  }
}
