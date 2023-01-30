import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConstantService } from '@shared/services/constant/constant.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { GridService } from '@shared/services/grid/grid.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { CheckTimelogComponent } from './check-timelog/check-timelog.component';
import { AdjustTimelogComponent } from './adjust-timelog/adjust-timelog.component';
import { AmazingTimePickerService } from 'amazing-time-picker';

@Component({
  selector: 'app-employee-timesheet-detail',
  templateUrl: './employee-timesheet-detail.component.html',
  styleUrls: ['./employee-timesheet-detail.component.scss']
})
export class EmployeeTimesheetDetailComponent implements OnInit {
  submitted = false;
  selectedDateRange: any;
  gridemployeeTimesheetDetail: any;
  weekBeginDate = moment().format('MM-DD-YYYY');
  weekEndDate = moment().format('MM-DD-YYYY');
  fromDate = null;
  toDate = null;
  fromdateValue = null;
  todateValue = null;
  fromday = null;
  today = null;
  fromyear = null;
  toyear = null;
  rowData: any;
  storeLocationID: any;
  roleId: any;
  empNameList: any;
  timeLogList: any;
  companyId: any;
  userInfo: any;
  columnDefs: any;
  gridApi: any;
  filterText: string;
  sumTotalPaid = 0;
  sumTotalWages: 0;
  cashier = false;
  startDate = moment().format('MM-DD-YYYY');
  addEmployeeId = null;
  storeLocationList: any[];
  isLoading = false;
  addEmployeeTimedheet = this._fb.group({
    employeeId: ['', Validators.required],
    punchInTime: ['', Validators.required],
    punchOutTime: [''],
    scheduleDate: ['', Validators.required],
    shiftId: ['', Validators.required],
    reason: ['']
  });
  days = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  constructor(private gridService: GridService, private constantsService: ConstantService, private dataService: SetupService
    , private logger: LoggerService, private toastr: ToastrService, private _fb: FormBuilder,
    private spinner: NgxSpinnerService, private _modal: NgbModal, public dialog: MatDialog, private atp: AmazingTimePickerService) {
    this.gridemployeeTimesheetDetail = this.gridService.getGridOption(this.constantsService.gridTypes.gridemployeeTimesheetDetail);
  }

  ngOnInit() {
    this.userInfo = this.constantsService.getUserInfo();
    this.columnDefs = this.gridemployeeTimesheetDetail.columnDefs;
    this.fromDate = new Date();
    this.toDate = new Date();
    this.fromdateValue = this.fromDate.toISOString().slice(8, 10);
    this.todateValue = this.toDate.toISOString().slice(8, 10);
    this.fromday = this.days[this.fromDate.getMonth()];
    this.today = this.days[this.toDate.getMonth()];
    this.fromyear = this.fromDate.toISOString().slice(0, 4);
    this.toyear = this.toDate.toISOString().slice(0, 4);
    this.getStoreLocationList();
  }

  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.fromDate = this.selectedDateRange.fDate;
    this.toDate = this.selectedDateRange.tDate;
    this.fromdateValue = this.fromDate.slice(8, 10);
    this.todateValue = this.toDate.slice(8, 10);
    this.fromday = this.days[new Date(this.fromDate).getMonth()];
    this.today = this.days[new Date(this.toDate).getMonth()];
    this.fromyear = this.fromDate.slice(0, 4);
    this.getEmployeeTimeSheet();
  }

  dateChange(event, control) {
    if (control === 'date') {
      this.startDate = event.formatedDate;
    }
  }

  getEmployeeTimeSheet() {
    this.spinner.show();
    this.dataService.getData('Scheduling/GetEmployeeTimeSheet/' + moment(this.fromDate).format('YYYY-MM-DD') + '/' + moment(this.toDate).format('YYYY-MM-DD') + '/' + this.storeLocationID + '/' + this.roleId + '/' + this.companyId, null, true).subscribe(
      (response) => {
        this.spinner.hide();
        if (response.length > 0) {
          response.forEach(element => {
            element['estimatedWadges'] = element['totalWages'] + element['overTimePay']
            element['totalPaid'] = element['paidHours'] + element['overTimeHours']
            element['scheduleHours'] = element['scheduleHours']
          });
          this.sumTotalPaid = response[0].sumTotalPaid;
          this.sumTotalWages = response[0].sumTotalWages + response[0].sumOverTimePay;
          response.push({
            employeeId: null,
            employeeName: null,
            scheduleHoursCheckIn: null,
            sumOverTimeHours: null,
            sumOverTimePay: null,
            sumPaidHours: null,
            sumScheduleHours: null,
            sumTotalPaid: null,
            sumTotalWages: null,
          })
          this.rowData = response;
          console.log(response);
        } else {
          this.rowData = [];
        }
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }

  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }

  getEmployeeNameList() {
    var storeLocationId = this.storeLocationID;
    this.spinner.show();
    this.dataService.getData('Employee/GetEmployeeByRoleAndCompnay/' +
      this.roleId + '/' + this.userInfo.companyId + '/' + storeLocationId, null, false).subscribe((response) => {
        this.spinner.hide();
        this.empNameList = response;
        console.log(response);
      }, (error) => {
        this.spinner.hide();
      });
  }

  resetEmployeeTimesheetDetail() {
    this.submitted = false;
    this.addEmployeeTimedheet.controls.punchInTime.reset();
    this.addEmployeeTimedheet.controls.punchOutTime.reset();
    this.addEmployeeTimedheet.controls.scheduleDate.reset();
    this.addEmployeeTimedheet.controls.employeeId.reset();
  }

  saveEmployeeTimesheetDetail() {
    this.submitted = true;
    var storeLocationId = this.storeLocationID;
    const postData = {
      PunchInTimeSpan: this.addEmployeeTimedheet.controls.punchInTime.value,
      PunchOutTimeSpan: this.addEmployeeTimedheet.controls.punchOutTime.value,
      ScheduleDate: this.addEmployeeTimedheet.controls.scheduleDate.value,
      EmployeeId: this.addEmployeeTimedheet.controls.employeeId.value,
      CreatedBy: this.userInfo.userName,
      EmployeeScheduleId: this.addEmployeeTimedheet.controls.shiftId.value,
      StoreLocationID: storeLocationId,
      reason: this.addEmployeeTimedheet.controls.reason.value
    }
    // if (new Date("01/01/2000 " + this.addEmployeeTimedheet.controls.punchInTime.value) >= new Date("01/01/2000 " + this.addEmployeeTimedheet.controls.punchOutTime.value)) {
    //   this.toastr.error(this.constantsService.infoMessages.punchInPunchOutTime, 'Error');
    //   this.ngOnInit();
    //   return;
    // }
    this.dataService.postData('EmployeeTimeTracking/', postData, false, true).subscribe((response) => {
      console.log(response);
      this.spinner.hide();
      if (response && response.statusCode === 500) {
        this.toastr.error(response.message, 'Error');
        this._modal.dismissAll();
        this.getEmployeeTimeSheet();
        this.getEmployeeNameList();
        this.getTimelog(null, null);
        this.resetEmployeeTimesheetDetail();
      } else {
        this.toastr.success(this.constantsService.infoMessages.addedRecord, 'Success');
        this._modal.dismissAll();
        this.getEmployeeTimeSheet();
        this.getEmployeeNameList();
        this.getTimelog(null, null);
        this.resetEmployeeTimesheetDetail();
      }
    }, (error) => {
      console.log(error);
      this.spinner.hide();
      this.toastr.error(this.constantsService.infoMessages.addRecordFailed, 'Error');
    });
  }

  addEmployeeTimesheetDetails(content) {
    this._modal.open(content, { size: 'lg' }).result.then((result) => {
      console.log(`Closed with: ${result}`);
    }, (reason) => {
      console.log(`Dismissed ${this.getDismissReason(reason)}`);
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  dateChangeStartDate(event) {
    this.addEmployeeTimedheet.get('scheduleDate').setValue(event.formatedDate);
    this.getTimelog(this.addEmployeeTimedheet.controls.employeeId.value, this.addEmployeeTimedheet.controls.scheduleDate.value)
  }

  checktimelog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = ['primary-modal-wrapper', 'modal-lg'];
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      dateValue: this.fromDate,
      storeLocationIDValue: this.storeLocationID
    }
    const dialogRef = this.dialog.open(CheckTimelogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      this.getEmployeeTimeSheet();
      this.getEmployeeNameList();
      this.getTimelog(null, null);
    }, error => {
      this.getEmployeeTimeSheet();
      this.getEmployeeNameList();
      this.getTimelog(null, null);
    });
  }

  adjusttimelog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'primary-modal-wrapper';
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      dateValue: this.startDate,
      addEmployeeId: decodeURIComponent(this.addEmployeeId),
      storeLocationIDValue: this.storeLocationID
    };
    const dialogRef = this.dialog.open(AdjustTimelogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      this.getEmployeeTimeSheet();
      this.getEmployeeNameList();
      this.getTimelog(null, null);
    }, error => {
      this.getEmployeeTimeSheet();
      this.getEmployeeNameList();
      this.getTimelog(null, null);
    });
  }

  onFilterTextBoxChanged() {
    this.gridemployeeTimesheetDetail.setQuickFilter(this.filterText);
  }

  getTimelog(addEmployeeId, dateValueFrom) {
    if (dateValueFrom === 'null' || dateValueFrom === null) {
      dateValueFrom = moment().format('YYYY-MM-DD');
    } else {
      dateValueFrom = moment(dateValueFrom).format('YYYY-MM-DD');
    }
    if (this.addEmployeeTimedheet.controls.employeeId.value === null && this.addEmployeeTimedheet.controls.employeeId.value === undefined && this.addEmployeeTimedheet.controls.employeeId.value === 0) {
      addEmployeeId = null;
    } else {
      addEmployeeId = Number(this.addEmployeeTimedheet.controls.employeeId.value);
      if (this.empNameList != null) {
        addEmployeeId = this.empNameList.find(x => x.employeeId === addEmployeeId).userName;
      }
    }
    var storeLocationId = this.storeLocationID;
    this.spinner.show();
    this.dataService.getData('EmployeeTimeTracking/' + addEmployeeId + '/' + dateValueFrom + '/' + storeLocationId + '/' + moment(new Date()).format('HH:mm'), null, true).subscribe(
      (response) => {
        this.spinner.hide();
        this.timeLogList = response;
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }

  getTimelogList() {
    if (this.addEmployeeTimedheet.controls.shiftId.value !== null && this.addEmployeeTimedheet.controls.shiftId.value !== undefined) {
      const employeeScheduleId = this.addEmployeeTimedheet.controls.shiftId.value;
      this.addEmployeeTimedheet.controls.punchInTime.setValue(this.timeLogList.find(x => x.employeeScheduleId === Number(employeeScheduleId)).shiftIn);
      this.addEmployeeTimedheet.controls.punchOutTime.setValue(this.timeLogList.find(x => x.employeeScheduleId === Number(employeeScheduleId)).shiftOut);
    }
  }

  getStoreLocationList() {
    // tslint:disable-next-line:max-line-length
    this.dataService.getData(`StoreLocation/getByCompanyId/${Number(this.userInfo.companyId)}/${this.userInfo.userName}`)
      .subscribe((response) => {
        this.storeLocationList = response;
        this.storeLocationID = this.storeLocationList[0].storeLocationID;
        this.companyId = this.userInfo.companyId;
        this.userInfo = this.constantsService.getUserInfo();
        if (this.userInfo.roleName === this.constantsService.roleName) {
          this.roleId = 3;
        }
        if (this.userInfo.roleName.toLowerCase() === 'companyadmin') {
          this.roleId = 2;
        }
        if (this.userInfo.roleName.toLowerCase() === 'storemanager') {
          this.roleId = 1;
        }
        if (this.userInfo.roleName.toLowerCase() === 'cashiers') {
          this.cashier = true;
        }
        this.getEmployeeTimeSheet();
        this.getEmployeeNameList();
        this.getTimelog(null, null);
      }, (error) => {
        console.log(error);
      });
  }

  bindStoreLocationId() {
    this.companyId = this.userInfo.companyId;
    this.userInfo = this.constantsService.getUserInfo();
    if (this.userInfo.roleName === this.constantsService.roleName) {
      this.roleId = 3;
    }
    if (this.userInfo.roleName.toLowerCase() === 'companyadmin') {
      this.roleId = 2;
    }
    if (this.userInfo.roleName.toLowerCase() === 'storemanager') {
      this.roleId = 1;
    }
    if (this.userInfo.roleName.toLowerCase() === 'cashiers') {
      this.cashier = true;
    }
    this.getEmployeeTimeSheet();
    this.getEmployeeNameList();
    this.getTimelog(null, null);
  }
}
