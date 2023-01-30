import { Component, OnInit } from '@angular/core';
import { SetupService } from '@shared/services/setupService/setup-service';
import { FormBuilder } from '@angular/forms';
import { StoreService } from '@shared/services/store/store.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import * as jspdf from 'jspdf';
import { ReportService } from '@shared/services/report/report.service';
import { UtilityService } from '@shared/services/utility/utility.service';
import * as moment from 'moment';
import { PDFGenrateService } from '@shared/services/pdf-genrate/pdf-genrate.service';
import { ExcelModel } from '@models/excel-data-model';
import { ExcelGeneratedService } from '@shared/services/excelGenerate/excel-generated.service';
import { ReportGridService } from '@shared/services/report/report-grid.service';
import * as _ from 'lodash';
@Component({
  selector: 'app-invoice-status-report',
  templateUrl: './invoice-status-report.component.html',
  styleUrls: ['./invoice-status-report.component.scss']
})
export class InvoiceStatusReportComponent implements OnInit {

  inputDOB = new Date();
  storeLocationList: any;
  userInfo = this.constantsService.getUserInfo();
  currentDate = this.pipe.transform(new Date(), 'MM-dd-yyyy');
  rowData: any;
  _startDate = moment().format('MM-DD-YYYY');
  _endDate = moment().format('MM-DD-YYYY');
  invoiceStatusReportForm = this.fb.group({
    startDate: this._startDate,
    endDate: this._endDate,
    storeLocationID: [''],
    invoiceStatusReport: [''],
  });
  isStoreLocationLoading = true;
  body: any = [];
  colWidths: any = [];
  isSingalStore: boolean;
  gridOption: any;
  columnApi: any;
  gridApi: any;
  selectedDateRange: any;
  constructor(private setupService: SetupService, private pipe: DatePipe, private storeService: StoreService,
    private fb: FormBuilder, private constantsService: ConstantService, private spinner: NgxSpinnerService,
    private toastr: ToastrService, private reportService: ReportService, private utilityService: UtilityService,
    private pdfGenrateService: PDFGenrateService, private excelGeneratedService: ExcelGeneratedService,
    private reportGridService: ReportGridService) { }

  ngOnInit() {
    this.getStoreLocationList();
  }
  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.invoiceStatusReportForm.get('startDate').setValue(this.selectedDateRange.fDate);
    this._startDate = this.selectedDateRange.fDate;
    this.invoiceStatusReportForm.get('endDate').setValue(this.selectedDateRange.tDate);
    this._endDate = this.selectedDateRange.tDate;
  }
  getStoreLocationList() {
    //  this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName)
    // .subscribe(res => {
    //   if (res && res['statusCode']) {
    //     this.storeLocationList = [];
    //   }
    //   this.storeLocationList = res;
    // });
    if (this.storeService.storeLocation) {
      this.storeLocationList = this.storeService.storeLocation;
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.storeLocationList = this.storeService.storeLocation;
      }, (error) => {
        console.log(error);
      });
    }
    this.isStoreLocationLoading = false;
    this.isSingalStore = false;
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      this.isSingalStore = true;
      this.invoiceStatusReportForm.get('storeLocationID').setValue(this.storeLocationList[0].storeLocationID.toString());
    }
  }
  startDateChange(event) {
    if (event) {
      this.invoiceStatusReportForm.get('startDate').setValue(event.formatedDate);
      this._startDate = event.formatedDate;
    }
  }
  endDateChange(event) {
    if (event) {
      this.invoiceStatusReportForm.get('endDate').setValue(event.formatedDate);
      this._endDate = event.formatedDate;
    }
  }
  searchInvoiceStatusReport() {
    if (this.invoiceStatusReportForm.value.invoiceStatusReport === '') {
      this.toastr.info('Please Select Report Type');
      return;
    }
    this.rowData = [];
    const storeLocationIdObj = this.isSingalStore ? this.invoiceStatusReportForm.value.storeLocationID :
      this.invoiceStatusReportForm.value.storeLocationID ?
        this.invoiceStatusReportForm.value.storeLocationID.map(x => x.storeLocationID).join(',') : '';
    const postData = {
      startDate: this.invoiceStatusReportForm.value.startDate,
      endDate: this.invoiceStatusReportForm.value.endDate,
      storeLocationID: storeLocationIdObj,
    };

    /**
     * Invoice Status Report
     */
    if (this.invoiceStatusReportForm.value.invoiceStatusReport === 'invoiceStatusReport') {
      this.spinner.show();
      this.setupService.postData('InvoiceStatusReports/InvoiceStatusReports', postData).subscribe(res => {
        this.spinner.hide();
        if (res && res['statusCode']) {
          this.rowData = [];
          this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
          return;
        } else {
          this.rowData = res;
        }
        if (this.rowData === null || this.rowData.length === 0) {
          this.toastr.info('Data not found', 'warning');
          return;
        }
        const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
        this.gridHeader();
        this.rowData = arr;
      }, err => {
        this.spinner.hide();
        console.log(err);
      });
    } else

      /**
       * Invoice Status Detail Report
       */
      if (this.invoiceStatusReportForm.value.invoiceStatusReport === 'invoiceStatusDetailReport') {
        this.spinner.show();
        this.setupService.postData('InvoiceStatusReports/InvoiceStatusDetailReports', postData).subscribe(res => {
          this.spinner.hide();
          if (res && res['statusCode']) {
            this.rowData = [];
            this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
            return;
          } else {
            this.rowData = res;
          }
          if (this.rowData === null || this.rowData.length === 0) {
            this.toastr.info('Data not found', 'warning');
            return;
          }
          const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
          this.gridHeader();
          this.rowData = arr;
        }, err => {
          this.spinner.hide();
          console.log(err);
        });
      }
  }

  public captureScreen() {
    const doc = new jspdf('p', 'pt');
    const headerData = {
      reportName: this.invoiceStatusReportForm.value.invoiceStatusReport === 'invoiceStatusReport' ?
        'Invoice Status Report' : 'Invoice Status Report Details',
      fromDate: this.invoiceStatusReportForm.value.startDate, toDate: this.invoiceStatusReportForm.value.endDate
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
    if (this.invoiceStatusReportForm.value.invoiceStatusReport === 'invoiceStatusReport') {
      return this.reportService.getColumnDef(this.constantsService.reportTypes.PurchaseByInvoiceStatusReport);
    } else {
      return this.reportService.getColumnDef(this.constantsService.reportTypes.PurchaseByInvoiceStatusReportDetails);
    }
  }
  gridHeader() {
    if (this.invoiceStatusReportForm.value.invoiceStatusReport === 'invoiceStatusReport') {
      this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.PurchaseByInvoiceStatusReport);
      return true;
    } else {
      this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.PurchaseByInvoiceStatusReportDetails);
      return true;
    }
  }
  searchReport(params) {
    let res = this.rowData;
    let rowData = [];
    /**
       * Invoice Status Report
       */
    if (this.invoiceStatusReportForm.value.invoiceStatusReport === 'invoiceStatusReport') {
      const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
      const grouped = _.groupBy(arr, pet => pet.storeName);
      const data = this.invoiceStatusReportForm.value.storeLocationID;
      const arrs = [];
      data.forEach(x => {
        if (grouped && grouped[x.storeName]) {
          const totalInvoice = _.sumBy(grouped[x.storeName], 'totalInvoice');

          arrs.push({
            storeName: x.storeName, totalInvoice: totalInvoice.toFixed(0),
            invoiceDate: '', invoiceStatusDescription: '', isGroup: true
          });
          grouped[x.storeName].forEach(y => {
            arrs.push(y);
          });
        }
      });
      rowData = arrs;

      if (params === 'pdf') {
        this.colWidths = [150, 80, 80, 150];
        this.body.push([{ text: 'Store Name' }, { text: 'Invoice Date' },
        { text: 'Total Invoice' }, { text: 'Invoice Status Description' }]);

        for (const key in rowData) {
          if (rowData.hasOwnProperty(key)) {
            const data = rowData[key];
            const fila = new Array();
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
                text: data.totalInvoice.toString(),
                border: [false, false, false, false], bold: true,
                color: 'white', fillColor: 'black',
              });
              fila.push({
                text: '', border: [false, false, false, false], bold: true,
                color: 'white', fillColor: 'black',
              });
              this.body.push(fila);
            } else {
              fila.push({ text: '', border: [false, false, false, false] });
              fila.push({ text: this.utilityService.formatDate(data.invoiceDate).toString(), border: [false, false, false, false] });
              fila.push({ text: data.totalInvoice.toString(), border: [false, false, false, false] });
              fila.push({ text: data.invoiceStatusDescription.toString(), border: [false, false, false, false] });
            }
            this.body.push(fila);
          }
        }
        this.pdfGenrateService.PDFGenrate('Invoice Status Report', this.colWidths,
          this.body, this.invoiceStatusReportForm.value.startDate, this.invoiceStatusReportForm.value.endDate);
        this.body = this.colWidths = [];
        // this.rowData =
      }
      if (params === 'excel') {
        const excelData = new ExcelModel();
        excelData.header = this.headRows();
        let fila = new Array();
        for (let key in this.rowData) {
          if (this.rowData.hasOwnProperty(key)) {
            let data = this.rowData[key];
            const temp = [data.storeName.toString(), this.utilityService.formatDate(data.invoiceDate).toString()
              , data.totalInvoice, data.invoiceStatusDescription];
            fila.push(temp);
          }
        }
        excelData.data = fila;
        excelData.reportName = 'Invoice Status Report';
        this.excelGeneratedService.generateExcel(excelData);
      }

    } else

      /**
       * Invoice Status Detail Report
       */
      if (this.invoiceStatusReportForm.value.invoiceStatusReport === 'invoiceStatusDetailReport') {
        const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
        const grouped = _.groupBy(arr, pet => pet.storeName);
        const data = this.invoiceStatusReportForm.value.storeLocationID;
        const arrs = [];
        data.forEach(x => {
          if (grouped && grouped[x.storeName]) {

            arrs.push({
              storeName: x.storeName, invoiceNo: '', isEDIInvoice: '', actionDateTime: '', invoiceActionTypeName: '',
              invoiceDate: '', invoiceStatusDescription: '', invoiceCreatedDateTime: '', isGroup: true
            });
            grouped[x.storeName].forEach(y => {
              arrs.push(y);
            });
          }
        });
        rowData = arrs;

        if (params === 'pdf') {
          this.colWidths = [55, 50, 55, 50, 60, 30, 60, 50, 50];
          this.body.push([{ text: 'Store Name' }, { text: 'Invoice Date' },
          { text: 'Invoice Created Date Time' }, { text: 'Invoice No', }, { text: 'Vendor Name' },
          { text: 'EDI Invoice' }, { text: 'Status Change Date Time' }, { text: 'Invoice Status' },
          { text: 'Invoice Action Type Name' },
          ]);

          for (const key in rowData) {
            if (rowData.hasOwnProperty(key)) {
              const data = rowData[key];
              const fila = new Array();
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
                fila.push({ text: this.utilityService.formatDate(data.invoiceDate).toString(), border: [false, false, false, false] });
                fila.push({
                  text: this.utilityService.formatDateTime(data.invoiceCreatedDateTime).toString(),
                  border: [false, false, false, false]
                });
                fila.push({ text: data.invoiceNo.toString(), border: [false, false, false, false] });
                fila.push({ text: data.vendorName.toString(), border: [false, false, false, false] });
                fila.push({ text: data.isEDIInvoice.toString(), border: [false, false, false, false] });
                // tslint:disable-next-line:max-line-length
                fila.push({ text: this.utilityService.formatDateTime(data.actionDateTime).toString(), border: [false, false, false, false] });
                fila.push({ text: data.invoiceStatusDescription.toString(), border: [false, false, false, false] });
                fila.push({ text: data.invoiceActionTypeName.toString(), border: [false, false, false, false] });
              }
              this.body.push(fila);
            }
          }
          this.pdfGenrateService.PDFGenrate('Invoice Status Detail Report', this.colWidths,
            this.body, this.invoiceStatusReportForm.value.startDate, this.invoiceStatusReportForm.value.endDate);
          this.body = this.colWidths = [];
        }
        if (params === 'excel') {
          const excelData = new ExcelModel();
          excelData.header = this.headRows();
          let fila = new Array();
          for (let key in this.rowData) {
            if (this.rowData.hasOwnProperty(key)) {
              let data = this.rowData[key];
              const temp = [data.storeName.toString(), this.utilityService.formatDate(data.invoiceDate).toString()
                , this.utilityService.formatDateTime(data.invoiceCreatedDateTime).toString()
                , data.invoiceNo, data.vendorName, data.isEDIInvoice, this.utilityService.formatDateTime(data.actionDateTime).toString()
                , data.invoiceStatusDescription, data.invoiceActionTypeName];
              fila.push(temp);
            }
          }
          excelData.data = fila;
          excelData.reportName = 'Invoice Status Detail Report';
          this.excelGeneratedService.generateExcel(excelData);
        }

      }
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }
}
