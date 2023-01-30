import { Component, OnInit, ChangeDetectorRef, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, Validators, PatternValidator, FormGroup } from '@angular/forms';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from 'src/app/shared/services/setupService/setup-service';
import { LoggerService } from 'src/app/shared/services/logger/logger.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'lodash';
import { isThisMonth } from 'date-fns';

@Component({
  selector: 'app-setting-time-off',
  templateUrl: './setting-time-off.component.html',
  styleUrls: ['./setting-time-off.component.scss']
})
export class SettingTimeOffComponent implements OnInit {
  @Input() storeLocationID: number;
  @Output() backToStoreList: EventEmitter<any> = new EventEmitter();
  @Output() changeTabs: EventEmitter<any> = new EventEmitter();
  settingTimeOffForm: FormGroup;
  userInfo = null;
  timeOffSettingId = null;
  constructor(private setupService: SetupService, private constantService: ConstantService, private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService, private toastr: ToastrService) { }

  ngOnInit() {
    this.userInfo = this.constantService.getUserInfo();
    this.settingTimeOffForm = this.formBuilder.group({
      isEnabledMaximumPeopleForLeave: [''],
      maximumPeopleForLeave: [''],
      isEnableAdvanceDays: [''],
      advanceDays: ['']
    });
    this.getSettingTimeOf();
  }

  getSettingTimeOf() {
    let id = this.storeLocationID;
    this.setupService.getData('TimeOffSetting/GetTimeOffSetting/' + id, null, true).subscribe(result => {
      if (result) {
        if (result.length > 0) {
          this.timeOffSettingId = result[0].timeOffSettingId;
          this.settingTimeOffForm.patchValue({
            isEnabledMaximumPeopleForLeave: result[0].isEnabledMaximumPeopleForLeave,
            maximumPeopleForLeave: result[0].maximumPeopleForLeave,
            isEnableAdvanceDays: result[0].isEnableAdvanceDays,
            advanceDays: result[0].advanceDays
          });
        }
        return;
      }
    });
  }

  saveTimeOffSetting() {
    const postData = {
      isEnabledMaximumPeopleForLeave: this.settingTimeOffForm.controls.isEnabledMaximumPeopleForLeave.value === null || this.settingTimeOffForm.controls.isEnabledMaximumPeopleForLeave.value === '' ? false : this.settingTimeOffForm.controls.isEnabledMaximumPeopleForLeave.value,
      isEnableAdvanceDays: this.settingTimeOffForm.controls.isEnableAdvanceDays.value === null || this.settingTimeOffForm.controls.isEnableAdvanceDays.value === '' ? false : this.settingTimeOffForm.controls.isEnableAdvanceDays.value,
      maximumPeopleForLeave: this.settingTimeOffForm.controls.maximumPeopleForLeave.value,
      advanceDays: this.settingTimeOffForm.controls.advanceDays.value,
      createdBy: this.userInfo.userName,
      createdDateTime: new Date(),
      LastModifiedBy: this.timeOffSettingId === null ? null : this.userInfo.userName,
      timeOffSettingId: this.timeOffSettingId === null ? 0 : this.timeOffSettingId,
      LastModifiedDateTime: this.timeOffSettingId === null ? null : new Date(),
      StoreLocationId: this.storeLocationID
    };

    this.setupService.postData('TimeOffSetting/InsertUpdateTimeOffSetting', postData, false, true).subscribe((response) => {
      console.log(response);
      this.spinner.hide();
      if (this.timeOffSettingId) {
        if (response && Number(response) === 1) {
          this.toastr.success(this.constantService.infoMessages.updatedRecord, 'Success');
          this.getSettingTimeOf();
        } else {
          this.toastr.error(this.constantService.infoMessages.updateRecordFailed, 'Error');
          this.getSettingTimeOf();
        }
      } else {
        if (response) {
          this.toastr.success(this.constantService.infoMessages.success, 'Success');
          this.getSettingTimeOf();
        }
      }

    }, (error) => {
      console.log(error);
      this.spinner.hide();
      this.toastr.error(this.constantService.infoMessages.updateRecordFailed, 'Error');
    });
  }

  backToMainList() {
    this.backToStoreList.emit(false);
  }
  onNavigateStoreFees() {
    const data = { tabId: 'tab-store-fees' };
    this.changeTabs.emit(data);
  }
}
