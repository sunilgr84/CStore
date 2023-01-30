import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-weekly-report',
  templateUrl: './weekly-report.component.html',
  styleUrls: ['./weekly-report.component.scss']
})
export class WeeklyReportComponent implements OnInit {
  isShowDepartmentType: boolean;
  inputDOB: any;
  LocationList: any;
  selectedDateRange:any;
  startDate:any;
  endDate:any;
  constructor() { }

  ngOnInit() {
  }
  weeklySaleByDepartmentTypeReportClick() {
    this.isShowDepartmentType = true;
  }
  weeklyReportClick() {
    this.isShowDepartmentType = false;
  }

  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.startDate = this.selectedDateRange.fDate;
    this.endDate = this.selectedDateRange.tDate;
  }
}
