import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { StoreService } from '@shared/services/store/store.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { FormBuilder } from '@angular/forms';
import { SetupService } from '@shared/services/setupService/setup-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ReportGridService } from '@shared/services/report/report-grid.service';
import * as _ from 'lodash';
import { PDFGenrateService } from '@shared/services/pdf-genrate/pdf-genrate.service';
import { ExcelModel } from '@models/excel-data-model';
import { ExcelGeneratedService } from '@shared/services/excelGenerate/excel-generated.service';
import { UtilityService } from '@shared/services/utility/utility.service';

@Component({
  selector: 'app-invoice-bin-report',
  templateUrl: './invoice-bin-report.component.html',
  styleUrls: ['./invoice-bin-report.component.scss']
})
export class InvoiceBinReportComponent implements OnInit {

  LocationList: any;
  inputDOB: any;
  _startDate = moment().format('MM-DD-YYYY');
  _endDate = moment().format('MM-DD-YYYY');
  userInfo = this.constantsService.getUserInfo();
  storeLocationList: any;
  isSingalStore: boolean;
  invoicebinReportForm = this.fb.group({
    startDate: this._startDate,
    endDate: this._endDate,
    storeLocation: [''],
    companyID: [null],
    vendorIDs: ''
    // weeklyReportButtonClick: [''],
    // departmentTypeID: [''],
  });
  vendorList: any;
  rowData: any;
  gridOption: any;
  body: any = [];
  colWidths: any = [];
  inputDate = moment().format('MM-DD-YYYY');
  selectedDateRange: any;
  constructor(private storeService: StoreService, private constantsService: ConstantService, private fb: FormBuilder,
    private setupService: SetupService, private spinner: NgxSpinnerService, private toastr: ToastrService,
    private reportGridService: ReportGridService, private pdfGenrateService: PDFGenrateService, private utilityService: UtilityService,
    private excelGeneratedService: ExcelGeneratedService) { }

  ngOnInit() {
    this.getStoreLocationList();
    this.getVendorByCompanyID();
  }
  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this._startDate=this.selectedDateRange.fDate;
    this._endDate=this.selectedDateRange.tDate;
  }
  getVendorByCompanyID() {
    this.setupService.getData(`Vendor/getAll/${this.userInfo.companyId}`).subscribe(res => {
      this.vendorList = res;
    });
  }
  getStoreLocationList() {
    this.storeService.getByCompanyId(this.userInfo.companyId, this.userInfo.userName).subscribe(res => {
      if (res && res['statusCode']) {
        this.storeLocationList = [];
      }
      this.storeLocationList = res;
      console.log('store loca lst', this.storeLocationList);
      this.isSingalStore = false;
      if (this.storeLocationList && this.storeLocationList.length === 1) {
        this.isSingalStore = true;
        this.invoicebinReportForm.get('storeLocationIds').setValue(this.storeLocationList[0].storeLocationID.toString());
      }
    });
  }

  searchInvoicebinReport() {
    this.spinner.show();
    const storeLocationIdObj = this.isSingalStore ? this.invoicebinReportForm.value.storeLocation :
      this.invoicebinReportForm.value.storeLocation ?
        this.invoicebinReportForm.value.storeLocation.map(x => x.storeLocationID).join(',') : '';
    console.log('storeLocationIdObj:', this.invoicebinReportForm.value.storeLocation);
    console.log('invoicebinReportForm:', this.invoicebinReportForm);
    const vendorObj = this.invoicebinReportForm.value.vendorIDs ?
      this.invoicebinReportForm.value.vendorIDs.map(x => x.vendorID).join(',') : '';
    /*  const departmentObj = this.invoicebinReportForm.value.departmentIDs ?
       this.invoicebinReportForm.value.departmentIDs.map(x => x.departmentID).join(',') : ''; */
    /*  const paymentTypeObj = this.invoicebinReportForm.value.paymentSourceID ?
       this.invoicebinReportForm.value.paymentSourceID.map(x => x.paymentSourceID).join(',') : ''; */
    this.rowData = [];
    const postData = {
      storeLocation: storeLocationIdObj,
      companyID: this.userInfo.companyId,
      startDate: this._startDate,
      endDate: this._endDate,
    };


    if (true) {
      const postDataByItem = {
        ...postData,
        vendorIDs: vendorObj,
      };
      this.setupService.postData('PurchaseReports/PurchaseReportByItems', postDataByItem).subscribe((res) => {
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
        // this.gridHeader();
        this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.purchaseReportByItem);
        this.rowData = arr;
      }, (error) => {
        console.log(error);
        this.rowData = [];
        this.spinner.hide();
      });
    } else {
      this.spinner.hide();
    }

  }
  searchSalesReport(param) {
    let res = this.rowData;
    let rowData = [];

    /**
     * Purchase Report By Item
     */
    if (true) {
      const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
      const grouped = _.groupBy(arr, pet => pet.storeName);
      const data = this.invoicebinReportForm.value.storeLocation;
      const arrs = [];
      data.forEach(x => {
        if (grouped && grouped[x.storeName]) {

          const invoiceValuePrice = _.sumBy(grouped[x.storeName], 'invoiceValuePrice');
          const buyingCaseQuantity = _.sumBy(grouped[x.storeName], 'buyingCaseQuantity');
          const casePrice = _.sumBy(grouped[x.storeName], 'casePrice');
          const itemCost = _.sumBy(grouped[x.storeName], 'itemCost');
          const regularSellPrice = _.sumBy(grouped[x.storeName], 'regularSellPrice');
          const profitMargin = _.sumBy(grouped[x.storeName], 'profitMargin');
          arrs.push({
            storeName: x.storeName, departmentDescription: '', buyingCaseQuantity: buyingCaseQuantity.toFixed(0),
            invoiceValuePrice: invoiceValuePrice.toFixed(2), casePrice: casePrice.toFixed(2),
            itemCost: itemCost.toFixed(2), regularSellPrice: regularSellPrice.toFixed(2), profitMargin: profitMargin.toFixed(2),
            vendorName: '', posCode: '', description: '', isGroup: true
          });

          grouped[x.storeName].forEach(y => { arrs.push(y); });
        }
      });
      rowData = arrs;

      if (param === 'pdf') {
        this.colWidths = [80, 90, 75, 100, 70, 45, 55, 50, 55, 55];
        this.body.push([{ text: 'Store Name' }, { text: 'Vendor Name' },
        { text: 'UPC Code' }, { text: 'Item', }, { text: 'Unit Buying Cost' },
        { text: 'Case Qty' }, { text: 'Case Price' }, { text: 'Total Cost' },
        { text: 'Selling Price' }, { text: 'Margin' }
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
                text: '', border: [false, false, false, false], bold: true, color: 'white', fillColor: 'black',
              });

              fila.push({
                text: '', border: [false, false, false, false], bold: true, color: 'white', fillColor: 'black',
              });
              fila.push({
                text: '', border: [false, false, false, false], bold: true, color: 'white', fillColor: 'black',
              });

              fila.push({
                text: this.utilityService.formatCurrency(data.invoiceValuePrice).toString(),
                border: [false, false, false, false], alignment: 'right', bold: true,
                color: 'white', fillColor: 'black',
              });

              fila.push({
                text: data.buyingCaseQuantity.toString(),
                border: [false, false, false, false], bold: true,
                color: 'white', fillColor: 'black',
              });
              fila.push({
                text: this.utilityService.formatCurrency(data.casePrice).toString(),
                border: [false, false, false, false], alignment: 'right', bold: true,
                color: 'white', fillColor: 'black',
              });
              fila.push({
                text: this.utilityService.formatCurrency(data.itemCost).toString(),
                border: [false, false, false, false], alignment: 'right', bold: true,
                color: 'white', fillColor: 'black',
              });

              fila.push({
                text: this.utilityService.formatCurrency(data.regularSellPrice).toString(),
                border: [false, false, false, false], alignment: 'right', bold: true,
                color: 'white', fillColor: 'black',
              });
              fila.push({
                text: data.profitMargin.toString(),
                border: [false, false, false, false], bold: true,
                color: 'white', fillColor: 'black',
              });

              this.body.push(fila);
            } else {

              fila.push({ text: '', border: [false, false, false, false] });
              fila.push({ text: data.vendorName.toString(), border: [false, false, false, false] });
              fila.push({ text: data.posCode.toString(), border: [false, false, false, false] });
              fila.push({ text: data.description.toString(), border: [false, false, false, false] });
              fila.push({
                text: this.utilityService.formatCurrency(data.invoiceValuePrice).toString(),
                border: [false, false, false, false], alignment: 'right'
              });
              fila.push({ text: data.buyingCaseQuantity.toString(), border: [false, false, false, false] });
              fila.push({
                text: this.utilityService.formatCurrency(data.casePrice).toString(),
                border: [false, false, false, false], alignment: 'right'
              });
              fila.push({
                text: this.utilityService.formatCurrency(data.itemCost).toString(),
                border: [false, false, false, false], alignment: 'right'
              });
              fila.push({
                text: this.utilityService.formatCurrency(data.regularSellPrice).toString(),
                border: [false, false, false, false], alignment: 'right'
              });
              fila.push({
                text: this.utilityService.formatCurrency(data.regularSellPrice).toString(),//this.utilityService.formatDecimalDigit(data.profitMargin).toString(),
                border: [false, false, false, false],
              });
            } this.body.push(fila);
          }
        }
        this.pdfGenrateService.PDFGenrate('Purchase Report By Item', this.colWidths,
          this.body, this.invoicebinReportForm.value.startDate, this.invoicebinReportForm.value.endDate, 'landscape');
        this.body = this.colWidths = [];
      }
      if (param === 'excel') {
        const excelData = new ExcelModel();
        excelData.header = ['test'];
        //this.reportService.getColumnDef(this.constantsService.reportTypes.purchaseReportByItem);// this.headRows();
        let fila = new Array();
        for (let key in this.rowData) {
          if (this.rowData.hasOwnProperty(key)) {
            let data = this.rowData[key];
            const temp = [data.storeName.toString(), data.vendorName.toString(), data.posCode.toString()
              , data.description.toString(), this.utilityService.formatCurrency(data.invoiceValuePrice).toString()
              , data.buyingCaseQuantity.toString(), this.utilityService.formatCurrency(data.casePrice).toString(),
            this.utilityService.formatCurrency(data.itemCost).toString(),
            this.utilityService.formatCurrency(data.regularSellPrice).toString()
            ];
            console.log(data);
            console.log('ss', this.utilityService.formatDecimalDigit(data.profitMargin).toString());
            fila.push(temp);
          }
        }
        excelData.data = fila;
        excelData.reportName = 'test report'; //this.checkReportName();
        this.excelGeneratedService.generateExcel(excelData);
      }

    }

  }
  dateChange(event, controls) {
    if (controls === 'startDate') {
      this.invoicebinReportForm.get('startDate').setValue(event.formatedDate);
      this._startDate = event.formatedDate;
    }
    if (controls === 'endDate') {
      this.invoicebinReportForm.get('endDate').setValue(event.formatedDate);
      this._endDate = event.formatedDate;
    }
    this.inputDate = event.formatedDate;
  }
  onGridReady(params) {

  }
}
