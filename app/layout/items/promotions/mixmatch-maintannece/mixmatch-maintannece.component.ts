import { Component, OnInit, ViewChild } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { StoreService } from '@shared/services/store/store.service';
import { GridService } from '@shared/services/grid/grid.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import * as moment from 'moment';
import { FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-mixmatch-maintannece',
  templateUrl: './mixmatch-maintannece.component.html',
  styleUrls: ['./mixmatch-maintannece.component.scss']
})
export class MixmatchMaintanneceComponent implements OnInit {
  editGridOptions: any;
  rowData: any[] = [];
  userInfo = this.constantsService.getUserInfo();
  storeLocationList: any;
  itemNameList: any;
  POSSyncStatus: any;
  UnitTypeList: any;
  // isAddMore = false;
  isEditMode = false;
  _storeLocationId: any;
  initialcomboMainanenceValue: any;
  itemListName: any;
  storeLocationName: any;
  _storeLocationID: any;
  submited = false;
  isStoreLocationLoading = true;
  isUnitTypeListLoading = true;
  isLoading = true;
  @ViewChild('mixMatchAmount') _mixMatchAmount: any;
  currentDate = moment().format('MM-DD-YYYY');
  _beginDate = moment().format('MM-DD-YYYY');
  _endDate = moment().format('MM-DD-YYYY');
  mixMatchMainanenceForm = this.fb.group({
    mixMatchStoreLocationID: 0,
    storeLocationID: [null, Validators.required],
    mixMatchName: ['', Validators.required],
    beginDate: this._beginDate,
    endDate: this._endDate,
    mixMatchAmount: [null, Validators.required],
    mixMatchUnits: [null, Validators.required],
    mixMatchPromotionUnitTypeID: [null, Validators.required],
    posSyncStatusID: [null, Validators.required],
    itemListID: [null, Validators.required],
    manufacturerFunded: [''],
    retailerFunded: [''],
    co_funded: true,
    lastModifiedBy: this.userInfo.userName,
    createdDateTime: '',
    lastModifiedDateTime: this.currentDate,
  });
  filterText: string;
  coFunded = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ];
  constructor(private gridService: GridService, private constantsService: ConstantService,
    private storeService: StoreService, private setupService: SetupService, private fb: FormBuilder,
    private spinner: NgxSpinnerService, private toastr: ToastrService) {
    this.editGridOptions = this.gridService.getGridOption(this.constantsService.gridTypes.mixMatchMaintanenceGrid);
    this.initialcomboMainanenceValue = this.mixMatchMainanenceForm.value;
  }

  ngOnInit() {
    this.getStoreLocation();
    this.getMixMatchMaintance();
    this.getUnitTypeList();
  }
  getStoreLocation(): any {
    this.storeService.getByCompanyId(this.userInfo['companyId'], this.userInfo.userName).subscribe((response) => {
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
      this.mixMatchMainanenceForm.get('storeLocationID').setValue(this.storeLocationList[0].storeLocationID);
      this.GetComboDealMaintanence();
    }
  }
  getMixMatchMaintance() {
    this.setupService.getComboMaintance().subscribe((response) => {
      if (response && response['statusCode']) {
        this.itemNameList = [];
        this.POSSyncStatus = [];
        return;
      }
      if (response) {
        this.itemNameList = response[0];
        this.POSSyncStatus = response[2];
        this.isLoading = false;
      }
    }, (error) => {
      console.log(error);
    });
  }
  getUnitTypeList() {
    this.setupService.getData('MixMatchPromotionUnitType/getAll').subscribe(res => {
      this.UnitTypeList = res;
      this.isUnitTypeListLoading = false;
    });
  }
  get _mixMatchMainanenc() { return this.mixMatchMainanenceForm.value; }
  get _mixMatchMaintanenceControl() { return this.mixMatchMainanenceForm.controls; }
  dateChange(event, control) {
    if (control === 'beginDate') {
      this.mixMatchMainanenceForm.get('beginDate').setValue(event.formatedDate);
      this._beginDate = event.formatedDate;
    }
    if (control === 'endDate') {
      this.mixMatchMainanenceForm.get('endDate').setValue(event.formatedDate);
      this._endDate = event.formatedDate;
    }
  }
  selectCofunded() {
    this.mixMatchMainanenceForm.get('mixMatchAmount').setValue(null);
    this.mixMatchMainanenceForm.get('manufacturerFunded').setValue('');
    this.mixMatchMainanenceForm.get('retailerFunded').setValue('');
    if (!this._mixMatchMainanenc.co_funded) {
      this._mixMatchAmount.nativeElement.focus();
    }
  }
  sumManufacturerRetailer() {
    if (this._mixMatchMainanenc.co_funded) {
      const value = Number(this._mixMatchMainanenc.manufacturerFunded) + Number(this._mixMatchMainanenc.retailerFunded);
      this.mixMatchMainanenceForm.get('mixMatchAmount').setValue(value);
      this.mixMatchMainanenceForm.get('manufacturerFunded').setValue(Number(this._mixMatchMainanenc.manufacturerFunded).toFixed(2));
      this.mixMatchMainanenceForm.get('retailerFunded').setValue(Number(this._mixMatchMainanenc.retailerFunded).toFixed(2));
    }
  }

  mixMatchChange() {
    this.mixMatchMainanenceForm.get('mixMatchAmount').setValue(Number(this.mixMatchMainanenceForm.get('mixMatchAmount').value).toFixed(2));
  }

  resetMixmatchMaintanneceForm() {
    this.isEditMode = false;
    this.mixMatchMainanenceForm.patchValue(this.initialcomboMainanenceValue);
    this._beginDate = this._endDate = '';
    this.submited = false;
  }
  AddMore() {
    // this.isAddMore = true;
    this.isEditMode = false;
    this.submited = false;
    this.mixMatchMainanenceForm.patchValue(this.initialcomboMainanenceValue);
    this._beginDate = this.currentDate;
    this._endDate = this.currentDate;
  }
  // backToList() {
  //   this.isAddMore = false;
  // }
  onGridReady(params) {
    // params.api.sizeColumnsToFit();
  }
  deleteRow(params) {
    this.spinner.show();
    this.setupService.deleteData(`MixMatchMaintanence?id=${params.data.mixMatchStoreLocationID}`).subscribe(res => {
      this.spinner.hide();
      if (res === '1') {
        this.toastr.success(this.constantsService.infoMessages.deletedRecord, 'Success');
        this.GetComboDealMaintanence();
      } else {
        this.toastr.error(this.constantsService.infoMessages.deleteRecordFailed, 'Error');
      }
    }, err => {
      console.log(err);
      this.spinner.hide();
      this.toastr.error(this.constantsService.infoMessages.deleteRecordFailed, 'Error');
    });
  }
  GetComboDealMaintanence() {
    let locationId = '';
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      locationId = this._storeLocationId.toString();
    } else {
      locationId = this._storeLocationId ? this._storeLocationId.map(x => x.storeLocationID).join(',') : '';
    } if (locationId) {
      this.spinner.show();
      this.setupService.getData('MixMatchMaintanence/GetMixMatchMaintanence/' + this.userInfo.companyId + '/' + locationId
        + '/' + this.userInfo.userName).subscribe((response) => {
          this.spinner.hide();
          this.rowData = response;
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
    if (this.mixMatchMainanenceForm.valid) {
      let StoreLocationIDs: string;
      if (this.storeLocationList && this.storeLocationList.length === 1) {
        StoreLocationIDs = this.mixMatchMainanenceForm.get('storeLocationID').value.toString();
      } else {
        if (!this.isEditMode) {
          StoreLocationIDs = this.mixMatchMainanenceForm.get('storeLocationID').value ?
            this.mixMatchMainanenceForm.get('storeLocationID').value.map(x => x.storeLocationID).join(',') : '';
        }
      }
      const postData = {
        ...this.mixMatchMainanenceForm.value,
        mixMatchStoreLocationID: this.isEditMode ? this._mixMatchMainanenc.mixMatchStoreLocationID : 0,
        storeLocationID: this.isEditMode ? this._storeLocationID : StoreLocationIDs,
        // mixMatchStoreLocationID: 0,
        // storeLocationID: 0,
        createdDateTime: this.currentDate,
      };
      if (this.isEditMode) {
        this.spinner.show();
        this.setupService.postData('MixMatchMaintanence/Update', postData).subscribe((response) => {
          this.spinner.hide();
          if (response && response['statusCode']) {
            this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, this.constantsService.infoMessages.error);
            return;
          }
          if (response) {
            this.toastr.success(this.constantsService.infoMessages.updatedRecord, 'Success');
            this.AddMore();
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
        this.setupService.postData('MixMatchMaintanence/addNew?StoreLocationIDs=' + StoreLocationIDs, postData).subscribe((response) => {
          this.spinner.hide();
          if (response && response['statusCode']) {
            this.toastr.error(this.constantsService.infoMessages.addRecordFailed, this.constantsService.infoMessages.error);
            return;
          }

          if (response) {
            this.toastr.success(this.constantsService.infoMessages.addedRecord, 'Success');
            this.GetComboDealMaintanence();
            this.AddMore();
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
  editMixMatchForm(params) {
    this.isEditMode = true;
    // this.isAddMore = true;
    this.mixMatchMainanenceForm.patchValue(params.data);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    this._beginDate = params.data.beginDate;
    this._endDate = params.data.endDate;
    this.mixMatchMainanenceForm.get('mixMatchStoreLocationID').setValue(params.data.mixMatchStoreLocationID);
    this._storeLocationID = params.data.storeLocationID;
    this.storeLocationList.map(x => {
      if (x.storeLocationID === params.data.storeLocationID) { return this.storeLocationName = x.storeName; }
    });
    this.itemNameList.map(x => {
      if (x.itemListID === params.data.itemListID) { return this.itemListName = x.itemListName; }
    });
  }

  onChange(params) {
    if (params.itemCount === 0) {
      this.mixMatchMainanenceForm.get("itemListID").reset();
      this.toastr.error("Please add items to the list", 'Error');
    }
  }
}
