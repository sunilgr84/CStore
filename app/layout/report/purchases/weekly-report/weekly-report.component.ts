import { Component, OnInit } from '@angular/core';
import { SetupService } from '@shared/services/setupService/setup-service';
import { DatePipe } from '@angular/common';
import { StoreService } from '@shared/services/store/store.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { FormBuilder } from '@angular/forms';
import { UtilityService } from '@shared/services/utility/utility.service';
import { ReportService } from '@shared/services/report/report.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment';
import { PDFGenrateService } from '@shared/services/pdf-genrate/pdf-genrate.service';
import * as _ from 'lodash';
import { ExcelModel } from '@models/excel-data-model';
import { ExcelGeneratedService } from '@shared/services/excelGenerate/excel-generated.service';
import { ReportGridService } from '@shared/services/report/report-grid.service';

@Component({
  selector: 'app-weekly-report',
  templateUrl: './weekly-report.component.html',
  styleUrls: ['./weekly-report.component.scss']
})
export class WeeklyReportComponent implements OnInit {
  isShowDepartmentType = false;
  storeLocationList: any;
  departmentTypeList: any;
  userInfo = this.constantsService.getUserInfo();
  currentDate = this.pipe.transform(new Date(), 'MM-dd-yyyy');
  rowData: any;
  _startDate = moment().subtract(7, 'days').format('MM-DD-YYYY');
  _endDate = moment().format('MM-DD-YYYY');
  weeklyReportForm = this.fb.group({
    startDate: this._startDate,
    endDate: this._endDate,
    storeLocationIds: [''],
    companyID: [null],
    weeklyReportButtonClick: [''],
    departmentTypeID: [''],
  });
  body: any = [];
  colWidths: any = [];
  excelData: ExcelModel;
  isSingalStore: boolean;
  gridOption: any;
  selectedDateRange:any;
  constructor(private setupService: SetupService, private pipe: DatePipe, private storeService: StoreService,
    private fb: FormBuilder, private constantsService: ConstantService, private spinner: NgxSpinnerService,
    private toastr: ToastrService, private reportService: ReportService, private excelGeneratedService: ExcelGeneratedService
    , private pdfGeneratedService: PDFGenrateService, private reportGridService: ReportGridService,
    private utilityService: UtilityService) { }

  ngOnInit() {
    this.getStoreLocationList();
    this.getDepartmentTypeList();
  }

  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.weeklyReportForm.get('startDate').setValue(this.selectedDateRange.fDate);
    this._startDate = this.selectedDateRange.fDate;
    this.weeklyReportForm.get('endDate').setValue(this.selectedDateRange.tDate);
    this._endDate = this.selectedDateRange.tDate;
  }
  getStoreLocationList() {
    if (this.storeService.storeLocation) {
      this.storeLocationList = this.storeService.storeLocation;
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.storeLocationList = this.storeService.storeLocation;
      }, (error) => {
        console.log(error);
      });
    }
    // / this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName)
    // .subscribe(res => {
    //   if (res && res['statusCode']) {
    //     this.storeLocationList = [];
    //   }
    //   this.storeLocationList = res;
    this.isSingalStore = false;
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      this.isSingalStore = true;
      this.weeklyReportForm.get('storeLocationIds').setValue(this.storeLocationList[0].storeLocationID.toString());
    }
    // });
  }
  getDepartmentTypeList() {
    this.setupService.getData('DepartmentType/getAll').subscribe((res) => {
      if (res && res['statusCode']) {
        this.departmentTypeList = [];
      }
      this.departmentTypeList = res;
      this.departmentTypeList.forEach(function (element) {
        element.companyID = 0;
      });
    });
  }
  startDateChange(event) {
    if (event) {
      this.weeklyReportForm.get('startDate').setValue(event.formatedDate);
      this._startDate = event.formatedDate;
    }
  }
  endDateChange(event) {
    if (event) {
      this.weeklyReportForm.get('endDate').setValue(event.formatedDate);
      this._endDate = event.formatedDate;
      this.weeklyReportForm.get('startDate').setValue(moment(new Date(event.formatedDate)).subtract(7, 'days').format('MM-DD-YYYY'));
      this._startDate = this.weeklyReportForm.get('startDate').value;
    }
  }
  searchWeeklyReport() {
    this.body = [];
    this.colWidths = [];
    if (this.weeklyReportForm.value.weeklyReportButtonClick === '') {
      this.toastr.info('Please Select Report Type');
      return;
    }

    this.rowData = [];
    const storeLocationIdObj = this.isSingalStore ? this.weeklyReportForm.value.storeLocationIds :
      this.weeklyReportForm.value.storeLocationIds ?
        this.weeklyReportForm.value.storeLocationIds.map(x => x.storeLocationID).join(',') : '';
    const postData = {
      startDate: this.weeklyReportForm.value.startDate,
      endDate: this.weeklyReportForm.value.endDate,
      storeLocationIds: storeLocationIdObj,
      companyID: this.userInfo.companyId
    };
    /**
     * Weekly Sale Report
     */
    if (this.weeklyReportForm.value.weeklyReportButtonClick === 'weeklySaleReport') {
      this.spinner.show();
      this.setupService.postData('WeeklyReports/SalesReportsByWeeklys', postData)
        .subscribe(res => {
          this.spinner.hide();
          if (res && res['statusCode']) {
            this.rowData = [];
          } else {
            const arr = _.sortBy(res, [function (o) { return o.storename.toLowerCase(); }]);
            this.rowData = arr;
          }
          if (this.rowData === null || this.rowData.length === 0) {
            this.toastr.info('Data not found', 'warning');
            return;
          }
          this.gridHeader();

        }, err => {
          this.spinner.hide();
          console.log(err);
        });
    }

    /**
     * Weekly Purchase Report
     */
    if (this.weeklyReportForm.value.weeklyReportButtonClick === 'weeklyPurchaseReport') {
      // modifer Code line 99 To 132 Add Method PDFGenrate
      this.spinner.show();
      this.setupService.postData('WeeklyReports/PurchaseReportsByWeeklys', postData)
        .subscribe(res => {
          this.spinner.hide();
          if (res && res['statusCode']) {
            this.rowData = [];
          } else {
            const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
            this.rowData = arr;
          }
          if (this.rowData === null || this.rowData.length === 0) {
            this.toastr.info('Data not found', 'warning');
            return;
          }

          this.gridHeader();
        }, err => {
          this.spinner.hide();
          console.log(err);
        });
    }

    /**
     * Weekly Sale By Department Type Report
     */
    if (this.weeklyReportForm.value.weeklyReportButtonClick === 'weeklySaleByDepartmentTypeReport') {
      this.spinner.show();
      const departmentTypeObj = this.weeklyReportForm.value.departmentTypeID ?
        this.weeklyReportForm.value.departmentTypeID.map(x => x.departmentTypeID).join(',') : '';
      const postDataOfWeeklyReport = {
        startDate: this.weeklyReportForm.value.startDate,
        endDate: this.weeklyReportForm.value.endDate,
        storeLocation: storeLocationIdObj,
        departmentTypeID: departmentTypeObj
      };
      this.setupService.postData('WeeklyReports/DepartmentSalesReportByWeeklys', postDataOfWeeklyReport)
        .subscribe(res => {
          this.spinner.hide();
          if (res && res['statusCode']) {
            this.rowData = [];
          } else {
            const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
            this.rowData = arr;
          }
          if (this.rowData === null || this.rowData.length === 0) {
            this.toastr.info('Data not found', 'warning');
            return;
          }
          this.gridHeader();
        }, err => {
          this.spinner.hide();
          console.log(err);
        });
    }
  }

  weeklySaleReportClick() {
    this.isShowDepartmentType = false;
  }
  weeklySaleByDepartmentTypeReportClick() {
    this.isShowDepartmentType = true;
  }
  headRows() {
    if (this.weeklyReportForm.value.weeklyReportButtonClick === 'weeklySaleReport') {
      return this.reportService.getColumnDef(this.constantsService.reportTypes.weeklySaleReport);
    } else if (this.weeklyReportForm.value.weeklyReportButtonClick === 'weeklyPurchaseReport') {
      return this.reportService.getColumnDef(this.constantsService.reportTypes.weeklyPurchaseReport);
    } else if (this.weeklyReportForm.value.weeklyReportButtonClick === 'weeklySaleByDepartmentTypeReport') {
      return this.reportService.getColumnDef(this.constantsService.reportTypes.weeklySaleByDepartmentTypeReport);
    }
  }
  gridHeader() {
    if (this.weeklyReportForm.value.weeklyReportButtonClick === 'weeklySaleReport') {
      this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.weeklySaleReport);
    }
    if (this.weeklyReportForm.value.weeklyReportButtonClick === 'weeklyPurchaseReport') {
      this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.weeklyPurchaseReport);
    }
    if (this.weeklyReportForm.value.weeklyReportButtonClick === 'weeklySaleByDepartmentTypeReport') {
      this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.weeklySaleByDepartmentTypeReport);
    }
  }

  searchReport(isType) {
    let res = this.rowData;
    let rowData = [];
    /**
        * Weekly Sale Report
        */
    if (this.weeklyReportForm.value.weeklyReportButtonClick === 'weeklySaleReport') {
      const arr = _.sortBy(res, [function (o) { return o.storename.toLowerCase(); }]);
      const grouped = _.groupBy(arr, pet => pet.storename);
      const data = this.weeklyReportForm.value.storeLocationIds;
      const arrs = [];
      data.forEach(x => {
        if (grouped && grouped[x.storeName]) {
          arrs.push({
            storename: x.storeName, rowcolumn: '', currentWeek: '', previousWeek: '', netValue: '',
            isGroup: true
          });
          grouped[x.storeName].forEach(y => {
            arrs.push(y);
          });
        }
      });
      rowData = arrs;

      if (isType === 'pdf') {
        this.colWidths = [100, 100, 90, 90, 90];
        this.body.push([{ text: 'Store Name' }, { text: 'Type' },
        { text: 'Current Week' }, { text: 'Previous Week' }, { text: 'Net Value' }
        ]);

        // tslint:disable-next-line:prefer-const
        for (let key in rowData) {
          if (rowData.hasOwnProperty(key)) {
            let data = rowData[key];
            let fila = new Array();

            if (data.isGroup) {
              fila.push({
                text: data.storename.toString(), border: [false, false, false, false], bold: true,
                color: 'white', fillColor: 'black',
              });
              fila.push({
                text: '', border: [false, false, false, false], bold: true,
                color: 'white', fillColor: 'black',
              });
              fila.push({
                text: '', border: [false, false, false, false], bold: true,
                color: 'white', fillColor: 'black',
              });
              fila.push({
                text: '', border: [false, false, false, false], bold: true,
                color: 'white', fillColor: 'black',
              });
              fila.push({
                text: '', border: [false, false, false, false], bold: true,
                color: 'white', fillColor: 'black',
              });

              this.body.push(fila);
            } else {

              fila.push({ text: '', border: [false, false, false, false] });
              fila.push({ text: data.rowcolumn.toString(), border: [false, false, false, false] });
              fila.push({ text: data.currentWeek.toString(), border: [false, false, false, false], alignment: 'right' });
              fila.push({ text: data.previousWeek.toString(), border: [false, false, false, false], alignment: 'right' });
              fila.push({ text: data.netValue.toString(), border: [false, false, false, false], alignment: 'right' });
            }
            this.body.push(fila);
          }
        }
        this.pdfGeneratedService.PDFGenrate('Weekly Sale Report', this.colWidths, this.body,
          this._startDate, this._endDate);
        this.body = [];
        this.colWidths = [];
      }
      if (isType === 'excel') {
        this.excelData = new ExcelModel();
        this.excelData.header = this.headRows();
        let fila = new Array();
        for (let key in this.rowData) {
          if (this.rowData.hasOwnProperty(key)) {
            let data = this.rowData[key];
            const temp = [data.storeName.toString(), data.rowcolumn.toString()
              , data.currentWeek, data.previousWeek, data.netValue];
            fila.push(temp);
          }
        }
        this.excelData.data = fila;
        this.excelData.reportName = 'Weekly Sale Report';
        this.excelGeneratedService.generateExcel(this.excelData);
      }

    }

    /**
     * Weekly Purchase Report
     */
    if (this.weeklyReportForm.value.weeklyReportButtonClick === 'weeklyPurchaseReport') {
      const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
      const grouped = _.groupBy(arr, pet => pet.storeName);
      const data = this.weeklyReportForm.value.storeLocationIds;
      const arrs = [];
      data.forEach(x => {
        if (grouped && grouped[x.storeName]) {
          arrs.push({
            storeName: x.storeName, departType: '', currentWeek: '', previousWeek: '', netResult: '',
            isGroup: true
          });
          grouped[x.storeName].forEach(y => { arrs.push(y); });
        }
      });
      rowData = arrs;

      if (isType === 'pdf') {
        this.colWidths = [90, 95, 95, 95, 95];
        this.body.push([{ text: 'Store Name' }, { text: 'Department Type' },
        { text: 'Current Week' }, { text: 'Previous Week' }, { text: 'Difference' }
        ]);

        // tslint:disable-next-line:prefer-const
        for (let key in rowData) {
          if (rowData.hasOwnProperty(key)) {
            let data = rowData[key];
            let fila = new Array();
            if (data.isGroup) {
              fila.push({
                text: data.storeName.toString(), border: [false, false, false, false], bold: true,
                color: 'white', fillColor: 'black',
              });
              fila.push({
                text: '', border: [false, false, false, false], bold: true, color: 'white', fillColor: 'black',
              });
              fila.push({
                text: '', border: [false, false, false, false], bold: true, color: 'white', fillColor: 'black',
              });
              fila.push({
                text: '', border: [false, false, false, false], bold: true, color: 'white', fillColor: 'black',
              });
              fila.push({
                text: '', border: [false, false, false, false], bold: true, color: 'white', fillColor: 'black',
              });
              this.body.push(fila);
            } else {

              fila.push({ text: '', border: [false, false, false, false] });
              fila.push({ text: data.departType.toString(), border: [false, false, false, false] });
              fila.push({ text: data.currentWeek.toString(), border: [false, false, false, false], alignment: 'right' });
              fila.push({ text: data.previousWeek.toString(), border: [false, false, false, false], alignment: 'right' });
              fila.push({ text: data.netResult.toString(), border: [false, false, false, false], alignment: 'right' });
            } this.body.push(fila);
          }
        }
        this.pdfGeneratedService.PDFGenrate('Weekly Purchase Report', this.colWidths, this.body,
          this._startDate, this._endDate);
        this.body = [];
        this.colWidths = [];
      }
      if (isType === 'excel') {
        this.excelData = new ExcelModel();
        this.excelData.header = this.headRows();
        let fila = new Array();
        for (let key in this.rowData) {
          if (this.rowData.hasOwnProperty(key)) {
            let data = this.rowData[key];
            const temp = [data.storeName.toString(), data.departType.toString()
              , data.currentWeek, data.previousWeek, data.netResult];
            fila.push(temp);
          }
        }
        this.excelData.data = fila;
        this.excelData.reportName = 'Weekly Purchase Report';
        this.excelGeneratedService.generateExcel(this.excelData);
      }

    }

    /**
     * Weekly Sale By Department Type Report
     */
    if (this.weeklyReportForm.value.weeklyReportButtonClick === 'weeklySaleByDepartmentTypeReport') {
      const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
      const grouped = _.groupBy(arr, pet => pet.storeName);
      const data = this.weeklyReportForm.value.storeLocationIds;
      const arrs = [];
      data.forEach(x => {
        if (grouped && grouped[x.storeName]) {
          // const salesAmount = _.sumBy(grouped[x.storeName], 'salesAmount');
          arrs.push({
            storeName: x.storeName, departmentTypeName: '',
            status1: '', diff: '', salesAmount: '',
            isGroup: true
            // salesAmount: salesAmount,
          });
          grouped[x.storeName].forEach(y => { arrs.push(y); });
        }
      });
      rowData = arrs;

      if (isType === 'pdf') {
        this.colWidths = [90, 90, 90, 90, 90];
        this.body.push([{ text: 'Store Name' }, { text: 'Department Type ' },
        { text: 'Sales Amount' }, { text: 'Status' }, { text: 'Difference' }
        ]);

        // tslint:disable-next-line:prefer-const
        for (let key in rowData) {
          if (rowData.hasOwnProperty(key)) {
            let data = rowData[key];
            let fila = new Array();


            if (data.isGroup) {
              fila.push({
                text: data.storeName.toString(), border: [false, false, false, false], bold: true,
                color: 'white', fillColor: 'black',
              });
              fila.push({
                text: '', border: [false, false, false, false], bold: true,
                color: 'white', fillColor: 'black',
              });

              fila.push({
                text: this.utilityService.formatCurrency(data.salesAmount).toString(),
                border: [false, false, false, false], alignment: 'right', bold: true,
                color: 'white', fillColor: 'black',
              });
              fila.push({
                text: '', border: [false, false, false, false], bold: true, color: 'white', fillColor: 'black',
              });
              fila.push({
                text: '', border: [false, false, false, false], bold: true, color: 'white', fillColor: 'black',
              });
              this.body.push(fila);
            } else {
              fila.push({ text: '', border: [false, false, false, false] });
              fila.push({ text: data.departmentTypeName.toString(), border: [false, false, false, false] });
              fila.push({ text: data.salesAmount.toString(), border: [false, false, false, false], alignment: 'right' });
              fila.push({ text: data.status1.toString(), border: [false, false, false, false], alignment: 'right' });
              fila.push({ text: data.diff.toString(), border: [false, false, false, false], alignment: 'right' });
            } this.body.push(fila);
          }
        }
        this.pdfGeneratedService.PDFGenrate('Weekly Sale By Department', this.colWidths, this.body,
          this._startDate, this._endDate);
        this.body = [];
        this.colWidths = [];
      }
      if (isType === 'excel') {
        this.excelData = new ExcelModel();
        this.excelData.header = this.headRows();
        let fila = new Array();
        for (let key in this.rowData) {
          if (this.rowData.hasOwnProperty(key)) {
            let data = this.rowData[key];
            const temp = [data.storeName.toString(), data.departmentTypeName.toString()
              , data.salesAmount, data.status1, data.diff];
            fila.push(temp);
          }
        }
        this.excelData.data = fila;
        this.excelData.reportName = 'Weekly Sale By Department';
        this.excelGeneratedService.generateExcel(this.excelData);
      }

    }
  }
  onGridReady(params) {

  }
}
