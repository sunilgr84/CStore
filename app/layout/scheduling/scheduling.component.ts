import { Component, OnInit } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { CommonService } from '@shared/services/commmon/common.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { replace } from 'lodash';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AddEditSchedulingComponent } from './add-edit-scheduling/add-edit-scheduling.component';

@Component({
  selector: 'app-scheduling',
  templateUrl: './scheduling.component.html',
  styleUrls: ['./scheduling.component.scss']
})
export class SchedulingComponent implements OnInit {
  selectedDateRange: any;

  weekBeginDate = moment().format('MM-DD-YYYY');
  weekEndDate = moment().format('MM-DD-YYYY');
  empNameList: any;
  totalCount = 0;
  totalCountScheduling = 0;
  schedulingDataList: any;
  userInfo: any;
  structure = "1";
  roleId: any;
  roleName: any;
  changeText: boolean;
  startDate = new Date();
  week = [];
  month = [];
  isLoading = false;
  storeLocationList: any[];
  scheduleStartDay = '1';
  storeLocationID = 0;
  constructor(private formBuilder: FormBuilder, private toastr: ToastrService, private commonService: CommonService,
    private constants: ConstantService, private spinner: NgxSpinnerService, private dataService: SetupService,
    public dialog: MatDialog, private setupService: SetupService) {
    this.changeText = false;
  }
  date = moment().format("DD/MM/YYYY");
  dayCol = [{ id: 0, value: '9:00 AM' }, { id: 1, value: '10:00 AM' }, { id: 2, value: '11:00 AM' }, { id: 3, value: '12:00 PM' }, { id: 4, value: '1:00 PM' }, { id: 5, value: '2:00 PM' }, { id: 6, value: '3:00 PM' }, { id: 7, value: '4:00 PM' }, { id: 8, value: '5:00 PM' }, { id: 9, value: '6:00 PM' }, { id: 10, value: '7:00 PM' }, { id: 11, value: '8:00 PM' }, { id: 12, value: '9:00 PM' }, { id: 13, value: '10:00 PM' }, { id: 14, value: '11:00 PM' }, { id: 15, value: '12:00 AM' }, { id: 16, value: '1:00 AM' }, { id: 17, value: '2:00 AM' }, { id: 18, value: '3:00 AM' }, { id: 19, value: '4:00 AM' }, { id: 20, value: '5:00 AM' }, { id: 21, value: '6:00 AM' }, { id: 22, value: '7:00 AM' }, { id: 23, value: '8:00 AM' }];
  weekCol = [];
  ngOnInit() {
    this.startDate = new Date();
    this.weekBeginDate = moment().format('MM-DD-YYYY');
    this.weekEndDate = moment(new Date(this.weekBeginDate + 7)).format('MM-DD-YYYY');
    this.userInfo = this.constants.getUserInfo();
    this.getStoreLocationList();
  }

  getEmployeeNameList() {
    var storeLocationId = this.storeLocationID;
    this.spinner.show();
    this.dataService.getData('Employee/GetEmployeeByRoleAndCompnay/' +
      this.roleId + '/' + this.userInfo.companyId + '/' + storeLocationId, null, false).subscribe((response) => {
        this.spinner.hide();
        this.empNameList = response;
        this.totalCount = this.empNameList.length;
        // this.schedulingData();
        console.log(response);
      }, (error) => {
        this.spinner.hide();
      });
  }

  getCurrentWeek() {
    var currentDate = moment();

    var weekStart = currentDate.clone().startOf('isoWeek');
    var weekEnd = currentDate.clone().endOf('isoWeek');
    var currentDateToday = moment(currentDate).add(i, 'days').format("D");
    var currentDateTodayMonth = moment(currentDate).add(i, 'days').format("dddd");
    var currentDateTodayYear = moment(currentDate).add(i, 'days').format("yyyy");
    var days = [];
    for (var i = 0; i <= 6; i++) {
      var daysObject = new Object();
      daysObject['dayNo'] = moment(weekStart).add(i, 'days').format("D");
      daysObject['dayDate'] = moment(weekStart).add(i, 'days').format("dddd");
      daysObject['dayYear'] = moment(weekStart).add(i, 'days').format("yyyy");
      if (daysObject['dayNo'] === currentDateToday && daysObject['dayDate'] === currentDateTodayMonth && daysObject['dayYear'] === currentDateTodayYear) {
        daysObject['dayDate'] = 'Today';
      }
      days.push(daysObject);
    }
    return days;
  }

  btnAdd(employeeId) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'primary-modal-wrapper';
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      structureValue: this.structure,
      roleIdValue: this.roleId,
      employeeId: employeeId,
      startDate: moment(this.week[0].date).format('MM-DD-YYYY'),
      endDate: moment(this.week[6].date).format('MM-DD-YYYY'),
      storeLocationIDValue: this.storeLocationID
    };
    const dialogRef = this.dialog.open(AddEditSchedulingComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.generateDayColumn();
        this.getCurrentWeekValue();
        this.userInfo = this.constants.getUserInfo();
        if (this.userInfo.roleName === this.constants.roleName) {
          this.roleId = 3;
          this.roleName = 'Company Admin';
        }
        if (this.userInfo.roleName.toLowerCase() === 'companyadmin') {
          this.roleId = 2;
          this.roleName = 'Store Manager';
        }
        if (this.userInfo.roleName.toLowerCase() === 'storemanager') {
          this.roleId = 1;
          this.roleName = 'Cashier';
        }
        this.getEmployeeNameList();
        this.weekCol = this.getCurrentWeek();
        this.getCurrentMonth(null);
      } else {
        this.ngOnInit();
      }
    }, error => {
      this.ngOnInit();
    });
  }

  schedulingData() {
    this.spinner.show();
    var storeLocationId = this.storeLocationID;
    if (this.structure == '1') {
      this.dataService.getData('Scheduling/' + this.week[0].date + '/' + this.week[6].date + '/' + storeLocationId, null, true, 'scheduling').subscribe(
        (response) => {
          this.spinner.hide();
          this.schedulingDataList = response;
          this.totalCountScheduling = this.schedulingDataList.length;
          if (this.empNameList) {
            this.empNameList.forEach(elementName => {
              if (this.schedulingDataList) {
                this.schedulingDataList.forEach(element => {
                  if (elementName.employeeId == element.employeeId) {
                    elementName['totalScheduleHours'] = element.totalScheduleHours;
                    elementName['totalPayscale'] = element.totalPayscale;
                  }
                  else {
                    elementName['totalScheduleHours'] = null;
                    elementName['totalPayscale'] = null;
                  }
                  element['newStartDateTime'] = new Date((element['scheduledStartDate'].slice(0, 10)));
                  element['newEndDateTime'] = new Date((element['scheduledEndDate'].slice(0, 10)));
                });
              }
            });
          }
          console.log(this.schedulingDataList);
        }, (error) => {
          this.spinner.hide();
          console.log(error);
        });
    }
    if (this.structure == '2') {
      this.dataService.getData('Scheduling/' + this.month[0].d + '/' + this.month[this.month.length - 1].d + '/' + storeLocationId, null, true, 'scheduling').subscribe(
        (response) => {
          this.spinner.hide();
          this.schedulingDataList = response;
          this.totalCountScheduling = this.schedulingDataList.length;
          if (this.empNameList) {
            this.empNameList.forEach(elementName => {
              if (this.schedulingDataList) {
                this.schedulingDataList.forEach(element => {
                  if (elementName.employeeId == element.employeeId) {
                    elementName['totalScheduleHours'] = element.totalScheduleHours;
                    elementName['totalPayscale'] = element.totalPayscale;
                  } else {
                    elementName['totalScheduleHours'] = null;
                    elementName['totalPayscale'] = null;
                  }
                  element['newStartDateTime'] = new Date((element['scheduledStartDate'].slice(0, 10)));
                  element['newEndDateTime'] = new Date((element['scheduledEndDate'].slice(0, 10)));
                });
              }
            });
          }
          console.log(this.schedulingDataList);
        }, (error) => {
          this.spinner.hide();
          console.log(error);
        });
    }

  }

  timeConvert(time) {
    // Check correct time format and split into components
    time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

    if (time.length > 1) { // If time format correct
      time = time.slice(1); // Remove full string match value
      time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
      time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join("");
  }

  generateDayColumn() {
    this.dayCol.forEach(element => {
      element['date'] = new Date(this.date + ' ' + element['value']);
    });
    console.log(this.dayCol);
  }

  getCurrentWeekValue() {
    let curr = new Date();
    this.week = [];
    let weekday = [];
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    var id = this.storeLocationID;
    this.spinner.show();
    this.setupService.getData('SchedulingSetting/GetSchedulingSetting/' + id, null, true).subscribe(result => {
      this.spinner.hide();
      if (result) {
        if (result.length > 0) {
          this.scheduleStartDay = result[0].scheduleStartDay;
          var now = new Date();
          var startDay = parseInt(this.scheduleStartDay); //0=sunday, 1=monday etc.
          var d = now.getDay(); //get the current day
          var weekStart = new Date(now.valueOf() - ((d - startDay) <= 0 ? 7 - (startDay - d) : d - startDay) * 86400000);//rewind to start day
          if ((d - startDay) === 0) {
            weekStart = new Date(now.valueOf() - 0); //rewind to start day
          }
          var weekEnd = new Date(weekStart.valueOf() + 6 * 86400000)
          for (let i = 0; i <= 6; i++) {
            var first = weekStart.getDate() + (i == 0 ? 0 : 1);
            var date = new Date(weekStart.setDate(first));
            var weekname = weekday[date.getDay() === 0 ? 0 : date.getDay()];
            // var day = date.toISOString().slice(0, 10);
            var day = this.getDateFormate((date)).slice(0, 10);
            var dayValue = this.getDateFormate(new Date(date)).slice(8, 10);
            var obj = { date: day, weekname: weekname, day: dayValue, dateValue: new Date(day) }
            this.week.push(obj)
          }
          this.schedulingData();
        } else {
          var now = new Date();
          var startDay = parseInt(this.scheduleStartDay); //0=sunday, 1=monday etc.
          var d = now.getDay(); //get the current day
          var weekStart = new Date(now.valueOf() - ((d - startDay) <= 0 ? 7 - (startDay - d) : d - startDay) * 86400000);//rewind to start day
          if ((d - startDay) === 0) {
            weekStart = new Date(now.valueOf() - 0); //rewind to start day
          }
          var weekEnd = new Date(weekStart.valueOf() + 6 * 86400000)
          for (let i = 0; i <= 6; i++) {
            var first = weekStart.getDate() + (i == 0 ? 0 : 1);
            var date = new Date(weekStart.setDate(first));
            var weekname = weekday[date.getDay() === 0 ? 0 : date.getDay()];
            var day = this.getDateFormate(new Date(date)).slice(0, 10);
            var dayValue = this.getDateFormate(new Date(date)).slice(8, 10);
            var obj = { date: day, weekname: weekname, day: dayValue, dateValue: new Date(day) }
            this.week.push(obj)
          }
          this.schedulingData();
        }
      } else {
        var now = new Date();
        var startDay = parseInt(this.scheduleStartDay); //0=sunday, 1=monday etc.
        var d = now.getDay(); //get the current day
        var weekStart = new Date(now.valueOf() - ((d - startDay) <= 0 ? 7 - (startDay - d) : d - startDay) * 86400000);//rewind to start day
        if ((d - startDay) === 0) {
          weekStart = new Date(now.valueOf() - 0); //rewind to start day
        }
        var weekEnd = new Date(weekStart.valueOf() + 6 * 86400000)
        for (let i = 0; i <= 6; i++) {
          var first = weekStart.getDate() + (i == 0 ? 0 : 1);
          var date = new Date(weekStart.setDate(first));
          var weekname = weekday[date.getDay() === 0 ? 0 : date.getDay()];
          var day = this.getDateFormate(new Date(date)).slice(0, 10);
          var dayValue = this.getDateFormate(new Date(date)).slice(8, 10);
          var obj = { date: day, weekname: weekname, day: dayValue, dateValue: new Date(day) }
          this.week.push(obj)
        }
        this.schedulingData();
      }
    });
  }

  focusFunction(e) {
    if (e.target.querySelector('.title') != null && e.target.querySelector('.title').style != null && e.target.querySelector('.title').style != undefined) {
      e.target.querySelector('.title').style.opacity = '0.3';
    }
  }

  focusOutFunction(e) {
    if (e.target.querySelector('.title') != null && e.target.querySelector('.title').style != null && e.target.querySelector('.title').style != undefined) {
      e.target.querySelector('.title').style.opacity = '0';
    }
  }

  btnDelete(id) {
    this.spinner.show();
    this.dataService.deleteData(`Scheduling/${id}`).subscribe(result => {
      this.spinner.hide();
      if (result === '0') {
        this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
      } else if (result === '1') {
        this.toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.delete);
      }
      this.ngOnInit();
    }, error => {
      this.spinner.hide();
      this.toastr.error(this.constants.infoMessages.contactAdmin);
    });
  }

  dateRangeChange(e: any) {
    this.selectedDateRange = e;
    this.weekBeginDate = this.selectedDateRange.date;
    if (this.structure === '2') {
      this.getCurrentMonth(this.selectedDateRange.date);
      this.schedulingData();
      return;
    }
    // this.weekEndDate = this.selectedDateRange.tDate;
    this.week = [];
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    var id = this.storeLocationID;
    this.spinner.show();
    // for (let i = 1; i <= 7; i++) {
    //   let first = (new Date(e.date).getDate() - ((new Date(e.date).getDay() === 0) ? 7 : new Date(e.date).getDay())) + i
    //   let date = new Date((e.date).setDate(first));
    //   let weekname = weekday[date.getDay() === 0 ? 7 : date.getDay()];
    //   let maindate = (date.setDate(date.getDate() + 1));
    //   let day = new Date(maindate).toISOString().slice(0, 10);
    //   let dayValue = new Date(maindate).toISOString().slice(8, 10);
    //   var obj = { date: day, weekname: weekname, day: dayValue, dateValue: new Date(day) }
    //   this.week.push(obj)
    // }
    this.setupService.getData('SchedulingSetting/GetSchedulingSetting/' + id, null, true).subscribe(result => {
      this.spinner.hide();
      if (result) {
        if (result.length > 0) {
          this.scheduleStartDay = result[0].scheduleStartDay;
          var now = new Date(e.date);
          var startDay = parseInt(this.scheduleStartDay); //0=sunday, 1=monday etc.
          var d = now.getDay(); //get the current day
          var weekStart = new Date(now.valueOf() - ((d - startDay) <= 0 ? 7 - (startDay - d) : d - startDay) * 86400000);//rewind to start day
          if ((d - startDay) === 0) {
            weekStart = new Date(now.valueOf() - 0); //rewind to start day
          }
          var weekEnd = new Date(weekStart.valueOf() + 6 * 86400000)
          for (let i = 0; i <= 6; i++) {
            var first = weekStart.getDate() + (i == 0 ? 0 : 1);
            var date = new Date(weekStart.setDate(first));
            var weekname = weekday[date.getDay() === 0 ? 0 : date.getDay()];
            var day = this.getDateFormate(new Date(date)).slice(0, 10);
            // var dayValue = date.toISOString().slice(8, 10);
            var dayValue = this.getDateFormate(new Date(date)).slice(8, 10);
            var obj = { date: day, weekname: weekname, day: dayValue, dateValue: new Date(day) }
            this.week.push(obj)
          }
          this.schedulingData();
        } else {
          var now = new Date();
          var startDay = parseInt(this.scheduleStartDay); //0=sunday, 1=monday etc.
          var d = now.getDay(); //get the current day
          var weekStart = new Date(now.valueOf() - (d <= 0 ? 7 - startDay : d - startDay) * 86400000 - 7 * 86400000); //rewind to start day
          if (d === 0) {
            weekStart = new Date(now.valueOf() - (d <= 0 ? 7 - startDay : d - startDay) * 86400000);
          } else if ((d - startDay) === 0) {
            weekStart = new Date(now.valueOf() - 0); //rewind to start day
          }
          var weekEnd = new Date(weekStart.valueOf() + 6 * 86400000)
          for (let i = 0; i <= 6; i++) {
            var first = weekStart.getDate() + (i == 0 ? 0 : 1);
            var date = new Date(weekStart.setDate(first));
            var weekname = weekday[date.getDay() === 0 ? 0 : date.getDay()];
            var day = this.getDateFormate(new Date(date)).slice(0, 10);
            var dayValue = this.getDateFormate(new Date(date)).slice(8, 10);
            var obj = { date: day, weekname: weekname, day: dayValue, dateValue: new Date(day) }
            this.week.push(obj)
          }
          this.schedulingData();
        }
      } else {
        var now = new Date();
        var startDay = parseInt(this.scheduleStartDay); //0=sunday, 1=monday etc.
        var d = now.getDay(); //get the current day
        var weekStart = new Date(now.valueOf() - (d <= 0 ? 7 - startDay : d - startDay) * 86400000 - 7 * 86400000); //rewind to start day
        if (d === 0) {
          weekStart = new Date(now.valueOf() - (d <= 0 ? 7 - startDay : d - startDay) * 86400000);
        } else if ((d - startDay) === 0) {
          weekStart = new Date(now.valueOf() - 0); //rewind to start day
        }
        var weekEnd = new Date(weekStart.valueOf() + 6 * 86400000)
        for (let i = 0; i <= 6; i++) {
          var first = weekStart.getDate() + (i == 0 ? 0 : 1);
          var date = new Date(weekStart.setDate(first));
          var weekname = weekday[date.getDay() === 0 ? 0 : date.getDay()];
          var day = this.getDateFormate(new Date(date)).slice(0, 10);
          var dayValue = this.getDateFormate(new Date(date)).slice(8, 10);
          var obj = { date: day, weekname: weekname, day: dayValue, dateValue: new Date(day) }
          this.week.push(obj)
        }
        this.schedulingData();
      }
    });
    console.log(this.week);
  }


  getCurrentMonth(date) {
    this.month = [];

    var date;
    if (date === null) {
      date = new Date()
    } else {
      date = date;
    }
    var month = date.getMonth() + 1;
    date.setDate(1);
    var all_days = [];
    var currentDate = moment();
    while (date.getMonth() + 1 == month) {
      var daysObject = new Object();
      daysObject['d'] = date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');
      daysObject['day'] = (date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString()).slice(8, 10);
      daysObject['dayNo'] = moment(date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0')).format("dddd");
      daysObject['dateValue'] = new Date(date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0'));
      all_days.push(daysObject);
      this.month.push(daysObject);
      date.setDate(date.getDate() + 1);
    }
    console.log(all_days);
  }

  onOptionsSelected() {
    this.schedulingData();
  }

  getDateFormate(d) {
    let date = d;
    if (d !== undefined || d != null) {
      var month = (d.getMonth() + 1).toString().padStart(2, 0);
      date = d.getFullYear() + '-' + month + '-' + d.getDate().toString().padStart(2, 0);
    }
    return date;
  }

  getStoreLocationList() {
    // tslint:disable-next-line:max-line-length
    this.dataService.getData(`StoreLocation/getByCompanyId/${Number(this.userInfo.companyId)}/${this.userInfo.userName}`)
      .subscribe((response) => {
        this.storeLocationList = response;
        this.storeLocationID = this.storeLocationList[0].storeLocationID;
        this.generateDayColumn();
        this.getCurrentWeekValue();
        if (this.userInfo.roleName === this.constants.roleName) {
          this.roleId = 3;
          this.roleName = 'Company Admin';
        }
        if (this.userInfo.roleName.toLowerCase() === 'companyadmin') {
          this.roleId = 2;
          this.roleName = 'Store Manager';
        }
        if (this.userInfo.roleName.toLowerCase() === 'storemanager') {
          this.roleId = 1;
          this.roleName = 'Cashier';
        }
        this.getEmployeeNameList();
        this.weekCol = this.getCurrentWeek();
        this.getCurrentMonth(null);
      }, (error) => {
        console.log(error);
      });
  }

  bindStoreLocationId() {
    this.generateDayColumn();
    this.getCurrentWeekValue();
    this.userInfo = this.constants.getUserInfo();
    if (this.userInfo.roleName === this.constants.roleName) {
      this.roleId = 3;
      this.roleName = 'Company Admin';
    }
    if (this.userInfo.roleName.toLowerCase() === 'companyadmin') {
      this.roleId = 2;
      this.roleName = 'Store Manager';
    }
    if (this.userInfo.roleName.toLowerCase() === 'storemanager') {
      this.roleId = 1;
      this.roleName = 'Cashier';
    }
    this.getEmployeeNameList();
    this.weekCol = this.getCurrentWeek();
    this.getCurrentMonth(null);
  }
}

