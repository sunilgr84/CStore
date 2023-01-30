import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ConstantService } from '@shared/services/constant/constant.service';
import { GridService } from '@shared/services/grid/grid.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { routerTransition } from 'src/app/router.animations';

@Component({
  selector: 'app-timesheet-timeoff',
  templateUrl: './timesheet-timeoff.component.html',
  styleUrls: ['./timesheet-timeoff.component.scss'],
  animations: [routerTransition()]
})
export class TimesheetTimeoffComponent implements OnInit {
  @Input() storeLocationID: number;
  @Output() changeTabs: EventEmitter<any> = new EventEmitter();
  @Output() backToStoreList: EventEmitter<any> = new EventEmitter();
  userInfo = null;
  timeTrackingSettingId  = null;
  timesheetTimeoffForm = this._fb.group({
    IsAskForShiftFeedback: [0],
    IsEnableDayOverTime: [0],
    DayOverTimeHours: [],
    DayOverTimePay: [],
    IsEnableWeekOverTime: [0],
    WeekOverTimeHours: [],
    WeekOverTimePay: [],
    IsBreakCheckbox: [],
    BreakMin: [],
    IsBreakPaid: ["1"],
    BreakHours: [],
    IsBreakMandatory: ["1"],
    IsSubstractUnpaidBreak: [0]
  });

  constructor(private gridService: GridService, private constantsService: ConstantService, private dataService: SetupService
    , private logger: LoggerService, private toastr: ToastrService, private _fb: FormBuilder,
    private spinner: NgxSpinnerService , private setupService: SetupService) { }

  ngOnInit() {
    this.userInfo = this.constantsService.getUserInfo();
    this.getTimesheetTimeoff();
  }

  getTimesheetTimeoff() {
    let id = this.storeLocationID;
    this.setupService.getData('TimeTrackingSetting/' + id, null, true).subscribe(result => {
      if (result) {
        if (result.length > 0) {
          this.timeTrackingSettingId = result[0].timeTrackingSettingId;
          this.timesheetTimeoffForm.patchValue({
            IsAskForShiftFeedback: result[0].isAskForShiftFeedback,
            IsEnableDayOverTime: result[0].isEnableDayOverTime,
            DayOverTimeHours: result[0].dayOverTimeHours,
            DayOverTimePay: result[0].dayOverTimePay,
            IsEnableWeekOverTime: result[0].isEnableWeekOverTime,
            WeekOverTimeHours: result[0].weekOverTimeHours,
            WeekOverTimePay: result[0].weekOverTimePay,
            IsBreakCheckbox: result[0].isBreakCheckbox,
            BreakMin: result[0].breakMin,
            IsBreakPaid: result[0].isBreakPaid == 1 ? "1" : "0",
            BreakHours: result[0].breakHours,
            IsBreakMandatory: result[0].isBreakMandatory == 1 ? "1" : "0",
            IsSubstractUnpaidBreak : result[0].isSubstractUnpaidBreak
          });
        }
        return;
      }
    });
  }


  saveTimesheetTimeOffSetting() {
      const postData = {
            IsAskForShiftFeedback: this.timesheetTimeoffForm.controls.IsAskForShiftFeedback.value,
            IsEnableDayOverTime: this.timesheetTimeoffForm.controls.IsEnableDayOverTime.value,
            DayOverTimeHours: this.timesheetTimeoffForm.controls.DayOverTimeHours.value,
            DayOverTimePay: this.timesheetTimeoffForm.controls.DayOverTimePay.value,
            IsEnableWeekOverTime: this.timesheetTimeoffForm.controls.IsEnableWeekOverTime.value,
            WeekOverTimeHours: this.timesheetTimeoffForm.controls.WeekOverTimeHours.value,
            WeekOverTimePay: this.timesheetTimeoffForm.controls.WeekOverTimePay.value,
            IsBreakCheckbox: this.timesheetTimeoffForm.controls.IsBreakCheckbox.value,
            BreakMin: this.timesheetTimeoffForm.controls.BreakMin.value,
            IsBreakPaid: this.timesheetTimeoffForm.controls.IsBreakPaid.value == "1" ? 1 : 0,
            BreakHours: this.timesheetTimeoffForm.controls.BreakHours.value,
            IsBreakMandatory: this.timesheetTimeoffForm.controls.IsBreakMandatory.value == "1" ? 1 : 0,
            IsSubstractUnpaidBreak : this.timesheetTimeoffForm.controls.IsSubstractUnpaidBreak.value,
            createdBy: this.userInfo.userName,
            createdDateTime: new Date(),
            LastModifiedBy: this.timeTrackingSettingId === null ? null : this.userInfo.userName,
            timeTrackingSettingId: this.timeTrackingSettingId === null ? 0 : this.timeTrackingSettingId,
            LastModifiedDateTime: this.timeTrackingSettingId === null ? null : new Date(),
            StoreLocationId: this.storeLocationID
      };
      if(this.timeTrackingSettingId == null) {
        this.setupService.postData('TimeTrackingSetting/', postData, false, true).subscribe((response) => {
          console.log(response);
          this.spinner.hide();
          if (this.timeTrackingSettingId) {
            if (response && Number(response) === 1) {
              this.toastr.success(this.constantsService.infoMessages.updatedRecord, 'Success');
              this.getTimesheetTimeoff();
            } else {
              this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, 'Error');
              this.getTimesheetTimeoff();
            }
          } else {
            if (response) {
              this.toastr.success(this.constantsService.infoMessages.success, 'Success');
              this.getTimesheetTimeoff();
            }
          }
    
        }, (error) => {
          console.log(error);
          this.spinner.hide();
          this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, 'Error');
        });
      } else {
        this.setupService.updateData('TimeTrackingSetting/', postData, false, true).subscribe((response) => {
          console.log(response);
          this.spinner.hide();
          if (this.timeTrackingSettingId) {
            if (response && Number(response) === 1) {
              this.toastr.success(this.constantsService.infoMessages.updatedRecord, 'Success');
              this.getTimesheetTimeoff();
            } else {
              this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, 'Error');
              this.getTimesheetTimeoff();
            }
          } else {
            if (response) {
              this.toastr.success(this.constantsService.infoMessages.success, 'Success');
              this.getTimesheetTimeoff();
            }
          }
    
        }, (error) => {
          console.log(error);
          this.spinner.hide();
          this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, 'Error');
        });
      }
    }

    backToMainList() {
      this.backToStoreList.emit(false);
    }
    onNavigateStoreFees() {
      const data = { tabId: 'tab-timesheet-timeoff' };
      this.changeTabs.emit(data);
    }
}
