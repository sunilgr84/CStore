import { Component, OnInit } from '@angular/core';
import { StoreService } from '@shared/services/store/store.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UtilityService } from '@shared/services/utility/utility.service';
import { PDFGenrateService } from '@shared/services/pdf-genrate/pdf-genrate.service';
import { FormBuilder } from '@angular/forms';
import * as moment from 'moment';
import { ExcelModel } from '@models/excel-data-model';
import { ExcelGeneratedService } from '@shared/services/excelGenerate/excel-generated.service';
import { ReportGridService } from '@shared/services/report/report-grid.service';
import * as _ from 'lodash';
@Component({
  selector: 'app-sales-comparision-year-ago-report',
  templateUrl: './sales-comparision-year-ago-report.component.html',
  styleUrls: ['./sales-comparision-year-ago-report.component.scss']
})
export class SalesComparisionYearAgoReportComponent implements OnInit {

  businessDate = moment().format('MM-DD-YYYY');
  salesComparisionYearSearchForm = this.formBuilder.group({
    date: this.businessDate,
    storelocationID: [''],
    shiftWiseValue: [0]
  });
  userInfo = this.constantsService.getUserInfo();
  body: any = [];
  colWidths: any = [];
  rowData: any;
  storeLocationList: any[];
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
      this.salesComparisionYearSearchForm.get('storelocationID').setValue(this.storeLocationList[0].storeLocationID);
    }
  }
  dateChange(event, controls) {
    if (controls === 'businessDate') {
      this.salesComparisionYearSearchForm.get('date').setValue(event.formatedDate);
      this.businessDate = event.formatedDate;
    }
  }
  generatePDF() {

    // const constStoreLocationIds = this.salesComparisionYearSearchForm.value.storelocationID ?
    //  this.salesComparisionYearSearchForm.value.storelocationID.map(x => x).join(',') : '';

    const postData = {
      ...this.salesComparisionYearSearchForm.value,
      storelocationID: this.salesComparisionYearSearchForm.value.storelocationID.toString(),
    };
    this.spinner.show();
    this.setupService.postData('Common/SalesComparisonByYears', postData).subscribe((res) => {
      this.spinner.hide();
      if (res && res['statusCode']) {
        this.rowData = [];
        this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
        return;
      } else {
        // const arr = _.sortBy(res, [function (o) { return o.storename.toLowerCase(); }]);
        // this.rowData = arr;
        this.gridHeader();
        this.rowData = res;
      }
      if (this.rowData === null || this.rowData.length === 0) {
        this.toastr.info('Data not found', 'warning');
        return;
      }
    }, (error) => {
      this.spinner.hide();
      console.log(error);
      this.rowData = [];
    });
  }
  searchSalesCompReport(params) {

    if (params === 'pdf') {
      this.colWidths = ['*', '*', '*', '*', '*', '*'];
      this.body.push([{ text: 'Department Description' }, { text: 'Department Type' }, { text: 'Business Date' },
      { text: 'Comapred Date' }, { text: 'Dated Sales Qty' }, { text: 'Compared Sales Qty' }]);

      for (const key in this.rowData) {
        if (this.rowData.hasOwnProperty(key)) {
          const data = this.rowData[key];
          const fila = new Array();
          fila.push({ text: data.departmentDescription.toString(), border: [false, false, false, false] });
          fila.push({ text: data.departmentType.toString(), border: [false, false, false, false] });
          fila.push({ text: this.utilityService.formatDate(data.businessDate).toString(), border: [false, false, false, false] });
          fila.push({ text: this.utilityService.formatDate(data.comapredDate).toString(), border: [false, false, false, false] });

          fila.push({ text: data.datedSalesQty.toString(), border: [false, false, false, false] });
          fila.push({ text: data.comparedSalesQty.toString(), border: [false, false, false, false] });
          this.body.push(fila);
        }
      }
      this.pdfGenrateService.PDFGenrate('Sales Comparision Year Ago Report', this.colWidths,
        this.body, this.salesComparisionYearSearchForm.value.startDate, this.salesComparisionYearSearchForm.value.endDate);
      this.body = this.colWidths = [];
    }
    if (params === 'excel') {
      const excelData = new ExcelModel();
      excelData.header = ['Department Description', 'Department Type', 'Business Date',
        'Comapred Date', 'Dated Sales Qty', 'Compared Sales Qty'];
      let fila = new Array();
      for (let key in this.rowData) {
        if (this.rowData.hasOwnProperty(key)) {
          let data = this.rowData[key];
          const temp = [
            data.departmentDescription.toString(),
            data.departmentType.toString(),
            this.utilityService.formatDate(data.businessDate).toString(),
            this.utilityService.formatDate(data.comapredDate).toString(),

            data.datedSalesQty.toString(),
            data.comparedSalesQty.toString(),
          ];
          fila.push(temp);
        }
      }
      excelData.data = fila;
      excelData.reportName = 'Sales Comparision Year Ago Report';
      this.excelGeneratedService.generateExcel(excelData);
    }
  }
  gridHeader() {
    this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.salesComparisionYearAgoReport);
  }
  onGridReady(params) { }
}
