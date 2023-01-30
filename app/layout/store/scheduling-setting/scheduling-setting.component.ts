import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConstantService } from '@shared/services/constant/constant.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AmazingTimePickerService } from 'amazing-time-picker';

@Component({
  selector: 'app-scheduling-setting',
  templateUrl: './scheduling-setting.component.html',
  styleUrls: ['./scheduling-setting.component.scss']
})
export class SchedulingSettingComponent implements OnInit {
  @Input() storeLocationID: number;
  @Output() backToStoreList: EventEmitter<any> = new EventEmitter();
  @Output() changeTabs: EventEmitter<any> = new EventEmitter();
  userInfo = null;
  schedulingSettingId = null;
  IsMarkLateEmployee: any;
  LateEmployeeMinute: any;
  IsPunchInBeforeAllowed: any;
  PunchInBeforeMinute: any;
  toDos = [];
  scheduleStartDay = '1';

  constructor(private setupService: SetupService, private constantService: ConstantService, private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService, private toastr: ToastrService,private atp: AmazingTimePickerService) { }

  ngOnInit() {
    this.userInfo = this.constantService.getUserInfo();
    this.getSehedulingTimeOff();
  }

  getSehedulingTimeOff() {
    let id = this.storeLocationID;
    this.spinner.show();
    this.setupService.getData('SchedulingSetting/GetSchedulingSetting/' + id, null, true).subscribe(result => {
      this.spinner.hide();
      if (result) {
        if (result.length > 0) {
          this.toDos = result;
          this.toDos.forEach(element => {
            element['thirdShiftChecked'] = false;
            element['secondShiftChecked'] = false;
            element['firstShiftChecked'] = false;
            element['firstShiftDisabled'] = true;
            element['secondShiftDisabled'] = true;
            element['thirdShiftDisabled'] = true;
            this.IsMarkLateEmployee = element['isMarkLateEmployee'];
            this.LateEmployeeMinute = element['lateEmployeeMinute'];
            this.IsPunchInBeforeAllowed = element['isPunchInBeforeAllowed'];
            this.scheduleStartDay = element['scheduleStartDay'];
            this.PunchInBeforeMinute = element['punchInBeforeMinute'];
            if ((element.firstShiftStartTime !== null && element.firstShiftStartTime !== '') && (element.firstShiftEndTime !== null && element.firstShiftEndTime !== '')) {
              element['firstShiftDisabled'] = false;
            } else {
              element['firstShiftDisabled'] = true;
            }
            if ((element.secondShiftStartTime !== null && element.secondShiftStartTime !== '') && (element.secondShiftEndTime !== null && element.secondShiftEndTime !== '')) {
              element['secondShiftDisabled'] = false;
            } else {
              element['secondShiftDisabled'] = true;
            }
            if ((element.thirdShiftStartTime !== null && element.thirdShiftStartTime !== '') && (element.thirdShiftEndTime !== null && element.thirdShiftEndTime !== '')) {
              element['thirdShiftDisabled'] = false;
            } else {
              element['thirdShiftDisabled'] = true;
            }

            // checkbox check uncheck video
            if ((element.firstShiftStartTime !== null && element.firstShiftStartTime !== '') && (element.firstShiftEndTime !== null && element.firstShiftEndTime !== '')) {
              element['firstShiftChecked'] = true;
            } else {
              element['firstShiftChecked'] = false;
            }
            if ((element.secondShiftStartTime !== null && element.secondShiftStartTime !== '') && (element.secondShiftEndTime !== null && element.secondShiftEndTime !== '')) {
              element['secondShiftChecked'] = true;
            } else {
              element['secondShiftChecked'] = false;
            }
            if ((element.thirdShiftStartTime !== null && element.thirdShiftStartTime !== '') && (element.thirdShiftEndTime !== null && element.thirdShiftEndTime !== '')) {
              element['thirdShiftChecked'] = true;
            } else {
              element['thirdShiftChecked'] = false;
            }
          });
        }
        console.log(this.toDos);
        return;
      }
    }), catchError(error => {
      this.tokenExp(error);
      return throwError(error);
    });
  }

  firstShiftChange(e, i) {
    if (e.target.checked) {
      this.toDos[i]['firstShiftDisabled'] = false;
      this.toDos[i]['secondShiftDisabled'] = false;
      this.toDos[i]['thirdShiftDisabled'] = false;
    } else {
      this.toDos[i]['firstShiftDisabled'] = true;
      this.toDos[i]['secondShiftDisabled'] = true;
      this.toDos[i]['thirdShiftDisabled'] = true;
    }
  }

  secondShiftChange(e, i) {
    if (e.target.checked) {
      this.toDos[i]['firstShiftDisabled'] = false;
      this.toDos[i]['secondShiftDisabled'] = false;
      this.toDos[i]['thirdShiftDisabled'] = false;
    } else {
      this.toDos[i]['firstShiftDisabled'] = true;
      this.toDos[i]['secondShiftDisabled'] = true;
      this.toDos[i]['thirdShiftDisabled'] = true;
    }
  }

  thirdShiftChange(e, i) {
    if (e.target.checked) {
      this.toDos[i]['firstShiftDisabled'] = false;
      this.toDos[i]['thirdShiftDisabled'] = false;
      this.toDos[i]['secondShiftDisabled'] = false;
    } else {
      this.toDos[i]['firstShiftDisabled'] = true;
      this.toDos[i]['thirdShiftDisabled'] = true;
      this.toDos[i]['secondShiftDisabled'] = true;
    }
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  public numberKeyValidation(event: any) {
    const charCode = event.keyCode;

    if ((charCode > 31 && (charCode < 48 || charCode > 57))) {
      if (charCode !== 58) {
        event.preventDefault();
        return;
      }

    }
  }

  backToMainList() {
    this.backToStoreList.emit(false);
  }
  onNavigateStoreFees() {
    const data = { tabId: 'tab-store-fees' };
    this.changeTabs.emit(data);
  }

  saveSchedulingSetting() {
    this.spinner.show();
    this.toDos.forEach(element => {
      element['CreatedBy'] = this.userInfo.userName
      element['LastModifiedBy'] = this.userInfo.userName
      element['IsMarkLateEmployee'] = this.IsMarkLateEmployee;
      element['LateEmployeeMinute'] = this.LateEmployeeMinute;
      element['IsPunchInBeforeAllowed'] = this.IsPunchInBeforeAllowed;
      element['PunchInBeforeMinute'] = this.PunchInBeforeMinute;
      element['scheduleStartDay'] = Number(this.scheduleStartDay);
    });
    let errorCount = 0;
    this.toDos.forEach(element => {
      if (element['firstShiftStartTime'] !== '' && element['firstShiftEndTime'] !== '') {
        if (new Date("01/01/2000 " + element['firstShiftStartTime']) >= new Date("01/01/2000 " + element['firstShiftEndTime'])) {
          this.spinner.hide();
          this.toastr.error(this.constantService.infoMessages.startEndTime);
          errorCount = errorCount + 1;
          return;
        }
      }
      if (element['firstShiftEndTime'] !== '' && element['secondShiftStartTime'] !== '') {
        if (new Date("01/01/2000 " + element['firstShiftEndTime']) >= new Date("01/01/2000 " + element['secondShiftStartTime'])) {
          this.spinner.hide();
          this.toastr.error(this.constantService.infoMessages.startEndTime);
          errorCount = errorCount + 1;
          return;
        }
      }
      if (element['secondShiftStartTime'] !== '' && element['secondShiftEndTime'] !== '') {
        if (new Date("01/01/2000 " + element['secondShiftStartTime']) >= new Date("01/01/2000 " + element['secondShiftEndTime'])) {
          this.spinner.hide();
          this.toastr.error(this.constantService.infoMessages.startEndTime);
          errorCount = errorCount + 1;
          return;
        }
      }
      if (element['secondShiftEndTime'] !== '' && element['thirdShiftStartTime'] !== '') {
        if (new Date("01/01/2000 " + element['secondShiftEndTime']) >= new Date("01/01/2000 " + element['thirdShiftStartTime'])) {
          this.spinner.hide();
          this.toastr.error(this.constantService.infoMessages.startEndTime);
          errorCount = errorCount + 1;
          return;
        }
      }
      // if (element['thirdShiftStartTime'] !== '' && element['thirdShiftEndTime'] !== '') {
      //   if (new Date("01/01/2000 " + element['thirdShiftStartTime']) >= new Date("01/01/2000 " + element['thirdShiftEndTime'])) {
      //     this.spinner.hide();
      //     this.toastr.error(this.constantService.infoMessages.startEndTime);
      //     errorCount = errorCount + 1;
      //     return;
      //   }
      // }
    });
    if (errorCount == 0) {
      this.setupService.postData('SchedulingSetting/', this.toDos, false, true).subscribe((response) => {
        console.log(response);
        this.spinner.hide();
        if (this.schedulingSettingId) {
          if (response && response === 1) {
            this.toastr.success(this.constantService.infoMessages.updatedRecord, 'Success');
            this.getSehedulingTimeOff();
          } else {
            this.toastr.error(this.constantService.infoMessages.updateRecordFailed, 'Error');
            this.getSehedulingTimeOff();
          }
        } else {
          if (response) {
            this.toastr.success(this.constantService.infoMessages.success, 'Success');
            this.getSehedulingTimeOff();
          }
        }

      }, (error) => {
        console.log(error);
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.updateRecordFailed, 'Error');
      });
    }
  }

  tokenExp(error) {
    if (error && error['status'] === 401) {
      this.toastr.warning('Session Expried', 'Login');
      sessionStorage.clear();
      setTimeout(() => {
      }, 250);
    }
  }

}

