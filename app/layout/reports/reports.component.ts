import { Component, OnInit } from '@angular/core';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import * as moment from 'moment';
// const image2base64 = require('image-to-base64');
import { UtilityService } from '@shared/services/utility/utility.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { ReportService } from '@shared/services/report/report.service';
declare const $;
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  pdfUrl: any;
  isShowDepartmentType = false;
  LocationList: any;
  departmentTypeList: any;
  inputDate = moment().format('MM-DD-YYYY');
  userInfo = this.consts.getUserInfo();
  rowData = [];
  formControl = {
    isReport: false, storeNames: null, departmentTypeIds: null,
    formDate: this.inputDate
    , toDate: this.inputDate
  };
  constructor(private utilityService: UtilityService, private setupService: SetupService
    , private consts: ConstantService, private reportService: ReportService) { }

  ngOnInit() {
  }
  weeklySaleReportClick() {
    this.isShowDepartmentType = false;
  }
  weeklySaleByDepartmentTypeReportClick() {
    this.isShowDepartmentType = true;
  }

  public captureScreen() {
    const doc = new jspdf('p', 'pt');
    const headerData = {
      reportName: 'Weekly Purchase Report',
      fromDate: this.formControl.formDate, toDate: this.formControl.toDate
    };
    doc.autoTable({
      //  html: '#my-table',
      head: this.headRows(),
      body: this.rowData,
      didDrawCell: (event) => {
        this.utilityService.pageHeaderFooter(doc, headerData, event);
      },
      margin: { top: 120 }
    });
    const iframe = document.getElementById('iframePDF');
    iframe['src'] = doc.output('dataurlstring');
    // doc.output('dataurlnewwindow');
    // doc.save('table.pdf');
  }
  headRows() {
    return this.reportService.getColumnDef(this.consts.reportTypes.PurchaseReportsByWeeklys);
  }
  PurchaseReportsByWeeklys() {
    // storeLocationIds pass comma separated ,
    const postData = {
      storeLocationIds: '94',
      companyID: this.userInfo.companyId,
      startDate: this.formControl.formDate,
      endDate: this.formControl.toDate
    };
    this.setupService.postData('WeeklyReports/PurchaseReportsByWeeklys', postData).subscribe(
      (response) => {
        this.rowData = response;
        this.captureScreen();
      }
    );
  }
  dateChange(event, controls) {
    if (controls === 'formDate') {
      this.formControl.formDate = event.formatedDate;
    }
    if (controls === 'toDate') {
      this.formControl.toDate = event.formatedDate;
    }
    this.inputDate = event.formatedDate;
  }
}
