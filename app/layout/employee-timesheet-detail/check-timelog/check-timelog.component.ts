import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConstantService } from '@shared/services/constant/constant.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-check-timelog',
  templateUrl: './check-timelog.component.html',
  styleUrls: ['./check-timelog.component.scss']
})
export class CheckTimelogComponent implements OnInit {

  PunchInTimeSpan = 0;
  BreakhoursTimeSpan = 0;
  PunchOutTimeSpan = 0;
  scheduleHoursTimeSpan = 0;
  overTimeHoursTimeSpan = 0;
  userInfo: any;
  rowdata = [] ;
  date = moment().format('YYYY-MM-DD');
  storeLocationId = 0;
  dateValueFrom = null;
  constructor(public dialogRef: MatDialogRef<CheckTimelogComponent> , private spinner: NgxSpinnerService,  private dataService: SetupService,
    private constants: ConstantService ,  @Inject(MAT_DIALOG_DATA) public data) {
      this.dateValueFrom = this.data ? this.data.dateValue ? moment(this.data.dateValue).format('YYYY-MM-DD') : this.date : this.date;
      this.storeLocationId = this.data ? this.data.storeLocationIDValue : 0;
     }

  ngOnInit() {
    this.userInfo = this.constants.getUserInfo();
    this.getTimelog();
  }

  close() {
     this.dialogRef.close();
  }

  getTimelog() {
    var storeLocationId = this.storeLocationId;
    this.spinner.show();
    this.dataService.getData('EmployeeTimeTracking/' + this.userInfo.userName + '/' + this.dateValueFrom + '/' + storeLocationId  + '/' +  moment(new Date()).format('HH:mm'), null, true).subscribe(
      (response) => {
        this.spinner.hide();
        this.rowdata = response;
        if (response) {
          this.PunchInTimeSpan = response.punchInTimeSpan === null ? 0 : response.punchInTimeSpan;
          this.PunchOutTimeSpan = response.punchOutTimeSpan=== null ? 0 : response.punchOutTimeSpan;
          this.BreakhoursTimeSpan = response.breakhoursTimeSpan === null ? 0 : response.breakhoursTimeSpan;
          this.scheduleHoursTimeSpan = response.scheduleHoursTimeSpan === null ? 0 : response.scheduleHoursTimeSpan;
          this.overTimeHoursTimeSpan = response.overTimeHoursTimeSpan === null ? 0 : response.overTimeHoursTimeSpan;
          console.log(this.rowdata);
        } else {
          console.log(this.rowdata);
        }
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }

}
