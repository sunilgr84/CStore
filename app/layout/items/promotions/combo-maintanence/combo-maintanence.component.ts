import { Component, OnInit, ViewChild } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';

import { StoreService } from '@shared/services/store/store.service';
import { GridService } from '@shared/services/grid/grid.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
@Component({
  selector: 'app-combo-maintanence',
  templateUrl: './combo-maintanence.component.html',
  styleUrls: ['./combo-maintanence.component.scss']
})
export class ComboMaintanenceComponent implements OnInit {
  @ViewChild('comboAmount') _comboAmount: any;
  editGridOptions: any;
  gridApi: any;
  rowData: any[] = [];
  userInfo = this.constantsService.getUserInfo();
  storeLocationList: any;
  itemNameList: any;
  comboPriorityTypes: any;
  POSSyncStatus: any;
  // isAddCombo = false;
  currentDate = moment().format('MM-DD-YYYY');
  _beginDate = moment().format('MM-DD-YYYY');
  _endDate = moment().format('MM-DD-YYYY');
  _storeLocationId: any;
  storeLocationName: string;
  _storeLocationID: string;
  itemListName: string;
  isStoreLocationLoading = true;
  isLoading = true;
  comboMainanenceForm = this._fb.group(
    {
      comboStoreLocationID: [0],
      storeLocationID: [null, Validators.required],
      comboName: ['', Validators.required],
      beginDate: this.currentDate,
      endDate: this.currentDate,
      comboAmount: [null, Validators.required],
      comboUnits: [null, Validators.required],
      comboPriorityTypeID: [null, Validators.required],
      posSyncStatusID: [null, Validators.required],
      itemListID: [null, Validators.required],
      manufacturerFunded: [null],
      retailerFunded: [null],
      co_funded: [true],
      lastModifiedBy: [''],
      createdDateTime: new Date(),
      lastModifiedDateTime: new Date()
    }
  );
  initialcomboMainanenceValue: any;
  submited = false;
  isEditMode = false;
  filterText: string;
  coFunded = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ];
  constructor(private gridService: GridService, private constantsService: ConstantService,
    private storeService: StoreService, private setupService: SetupService,
    private spinner: NgxSpinnerService, private toastr: ToastrService, private _fb: FormBuilder) {
    this.editGridOptions = this.gridService.getGridOption(this.constantsService.gridTypes.comboMaintanenceGrid);
    this.initialcomboMainanenceValue = this.comboMainanenceForm.value;
  }

  ngOnInit() {
    this.getStoreLocation();
    this.getComboMaintance();
  }
  GetComboDealMaintanence() {
    let locationId = '';
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      locationId = this._storeLocationId.toString();
    } else {
      locationId = this._storeLocationId ? this._storeLocationId.map(x => x.storeLocationID).join(',') : '';
    }

    if (locationId) {
      this.spinner.show();
      this.setupService.getData('ComboDealMaintanence/GetComboDealMaintanence/' + this.userInfo.companyId + '/' + locationId
        + '/' + this.userInfo.userName).subscribe((response) => {
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
  }
  getComboMaintance() {
    this.setupService.getComboMaintance().subscribe((response) => {
      if (response) {
        this.isLoading = false;
        this.itemNameList = response[0];
        this.comboPriorityTypes = response[1];
        this.POSSyncStatus = response[2];
      }
    }, (error) => {
      console.log(error);
    });
  }
  getStoreLocation(): any {
    this.storeService.getByCompanyId(this.userInfo['companyId'], this.userInfo['userName']).subscribe((response) => {
      this.isStoreLocationLoading = false;
      if (response && response['statusCode']) {
        this.storeLocationList = [];
        return;
      }
      this.storeLocationList = response;
      this.setStoreLocation();
    }, (error) => {
      console.log(error);
    });
  }
  setStoreLocation() {
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      this._storeLocationId = this.storeLocationList[0].storeLocationID.toString();
      this.comboMainanenceForm.get('storeLocationID').setValue(this.storeLocationList[0].storeLocationID);
      this.GetComboDealMaintanence();
    }
  }
  get cmfValid() { return this.comboMainanenceForm.controls; }
  get _comboMainanenc() { return this.comboMainanenceForm.value; }
  AddComboDeal() {
    this.comboMainanenceForm.patchValue(this.initialcomboMainanenceValue);
    this.setStoreLocation();
    this.isEditMode = false;
    this.submited = false;
    this._beginDate = this.currentDate;
    this._endDate = this.currentDate;
  }
  // backToList() {
  //   this.isAddCombo = false;
  // }
  onGridReady(params) {
    this.gridApi = params.api;
    // params.api.sizeColumnsToFit();
  }
  dateChange(event, control) {
    if (control === 'beginDate') {
      this.comboMainanenceForm.get('beginDate').setValue(event.formatedDate);
      this._beginDate = event.formatedDate;
    }
    if (control === 'endDate') {
      this.comboMainanenceForm.get('endDate').setValue(event.formatedDate);
      this._endDate = event.formatedDate;
    }
  }
  selectCofunded() {
    this.comboMainanenceForm.get('comboAmount').setValue(null);
    this.comboMainanenceForm.get('manufacturerFunded').setValue('');
    this.comboMainanenceForm.get('retailerFunded').setValue('');
    if (!this._comboMainanenc.co_funded) {
      this._comboAmount.nativeElement.focus();
    }
  }
  sumManufacturerRetailer() {
    if (this._comboMainanenc.co_funded) {
      const value = Number(this._comboMainanenc.manufacturerFunded) + Number(this._comboMainanenc.retailerFunded);
      this.comboMainanenceForm.get('comboAmount').setValue(value.toFixed(2));
      this.comboMainanenceForm.get('manufacturerFunded').setValue(Number(this._comboMainanenc.manufacturerFunded).toFixed(2));
      this.comboMainanenceForm.get('retailerFunded').setValue(Number(this._comboMainanenc.retailerFunded).toFixed(2));
    }
  }

  comboDetailsChange() {
    this.comboMainanenceForm.get('comboAmount').setValue(Number(this.comboMainanenceForm.get('comboAmount').value).toFixed(2));
  }

  resetComboMaintaenceForm() {
    this.isEditMode = false;
    // this.comboMainanenceForm.get('beginDate').setValue(this.currentDate);
    // this._beginDate = this.currentDate;
    // this.comboMainanenceForm.get('endDate').setValue(this.currentDate);
    // this._endDate = this.currentDate;
    this.submited = false;
    this.comboMainanenceForm.patchValue(this.initialcomboMainanenceValue);
    this._endDate = this._beginDate = '';
  }

  deleteRow(event) {
    if (event && event.data && event.data.comboStoreLocationID) {
      this.spinner.show();
      this.setupService.deleteData('ComboDealMaintanence?id=' + event.data.comboStoreLocationID).subscribe((response) => {
        this.spinner.hide();
        if (response === '1') {
          // this.gridApi.updateRowData({ remove: [event.data] });
          this.GetComboDealMaintanence();
          this.toastr.success(this.constantsService.infoMessages.deletedRecord, 'Deleted');
        } else {
          this.toastr.error(this.constantsService.infoMessages.deleteRecordFailed, 'Deleted');
        }
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });
    }
  }
  // editOrSaveClose(event) {
  //   this.editOrSave(event, () => { this.backToList(); });
  // }

  editOrSave(_event) {
    this.submited = true;
    if (this.comboMainanenceForm.valid) {
      let StoreLocationIDs: string;
      // tslint:disable-next-line:no-unused-expression
      if (this.storeLocationList && this.storeLocationList.length === 1) {
        StoreLocationIDs = this._comboMainanenc.storeLocationID.toString();
      } else {
        // tslint:disable-next-line:no-unused-expression
        this.isEditMode ? '' : StoreLocationIDs = this._comboMainanenc.storeLocationID ?
          this._comboMainanenc.storeLocationID.map(x => x).join(',') : '';
      }

      const postData = {
        comboStoreLocationID: this.isEditMode ? this._comboMainanenc.comboStoreLocationID : 0,
        storeLocationID: this.isEditMode ? this._storeLocationID : 0,
        comboName: this._comboMainanenc.comboName,
        beginDate: this._comboMainanenc.beginDate ? this._comboMainanenc.beginDate : this.currentDate,
        endDate: this._comboMainanenc.endDate ? this._comboMainanenc.endDate : this.currentDate,
        comboAmount: this._comboMainanenc.comboAmount ? this._comboMainanenc.comboAmount : 0,
        comboUnits: this._comboMainanenc.comboUnits ? this._comboMainanenc.comboUnits : 0,
        comboPriorityTypeID: this._comboMainanenc.comboPriorityTypeID,
        posSyncStatusID: this._comboMainanenc.posSyncStatusID,
        itemListID: this._comboMainanenc.itemListID,
        manufacturerFunded: this._comboMainanenc.manufacturerFunded ? this._comboMainanenc.manufacturerFunded : 0,
        retailerFunded: this._comboMainanenc.retailerFunded ? this._comboMainanenc.retailerFunded : 0,
        co_funded: this._comboMainanenc.co_funded,
        lastModifiedBy: this.userInfo.userName,
        createdDateTime: new Date(),
        lastModifiedDateTime: new Date()
      };
      if (this.isEditMode) {
        this.spinner.show();
        this.setupService.postData('ComboDealMaintanence/Update', postData).subscribe((response) => {
          this.spinner.hide();
          if (response && response['statusCode']) {
            this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, 'Error');
            return;
          }
          if (response) {
            this.toastr.success(this.constantsService.infoMessages.updatedRecord, 'Success');
            this.AddComboDeal();
            this.GetComboDealMaintanence();
            // callBack();
          } else {
            this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, 'Error');
          }
        }, (error) => {
          this.spinner.hide();
          console.log(error);
          this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, 'Error');
        });
      } else {
        this.spinner.show();
        this.setupService.postData('ComboDealMaintanence/addNew?StoreLocationIDs=' + StoreLocationIDs,
          postData).subscribe((response) => {
            this.spinner.hide();
            if (response && response['statusCode']) {
              this.toastr.error(this.constantsService.infoMessages.addRecordFailed, 'Error');
              return;
            }
            if (response) {
              this.toastr.success(this.constantsService.infoMessages.addedRecord, 'Success');
              this.GetComboDealMaintanence();
              this.AddComboDeal();
              // callBack();
            } else {
              this.toastr.error(this.constantsService.infoMessages.addRecordFailed, 'Error');
            }
          }, (error) => {
            this.spinner.hide();
            console.log(error);
            this.toastr.error(this.constantsService.infoMessages.addRecordFailed, 'Error');
          });
      }
    }
  }
  editComboDeal(params) {
    // this.isAddCombo = true;
    this.isEditMode = true;
    // this.comboMainanenceForm.get('storeLocationID').setValue(params.data.storeLocationID);
    this.comboMainanenceForm.patchValue(params.data);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    this._beginDate = params.data.beginDate;
    this._endDate = params.data.endDate;
    this._storeLocationID = params.data.storeLocationID;
    this.storeLocationList.map(x => {
      if (x.storeLocationID === params.data.storeLocationID) {
        return this.storeLocationName = x.storeName;
      }
    });
    this.itemNameList.map(x => {
      if (x.itemListID === params.data.itemListID) {
        return this.itemListName = x.itemListName;
      }
    });
  }
}
