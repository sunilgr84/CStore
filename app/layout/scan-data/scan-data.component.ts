import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { FormBuilder } from '@angular/forms';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { GridService } from '@shared/services/grid/grid.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { StoreService } from '@shared/services/store/store.service';

@Component({
  selector: 'app-scan-data',
  templateUrl: './scan-data.component.html',
  styleUrls: ['./scan-data.component.scss']
})
export class ScanDataComponent implements OnInit {

  storeLocationList: any;
  manufacturerList: any;
  rowData: any;
  gridOptions: any;
  isHideGrid = false;
  userInfo = this.constantService.getUserInfo();
  initialFormValue: any;
  _currentDate = moment().format('MM-DD-YYYY');
  isChainOfStores = false;
  isEditMode = false;
  gridApi: any;
  submited = false;
  scanDataForm = this.fb.group({
    scanDataSetUpId: [0],
    setUpCompany: [0],
    isChainOfStores: [false],
    companyId: [0],
    storeLocationId: [null],
    manufacturerId: [null],
    accountNumber: [''],
    submissiondDay: [null],
    note: [''],
  });

  submissiondDayList = [
    { value: 'Sunday', submissiondDay: 'Sunday' },
    { value: 'Monday', submissiondDay: 'Monday' },
    { value: 'Tuesday', submissiondDay: 'Tuesday' },
    { value: 'Wednesday', submissiondDay: 'Wednesday' },
    { value: 'Thursday', submissiondDay: 'Thursday' },
    { value: 'Friday', submissiondDay: 'Friday' },
    { value: 'Saturday', submissiondDay: 'Saturday' },
  ];
  constructor(private fb: FormBuilder, private _setupService: SetupService, private constantService: ConstantService,
    private gridService: GridService, private _toastr: ToastrService, private spinner: NgxSpinnerService,
    private storeService: StoreService) {
    this.gridOptions = this.gridService.getGridOption(this.constantService.gridTypes.scanDataSetupGrid);
    this.initialFormValue = this.scanDataForm.value;
  }

  ngOnInit() {
    this.getAllScanDataSetupByCompanyId();
    this.getStoreLocationByCompanyId();
    this.getManufacturer();
  }

  getStoreLocationByCompanyId() {
    this.storeService.getByCompanyId(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
      if (response && response['statusCode']) {
        this.storeLocationList = [];
        return;
      }
      this.storeLocationList = response;
    }, (error) => {
      this.spinner.hide();
    });
  }
  getManufacturer() {
    this._setupService.getData(`Manufacturer/getAll`).subscribe((response) => {
      this.manufacturerList = response.filter((x) => x.manufacturerID === 1 || x.manufacturerID === 2);
    }, (error) => {
      this.spinner.hide();
    });
  }
  get scanDataFormValue() { return this.scanDataForm.value; }
  get cdsValid() { return this.scanDataForm.controls; }

  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }
  getAllScanDataSetupByCompanyId() {
    this.spinner.show();
    this._setupService.getData(`ScanDataSetUp/GetAll/${this.userInfo.companyId}`).subscribe((response) => {
      this.spinner.hide();
      if (response && response['statusCode']) {
        this.rowData = [];
        return;
      }
      this.rowData = response;
    }, (error) => {
      this.spinner.hide();
    });
  }
  resetScanDataSetupForm() {
    this.isEditMode = false;
    this.isChainOfStores = false;
    this.submited = false;
    this.scanDataForm.patchValue(this.initialFormValue);
  }
  backToList() {
    this.isEditMode = false;
    this.isHideGrid = false;
  }
  addScanDataSetup() {
    this.isEditMode = false;
    this.submited = false;
    this.isChainOfStores = false;
    this.scanDataForm.patchValue(this.initialFormValue);
    this.isHideGrid = true;
  }
  saveAndClose() {
    this.saveScanDataSetup(() => { this.isHideGrid = false; });
  }
  saveScanDataSetup(callBack = () => { }) {
    this.submited = true;
    if (this.scanDataForm.valid) {
      const postData = {
        ...this.scanDataFormValue,
        storeLocationId: this.scanDataFormValue.storeLocationId ? this.scanDataFormValue.storeLocationId : null,
        companyId: this.userInfo.companyId,
        setUpCompany: this.userInfo.companyId,
      };
      if (this.scanDataFormValue.scanDataSetUpId === 0) {
        this.spinner.show();
        this._setupService.postData('ScanDataSetUp', postData).subscribe((response) => {
          console.log(response);
          this.spinner.hide();
          if (response.statusCode) {
            this._toastr.error(this.constantService.infoMessages.contactAdmin, this.constantService.infoMessages.error);
            return;
          }
          if (response) {
            this.resetScanDataSetupForm();
            this.getAllScanDataSetupByCompanyId();
            callBack();
            this._toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
          }
        }, (error) => {
          this.spinner.hide();
          this._toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
          console.log(error);
        });
      } else {
        this.spinner.show();
        this._setupService.updateData('ScanDataSetUp', postData).subscribe((response) => {
          this.spinner.hide();
          if (response.statusCode) {
            this._toastr.error(this.constantService.infoMessages.contactAdmin, this.constantService.infoMessages.error);
            return;
          }
          if (response === '1') {
            this.resetScanDataSetupForm();
            this.getAllScanDataSetupByCompanyId();
            callBack();
            this._toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
          } else {
            this._toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
          }
        }, (error) => {
          this.spinner.hide();
          this._toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
          console.log(error);
        });
      }
    }
  }
  clickIsChainOfStores() {
    this.isChainOfStores = this.scanDataFormValue.isChainOfStores;
    if (this.isChainOfStores === true) {
      this.scanDataForm.get('storeLocationId').setValue(null);
    }
  }
  edit(params) {
    this.isHideGrid = true;
    this.isEditMode = true;
    this.isChainOfStores = params.data.isChainOfStores;
    this.scanDataForm.patchValue(params.data);
  }
  delete(params) {
    this.spinner.show();
    this._setupService.deleteData(`ScanDataSetUp/${params.data.scanDataSetUpId}`).subscribe((response) => {
      this.spinner.hide();
      if (response === '1') {
        this.getAllScanDataSetupByCompanyId();
        this._toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
      } else {
        this._toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
      }
    }, (error) => {
      this.spinner.hide();
      this._toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
      console.log(error);
    });
  }

}
