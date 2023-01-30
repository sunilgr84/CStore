import { Component, OnInit } from '@angular/core';
import { StoreService } from '@shared/services/store/store.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { FormBuilder } from '@angular/forms';
import { PDFGenrateService } from '@shared/services/pdf-genrate/pdf-genrate.service';
import { UtilityService } from '@shared/services/utility/utility.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { SetupService } from '@shared/services/setupService/setup-service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { ExcelGeneratedService } from '@shared/services/excelGenerate/excel-generated.service';
import { ExcelModel } from '@models/excel-data-model';
import { ReportGridService } from '@shared/services/report/report-grid.service';


@Component({
  selector: 'app-sales-comparison-report',
  templateUrl: './sales-comparison-report.component.html',
  styleUrls: ['./sales-comparison-report.component.scss']
})
export class SalesComparisonReportComponent implements OnInit {

  startDate = moment().format('MM-DD-YYYY');
  endDate = moment().format('MM-DD-YYYY');
  salesComparisonForm = this.formBuilder.group({
    storeLocation: [''],
    period: [0],
    startDate: this.startDate,
    endDate: this.endDate
  });
  userInfo = this.constantsService.getUserInfo();
  body: any = [];
  colWidths: any = [];
  rowData: any;
  storeLocationList: any[];
  selectedDateRange:any;
  shiftList = [
    { name: 'Day Close', value: 0 },
    { name: 'Shift 1', value: 1 },
    { name: 'Shift 2', value: 2 },
    { name: 'Shift 3', value: 3 },
  ];
  gridOption: any;
  constructor(private storeService: StoreService, private constantsService: ConstantService,
    private setupService: SetupService, private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService, private pdfGenrateService: PDFGenrateService,
    private toastr: ToastrService, private utilityService: UtilityService,
    private excelGeneratedService: ExcelGeneratedService, private reportGridService: ReportGridService) { }

  ngOnInit() {
    this.getStoreLocationList();
  }

  getStoreLocationList() {
    if (this.storeService.storeLocation) {
      this.storeLocationList = this.storeService.storeLocation;
      this.setLocationId();
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.storeLocationList = this.storeService.storeLocation;
        this.setLocationId();
      }, (error) => {
        console.log(error);
      });
    }

  }
  setLocationId() {
    if (this.storeLocationList.length === 1) {
      this.salesComparisonForm.get('storeLocation').setValue(this.storeLocationList);
    }
  }
  dateChange(event, controls) {
    if (controls === 'startDate') {
      this.salesComparisonForm.get('startDate').setValue(event.formatedDate);
      this.startDate = event.formatedDate;
    }
    if (controls === 'endDate') {
      this.salesComparisonForm.get('endDate').setValue(event.formatedDate);
      this.endDate = event.formatedDate;
    }
  }
  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.salesComparisonForm.get('startDate').setValue(this.selectedDateRange.fDate);
    this.startDate = this.selectedDateRange.fDate;
    this.salesComparisonForm.get('endDate').setValue(this.selectedDateRange.tDate);
    this.endDate = this.selectedDateRange.tDate;
  }

  generatePDF() {
    const constStoreLocationIds = this.salesComparisonForm.value.storeLocation ?
      this.salesComparisonForm.value.storeLocation.map(x => x.storeLocationID).join(',') : '';
    const constPeriod = this.salesComparisonForm.value.period ?
      this.salesComparisonForm.value.period : 0;

    const postData = {
      ...this.salesComparisonForm.value,
      storeLocation: constStoreLocationIds,
      period: constPeriod,
    };
    this.spinner.show();
    this.setupService.postData('Common/SalesComparisonReports', postData).subscribe((res) => {
      this.spinner.hide();
      if (res && res['statusCode']) {
        this.rowData = [];
        this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
        return;
      } else {
        const arr = _.sortBy(res, [function (o) { return o.storename.toLowerCase(); }]);
        this.rowData = arr;
      }
      if (this.rowData === null || this.rowData.length === 0) {
       // this.toastr.info('Data not found', 'warning');
        return;
      }
      this.gridHeader();
    }, (error) => {
      this.spinner.hide();
      console.log(error);
      this.rowData = [];
    });
  }
  searchSalesCompReport(params) {
    let res = this.rowData;
    let rowData = [];

    const arr = _.sortBy(res, [function (o) { return o.storename.toLowerCase(); }]);
    const grouped = _.groupBy(arr, pet => pet.storeName);
    const data = this.salesComparisonForm.value.storeLocation;
    const arrs = [];
    data.forEach(x => {
      if (grouped && grouped[x.storename]) {
        arrs.push({
          storename: x.storeName, tag: '', rowcolumn: '', period: '', currentWeek: '',
          previousWeek: '', netValue: '', percentChange: '',
          isGroup: true
        });
        grouped[x.storename].forEach(y => {
          arrs.push(y);
        });
      }
    });
    rowData = arrs;


    if (params === 'pdf') {
      this.colWidths = [60, 60, 65, 40, 55, 65, 55, 55];
      this.body.push([{ text: 'Store Name' }, { text: 'Tag' }, { text: 'Department' },
      { text: 'Period' }, { text: 'Current Week' }, { text: 'Previous Week' },
      { text: 'Net Value' }, { text: 'Percent Change' },
      ]);

      for (const key in rowData) {
        if (rowData.hasOwnProperty(key)) {
          const data = rowData[key];
          const fila = new Array();
          if (data.isGroup) {
            fila.push({
              text: data.storename.toString(), border: [false, false, false, false], bold: true,
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
            fila.push({ text: data.tag.toString(), border: [false, false, false, false] });

            fila.push({ text: data.rowcolumn.toString(), border: [false, false, false, false] });
            fila.push({ text: data.period.toString(), border: [false, false, false, false] });
            fila.push({ text: data.currentWeek.toString(), border: [false, false, false, false] });

            fila.push({ text: data.previousWeek.toString(), border: [false, false, false, false] });
            fila.push({ text: data.netValue.toString(), border: [false, false, false, false] });
            fila.push({ text: data.percentChange.toString(), border: [false, false, false, false] });
          }
          this.body.push(fila);
        }
      }
      this.pdfGenrateService.PDFGenrate('Sales Comparison Report', this.colWidths,
        this.body, this.salesComparisonForm.value.startDate, this.salesComparisonForm.value.endDate);
      this.body = this.colWidths = [];
    }
    if (params === 'excel') {
      const excelData = new ExcelModel();
      excelData.header = ['Store Name', 'Tag', 'Row Column',
        'Period', 'Current Week', 'Previous Week', 'Net Value', 'Percent Change'];
      let fila = new Array();
      for (let key in this.rowData) {
        if (this.rowData.hasOwnProperty(key)) {
          let data = this.rowData[key];
          const temp = [
            data.storename.toString(),
            data.tag.toString(),
            data.rowcolumn.toString(),
            data.period.toString(),
            data.currentWeek.toString(),
            data.previousWeek.toString(),
            data.netValue.toString(),
            data.percentChange.toString(),

          ];
          fila.push(temp);
        }
      }
      excelData.data = fila;
      excelData.reportName = 'Sales Comparison Report';
      this.excelGeneratedService.generateExcel(excelData);
    }
  }

  gridHeader() {
    this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.SalesComparisonReport);
  }
  onGridReady(params) { }
}
