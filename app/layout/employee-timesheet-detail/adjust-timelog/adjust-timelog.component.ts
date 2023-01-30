import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConstantService } from '@shared/services/constant/constant.service';
import { GridService } from '@shared/services/grid/grid.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ColumnApi, GridApi } from 'ag-grid-community';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { element } from 'protractor';

@Component({
  selector: 'app-adjust-timelog',
  templateUrl: './adjust-timelog.component.html',
  styleUrls: ['./adjust-timelog.component.scss']
})
export class AdjustTimelogComponent implements OnInit {

  userInfo: any;
  rowdata = [];
  adjustemployeeTimesheetDetail: any;
  date = moment().format('YYYY-MM-DD');
  dateValueFrom = null;
  columnDefs: any;
  filterText: string;
  gridApi: GridApi;
  columnApi: ColumnApi;
  addEmployeeId = null;
  storeLocationID = 0;
  constructor(public dialogRef: MatDialogRef<AdjustTimelogComponent>, private spinner: NgxSpinnerService, private dataService: SetupService,
    private toastr: ToastrService, @Inject(MAT_DIALOG_DATA) public data,
    private constants: ConstantService, private gridService: GridService) {
    this.adjustemployeeTimesheetDetail = this.gridService.getGridOption(this.constants.gridTypes.adjustemployeeTimesheetDetail);
    this.dateValueFrom = this.data ? this.data.dateValue ? moment(this.data.dateValue).format('YYYY-MM-DD') : this.date : this.date;
    this.addEmployeeId = this.data ? this.data.addEmployeeId : this.userInfo.userName;
    this.storeLocationID = this.data ? this.data.storeLocationIDValue : 0;
  }

  ngOnInit() {
    this.userInfo = this.constants.getUserInfo();
    this.columnDefs = this.adjustemployeeTimesheetDetail.columnDefs;
    this.getTimelog();
  }

  closeModal() {
    this.dialogRef.close();
  }

  getTimelog() {
    var storeLocationId = this.storeLocationID;
    this.spinner.show();
    this.dataService.getData('EmployeeTimeTracking/' + this.addEmployeeId + '/' + this.dateValueFrom + '/' + storeLocationId + '/' + moment(new Date()).format('HH:mm'), null, true).subscribe(
      (response) => {
        this.spinner.hide();
        if (response) {
          response.forEach(element1 => {
            if(element1.listEmployeeTracking !== null)
            element1.listEmployeeTracking.forEach(element => {
              element['date'] = this.dateValueFrom;
              element['employeeName'] = this.addEmployeeId;
            });
          });
          this.rowdata = response;
        } else {
          this.rowdata = [];
        }
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }

  onFilterTextBoxChanged() {
    this.adjustemployeeTimesheetDetail.setQuickFilter(this.filterText);
  }

  rejectEmployeeAction(params) {
    this.dialogRef.close();
    this.spinner.show();
    this.dataService.deleteData('EmployeeTimeTracking/' + params.data.employeeTimeTrackingId).subscribe(
      (response: any) => {
        this.spinner.hide();
        if (response === '1') {
          this.toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.success);
          this.closeModal();
          this.ngOnInit();
        } else {
          this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.contactAdmin);
      });
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    params.api.sizeColumnsToFit();
  }

}
