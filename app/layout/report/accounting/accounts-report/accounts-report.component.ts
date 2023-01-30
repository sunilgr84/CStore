import { Component, OnInit } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { StoreService } from '@shared/services/store/store.service';
import { UtilityService } from '@shared/services/utility/utility.service';
import { ReportService } from '@shared/services/report/report.service';
import { FormBuilder } from '@angular/forms';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import * as jspdf from 'jspdf';
import { PDFGenrateService } from '@shared/services/pdf-genrate/pdf-genrate.service';
import * as _ from 'lodash';
import { ExcelModel } from '@models/excel-data-model';
import { ExcelGeneratedService } from '@shared/services/excelGenerate/excel-generated.service';
import { TestService } from '@shared/services/test/test.service';
import { ReportGridService } from '@shared/services/report/report-grid.service';
import { GridOptions } from 'ag-grid-community';

@Component({
  selector: 'app-accounts-report',
  templateUrl: './accounts-report.component.html',
  styleUrls: ['./accounts-report.component.scss']
})
export class AccountsReportComponent implements OnInit {
  isShowOrderBy: boolean;
  isShowPriceGroup: boolean;
  isShowVendor: boolean;
  isShowDepartment = true;
  inputDOB: any;
  LocationList: any;
  reportRowData: any;
  storeLocationList: any[] = [];
  vendorList: any;
  departmentList: any;
  priceGroupList: any;
  selectedDateRange: any;
  startDate = moment().format('MM-DD-YYYY');
  endDate = moment().format('MM-DD-YYYY');
  userInfo = this.constantsService.getUserInfo();
  accountingReportForm = this.fb.group({
    storeLocation: '',
    accountingReport: '',
    startDate: this.startDate,
    endDate: this.endDate,
    departmentIDs: '', vendor: '', groupID: '', orderBy: '',
  });
  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.startDate = this.selectedDateRange.fDate;
    this.endDate = this.selectedDateRange.tDate;
    this.accountingReportForm.get('startDate').setValue(this.selectedDateRange.fDate);
    this.accountingReportForm.get('endDate').setValue(this.selectedDateRange.tDate);
  }
  body: any = [];
  colWidths: any = [];
  orderByList = [
    { name: 'None', value: 'None' },
    { name: 'Top Selling Items', value: 'Top Selling Items' },
    { name: 'Least Selling Items', value: 'Selling Items' },

  ];
  gridApi: any;
  columnApi: any;
  gridOption: GridOptions;
  filterText = '';
  isStoreLoading = true;
  columnDefs: any;
  actualData: any = [];
  columnNames: any;
  constructor(private constantsService: ConstantService, private spinner: NgxSpinnerService, private storeService: StoreService,
    private toastr: ToastrService, private reportService: ReportService,
    private reportGridService: ReportGridService, private utilityService: UtilityService,
    private setupService: SetupService, private fb: FormBuilder, private pdfGenrateService: PDFGenrateService,
    private excelGeneratedService: ExcelGeneratedService, private testService: TestService) {
    this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.bankDepositReport);
  }

  ngOnInit() {
    this.getStoreLocationList();
    this.columnDefs = [];
  }

  bankDepositReportClick() {
    this.reportRowData = [];
  }
  dateChange(event, controls) {
    if (controls === 'startDate') {
      this.accountingReportForm.get('startDate').setValue(event.formatedDate);
      this.startDate = event.formatedDate;
    }
    if (controls === 'endDate') {
      this.accountingReportForm.get('endDate').setValue(event.formatedDate);
      this.endDate = event.formatedDate;
    }
  }
  getStoreLocationList() {
    if (this.storeService.storeLocation) {
      this.isStoreLoading = false;
      this.storeLocationList = this.storeService.storeLocation;
      this.setLocationId();
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.isStoreLoading = false;
        this.storeLocationList = this.storeService.storeLocation;
        this.setLocationId();
      }, (error) => {
        console.log(error);
      });
    }
  }
  setLocationId() {
    if (this.storeLocationList.length === 1) {
      this.accountingReportForm.get('storeLocation').setValue(this.storeLocationList);
    }
  }
  onGridReady(params) {
    this.gridApi = params.api;
    let coldefs = [];
    for (let i = 0; i < Object.keys(this.reportRowData[0]).length; i++) {
      if (Object.keys(this.reportRowData[0])[i] == 'Date') {
        coldefs.push({
          headerName: Object.keys(this.reportRowData[0])[i],
          field: Object.keys(this.reportRowData[0])[i], pinned: 'left'
        });
        this.columnDefs.unshift(Object.keys(this.reportRowData[0])[i]);
      }
      else {
        this.columnDefs.push(Object.keys(this.reportRowData[0])[i]);
        coldefs.push({
          headerName: Object.keys(this.reportRowData[0])[i],
          field: Object.keys(this.reportRowData[0])[i]
        })
      }

    }

    this.gridApi.setColumnDefs(coldefs);
    this.gridApi.redrawRows();
    params.api.sizeColumnsToFit();
  }
  accountingReport() {
    this.reportRowData = [];
    if (this.accountingReportForm.value.salesReport === '') {
      this.toastr.info('Please Select Report Type');
      return;
    }
    const storeLocationIdObj = this.accountingReportForm.value.storeLocation ?
      this.accountingReportForm.value.storeLocation.map(x => x.storeLocationID).join(',') : '';

    const postData = {
      storeLocation: storeLocationIdObj,
      companyID: this.userInfo.companyId,
      startDate: moment(this.accountingReportForm.value.startDate).format('MM-DD-YYYY'),
      endDate: moment(this.accountingReportForm.value.endDate).format('MM-DD-YYYY'),
      isDebug: false
    };

    /**
     * Bank Deposit Report
     */

    if (this.accountingReportForm.value.accountingReport === 'bankDepositReport') {
      const postDataByBankDeposit = {
        ...postData,

      };
      this.spinner.show();
      this.setupService.postData('BankDepositReport/BankDepositReport', postDataByBankDeposit).subscribe((res) => {
        this.spinner.hide();
        if (res && res['statusCode']) {
          this.reportRowData = [];
          this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
          return;
        }
        if (res.length > 0) {
          this.gridHeader();
          const grouped = _.groupBy(res, record => record.businessDate);
          var columns = {};
          var data = [];
          res.filter(function (entry) {
            if (columns[entry.dayData]) {
              return false;
            }
            columns[entry.dayData] = true;
            return true;
          });
          let columnNames = Object.keys(columns);
          this.columnNames = Object.keys(columns);
          for (let i = 0; i <= Object.keys(grouped).length - 1; i++) {
            let item = {};
            for (let j = 0; j <= columnNames.length - 1; j++) {
              item[columnNames[j]] = null;
              let newObj = null;
              let filterObj = null;

              let filterArr = grouped[Object.keys(grouped)[i]].filter(x => { return x.dayData == columnNames[j] })
              if (filterArr.length > 1) {
                newObj = filterArr[0];
                let totalPOSDeposit = 0;
                for (let k = 0; k < filterArr.length; k++) {
                  totalPOSDeposit += filterArr[k]["totalPOSDeposit"];
                }
                newObj["totalPOSDeposit"] = totalPOSDeposit;
                filterObj = newObj;
              }
              else {
                filterObj = grouped[Object.keys(grouped)[i]].filter(x => { return x.dayData == columnNames[j] })[0];
              }
              if (filterObj) {
                item[columnNames[j]] = filterObj.totalPOSDeposit;
              }
            }
            item["Date"] = moment(Object.keys(grouped)[i]).format('MM-DD-YYYY');
            data.push(item);
          }
          data.sort(function (a, b) {
            let c = new Date(b.Date);
            let d = new Date(a.Date);
            return d.getTime() - c.getTime();
          });
          let totalRow = { Date: 'Total' };
          for (let l = 0; l < columnNames.length; l++) {
            const totalAmount = _.sumBy(data, columnNames[l]);
            totalRow[columnNames[l]] = totalAmount.toFixed(2);
          }
          this.actualData = data;
          data = [...data, totalRow];
          this.reportRowData = data;
        }
      }, (error) => {
        this.spinner.hide();
        console.log(error);
        this.reportRowData = [];
      });
    } else
      if (this.accountingReportForm.value.accountingReport === 'bankDepositSummaryReport') {
        const postDataByBankDepositSummary = {
          ...postData,

        };
        this.spinner.show();
        this.setupService.postData('BankDepositReport/BankDepositsummaryReport', postDataByBankDepositSummary).subscribe((res) => {
          this.spinner.hide();
          if (res && res['statusCode']) {
            this.reportRowData = [];
            this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
            return;
          }
          this.gridHeader();

          this.reportRowData = res;
        }, (error) => {
          this.spinner.hide();
          console.log(error);
          this.reportRowData = [];
        });
      }
  }

  gridHeader() {
    switch (this.accountingReportForm.value.accountingReport) {
      case 'bankDepositReport':
        this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.bankDepositReport);
        return true;
      case 'bankDepositSummaryReport':
        this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.bankDepositSummaryReport);
        return true;
    }
  }
  headRows() {
    switch (this.accountingReportForm.value.accountingReport) {
      case 'bankDepositReport':
        return this.columnDefs;
      case 'bankDepositSummaryReport':
        return this.reportService.getColumnDef(this.constantsService.reportTypes.bankDepositSummaryReport);
    }
  }

  checkReportName() {
    switch (this.accountingReportForm.value.accountingReport) {
      case 'bankDepositReport':
        return 'Bank Deposit Report';

    }
  }
  public captureScreen() {
    const doc = new jspdf('p', 'pt');

    const headerData = {
      reportName: this.checkReportName(),
      fromDate: this.accountingReportForm.value.startDate, toDate: this.accountingReportForm.value.endDate
    };
    doc.autoTable({
      head: this.headRows(),
      body: this.reportRowData,
      didDrawCell: (event) => {
        this.utilityService.pageHeaderFooter(doc, headerData, event);
      },
      margin: { top: 120 }
    });
    const iframe = document.getElementById('iframePDF');
    iframe['src'] = doc.output('dataurlstring');
  }


  searchSalesReport(params) {
    let res = this.reportRowData;
    let rowData = [];
    /**
     * Bank Deposit Report
     */
    if (this.accountingReportForm.value.accountingReport === 'bankDepositReport') {
      rowData = this.actualData;
      if (params === 'pdf') {
        let columns = [];
        let totalsRow = [];
        this.colWidths = [];
        for (let k = 0; k < this.columnDefs.length; k++) {
          this.colWidths.push(80);
        }
        let totalRow = { Date: 'Total' };
        for (let l = 0; l < this.columnNames.length; l++) {
          const totalAmount = _.sumBy(this.actualData, this.columnNames[l]);
          totalRow[this.columnNames[l]] = totalAmount.toFixed(2);
        }
        for (let i = 0; i < Object.keys(totalRow).length; i++) {
          if (Object.keys(totalRow)[i] == 'Date') {
            totalsRow.push({
              text: Object.values(totalRow)[i], border: [false, false, false, false], bold: true,
              color: 'white', fillColor: 'black'
            });
          }
          else {
            totalsRow.push({
              text: Object.values(totalRow)[i] !== null ? this.utilityService.formatCurrency(Object.values(totalRow)[i]).toString() : '',
              border: [false, false, false, false], bold: true,
              color: 'white', fillColor: 'black', alignment: 'right'
            });
          }

        }
        for (let i = 0; i < Object.keys(rowData[0]).length; i++) {
          if (Object.keys(rowData[0])[i] == 'Date') {
            columns.unshift({ text: Object.keys(rowData[0])[i] });
          }
          else {
            columns.push({ text: Object.keys(rowData[0])[i] })
          }
        }
        this.body.push(columns);
        this.body.push(totalsRow);

        for (const key in rowData) {
          if (rowData.hasOwnProperty(key)) {
            const data = rowData[key];
            const fila = new Array();

            for (let i = 0; i < Object.keys(rowData[key]).length; i++) {
              if (Object.keys(rowData[key])[i] == 'Date') {

                if (i !== Object.keys(rowData[key]).length - 1) {
                  fila.unshift({
                    text: Object.values(data)[i],
                    border: [false, false, false, false], bold: true,
                    color: 'white', fillColor: 'black',
                  });
                }
                else {
                  fila.unshift({
                    text: Object.values(data)[i],
                    border: [false, false, false, false]
                  });
                }
              }
              else {
                fila.push({
                  text: Object.values(data)[i] !== null ? this.utilityService.formatCurrency(Object.values(data)[i]).toString() : '',
                  border: [false, false, false, false], alignment: 'right'
                });
              }
            }
            this.body.push(fila);
          }
        }

        this.pdfGenrateService.PDFGenrate('Bank Deposit Report', this.colWidths,
          this.body, this.accountingReportForm.value.startDate, this.accountingReportForm.value.endDate);
        this.body = this.colWidths = [];
      }
      if (params === 'excel') {
        const excelData = new ExcelModel();
        excelData.header = this.headRows();

        excelData.groupedData = false;
        let fila = new Array();
        let excelTotalsRow = [];
        let totalRow = { Date: 'Total' };
        for (let l = 0; l < this.columnNames.length; l++) {
          const totalAmount = _.sumBy(this.actualData, this.columnNames[l]);
          totalRow[this.columnNames[l]] = totalAmount.toFixed(2);
        }
        for (let i = 0; i < Object.keys(totalRow).length; i++) {
          if (Object.keys(totalRow)[i] == 'Date') {
            excelTotalsRow.push(Object.values(totalRow)[i]);
          }
          else {
            excelTotalsRow.push(Object.values(totalRow)[i] !== null ? this.utilityService.formatCurrency(Object.values(totalRow)[i]).toString() : '');
          }
        }

        excelData.totalsRow = excelTotalsRow;
        for (let key in rowData) {
          if (rowData.hasOwnProperty(key)) {
            let data = rowData[key];
            let temp = [];
            for (let i = 0; i < Object.keys(rowData[key]).length; i++) {
              if (Object.keys(rowData[key])[i] == 'Date') {
                temp.unshift(Object.values(data)[i]);
              }
              else {
                temp.push(Object.values(data)[i] !== null ? this.utilityService.formatCurrency(Object.values(data)[i]).toString() : '');
              }
            }
            fila.push(temp);
          }
        }
        excelData.data = fila;
        excelData.reportName = 'Bank Deposit Report';
        excelData.startDate = this.startDate;
        excelData.endDate = this.endDate;
        this.excelGeneratedService.generateExcel(excelData);
      }
    } else
      if (this.accountingReportForm.value.salesReport === 'bankDepositSummaryReport') {
        const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
        const grouped = _.groupBy(arr, pet => pet.storeName);
        const data = this.accountingReportForm.value.storeLocation;
        const arrs = [];
        data.forEach(x => {
          if (grouped && grouped[x.storeName]) {
            const salesAmount = _.sumBy(grouped[x.storeName], 'salesAmount');
            const totalSalesAmount = _.sumBy(grouped[x.storeName], 'totalSalesAmount');
            const buyingCost = _.sumBy(grouped[x.storeName], 'buyingCost');
            const salesQuantity = _.sumBy(grouped[x.storeName], 'salesQuantity');
            arrs.push({
              storeName: x.storeName, departmentDescription: '', salesQuantity: salesQuantity.toFixed(0),
              salesAmount: salesAmount.toFixed(2), totalSalesAmount: totalSalesAmount.toFixed(2),
              buyingCost: buyingCost.toFixed(3), prof: '', margin: '', isGroup: true
            });
            grouped[x.storeName].forEach(y => {
              arrs.push(y);
            });
          }
        });
        rowData = arrs;
        if (params === 'pdf') {
          this.colWidths = [80, 80, 45, 45, 60, 50, 45, 45];
          this.body.push([{ text: 'Store Name' }, { text: 'Department' },
          { text: 'Sales Quantity' }, { text: 'Sales Amount' }, { text: 'Percentile of Sales Amount' },
          { text: 'Buying Cost' }, { text: 'Profit' }, { text: 'Margin' }
          ]);

          for (const key in rowData) {
            if (rowData.hasOwnProperty(key)) {
              const data = rowData[key];
              const fila = new Array();
              if (data.isGroup) {
                fila.push({
                  text: data.storeName.toString(),
                  border: [false, false, false, false], bold: true,
                  color: 'white',
                  fillColor: 'black',
                });
                fila.push({
                  text: '',
                  border: [false, false, false, false], bold: true,
                  color: 'white',
                  fillColor: 'black',
                });
                fila.push({
                  text: data.salesQuantity.toString(), border: [false, false, false, false], bold: true,
                  color: 'white',
                  fillColor: 'black',
                });
                fila.push({
                  text: this.utilityService.formatCurrency(data.salesAmount).toString(),
                  border: [false, false, false, false], alignment: 'right', bold: true,
                  color: 'white',
                  fillColor: 'black',
                });
                fila.push({
                  text: this.utilityService.formatCurrency(data.totalSalesAmount).toString(),
                  border: [false, false, false, false], alignment: 'right', bold: true,
                  color: 'white',
                  fillColor: 'black',
                });
                fila.push({
                  text: this.utilityService.formatCurrency(data.buyingCost).toString(),
                  border: [false, false, false, false], alignment: 'right', bold: true,
                  color: 'white',
                  fillColor: 'black',
                });
                fila.push({
                  text: '', border: [false, false, false, false], bold: true,
                  color: 'white',
                  fillColor: 'black',
                });
                fila.push({
                  text: '', border: [false, false, false, false], bold: true,
                  color: 'white',
                  fillColor: 'black',
                });
                this.body.push(fila);
              } else {
                fila.push({ text: '', border: [false, false, false, false] });
                fila.push({ text: data.departmentDescription.toString(), border: [false, false, false, false] });
                fila.push({ text: data.salesQuantity.toString(), border: [false, false, false, false] });
                fila.push({
                  text: this.utilityService.formatCurrency(data.salesAmount).toString(),
                  border: [false, false, false, false], alignment: 'right'
                });
                fila.push({
                  text: this.utilityService.formatCurrency(data.totalSalesAmount).toString(),
                  border: [false, false, false, false], alignment: 'right'
                });
                fila.push({
                  text: this.utilityService.formatCurrency(data.buyingCost).toString(),
                  border: [false, false, false, false], alignment: 'right'
                });
                fila.push({ text: data.prof.toString(), border: [false, false, false, false] });
                fila.push({ text: data.margin.toString(), border: [false, false, false, false] });
              }
              this.body.push(fila);
            }
          }
          this.pdfGenrateService.PDFGenrate('Bank Deposit Summary Report', this.colWidths,
            this.body, this.accountingReportForm.value.startDate, this.accountingReportForm.value.endDate);
          this.body = this.colWidths = [];
        }
        if (params === 'excel') {
          const excelData = new ExcelModel();
          excelData.header = this.headRows();
          excelData.groupedData = true;
          let fila = new Array();
          for (let key in rowData) {
            if (rowData.hasOwnProperty(key)) {
              let data = rowData[key];
              let temp;
              if (data.isGroup) {
                temp = [
                  data.storeName.toString(),
                  '', '', '', '', '', '', ''
                ];
              } else {
                temp = [
                  '',
                  data.departmentDescription.toString(),
                  data.salesQuantity.toString(),
                  this.utilityService.formatCurrency(data.salesAmount).toString(),
                  this.utilityService.formatCurrency(data.totalSalesAmount).toString(),
                  this.utilityService.formatCurrency(data.buyingCost).toString(),
                  data.prof.toString(),
                  data.margin.toString(),
                ];
              }
              fila.push(temp);
            }
          }
          excelData.data = fila;
          excelData.reportName = 'Bank Deposit Summary Report';
          excelData.startDate = this.startDate;
          excelData.endDate = this.endDate;
          this.excelGeneratedService.generateExcel(excelData);
        }


      }
  }
}
