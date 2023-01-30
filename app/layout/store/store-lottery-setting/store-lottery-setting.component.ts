import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ConstantService } from '@shared/services/constant/constant.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';
import { isObservable } from 'rxjs';
import { StoreService } from '@shared/services/store/store.service';
import * as _ from 'lodash';


@Component({
  selector: 'app-store-lottery-setting',
  templateUrl: './store-lottery-setting.component.html',
  styleUrls: ['./store-lottery-setting.component.scss']
})
export class StoreLotterySettingComponent implements OnInit {
  @Input() storeLocationID: any;
  @Input() lotteryStateCode: any;
  @Input() storeInfoData: any;
  departmentList: any[];
  storeLotterySettingForm = this._fb.group({
    storeLocationId: 0,
    lotteryRetailerID: null,
    lotteryRetailerUserName: '',
    lotteryRetailerPassword: '',
    isLotteryStartingFromZero: false,
    noOfLotteryBins: null,
    lastModifiedBy: '',
    lotteryStateCode: '',
    lotteryEnabled: false,
    reverseOrder: false,
    departmentId: null
  });
  userInfo: any;
  lotteryStatus: any;

  constructor(private dataService: SetupService, private _fb: FormBuilder, private constantService: ConstantService
    , private spinner: NgxSpinnerService, private _toastr: ToastrService, private storeService: StoreService) {
    this.userInfo = this.constantService.getUserInfo();
  }

  ngOnInit() {
    this.lotteryStatus = this.storeInfoData.isLotteryStartingFromZero;
    //resetting data to default values
    let formData: any = _.cloneDeep(this.storeInfoData);
    formData.reverseOrder = false;
    formData.isLotteryStartingFromZero = false;
    formData.departmentId = "";
    this.storeLotterySettingForm.patchValue(formData);
    this.activateLotteryForm(this.lotteryStatus);
  }

  activateLotteryForm(activationFlag: boolean) {
    if (activationFlag) {
      this.storeLotterySettingForm.enable();
      this.getLotteryAdditionalDetails();
      this.getDepartmentList();
    } else {
      this.storeLotterySettingForm.disable();
    }
  }

  getLotterySetting() {
    this.spinner.show();
    this.dataService.getData('StoreLocation/GetStoreLotterySettings?StoreLocationID='
      + this.storeLocationID).subscribe(
        (response) => {
          this.spinner.hide();
          this.storeLotterySettingForm.patchValue(response);
        }, (error) => {
          this.spinner.hide();
        }
      );
  }

  getLotteryAdditionalDetails() {
    // let lotterySettingID = "1";
    this.dataService.getData('LotterySetting/getByStoreLocationID/' + this.storeLocationID).subscribe(
      // this.dataService.getData('LotterySetting/getByID/' + lotterySettingID).subscribe(
      (response) => {
        if (response && response.length > 0) {
          let responseData = response[0];
          let additionalData = {
            reverseOrder: responseData.isReverse,
            departmentId: responseData.departmentID,
            isLotteryStartingFromZero: responseData.isStartingwithZero
          }
          this.storeLotterySettingForm.patchValue(additionalData);
        }
      }, (error) => {
        this.spinner.hide();
      }
    );
  }

  enableLottery(event) {
    this.updateLotterySettings(event.checked);
  }

  updateLotterySettings(status) {
    const postData = {
      ...this.storeLotterySettingForm.value,
      storeLocationId: this.storeLocationID,
      lastModifiedBy: this.userInfo.userName,
      lotteryStateCode: this.lotteryStateCode
    };
    postData.isLotteryStartingFromZero = status,
      this.spinner.show();
    this.dataService.updateData('StoreLocation/UpdateStoreLotterySettings', postData).subscribe(
      (response) => {
        this.spinner.hide();
        this.activateLotteryForm(status);
        this._toastr.success(this.constantService.infoMessages.updateRecord, this.constantService.infoMessages.success);
      }, (error) => {
        this.spinner.hide();
        this._toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
      }
    );
  }

  getDepartmentList() {
    let departmentTypeID = 5;
    this.spinner.show();
    this.dataService.getData('Department/getDepartments/' + departmentTypeID + '/' + this.storeLocationID).subscribe(
      (response) => {
        this.spinner.hide();
        if (response && response.length > 0) {
          this.departmentList = response;
        }
      }, (error) => {
        this.spinner.hide();
      }
    );
  }

  onSubmit() {
    // if (this.storeLotterySettingForm.value.departmentId === null || this.storeLotterySettingForm.value.departmentId === '') {
    //   this._toastr.warning('Department is required', this.constantService.infoMessages.error);
    //   return;
    // }
    const postData = {
      lotterySettingID: 0,
      storeLocationID: this.storeLocationID,
      isStartingwithZero: this.storeLotterySettingForm.value.isLotteryStartingFromZero,
      isReverse: this.storeLotterySettingForm.value.reverseOrder,
      departmentID: this.storeLotterySettingForm.value.departmentId
    }
    this.spinner.show();
    this.dataService.updateData('LotterySetting/update', postData).subscribe(
      (response) => {
        this.spinner.hide();
        if (response === "1") {
          this._toastr.success(this.constantService.infoMessages.updateRecord, this.constantService.infoMessages.success);
        } else {
          this._toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
        }
        this.getLotteryAdditionalDetails();
      }, (error) => {
        this.spinner.hide();
        this._toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
      }
    );
  }

}
