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

declare var require: any;
let JsBarcode = require('jsbarcode');

@Component({
  selector: 'app-sales-report',
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.scss']
})
export class SalesReportComponent implements OnInit {

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
  priceGroupList: any[] = [];
  selectedDateRange: any;
  startDate = moment().format('MM-DD-YYYY');
  endDate = moment().format('MM-DD-YYYY');
  userInfo = this.constantsService.getUserInfo();
  salesReportForm = this.fb.group({
    storeLocation: '', salesReport: '',
    startDate: this.startDate,
    endDate: this.endDate,
    departmentIDs: '', vendor: '', groupID: '', orderBy: '',
  });
  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.startDate = this.selectedDateRange.fDate;
    this.endDate = this.selectedDateRange.tDate;
    this.salesReportForm.get('startDate').setValue(this.selectedDateRange.fDate);
    this.salesReportForm.get('endDate').setValue(this.selectedDateRange.tDate);
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
  constructor(private constantsService: ConstantService, private spinner: NgxSpinnerService, private storeService: StoreService,
    private toastr: ToastrService, private reportService: ReportService,
    private reportGridService: ReportGridService, private utilityService: UtilityService,
    private setupService: SetupService, private fb: FormBuilder, private pdfGenrateService: PDFGenrateService,
    private excelGeneratedService: ExcelGeneratedService, private testService: TestService) {
    this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.departmentSalesReportDetail);
  }

  ngOnInit() {
    this.getStoreLocationList();
    this.getVendorByCompanyID();
    this.getDepartmentList();
    // this.getPriceGroupList();
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
      this.salesReportForm.get('storeLocation').setValue(this.storeLocationList);
    }
  }
  getVendorByCompanyID() {
    this.setupService.getData(`Vendor/getAll/${this.userInfo.companyId}`).subscribe(res => {
      if (res && res['statusCode']) {
        this.vendorList = [];
      }
      this.vendorList = res;
    });
  }
  getDepartmentList() {
    this.setupService.getData(`Department/GetByfuel/${this.userInfo.userName}/${this.userInfo.companyId}/true`).subscribe(res => {
      if (res && res['statusCode']) {
        this.departmentList = [];
      }
      this.departmentList = res;
    });
  }
  getPriceGroupList() {
    if (this.priceGroupList.length === 0) {
      this.spinner.show();
      this.setupService.getData('CompanyPriceGroup/getByCompanyID/' + this.userInfo.companyId).subscribe(
        (res) => {
          this.spinner.hide();
          if (res && res['statusCode']) this.priceGroupList = [];
          else this.priceGroupList = res;
        }, (error) => {
          console.log(error);
        }
      );
    }
    // this.setupService.getData(`Group/getData`).subscribe(res => {
    //   if (res && res['statusCode']) {
    //     this.priceGroupList = [];
    //   }
    //   this.priceGroupList = res;
    // });
  }
  itemSalesReportClick() {
    this.isShowOrderBy = true;
    this.isShowPriceGroup = false;
    this.isShowVendor = false;
    this.isShowDepartment = true;
    this.reportRowData = [];
  }
  salesReportByVendorClick() {
    this.isShowOrderBy = false;
    this.isShowPriceGroup = false;
    this.isShowVendor = true;
    this.isShowDepartment = false;
    this.reportRowData = [];
  }
  salesReportByPriceGroupClick() {
    this.isShowOrderBy = false;
    this.isShowPriceGroup = true;
    this.isShowVendor = false;
    this.isShowDepartment = false;
    this.reportRowData = [];
    this.getPriceGroupList();
  }
  SalesReportClick() {
    this.isShowDepartment = true;
    this.isShowOrderBy = false;
    this.isShowPriceGroup = false;
    this.isShowVendor = false;
    this.reportRowData = [];
  }
  dateChange(event, controls) {
    // this.salesReportForm.get('startDate').setValue(event.fromDate);
    // this.startDate = event.fromDate;
    // this.salesReportForm.get('endDate').setValue(event.toDate);
    // this.endDate = event.toDate;
    if (controls === 'startDate') {
      this.salesReportForm.get('startDate').setValue(event.formatedDate);
      this.startDate = event.formatedDate;
    }
    if (controls === 'endDate') {
      this.salesReportForm.get('endDate').setValue(event.formatedDate);
      this.endDate = event.formatedDate;
    }
  }
  searchSalesReport(params) {
    let res = this.reportRowData;
    let rowData = [];
    /**
     * Department Sales Report
     */
    if (this.salesReportForm.value.salesReport === 'departmentSalesReport') {
      const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
      const grouped = _.groupBy(arr, pet => pet.storeName);
      const data = this.salesReportForm.value.storeLocation;
      const arrs = [];
      data.forEach(x => {
        if (grouped && grouped[x.storeName]) {
          const salesAmount = _.sumBy(grouped[x.storeName], 'salesAmount');
          const totalSalesAmount = _.sumBy(grouped[x.storeName], 'totalSalesAmount');
          const buyingCost = _.sumBy(grouped[x.storeName], 'buyingCost');
          const salesQuantity = _.sumBy(grouped[x.storeName], 'salesQuantity');
          arrs.push({
            storeName: x.storeName, departmentDescription: '', salesQuantity: salesQuantity.toFixed(0),
            salesAmount: salesAmount.toFixed(2), totalSalesAmount: totalSalesAmount ? totalSalesAmount.toFixed(2) : 0.0,
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
        this.pdfGenrateService.PDFGenrate('Department Sales Report', this.colWidths,
          this.body, this.salesReportForm.value.startDate, this.salesReportForm.value.endDate);
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
        excelData.reportName = 'Department Sales Report';
        excelData.startDate = this.startDate;
        excelData.endDate = this.endDate;
        this.excelGeneratedService.generateExcel(excelData);
      }


    } else
      /**
       * Department Sales Report Detail
       */
      if (this.salesReportForm.value.salesReport === 'departmentSalesReportDetail') {
        // this.setupService.postData('SalesReports/DetailSaleReportByDepartments', postDataByItem).subscribe((res) => {
        const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
        const grouped = _.groupBy(arr, pet => pet.storeName);
        const data = this.salesReportForm.value.storeLocation;
        const arrs = [];
        data.forEach(x => {
          if (grouped && grouped[x.storeName]) {
            const salesAmount = _.sumBy(grouped[x.storeName], 'salesAmount');
            const totalSalesAmount = _.sumBy(grouped[x.storeName], 'totalSalesAmount');
            const buyingCost = _.sumBy(grouped[x.storeName], 'buyingCost');
            const salesQuantity = _.sumBy(grouped[x.storeName], 'salesQuantity');
            arrs.push({
              storeName: x.storeName, businessDate: '', departmentDescription: '', salesQuantity: salesQuantity.toFixed(0),
              salesAmount: salesAmount.toFixed(2), totalSalesAmount: totalSalesAmount ? totalSalesAmount.toFixed(2) : 0.0,
              buyingCost: buyingCost.toFixed(3), prof: '', margin: '', isGroup: true
            });
            grouped[x.storeName].forEach(y => {
              arrs.push(y);
            });
          }
        });
        rowData = arrs;

        if (params === 'pdf') {
          this.colWidths = [70, 50, 70, 40, 40, 60, 45, 40, 40];
          this.body.push([{ text: 'Store Name' }, { text: 'Business Date' }, { text: 'Department' },
          { text: 'Sales Quantity' }, { text: 'Sales Amount' }, { text: 'Percentile of Sales Amount' },
          { text: 'Buying Cost' }, { text: 'Profit' }, { text: 'Margin' }
          ]);

          for (const key in rowData) {
            if (rowData.hasOwnProperty(key)) {
              const data = rowData[key];
              const fila = new Array();
              if (data.isGroup) {
                fila.push({
                  text: data.departmentDescription ? '-' :
                    data.storeName.toString(),
                  border: [false, false, false, false], bold: true,
                  color: 'white',
                  fillColor: 'black',
                });
                fila.push({
                  text: this.utilityService.formatDateEmpty(data.businessDate).toString(),
                  border: [false, false, false, false], bold: true,
                  color: 'white',
                  fillColor: 'black',
                });
                fila.push({
                  text: data.departmentDescription.toString(), border: [false, false, false, false], bold: true,
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
                  text: data.prof.toString(), border: [false, false, false, false], bold: true,
                  color: 'white',
                  fillColor: 'black',
                });
                fila.push({
                  text: data.margin.toString(), border: [false, false, false, false], bold: true,
                  color: 'white',
                  fillColor: 'black',
                });
                this.body.push(fila);
              } else {
                fila.push({
                  text: ''
                  ,
                  border: [false, false, false, false]
                });
                fila.push({
                  text: this.utilityService.formatDateEmpty(data.businessDate).toString(),
                  border: [false, false, false, false]
                });
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
                this.body.push(fila);
              }

            }
          }
          this.pdfGenrateService.PDFGenrate('Department Sales Report Detail', this.colWidths,
            this.body, this.salesReportForm.value.startDate, this.salesReportForm.value.endDate);
          this.body = this.colWidths = [];
        }
        if (params === 'excel') {
          const excelData = new ExcelModel();
          excelData.header = this.headRows();
          excelData.startDate = this.salesReportForm.value.startDate;
          excelData.endDate = this.salesReportForm.value.endDate;
          excelData.groupedData = true;
          let fila = new Array();
          for (let key in rowData) {
            if (rowData.hasOwnProperty(key)) {
              let data = rowData[key];
              if (data.isGroup) {
                const temp = [
                  data.storeName.toString(),
                  '',
                  '',
                  data.salesQuantity.toString(),
                  this.utilityService.formatCurrency(data.salesAmount).toString(),
                  this.utilityService.formatCurrency(data.totalSalesAmount).toString(),
                  this.utilityService.formatCurrency(data.buyingCost).toString(),
                  '',
                  '',
                ];
                fila.push(temp);
              } else {
                const temp = [
                  '',
                  this.utilityService.formatDate(data.businessDate).toString(),
                  data.departmentDescription.toString(),
                  data.salesQuantity.toString(),
                  this.utilityService.formatCurrency(data.salesAmount).toString(),
                  this.utilityService.formatCurrency(data.totalSalesAmount).toString(),
                  this.utilityService.formatCurrency(data.buyingCost).toString(),
                  data.prof.toString(),
                  data.margin.toString(),
                ];
                fila.push(temp);
              }
            }
          }
          excelData.data = fila;
          excelData.reportName = 'Department Sales Report Detail';
          this.excelGeneratedService.generateExcel(excelData);
        }

      } else
        /**
         * Item Sales Report
         */
        if (this.salesReportForm.value.salesReport === 'itemSalesReport') {
          const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
          const grouped = _.groupBy(arr, pet => pet.storeName);
          const data = this.salesReportForm.value.storeLocation;
          const arrs = [];
          data.forEach(x => {
            if (grouped && grouped[x.storeName]) {
              const salesAmount = _.sumBy(grouped[x.storeName], 'salesAmount');
              const totalSalesAmount = _.sumBy(grouped[x.storeName], 'totalSalesAmount');
              const buyingCost = _.sumBy(grouped[x.storeName], 'buyingCost');
              const singleUnitBuyingCost = _.sumBy(grouped[x.storeName], 'singleUnitBuyingCost');
              const singleUnitSalesCost = _.sumBy(grouped[x.storeName], 'singleUnitSalesCost');
              const salesQuantity = _.sumBy(grouped[x.storeName], 'salesQuantity');
              arrs.push({
                storeName: x.storeName, posCode: '', description: '', departmentDescription: '',
                singleUnitBuyingCost: singleUnitBuyingCost.toFixed(2), singleUnitSalesCost: singleUnitSalesCost.toFixed(2),
                salesQuantity: salesQuantity, salesAmount: salesAmount.toFixed(2),
                totalSalesAmount: totalSalesAmount ? totalSalesAmount.toFixed(2) : 0.0, buyingCost: buyingCost.toFixed(2), profit: '', margin: '', isGroup: true
              });
              grouped[x.storeName].forEach(y => {
                arrs.push(y);
              });
            }
          });
          rowData = arrs;
          if (params === 'pdf') {
            this.colWidths = [65, 120, 85, 60, 40, 40, 40, 40, 70, 50, 35, 35];
            this.body.push([{ text: 'Store Name' }, { text: 'UPC Code' }, { text: 'Item' }, { text: 'Department Description' },
            { text: 'Unit Buying Cost' }, { text: 'Selling Price' }, { text: 'Sales Quantity' }, { text: 'Sales Amount' },
            { text: 'Percentile of Sales Amount' }, { text: 'Buying Cost' }, { text: 'Profit' }, { text: 'Margin' }
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
                    text: '', border: [false, false, false, false], bold: true,
                    color: 'white',
                    fillColor: 'black',
                  });
                  fila.push({
                    text: '', border: [false, false, false, false], bold: true,
                    color: 'white',
                    fillColor: 'black',
                  });
                  fila.push({
                    text: this.utilityService.formatCurrency(data.singleUnitBuyingCost).toString(),
                    border: [false, false, false, false], bold: true,
                    color: 'white',
                    fillColor: 'black', alignment: 'center'
                  });
                  fila.push({
                    text: this.utilityService.formatCurrency(data.singleUnitSalesCost).toString(),
                    border: [false, false, false, false], alignment: 'right', bold: true,
                    color: 'white',
                    fillColor: 'black',
                  });
                  fila.push({
                    text: data.salesQuantity.toString(),
                    border: [false, false, false, false], bold: true,
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
                  fila.push({ text: '', border: [false, false, false, false], alignment: 'center' });
                  let upcCode = data.posCode.toString();
                  let canvas = document.createElement("canvas");
                  if (upcCode.length == 11 || upcCode.length == 13) {
                    JsBarcode(canvas, upcCode, {
                      format: "UPC", elementType: 'svg', lineColor: '#000000',
                      width: 1, height: 15, displayValue: true, fontOptions: '',
                      font: 'monospace', textAlign: 'center', textPosition: 'bottom',
                      textMargin: 2, fontSize: 20, background: '#ffffff',
                      margin: 10, marginTop: 10, marginBottom: 10, marginLeft: 10, marginRight: 10,
                      tempId: 0, addrow: 0
                    });
                    fila.push({ image: canvas.toDataURL("image/png"), border: [false, false, false, false] });
                  } else {
                    fila.push({ text: '', border: [false, false, false, false] });
                  }
                  fila.push({ text: data.description.toString(), border: [false, false, false, false] });
                  fila.push({ text: data.departmentDescription.toString(), border: [false, false, false, false] });
                  fila.push({
                    text: this.utilityService.formatCurrency(data.singleUnitBuyingCost).toString(),
                    border: [false, false, false, false], alignment: 'right'
                  });
                  fila.push({
                    text: this.utilityService.formatCurrency(data.singleUnitSalesCost).toString(),
                    border: [false, false, false, false], alignment: 'right'
                  });
                  fila.push({ text: data.salesQuantity.toString(), border: [false, false, false, false], alignment: 'center' });
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
                  fila.push({ text: data.profit.toString(), border: [false, false, false, false] });
                  fila.push({ text: data.margin.toString(), border: [false, false, false, false] });
                }
                this.body.push(fila);
              }
            }
            this.pdfGenrateService.PDFGenrate('Item Sales Report ', this.colWidths,
              this.body, this.salesReportForm.value.startDate, this.salesReportForm.value.endDate, 'portrait');
            this.body = this.colWidths = [];
          }
          if (params === 'excel') {
            const excelData = new ExcelModel();
            excelData.header = this.headRows();
            excelData.startDate = this.salesReportForm.value.startDate;
            excelData.endDate = this.salesReportForm.value.endDate;
            excelData.groupedData = true;
            let fila = new Array();
            for (let key in rowData) {
              if (rowData.hasOwnProperty(key)) {
                let data = rowData[key];
                let temp;
                if (data.isGroup) {
                  temp = [
                    data.storeName.toString(), '', '', '',
                    this.utilityService.formatCurrency(data.singleUnitBuyingCost).toString(),
                    this.utilityService.formatCurrency(data.singleUnitSalesCost).toString(),
                    data.salesQuantity.toString(),
                    this.utilityService.formatCurrency(data.salesAmount).toString(),
                    this.utilityService.formatCurrency(data.totalSalesAmount).toString(),
                    this.utilityService.formatCurrency(data.buyingCost).toString(),
                    '',
                    '',]
                } else {
                  temp = [
                    '',
                    data.posCode.toString(),
                    data.description.toString(),
                    data.departmentDescription.toString(),
                    this.utilityService.formatCurrency(data.singleUnitBuyingCost).toString(),
                    this.utilityService.formatCurrency(data.singleUnitSalesCost).toString(),
                    data.salesQuantity.toString(),
                    this.utilityService.formatCurrency(data.salesAmount).toString(),
                    this.utilityService.formatCurrency(data.totalSalesAmount).toString(),
                    this.utilityService.formatCurrency(data.buyingCost).toString(),
                    data.profit ? data.profit.toString() : data.profit,
                    data.margin.toString(),
                  ];
                }
                fila.push(temp);
              }
            }
            excelData.data = fila;
            excelData.reportName = 'Item Sales Report';
            this.excelGeneratedService.generateExcel(excelData);
          }
        } else
          /**
           * Item Sales Report Detail
           */
          if (this.salesReportForm.value.salesReport === 'itemSalesReportDetail') {

            const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
            const grouped = _.groupBy(arr, pet => pet.storeName);
            const data = this.salesReportForm.value.storeLocation;
            const arrs = [];
            data.forEach(x => {
              if (grouped && grouped[x.storeName]) {
                const salesAmount = _.sumBy(grouped[x.storeName], 'salesAmount');
                const totalSalesAmount = _.sumBy(grouped[x.storeName], 'totalSalesAmount');
                const buyingCost = _.sumBy(grouped[x.storeName], 'buyingCost');
                const singleUnitBuyingCost = _.sumBy(grouped[x.storeName], 'singleUnitBuyingCost');
                const singleUnitSalesCost = _.sumBy(grouped[x.storeName], 'singleUnitSalesCost');
                const salesQuantity = _.sumBy(grouped[x.storeName], 'salesQuantity');
                arrs.push({
                  storeName: x.storeName, businessDate: '', departmentDescription: '',
                  posCode: '', description: '',
                  singleUnitBuyingCost: singleUnitBuyingCost.toFixed(2), singleUnitSalesCost: singleUnitSalesCost.toFixed(2),
                  salesQuantity: salesQuantity, salesAmount: salesAmount.toFixed(2),
                  totalSalesAmount: totalSalesAmount ? totalSalesAmount.toFixed(2) : 0.0, buyingCost: buyingCost.toFixed(2), prof: '', margin: '',
                  currentInventory: '', isGroup: true
                });
                grouped[x.storeName].forEach(y => {
                  arrs.push(y);
                });
              }
            });
            rowData = arrs;

            if (params === 'pdf') {
              this.colWidths = [55, 60, 70, 60, 70, 40, 35, 35, 35, 45, 35, 35, 35, 40];
              this.body.push([{ text: 'Store Name' }, { text: 'Business Date' }, { text: 'Department' }, { text: 'UPC Code' },
              { text: 'Item' }, { text: 'Unit Buying Cost' },
              { text: 'Sales Price' }, { text: 'Sales Quantity' }, { text: 'Sales Amount' },
              { text: 'Percentile of Sales Amount' }, { text: 'Buying Cost' }, { text: 'Profit' },
              { text: 'Margin' },
              { text: 'Current Inventory' },
              ]);

              for (const key in rowData) {
                if (rowData.hasOwnProperty(key)) {
                  const data = rowData[key];
                  const fila = new Array();
                  if (data.isGroup) {
                    fila.push({
                      text: data.storeName.toString(), border: [false, false, false, false],
                      bold: true,
                      color: 'white',
                      fillColor: 'black',
                    });
                    fila.push({
                      text: ''.toString(), border: [false, false, false, false],
                      bold: true,
                      color: 'white',
                      fillColor: 'black',
                    });
                    fila.push({
                      text: ''.toString(), border: [false, false, false, false],
                      bold: true,
                      color: 'white',
                      fillColor: 'black',
                    });
                    fila.push({
                      text: '', border: [false, false, false, false],
                      bold: true,
                      color: 'white',
                      fillColor: 'black',
                    });
                    fila.push({
                      text: '', border: [false, false, false, false],
                      bold: true,
                      color: 'white',
                      fillColor: 'black',
                    });
                    fila.push({
                      text: this.utilityService.formatCurrency(data.singleUnitBuyingCost).toString(),
                      border: [false, false, false, false], alignment: 'right',
                      bold: true,
                      color: 'white',
                      fillColor: 'black',
                    });

                    fila.push({
                      text: this.utilityService.formatCurrency(data.singleUnitSalesCost).toString(),
                      border: [false, false, false, false], alignment: 'right',
                      bold: true,
                      color: 'white',
                      fillColor: 'black',
                    });
                    fila.push({
                      text: data.salesQuantity.toString(), border: [false, false, false, false],
                      bold: true,
                      color: 'white',
                      fillColor: 'black',
                    });
                    fila.push({
                      text: this.utilityService.formatCurrency(data.salesAmount).toString(),
                      border: [false, false, false, false], alignment: 'right',
                      bold: true,
                      color: 'white',
                      fillColor: 'black',
                    });
                    fila.push({
                      text: this.utilityService.formatCurrency(data.totalSalesAmount).toString(),
                      border: [false, false, false, false], alignment: 'right',
                      bold: true,
                      color: 'white',
                      fillColor: 'black',
                    });
                    fila.push({
                      text: this.utilityService.formatCurrency(data.buyingCost).toString(),
                      border: [false, false, false, false], alignment: 'right',
                      bold: true,
                      color: 'white',
                      fillColor: 'black',
                    });

                    fila.push({
                      text: '', border: [false, false, false, false],
                      bold: true,
                      color: 'white',
                      fillColor: 'black',
                    });
                    fila.push({
                      text: ''.toString(), border: [false, false, false, false],
                      bold: true,
                      color: 'white',
                      fillColor: 'black',
                    });
                    fila.push({
                      text: '', border: [false, false, false, false],
                      bold: true,
                      color: 'white',
                      fillColor: 'black',
                    });

                  } else {
                    fila.push({ text: '', border: [false, false, false, false], alignment: 'center' });
                    fila.push({
                      text: this.utilityService.formatDate(data.businessDate).toString(),
                      border: [false, false, false, false]
                    });
                    fila.push({ text: data.departmentDescription.toString(), border: [false, false, false, false] });
                    fila.push({ text: data.posCode.toString(), border: [false, false, false, false] });
                    fila.push({ text: data.description.toString(), border: [false, false, false, false] });
                    fila.push({
                      text: this.utilityService.formatCurrency(data.singleUnitBuyingCost).toString(),
                      border: [false, false, false, false], alignment: 'right'
                    });

                    fila.push({
                      text: this.utilityService.formatCurrency(data.singleUnitSalesCost).toString(),
                      border: [false, false, false, false], alignment: 'right'
                    });
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
                    fila.push({ text: data.prof, border: [false, false, false, false] });
                    fila.push({ text: data.margin.toString(), border: [false, false, false, false] });
                    fila.push({ text: data.currentInventory, border: [false, false, false, false] });
                  }
                  this.body.push(fila);
                }
              }
              this.pdfGenrateService.PDFGenrate('Item Sales Report Detail', this.colWidths,
                this.body, this.salesReportForm.value.startDate, this.salesReportForm.value.endDate, 'portrait');
              this.body = this.colWidths = [];
            }
            if (params === 'excel') {
              const excelData = new ExcelModel();
              excelData.header = this.headRows();
              excelData.startDate = this.salesReportForm.value.startDate;
              excelData.endDate = this.salesReportForm.value.endDate;
              excelData.groupedData = true;
              let fila = new Array();
              for (let key in rowData) {
                if (rowData.hasOwnProperty(key)) {
                  let data = rowData[key];
                  let temp;
                  if (data.isGroup) {
                    temp = [data.storeName.toString(),
                      '', '', '', '',
                    this.utilityService.formatCurrency(data.singleUnitBuyingCost).toString(),
                    this.utilityService.formatCurrency(data.singleUnitSalesCost).toString(),
                    data.salesQuantity.toString(),
                    this.utilityService.formatCurrency(data.salesAmount).toString(),
                    this.utilityService.formatCurrency(data.totalSalesAmount).toString(),
                    this.utilityService.formatCurrency(data.buyingCost).toString(),
                      '', '', '',];
                  } else {
                    temp = [
                      '',
                      this.utilityService.formatDate(data.businessDate).toString(),
                      data.departmentDescription.toString(),
                      data.posCode.toString(),
                      data.description.toString(),
                      this.utilityService.formatCurrency(data.singleUnitBuyingCost).toString(),
                      this.utilityService.formatCurrency(data.singleUnitSalesCost).toString(),
                      data.salesQuantity.toString(),
                      this.utilityService.formatCurrency(data.salesAmount).toString(),
                      this.utilityService.formatCurrency(data.totalSalesAmount).toString(),
                      this.utilityService.formatCurrency(data.buyingCost).toString(),
                      // this.utilityService.formatCurrency(data.singleUnitBuyingCost).toString(),
                      data.prof ? data.prof.toString() : data.prof,
                      data.margin.toString(),
                      data.currentInventory,
                    ];
                  }
                  fila.push(temp);
                }
              }
              excelData.data = fila;
              excelData.reportName = 'Item Sales Report Detail';
              this.excelGeneratedService.generateExcel(excelData);
            }

          } else
            /**
             * Sales Percent Report
             */
            if (this.salesReportForm.value.salesReport === 'salesPercentReport') {

              const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
              const grouped = _.groupBy(arr, pet => pet.storeName);
              const data = this.salesReportForm.value.storeLocation;
              const arrs = [];
              data.forEach(x => {
                if (grouped && grouped[x.storeName]) {
                  const salesAmount = _.sumBy(grouped[x.storeName], 'salesAmount');
                  const totalSalesAmount = _.sumBy(grouped[x.storeName], 'totalSalesAmount');
                  arrs.push({
                    storeName: x.storeName, departmentDescription: '',
                    salesAmount: salesAmount.toFixed(2),
                    totalSalesAmount: totalSalesAmount ? totalSalesAmount.toFixed(2) : 0.0, isGroup: true
                  });
                  grouped[x.storeName].forEach(y => {
                    arrs.push(y);
                  });
                }
              });
              rowData = arrs;
              if (params === 'pdf') {
                this.colWidths = [150, 150, 80, 80];
                this.body.push([{ text: 'Store Name' }, { text: 'Department' },
                { text: 'Amount' }, { text: 'Total Amount' }]);
                for (const key in rowData) {
                  if (rowData.hasOwnProperty(key)) {
                    const data = rowData[key];
                    const fila = new Array();
                    if (data.isGroup) {
                      fila.push({
                        text: data.storeName.toString(), border: [false, false, false, false],
                        bold: true,
                        color: 'white',
                        fillColor: 'black'
                      });
                      fila.push({
                        text: '', border: [false, false, false, false],
                        bold: true,
                        color: 'white',
                        fillColor: 'black'
                      });
                      fila.push({
                        text: this.utilityService.formatCurrency(data.salesAmount).toString(),
                        border: [false, false, false, false], alignment: 'right',
                        bold: true,
                        color: 'white',
                        fillColor: 'black'
                      });
                      fila.push({
                        text: this.utilityService.formatCurrency(data.totalSalesAmount).toString(),
                        border: [false, false, false, false], alignment: 'right',
                        bold: true,
                        color: 'white',
                        fillColor: 'black'
                      });
                    } else {
                      fila.push({ text: '', border: [false, false, false, false], alignment: 'center' });
                      fila.push({ text: data.departmentDescription.toString(), border: [false, false, false, false] });
                      fila.push({
                        text: this.utilityService.formatCurrency(data.salesAmount).toString(),
                        border: [false, false, false, false], alignment: 'right'
                      });
                      fila.push({
                        text: this.utilityService.formatCurrency(data.totalSalesAmount).toString(),
                        border: [false, false, false, false], alignment: 'right'
                      });
                    }
                    this.body.push(fila);
                  }
                }
                this.pdfGenrateService.PDFGenrate('Sales Percent Report', this.colWidths,
                  this.body, this.salesReportForm.value.startDate, this.salesReportForm.value.endDate);
                this.body = this.colWidths = [];
              }
              if (params === 'excel') {
                const excelData = new ExcelModel();
                excelData.header = this.headRows();
                excelData.startDate = this.salesReportForm.value.startDate;
                excelData.endDate = this.salesReportForm.value.endDate;
                excelData.groupedData = true;
                let fila = new Array();
                for (let key in rowData) {
                  if (rowData.hasOwnProperty(key)) {
                    let data = rowData[key];
                    let temp;
                    if (data.isGroup) {
                      temp = [
                        data.storeName.toString(),
                        '',
                        this.utilityService.formatCurrency(data.salesAmount).toString(),
                        this.utilityService.formatCurrency(data.totalSalesAmount).toString(),
                      ];
                    } else {
                      temp = [
                        '',
                        data.departmentDescription.toString(),
                        this.utilityService.formatCurrency(data.salesAmount).toString(),
                        this.utilityService.formatCurrency(data.totalSalesAmount).toString(),
                      ];
                    }
                    fila.push(temp);
                  }
                }
                excelData.data = fila;
                excelData.reportName = 'Sales Percent Report';
                this.excelGeneratedService.generateExcel(excelData);
              }
            } else
              /**
               * Promotion Items Report
               */
              if (this.salesReportForm.value.salesReport === 'promotionItemsReport') {
                const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
                const grouped = _.groupBy(arr, pet => pet.storeName);
                const data = this.salesReportForm.value.storeLocation;
                const arrs = [];
                data.forEach(x => {
                  if (grouped && grouped[x.storeName]) {
                    const unitBuyingCost = _.sumBy(grouped[x.storeName], 'unitBuyingCost');
                    const sellingPrice = _.sumBy(grouped[x.storeName], 'sellingPrice');
                    const promotionalSalesQuantity = _.sumBy(grouped[x.storeName], 'promotionalSalesQuantity');
                    const itemSalesQuantity = _.sumBy(grouped[x.storeName], 'itemSalesQuantity');
                    const salesAmount = _.sumBy(grouped[x.storeName], 'salesAmount');
                    arrs.push({
                      storeName: x.storeName, isGroup: true,
                      businessDate: '', departmentName: '', posCode: '', description: '', unitBuyingCost: unitBuyingCost.toFixed(2),
                      sellingPrice: sellingPrice.toFixed(2), promotionalSalesQuantity: promotionalSalesQuantity.toFixed(0),
                      itemSalesQuantity: itemSalesQuantity.toFixed(0), salesAmount: salesAmount.toFixed(2)
                    });
                    grouped[x.storeName].forEach(y => {
                      arrs.push(y);
                    });
                  }
                });
                rowData = arrs;
                if (params === 'pdf') {
                  this.colWidths = [65, 70, 70, 65, 95, 65, 65, 65, 60, 60];
                  this.body.push([{ text: 'Store Name' }, { text: 'Business Date' }, { text: 'Department Name' }, { text: 'UPC Code' },
                  { text: 'Description' }, { text: 'Unit Buying Cost' }, { text: 'Selling Price' },
                  { text: 'Promotional Sales Quantity' }, { text: 'Item Sales Quantity' }, { text: 'Sales Amount' }]);
                  for (const key in rowData) {
                    if (rowData.hasOwnProperty(key)) {
                      const data = rowData[key];
                      const fila = new Array();
                      if (data.isGroup) {
                        fila.push({
                          text: data.storeName.toString(), border: [false, false, false, false], bold: true,
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
                        fila.push({
                          text: this.utilityService.formatCurrency(data.unitBuyingCost).toString(),
                          border: [false, false, false, false], alignment: 'right', bold: true,
                          color: 'white',
                          fillColor: 'black',
                        });
                        fila.push({
                          text: this.utilityService.formatCurrency(data.sellingPrice).toString(),
                          border: [false, false, false, false], alignment: 'right', bold: true,
                          color: 'white',
                          fillColor: 'black',
                        });
                        fila.push({
                          text: data.promotionalSalesQuantity.toString(),
                          border: [false, false, false, false], bold: true,
                          color: 'white', fillColor: 'black',
                        });
                        fila.push({
                          text: data.itemSalesQuantity.toString(),
                          border: [false, false, false, false], bold: true,
                          color: 'white', fillColor: 'black',
                        });
                        fila.push({
                          text: this.utilityService.formatCurrency(data.salesAmount).toString(),
                          border: [false, false, false, false], alignment: 'right', bold: true,
                          color: 'white',
                          fillColor: 'black',
                        });
                      } else {
                        fila.push({ text: '', border: [false, false, false, false] });
                        fila.push({
                          text: this.utilityService.formatDate(data.businessDate).toString(),
                          border: [false, false, false, false]
                        });
                        fila.push({ text: data.departmentName.toString(), border: [false, false, false, false] });
                        fila.push({ text: data.posCode.toString(), border: [false, false, false, false] });
                        fila.push({ text: data.description.toString(), border: [false, false, false, false] });
                        fila.push({
                          text: this.utilityService.formatCurrency(data.unitBuyingCost).toString(),
                          border: [false, false, false, false], alignment: 'right'
                        });
                        fila.push({
                          text: this.utilityService.formatCurrency(data.sellingPrice).toString(),
                          border: [false, false, false, false], alignment: 'right'
                        });
                        fila.push({ text: data.promotionalSalesQuantity.toString(), border: [false, false, false, false] });
                        fila.push({ text: data.itemSalesQuantity.toString(), border: [false, false, false, false] });
                        fila.push({
                          text: this.utilityService.formatCurrency(data.salesAmount).toString(),
                          border: [false, false, false, false], alignment: 'right'
                        });
                      }
                      this.body.push(fila);
                    }
                  }
                  this.pdfGenrateService.PDFGenrate('Promotion Items Report', this.colWidths,
                    this.body, this.salesReportForm.value.startDate, this.salesReportForm.value.endDate, 'landscape');
                  this.body = this.colWidths = [];
                }
                if (params === 'excel') {
                  const excelData = new ExcelModel();
                  excelData.header = this.headRows();
                  excelData.startDate = this.salesReportForm.value.startDate;
                  excelData.endDate = this.salesReportForm.value.endDate;
                  excelData.groupedData = true;
                  let fila = new Array();
                  for (let key in rowData) {
                    if (rowData.hasOwnProperty(key)) {
                      let data = rowData[key];
                      let temp;
                      if (data.isGroup) {
                        temp = [
                          data.storeName.toString(),
                          '',
                          '',
                          '',
                          '',
                          this.utilityService.formatCurrency(data.unitBuyingCost).toString(),
                          this.utilityService.formatCurrency(data.sellingPrice).toString(),
                          data.promotionalSalesQuantity.toString(),
                          data.itemSalesQuantity.toString(),
                          this.utilityService.formatCurrency(data.salesAmount).toString(),
                        ];
                      } else {
                        temp = [
                          '',
                          this.utilityService.formatDate(data.businessDate).toString(),
                          data.posCode.toString(),
                          data.departmentName.toString(),
                          data.description.toString(),
                          this.utilityService.formatCurrency(data.unitBuyingCost).toString(),
                          this.utilityService.formatCurrency(data.sellingPrice).toString(),
                          data.promotionalSalesQuantity.toString(),
                          data.itemSalesQuantity.toString(),
                          this.utilityService.formatCurrency(data.salesAmount).toString(),
                        ];
                      }
                      fila.push(temp);
                    }
                  }
                  excelData.data = fila;
                  excelData.reportName = 'Promotion Items Report';
                  this.excelGeneratedService.generateExcel(excelData);
                }
              } else
                /**
                 * Sales Report By Vendor
                 */
                if (this.salesReportForm.value.salesReport === 'salesReportByVendor') {
                  const arr = _.sortBy(res, [function (o) { return o.storename.toLowerCase(); }]);
                  const grouped = _.groupBy(arr, pet => pet.storename);
                  const data = this.salesReportForm.value.storeLocation;
                  const arrs = [];
                  data.forEach(x => {
                    if (grouped && grouped[x.storeName]) {
                      const purchaseBuyingCost = _.sumBy(grouped[x.storeName], 'purchaseBuyingCost');
                      const purchasedQuantity = _.sumBy(grouped[x.storeName], 'purchasedQuantity');
                      const salesBuyingCost = _.sumBy(grouped[x.storeName], 'salesBuyingCost');
                      const salesQuantity = _.sumBy(grouped[x.storeName], 'salesQuantity');
                      const sellingPrice = _.sumBy(grouped[x.storeName], 'sellingPrice');
                      const sellingUnits = _.sumBy(grouped[x.storeName], 'sellingUnits');
                      const totalBuyingCost = _.sumBy(grouped[x.storeName], 'totalBuyingCost');
                      const totalSellingCost = _.sumBy(grouped[x.storeName], 'totalSellingCost');
                      arrs.push({
                        storename: x.storeName, isGroup: true,
                        posCode: '', currentinventory: '', description: '', purchaseBuyingCost: purchaseBuyingCost.toFixed(2),
                        purchasedQuantity: purchasedQuantity.toFixed(2), salesBuyingCost: salesBuyingCost.toFixed(2),
                        salesQuantity: salesQuantity.toFixed(0), sellingPrice: sellingPrice.toFixed(2),
                        sellingUnits: sellingUnits.toFixed(0), totalBuyingCost: totalBuyingCost.toFixed(2),
                        totalSellingCost: totalSellingCost.toFixed(2)
                      });
                      grouped[x.storeName].forEach(y => {
                        arrs.push(y);
                      });
                    }
                  });
                  rowData = arrs;
                  if (params === 'pdf') {
                    this.colWidths = [65, 65, 90, 50, 55, 45, 40, 50, 50, 50, 50, 50];
                    this.body.push([{ text: 'Store Name' }, { text: 'UPC Code' }, { text: 'Description' }, { text: 'Selling Units' },
                    { text: 'Sales Quantity' }, { text: 'Buying Cost' }, { text: 'Selling Cost' },
                    { text: 'Purchased Quantity' }, { text: 'Purchase Amount' }, { text: 'Current Inventory' },
                    { text: 'Total Buying Cost' }, { text: 'Total Selling Cost' }]);
                    for (const key in rowData) {
                      if (rowData.hasOwnProperty(key)) {
                        const data = rowData[key];
                        const fila = new Array();
                        if (data.isGroup) {
                          fila.push({
                            text: data.storename.toString(), border: [false, false, false, false], bold: true,
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
                          fila.push({
                            text: '', border: [false, false, false, false], bold: true,
                            color: 'white',
                            fillColor: 'black',
                          });
                          fila.push({
                            text: data.salesQuantity.toString(),
                            border: [false, false, false, false], bold: true,
                            color: 'white',
                            fillColor: 'black',
                          });
                          fila.push({
                            text: this.utilityService.formatCurrency(data.salesBuyingCost).toString(),
                            border: [false, false, false, false], alignment: 'right', bold: true,
                            color: 'white',
                            fillColor: 'black',
                          });
                          fila.push({
                            text: this.utilityService.formatCurrency(data.sellingPrice).toString(),
                            border: [false, false, false, false], alignment: 'right', bold: true,
                            color: 'white',
                            fillColor: 'black',
                          });
                          fila.push({
                            text: data.purchasedQuantity.toString(),
                            border: [false, false, false, false], alignment: 'right', bold: true,
                            color: 'white',
                            fillColor: 'black',
                          });
                          fila.push({
                            text: this.utilityService.formatCurrency(data.purchaseBuyingCost).toString(),
                            border: [false, false, false, false], alignment: 'right', bold: true,
                            color: 'white',
                            fillColor: 'black',
                          });
                          fila.push({
                            text: this.utilityService.formatCurrency(data.currentinventory).toString(),
                            border: [false, false, false, false], alignment: 'right', bold: true,
                            color: 'white',
                            fillColor: 'black',
                          });
                          fila.push({
                            text: this.utilityService.formatCurrency(data.totalBuyingCost).toString(),
                            border: [false, false, false, false], alignment: 'right', bold: true,
                            color: 'white',
                            fillColor: 'black',
                          });
                          fila.push({
                            text: this.utilityService.formatCurrency(data.totalSellingCost).toString(),
                            border: [false, false, false, false], alignment: 'right', bold: true,
                            color: 'white',
                            fillColor: 'black',
                          });
                        } else {
                          fila.push({ text: '', border: [false, false, false, false] });
                          fila.push({ text: data.posCode.toString(), border: [false, false, false, false] });
                          fila.push({ text: data.description.toString(), border: [false, false, false, false] });
                          fila.push({ text: data.sellingUnits, border: [false, false, false, false] });
                          fila.push({ text: data.salesQuantity, border: [false, false, false, false] });
                          fila.push({
                            text: this.utilityService.formatCurrency(data.salesBuyingCost).toString(),
                            alignment: 'right', border: [false, false, false, false]
                          });
                          fila.push({
                            text: this.utilityService.formatCurrency(data.sellingPrice).toString(),
                            alignment: 'right', border: [false, false, false, false]
                          });
                          fila.push({ text: data.purchasedQuantity, border: [false, false, false, false] });
                          fila.push({ text: data.purchaseBuyingCost, border: [false, false, false, false] });

                          fila.push({ text: data.currentinventory, border: [false, false, false, false] });
                          fila.push({
                            text: this.utilityService.formatCurrency(data.totalBuyingCost).toString(),
                            border: [false, false, false, false], alignment: 'right'
                          });
                          fila.push({
                            text: this.utilityService.formatCurrency(data.totalSellingCost).toString(),
                            border: [false, false, false, false], alignment: 'right'
                          });
                        } this.body.push(fila);
                      }
                    }
                    this.pdfGenrateService.PDFGenrate('Sales Report By Vendor', this.colWidths,
                      this.body, this.salesReportForm.value.startDate, this.salesReportForm.value.endDate, 'landscape');
                    this.body = this.colWidths = [];
                  }
                  if (params === 'excel') {
                    const excelData = new ExcelModel();
                    excelData.header = this.headRows();
                    excelData.startDate = this.salesReportForm.value.startDate;
                    excelData.endDate = this.salesReportForm.value.endDate;
                    excelData.groupedData = true;
                    let fila = new Array();
                    for (let key in rowData) {
                      if (rowData.hasOwnProperty(key)) {
                        let data = rowData[key];
                        let temp;
                        if (data.isGroup) {
                          temp = [data.storename.toString(),
                            '',
                            '',
                            '',
                          data.salesQuantity,
                          data.salesBuyingCost,
                          data.sellingPrice,
                          data.purchasedQuantity,
                          this.utilityService.formatCurrency(data.purchaseBuyingCost).toString(),
                          data.currentinventory,
                          this.utilityService.formatCurrency(data.totalBuyingCost).toString(),
                          this.utilityService.formatCurrency(data.totalSellingCost).toString(),]
                        } else {
                          temp = [
                            '',
                            data.posCode.toString(),
                            data.description.toString(),
                            data.sellingUnits,
                            data.salesQuantity,
                            data.salesBuyingCost,
                            data.sellingPrice,
                            data.purchasedQuantity,
                            data.purchaseBuyingCost,
                            data.currentinventory,
                            this.utilityService.formatCurrency(data.totalBuyingCost).toString(),
                            this.utilityService.formatCurrency(data.totalSellingCost).toString(),
                          ];
                        }
                        fila.push(temp);
                      }
                    }
                    excelData.data = fila;
                    excelData.reportName = 'Sales Report By Vendor';
                    this.excelGeneratedService.generateExcel(excelData);
                  }

                } else
                  /**
                   * Sales Report
                   */
                  if (this.salesReportForm.value.salesReport === 'salesReport') {
                    const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
                    const grouped = _.groupBy(arr, pet => pet.storeName);
                    const data = this.salesReportForm.value.storeLocation;
                    const arrs = [];
                    data.forEach(x => {
                      if (grouped && grouped[x.storeName]) {
                        const totalAmount = _.sumBy(grouped[x.storeName], 'totalAmount');
                        const upcSalesAmount = _.sumBy(grouped[x.storeName], 'upcSalesAmount');
                        const openAmount = _.sumBy(grouped[x.storeName], 'openAmount');
                        arrs.push({
                          storeName: x.storeName, departmentDescription: '', departmentTypeName: '',
                          totalAmount: totalAmount.toFixed(2), upcSalesAmount: upcSalesAmount.toFixed(2),
                          openAmount: openAmount.toFixed(2), isGroup: true
                        });
                        grouped[x.storeName].forEach(y => {
                          arrs.push(y);
                        });
                      }
                    });
                    rowData = arrs;
                    if (params === 'pdf') {
                      this.colWidths = ['*', '*', '*', '*', '*', '*'];
                      this.body.push([{ text: 'Store Name' }, { text: 'Department Description' }, { text: 'Department Type Name' },
                      { text: 'Total Amount' }, { text: 'UPC Sales Amount' }, { text: 'Open Amount' },
                      ]);

                      for (const key in rowData) {
                        if (rowData.hasOwnProperty(key)) {
                          const data = rowData[key];
                          const fila = new Array();
                          if (data.isGroup) {
                            fila.push({
                              text: data.storeName.toString(), border: [false, false, false, false], bold: true,
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
                            fila.push({
                              text: this.utilityService.formatCurrency(data.totalAmount).toString(),
                              border: [false, false, false, false], alignment: 'right', bold: true,
                              color: 'white',
                              fillColor: 'black',
                            });
                            fila.push({
                              text: this.utilityService.formatCurrency(data.upcSalesAmount).toString(),
                              border: [false, false, false, false], alignment: 'right', bold: true,
                              color: 'white',
                              fillColor: 'black',
                            });
                            fila.push({
                              text: this.utilityService.formatCurrency(data.openAmount).toString(),
                              border: [false, false, false, false], alignment: 'right', bold: true,
                              color: 'white',
                              fillColor: 'black',
                            });
                          } else {
                            fila.push({ text: '-', border: [false, false, false, false], alignment: 'center' });
                            fila.push({ text: data.departmentDescription.toString(), border: [false, false, false, false] });
                            fila.push({ text: data.departmentTypeName.toString(), border: [false, false, false, false] });
                            fila.push({
                              text: this.utilityService.formatCurrency(data.totalAmount).toString(),
                              border: [false, false, false, false], alignment: 'right'
                            });
                            fila.push({
                              text: this.utilityService.formatCurrency(data.upcSalesAmount).toString(),
                              border: [false, false, false, false], alignment: 'right'
                            });
                            fila.push({
                              text: this.utilityService.formatCurrency(data.openAmount).toString(),
                              border: [false, false, false, false], alignment: 'right'
                            });
                          }
                          this.body.push(fila);
                        }
                      }
                      this.pdfGenrateService.PDFGenrate('Sales Report', this.colWidths,
                        this.body, this.salesReportForm.value.startDate, this.salesReportForm.value.endDate);
                      this.body = this.colWidths = [];
                    }
                    if (params === 'excel') {
                      const excelData = new ExcelModel();
                      excelData.header = this.headRows();
                      excelData.startDate = this.salesReportForm.value.startDate;
                      excelData.endDate = this.salesReportForm.value.endDate;
                      excelData.groupedData = true;
                      let fila = new Array();
                      for (let key in rowData) {
                        if (rowData.hasOwnProperty(key)) {
                          let data = rowData[key];
                          let temp;
                          if (data.isGroup) {
                            temp = [
                              data.storeName.toString(),
                              '',
                              '',
                              this.utilityService.formatCurrency(data.totalAmount).toString(),
                              this.utilityService.formatCurrency(data.upcSalesAmount).toString(),
                              this.utilityService.formatCurrency(data.openAmount).toString(),
                            ];
                          } else {
                            temp = [
                              '',
                              data.departmentDescription.toString(),
                              data.departmentTypeName.toString(),
                              this.utilityService.formatCurrency(data.totalAmount).toString(),
                              this.utilityService.formatCurrency(data.upcSalesAmount).toString(),
                              this.utilityService.formatCurrency(data.openAmount).toString(),
                            ];
                          }
                          fila.push(temp);
                        }
                      }
                      excelData.data = fila;
                      excelData.reportName = 'Sales Report';
                      this.excelGeneratedService.generateExcel(excelData);
                    }
                  } else
                    /**
                     * Sales Report By Price Group
                     */
                    if (this.salesReportForm.value.salesReport === 'salesReportByPriceGroup') {
                      const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
                      const grouped = _.groupBy(arr, pet => pet.storeName);
                      const data = this.salesReportForm.value.storeLocation;
                      const arrs = [];
                      data.forEach(x => {
                        if (grouped && grouped[x.storeName]) {
                          const singleUnitSalesCost = _.sumBy(grouped[x.storeName], 'singleUnitSalesCost');
                          const salesQuantity = _.sumBy(grouped[x.storeName], 'salesQuantity');
                          const salesAmount = _.sumBy(grouped[x.storeName], 'salesAmount');
                          const buyingCost = _.sumBy(grouped[x.storeName], 'buyingCost');
                          const singleUnitBuyingCost = _.sumBy(grouped[x.storeName], 'singleUnitBuyingCost');
                          const totalSalesAmount = _.sumBy(grouped[x.storeName], 'totalSalesAmount');
                          arrs.push({
                            storeName: x.storeName, departmentDescription: '', posCode: '', description: '',
                            groupName: '', singleUnitSalesCost: singleUnitSalesCost.toFixed(2),
                            salesQuantity: salesQuantity.toFixed(2),
                            salesAmount: salesAmount.toFixed(2), buyingCost: buyingCost.toFixed(2),
                            singleUnitBuyingCost: singleUnitBuyingCost.toFixed(2),
                            profit: '', margin: '',
                            totalSalesAmount: totalSalesAmount ? totalSalesAmount.toFixed(2) : 0.0, isGroup: true
                          });
                          grouped[x.storeName].forEach(y => {
                            arrs.push(y);
                          });
                        }
                      });
                      rowData = arrs;

                      if (params === 'pdf') {
                        this.colWidths = [30, 30, 60, 60, 30, 40, 35, '*', '*', '*', 40, 40, 70];
                        // this.colWidths = ['*', '*', '*', '*', '*', 35, 30, '*', '*', '*', 30, 40, 50];
                        this.body.push([{ text: 'Store Name' }, { text: 'Department Description' }, { text: 'UPC Code' },
                        { text: 'Description' }, { text: 'Group Name' }, { text: 'Unit Sales Cost' },
                        { text: 'Sales Qty' }, { text: 'Sales Amount' }, { text: 'Buying Cost' },
                        { text: 'Unit Buying Cost' }, { text: 'Profit ' }, { text: 'Margin' },
                        { text: 'Total Sales Amount' },
                        ]);

                        for (const key in rowData) {
                          if (rowData.hasOwnProperty(key)) {
                            const data = rowData[key];
                            const fila = new Array();
                            if (data.isGroup) {
                              fila.push({
                                text: data.storeName.toString(), border: [false, false, false, false],
                                bold: true,
                                color: 'white',
                                fillColor: 'black'
                              });
                              fila.push({
                                text: '', border: [false, false, false, false],
                                bold: true,
                                color: 'white',
                                fillColor: 'black'
                              });
                              fila.push({
                                text: '', border: [false, false, false, false],
                                bold: true,
                                color: 'white',
                                fillColor: 'black'
                              });
                              fila.push({
                                text: '', border: [false, false, false, false],
                                bold: true,
                                color: 'white',
                                fillColor: 'black'
                              });
                              fila.push({
                                text: '', border: [false, false, false, false],
                                bold: true,
                                color: 'white',
                                fillColor: 'black'
                              });
                              fila.push({
                                text: data.singleUnitSalesCost.toString(), border: [false, false, false, false],
                                bold: true,
                                color: 'white',
                                fillColor: 'black'
                              });
                              fila.push({
                                text: data.salesQuantity.toString(),
                                border: [false, false, false, false], alignment: 'right',
                                bold: true,
                                color: 'white',
                                fillColor: 'black'
                              });
                              fila.push({
                                text: this.utilityService.formatCurrency(data.salesAmount).toString(),
                                border: [false, false, false, false], alignment: 'right',
                                bold: true,
                                color: 'white',
                                fillColor: 'black'
                              });
                              fila.push({
                                text: this.utilityService.formatCurrency(data.buyingCost).toString(),
                                border: [false, false, false, false], alignment: 'right',
                                bold: true,
                                color: 'white',
                                fillColor: 'black'
                              });
                              fila.push({
                                text: this.utilityService.formatCurrency(data.singleUnitBuyingCost).toString(),
                                border: [false, false, false, false], alignment: 'right',
                                bold: true,
                                color: 'white',
                                fillColor: 'black'
                              });
                              fila.push({
                                text: '', border: [false, false, false, false], alignment: 'right',
                                bold: true,
                                color: 'white',
                                fillColor: 'black'
                              });
                              fila.push({
                                text: '', border: [false, false, false, false], alignment: 'right',
                                bold: true,
                                color: 'white',
                                fillColor: 'black'
                              });
                              fila.push({
                                text: this.utilityService.formatCurrency(data.totalSalesAmount).toString(),
                                border: [false, false, false, false], alignment: 'right',
                                bold: true,
                                color: 'white',
                                fillColor: 'black'
                              });
                            } else {
                              fila.push({ text: '', border: [false, false, false, false] });
                              fila.push({ text: data.departmentDescription.toString(), border: [false, false, false, false] });
                              fila.push({ text: data.posCode.toString(), border: [false, false, false, false] });
                              fila.push({ text: data.description.toString(), border: [false, false, false, false] });
                              fila.push({ text: data.groupName.toString(), border: [false, false, false, false] });
                              fila.push({ text: data.singleUnitSalesCost.toString(), border: [false, false, false, false] });
                              fila.push({
                                text: data.salesQuantity.toString(),
                                border: [false, false, false, false], alignment: 'right'
                              });
                              fila.push({
                                text: this.utilityService.formatCurrency(data.salesAmount).toString(),
                                border: [false, false, false, false], alignment: 'right'
                              });
                              fila.push({
                                text: this.utilityService.formatCurrency(data.buyingCost).toString(),
                                border: [false, false, false, false], alignment: 'right'
                              });
                              fila.push({
                                text: this.utilityService.formatCurrency(data.singleUnitBuyingCost).toString(),
                                border: [false, false, false, false], alignment: 'right'
                              });
                              fila.push({ text: data.profit.toString(), border: [false, false, false, false], alignment: 'right' });
                              fila.push({ text: data.margin.toString(), border: [false, false, false, false], alignment: 'right' });
                              fila.push({
                                text: this.utilityService.formatCurrency(data.totalSalesAmount).toString(),
                                border: [false, false, false, false], alignment: 'right'
                              });
                            }
                            this.body.push(fila);
                          }
                        }
                        this.pdfGenrateService.PDFGenrate('Sales Report By Price Group', this.colWidths,
                          this.body, this.salesReportForm.value.startDate, this.salesReportForm.value.endDate, true);
                        this.body = this.colWidths = [];
                      }
                      if (params === 'excel') {
                        const excelData = new ExcelModel();
                        excelData.header = this.headRows();
                        excelData.startDate = this.salesReportForm.value.startDate;
                        excelData.endDate = this.salesReportForm.value.endDate;
                        excelData.groupedData = true;
                        let fila = new Array();
                        for (let key in rowData) {
                          if (rowData.hasOwnProperty(key)) {
                            let data = rowData[key];
                            let temp;
                            if (data.isGroup) {
                              temp = [
                                data.storeName.toString(),
                                '',
                                '',
                                '',
                                '',
                                data.singleUnitSalesCost.toString(),
                                data.salesQuantity.toString(),
                                this.utilityService.formatCurrency(data.salesAmount).toString(),
                                this.utilityService.formatCurrency(data.buyingCost).toString(),
                                this.utilityService.formatCurrency(data.singleUnitBuyingCost).toString(),
                                '',
                                '',
                                this.utilityService.formatCurrency(data.totalSalesAmount).toString(),
                              ];
                            } else {
                              temp = [
                                '',
                                data.departmentDescription.toString(),
                                data.posCode.toString(),
                                data.description.toString(),
                                data.groupName.toString(),
                                data.singleUnitSalesCost.toString(),
                                data.salesQuantity.toString(),
                                this.utilityService.formatCurrency(data.salesAmount).toString(),
                                this.utilityService.formatCurrency(data.buyingCost).toString(),
                                this.utilityService.formatCurrency(data.singleUnitBuyingCost).toString(),
                                data.profit.toString(),
                                data.margin.toString(),
                                this.utilityService.formatCurrency(data.totalSalesAmount).toString(),
                              ];
                            }
                            fila.push(temp);
                          }
                        }
                        excelData.data = fila;
                        excelData.reportName = 'Sales Report By Price Group';
                        this.excelGeneratedService.generateExcel(excelData);
                      }
                    }
  }
  SalesReport() {
    this.reportRowData = [];
    if (this.salesReportForm.value.salesReport === '') {
      this.toastr.info('Please Select Report Type');
      return;
    }
    const storeLocationIdObj = this.salesReportForm.value.storeLocation ?
      this.salesReportForm.value.storeLocation.map(x => x.storeLocationID).join(',') : '';
    const vendorObj = this.salesReportForm.value.vendor ? this.salesReportForm.value.vendor.map(x => x.vendorID).join(',') : '';
    const departmentObj = this.salesReportForm.value.departmentIDs ?
      this.salesReportForm.value.departmentIDs.map(x => x.departmentID).join(',') : '';
    const priceGroupObj = this.salesReportForm.value.groupID ? this.salesReportForm.value.groupID.map(x => x.CompanyPriceGroupID).join(',') : '';
    const postData = {
      storeLocation: storeLocationIdObj,
      companyID: this.userInfo.companyId,
      startDate: this.salesReportForm.value.startDate,
      endDate: this.salesReportForm.value.endDate,
    };

    /**
     * Department Sales Report
     */

    if (this.salesReportForm.value.salesReport === 'departmentSalesReport') {
      const postDataByDeptSales = {
        ...postData,
        department: departmentObj,
      };
      this.spinner.show();
      this.setupService.postData('SalesReports/DetailSaleReportByDepartments', postDataByDeptSales).subscribe((res) => {
        this.spinner.hide();
        if (res && res['statusCode']) {
          this.reportRowData = [];
          this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
          return;
        }
        _.forEach(res, function (el, index, arr) {
          if (el.totalSalesAmount > 0 && el.salesAmount == 0) {
            el.totalSalesAmount = 0;
          }
          else if (el.totalSalesAmount > 0 && el.salesAmount) {
            el.totalSalesAmount = ((el.salesAmount / el.totalSalesAmount) * 100);
          }
        });
        const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
        this.gridHeader();
        this.reportRowData = arr;
      }, (error) => {
        this.spinner.hide();
        console.log(error);
        this.reportRowData = [];
      });


    } else
      /**
       * Department Sales Report Detail
       */
      if (this.salesReportForm.value.salesReport === 'departmentSalesReportDetail') {
        const postDataByItem = {
          ...postData,
          department: departmentObj,
        };
        this.spinner.show();
        this.setupService.postData('SalesReports/SalesRoomSummaryDetailAsync', postDataByItem)
          .subscribe((res) => {
            this.spinner.hide();
            if (res && res['statusCode']) {
              this.reportRowData = [];
              this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
              return;
            }
            const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
            this.gridHeader();
            this.reportRowData = arr;
          }, (error) => {
            this.spinner.hide();
            console.log(error);
            this.reportRowData = [];
          });

      } else
        /**
         * Item Sales Report
         */
        if (this.salesReportForm.value.salesReport === 'itemSalesReport') {
          const postDataByItem = {
            ...postData,
            department: departmentObj,
            orderBy: this.salesReportForm.value.orderBy
          };
          this.spinner.show();
          this.setupService.postData('SalesReports/SalesRoomByItemAsync', postDataByItem)
            .subscribe((res) => {
              this.spinner.hide();
              if (res && res['statusCode']) {
                this.reportRowData = [];
                this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
                return;
              }
              const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
              this.gridHeader();
              this.reportRowData = arr;
            }, (error) => {
              this.reportRowData = [];
              this.spinner.hide();
            });
        } else
          /**
           * Item Sales Report Detail
           */
          if (this.salesReportForm.value.salesReport === 'itemSalesReportDetail') {
            const postDataBySalesDetail = {
              ...postData,
              department: departmentObj,
            };
            this.spinner.show();
            this.setupService.postData('SalesReports/SalesDetailReportByItems', postDataBySalesDetail).subscribe((res) => {
              this.spinner.hide();
              if (res && res['statusCode']) {
                this.reportRowData = [];
                this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
                return;
              }
              const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
              this.gridHeader();
              this.reportRowData = arr;

            }, (error) => {
              this.reportRowData = [];
              this.spinner.hide();
            });
          } else
            /**
             * Sales Percent Report
             */
            if (this.salesReportForm.value.salesReport === 'salesPercentReport') {
              const postDataByPercent = {
                ...postData,
                department: departmentObj,
              };
              this.spinner.show();
              this.setupService.postData('SalesReports/SalesReportsInPercentages', postDataByPercent).subscribe((res) => {
                this.spinner.hide();
                if (res && res['statusCode']) {
                  this.reportRowData = [];
                  this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
                  return;
                }
                const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
                this.gridHeader();
                this.reportRowData = arr;

              }, (error) => {
                this.spinner.hide();
                console.log(error);
              });
            } else
              /**
               * Promotion Items Report
               */
              if (this.salesReportForm.value.salesReport === 'promotionItemsReport') {
                const postDataByPromotion = {
                  ...postData,
                  department: departmentObj,
                  // department: 2002,
                  // storeLocation: 266,
                  // startDate: '2014-03-14',
                  // endDate: '2014-03-14',
                };
                this.spinner.show();
                this.setupService.postData('SalesReports/ItemReportsByPromotions', postDataByPromotion).subscribe((res) => {
                  this.spinner.hide();
                  if (res && res['statusCode']) {
                    this.reportRowData = [];
                    this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
                    return;
                  }
                  const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
                  this.gridHeader();
                  this.reportRowData = arr;

                }, (error) => {
                  this.spinner.hide();
                  console.log(error);
                });
              } else
                /**
                 * Sales Report By Vendor
                 */
                if (this.salesReportForm.value.salesReport === 'salesReportByVendor') {
                  const postDataByVendor = {
                    ...postData,
                    vendor: vendorObj,
                    // vendor: '789',
                    // storeLocation: '45,38,31,71',
                    // startDate: '2016-01-03',
                    // endDate: '2016-01-03',
                  };
                  this.spinner.show();
                  this.setupService.postData('SalesReports/SalesReportByVendors', postDataByVendor).subscribe((res) => {
                    this.spinner.hide();
                    if (res && res['statusCode']) {
                      this.reportRowData = [];
                      this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
                      return;
                    }
                    const arr = _.sortBy(res, [function (o) { return o.storename.toLowerCase(); }]);
                    this.gridHeader();
                    this.reportRowData = arr;

                  }, (error) => {
                    this.spinner.hide();
                    console.log(error);
                  });
                } else
                  /**
                   * Sales Report
                   */
                  if (this.salesReportForm.value.salesReport === 'salesReport') {
                    const postDataBySales = {
                      ...postData,
                      storeLocationID: storeLocationIdObj,
                      departmentID: departmentObj,
                    };
                    this.spinner.show();
                    this.setupService.postData('SalesReports/SalesReports', postDataBySales).subscribe((res) => {
                      this.spinner.hide();
                      if (res && res['statusCode']) {
                        this.reportRowData = [];
                        this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
                        return;
                      }
                      const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
                      this.gridHeader();
                      this.reportRowData = arr;

                    }, (error) => {
                      console.log(error);
                      this.spinner.hide();
                    });
                  } else
                    /**
                     * Sales Report By Price Group
                     */
                    if (this.salesReportForm.value.salesReport === 'salesReportByPriceGroup') {
                      const postDataBySales = {
                        ...postData,
                        groupid: priceGroupObj,
                      };
                      this.spinner.show();
                      this.setupService.postData('SalesReports/SalesReportByPriceGroups', postDataBySales).subscribe((res) => {
                        this.spinner.hide();
                        if (res && res['statusCode']) {
                          this.reportRowData = [];
                          this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
                          return;
                        }
                        const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
                        this.gridHeader();
                        this.reportRowData = arr;
                      }, (error) => {
                        this.spinner.hide();
                        console.log(error);
                      });
                    }
  }
  checkReportName() {
    switch (this.salesReportForm.value.salesReport) {
      case 'departmentSalesReport':
        return 'Department Sales Report';
      case 'departmentSalesReportDetail':
        return 'Department Sales Report Detail';
      case 'itemSalesReport':
        return 'Item Sales Report';
      case 'itemSalesReportDetail':
        return 'Item Sales Report Detail';
      case 'salesPercentReport':
        return 'Sales Percent Report';
      case 'promotionItemsReport':
        return 'Promotion Items Report';
      case 'salesReportByVendor':
        return 'Sales Report By Vendor';
      case 'salesReport':
        return 'Sales Report';
      case 'salesReportByPriceGroup':
        return 'Sales Report By Price Group';
    }
  }

  public captureScreen() {
    const doc = new jspdf('p', 'pt');

    const headerData = {
      reportName: this.checkReportName(),
      fromDate: this.salesReportForm.value.startDate, toDate: this.salesReportForm.value.endDate
    };
    doc.autoTable({
      //  html: '#my-table',
      head: this.headRows(),
      body: this.reportRowData,
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
    switch (this.salesReportForm.value.salesReport) {
      case 'departmentSalesReport':
        return this.reportService.getColumnDef(this.constantsService.reportTypes.departmentSalesReport);
      case 'departmentSalesReportDetail':
        return this.reportService.getColumnDef(this.constantsService.reportTypes.departmentSalesReportDetail);
      case 'itemSalesReport':
        return this.reportService.getColumnDef(this.constantsService.reportTypes.itemSalesReport);
      case 'itemSalesReportDetail':
        return this.reportService.getColumnDef(this.constantsService.reportTypes.itemSalesReportDetail);
      case 'salesPercentReport':
        return this.reportService.getColumnDef(this.constantsService.reportTypes.salesPercentReport);
      case 'promotionItemsReport':
        return this.reportService.getColumnDef(this.constantsService.reportTypes.promotionItemsReport);
      case 'salesReportByVendor':
        return this.reportService.getColumnDef(this.constantsService.reportTypes.salesReportByVendor);
      case 'salesReport':
        return this.reportService.getColumnDef(this.constantsService.reportTypes.salesReport);
      case 'salesReportByPriceGroup':
        return this.reportService.getColumnDef(this.constantsService.reportTypes.salesReportByPriceGroup);
    }
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }
  gridHeader() {
    switch (this.salesReportForm.value.salesReport) {
      case 'departmentSalesReport':
        this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.departmentSalesReport);
        return true;
      case 'departmentSalesReportDetail':
        this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.departmentSalesReportDetail);
        return true;
      case 'itemSalesReport':
        this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.itemSalesReport);
        return true;
      case 'itemSalesReportDetail':
        this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.itemSalesReportDetail);
        return true;
      case 'salesPercentReport':
        this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.salesPercentReport);
        return true;
      case 'promotionItemsReport':
        this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.promotionItemsReport);
        return true;
      case 'salesReportByVendor':
        this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.salesReportByVendor);
        return true;
      case 'salesReport':
        this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.salesReport);
        return true;
      case 'salesReportByPriceGroup':
        this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.salesReportByPriceGroup);
        return true;
    }
  }
}
