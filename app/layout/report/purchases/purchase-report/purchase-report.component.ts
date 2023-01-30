import { Component, OnInit } from '@angular/core';
import * as jspdf from 'jspdf';
import { ConstantService } from '@shared/services/constant/constant.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ReportService } from '@shared/services/report/report.service';
import { UtilityService } from '@shared/services/utility/utility.service';
import * as moment from 'moment';
import { StoreService } from '@shared/services/store/store.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { FormBuilder } from '@angular/forms';
import { PDFGenrateService } from '@shared/services/pdf-genrate/pdf-genrate.service';
import { ExcelModel } from '@models/excel-data-model';
import { ExcelGeneratedService } from '@shared/services/excelGenerate/excel-generated.service';
import * as _ from 'lodash';
import { ReportGridService } from '@shared/services/report/report-grid.service';
@Component({
  selector: 'app-purchase-report',
  templateUrl: './purchase-report.component.html',
  styleUrls: ['./purchase-report.component.scss']
})
export class PurchaseReportComponent implements OnInit {
  isShowDepartment = false;
  isShowPaymentType = false;
  isShowVendor = true;
  storeLocationList: any;
  vendorList: any;
  departmentList: any;
  paymentTypeList: any;
  rowData: any;
  inputDate = moment().format('MM-DD-YYYY');
  _endDate = moment().format('MM-DD-YYYY');
  _startDate = moment().format('MM-DD-YYYY');
  userInfo = this.constantsService.getUserInfo();
  reportName: any;
  purchaseReportForm = this.fb.group({
    storeLocation: '', vendorIDs: '', purchaseReport: '',
    startDate: this._startDate, endDate: this._endDate,
    departmentIDs: '', paymentSourceID: '',
  });
  body: any = [];
  colWidths: any = [];
  isSingalStore = false;
  gridOption: any;
  selectedDateRange: any;
  constructor(private constantsService: ConstantService, private spinner: NgxSpinnerService, private storeService: StoreService,
    private toastr: ToastrService, private reportService: ReportService, private utilityService: UtilityService,
    private setupService: SetupService, private fb: FormBuilder, private pdfGenrateService: PDFGenrateService,
    private excelGeneratedService: ExcelGeneratedService, private reportGridService: ReportGridService) { }

  ngOnInit() {
    this.getStoreLocationList();
    this.getVendorByCompanyID();
    this.getDepartmentList();
    this.getPaymentTypeList();
  }
  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.purchaseReportForm.get('startDate').setValue(this.selectedDateRange.fDate);
    this._startDate = this.selectedDateRange.fDate;
    this.purchaseReportForm.get('endDate').setValue(this.selectedDateRange.tDate);
    this._endDate = this.selectedDateRange.tDate;
  }

  getStoreLocationList() {
    //  this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName)
    // .subscribe(res => {
    //   if (res && res['statusCode']) {
    //     this.storeLocationList = [];
    //   } else {
    //     this.storeLocationList = res;
    //   }
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
    this.isSingalStore = false;
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      this.isSingalStore = true;
      this.purchaseReportForm.get('storeLocation').setValue(this.storeLocationList[0].storeLocationID.toString());
    }
  }
  getVendorByCompanyID() {
    this.setupService.getData(`Vendor/getAll/${this.userInfo.companyId}`).subscribe(res => {
      this.vendorList = res;
    });
  }
  getDepartmentList() {
    this.setupService.getData(`Department/GetByfuel/${this.userInfo.userName}/${this.userInfo.companyId}/false`).subscribe(res => {
      this.departmentList = res;
    });
  }
  getPaymentTypeList() {
    this.storeService.getPaymentByCompanyID(this.userInfo.companyId).subscribe(
      (response) => {
        this.paymentTypeList = response;
      }, (error) => {
        console.log(error);
      });

  }
  purchaseReportByItemClick() {
    this.isShowDepartment = false;
    this.isShowPaymentType = false;
    this.isShowVendor = true;
  }
  purchaseReportByItemDetailClick() {
    this.isShowDepartment = true;
    this.isShowPaymentType = false;
    this.isShowVendor = true;
  }
  purchaseReport() {
    this.isShowDepartment = false;
    this.isShowPaymentType = true;
    this.isShowVendor = false;
  }
  purchaseReportByDepartmentClick() {
    this.isShowDepartment = true;
    this.isShowPaymentType = false;
    this.isShowVendor = false;
  }

  checkReportName() {
    switch (this.purchaseReportForm.value.purchaseReport) {
      case 'purchaseReportByItem':
        return 'Purchase Report By Item';
      case 'purchaseReportByItemDetail':
        return 'Purchase Report By Item Detail';
      case 'purchaseReport':
        return 'Purchase Report';
      case 'purchaseReportByVendor':
        return 'Purchase Report By Vendor';
      case 'purchaseReportByDepartment':
        return 'Purchase Report By Department';
    }
  }

  public captureScreen() {
    const doc = new jspdf('p', 'pt');

    const headerData = {
      reportName: this.checkReportName(),
      fromDate: this.purchaseReportForm.value.startDate, toDate: this.purchaseReportForm.value.endDate
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
    switch (this.purchaseReportForm.value.purchaseReport) {
      case 'purchaseReportByItem':
        return this.reportService.getColumnDef(this.constantsService.reportTypes.purchaseReportByItem);
      case 'purchaseReportByItemDetail':
        return this.reportService.getColumnDef(this.constantsService.reportTypes.purchaseReportByItemDetail);
      case 'purchaseReport':
        return this.reportService.getColumnDef(this.constantsService.reportTypes.purchaseReport);
      case 'purchaseReportByVendor':
        return this.reportService.getColumnDef(this.constantsService.reportTypes.purchaseReportByVendor);
      case 'purchaseReportByDepartment':
        return this.reportService.getColumnDef(this.constantsService.reportTypes.purchaseReportByDepartment);
    }
  }

  dateChange(event, controls) {
    if (controls === 'startDate') {
      this.purchaseReportForm.get('startDate').setValue(event.formatedDate);
      this._startDate = event.formatedDate;
    }
    if (controls === 'endDate') {
      this.purchaseReportForm.get('endDate').setValue(event.formatedDate);
      this._endDate = event.formatedDate;
    }
    this.inputDate = event.formatedDate;
  }

  searchPurchaseReport() {
    if (this.purchaseReportForm.value.purchaseReport === '') {
      this.toastr.info('Please Select Report Type');
      return;
    }
    this.spinner.show();
    const storeLocationIdObj = this.isSingalStore ? this.purchaseReportForm.value.storeLocation :
      this.purchaseReportForm.value.storeLocation ?
        this.purchaseReportForm.value.storeLocation.map(x => x.storeLocationID).join(',') : '';
    const vendorObj = this.purchaseReportForm.value.vendorIDs ?
      this.purchaseReportForm.value.vendorIDs.map(x => x.vendorID).join(',') : '';
    const departmentObj = this.purchaseReportForm.value.departmentIDs ?
      this.purchaseReportForm.value.departmentIDs.map(x => x.departmentID).join(',') : '';
    const paymentTypeObj = this.purchaseReportForm.value.paymentSourceID ?
      this.purchaseReportForm.value.paymentSourceID.map(x => x.paymentSourceID).join(',') : '';
    this.rowData = [];
    const postData = {
      storeLocation: storeLocationIdObj,
      companyID: this.userInfo.companyId,
      startDate: this.purchaseReportForm.value.startDate,
      endDate: this.purchaseReportForm.value.endDate,
    };

    /**
     * Purchase Report By Item
     */
    if (this.purchaseReportForm.value.purchaseReport === 'purchaseReportByItem') {
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
        this.gridHeader();
        this.rowData = arr;
      }, (error) => {
        console.log(error);
        this.rowData = [];
        this.spinner.hide();
      });

    } else
      /**
        * Purchase Report By Item Details
        */
      if (this.purchaseReportForm.value.purchaseReport === 'purchaseReportByItemDetail') {

        const postDataByItemDetail = {
          ...postData,
          vendorIDs: vendorObj,
          departmentIDs: departmentObj,
        };
        this.setupService.postData('PurchaseReports/PurchaseReportByItemDetails', postDataByItemDetail).subscribe((res) => {
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
        }, (error) => {
          console.log(error);
          this.spinner.hide();
        });
      } else
        /**
          * Purchase Report
          */
        if (this.purchaseReportForm.value.purchaseReport === 'purchaseReport') {
          const postDataByPurchaseReport = {
            ...postData,
            paymentSourceID: paymentTypeObj,
          };
          this.setupService.postData('PurchaseReports/PurchaseReports', postDataByPurchaseReport).subscribe((res) => {
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
          }, (error) => {
            console.log(error);
            this.rowData = [];
            this.spinner.hide();
          });
        } else
          /**
           * Purchase Report By Vendor
           */
          if (this.purchaseReportForm.value.purchaseReport === 'purchaseReportByVendor') {
            const postDataByVendor = {
              ...postData,
              vendorIDs: vendorObj,
            };
            this.setupService.postData('PurchaseReports/PurchaseReportByVendors', postDataByVendor).subscribe((res) => {
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
            }, (error) => {
              console.log(error);
              this.rowData = [];
              this.spinner.hide();
            });
          } else
            /**
            * Purchase Report By Department
            */
            if (this.purchaseReportForm.value.purchaseReport === 'purchaseReportByDepartment') {
              const postDataByDepartment = {
                ...postData,
                storeLocationIDs: storeLocationIdObj,
                departmentIDs: departmentObj,
              };
              this.setupService.postData('PurchaseReports/PurchaseByDepartments', postDataByDepartment).subscribe((res) => {
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
    if (this.purchaseReportForm.value.purchaseReport === 'purchaseReportByItem') {
      const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
      const grouped = _.groupBy(arr, pet => pet.storeName);
      const data = this.purchaseReportForm.value.storeLocation;
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
                text: this.utilityService.formatDecimalDigit(data.profitMargin).toString(),
                border: [false, false, false, false],
              });
            } this.body.push(fila);
          }
        }
        this.pdfGenrateService.PDFGenrate('Purchase Report By Item', this.colWidths,
          this.body, this.purchaseReportForm.value.startDate, this.purchaseReportForm.value.endDate, 'landscape');
        this.body = this.colWidths = [];
      }
      if (param === 'excel') {
        const excelData = new ExcelModel();
        excelData.header = this.headRows();
        let fila = new Array();
        for (let key in this.rowData) {
          if (this.rowData.hasOwnProperty(key)) {
            let data = this.rowData[key];
            const temp = [data.storeName.toString(), data.vendorName.toString(), data.posCode.toString()
              , data.description.toString(), this.utilityService.formatCurrency(data.invoiceValuePrice).toString()
              , data.buyingCaseQuantity.toString(), this.utilityService.formatCurrency(data.casePrice).toString(),
            this.utilityService.formatCurrency(data.itemCost).toString(),
            this.utilityService.formatCurrency(data.regularSellPrice).toString()
              , this.utilityService.formatDecimalDigit(data.profitMargin).toString()];
            fila.push(temp);
          }
        }
        excelData.data = fila;
        excelData.reportName = this.checkReportName();
        this.excelGeneratedService.generateExcel(excelData);
      }

    } else
      /**
        * Purchase Report By Item Details
        */
      if (this.purchaseReportForm.value.purchaseReport === 'purchaseReportByItemDetail') {

        const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
        const grouped = _.groupBy(arr, pet => pet.storeName);
        const data = this.purchaseReportForm.value.storeLocation;
        const arrs = [];
        data.forEach(x => {
          if (grouped && grouped[x.storeName]) {
            const invoiceValuePrice = _.sumBy(grouped[x.storeName], 'invoiceValuePrice');
            const buyingUnitQuantity = _.sumBy(grouped[x.storeName], 'buyingUnitQuantity');
            const buyingCaseQuantity = _.sumBy(grouped[x.storeName], 'buyingCaseQuantity');
            const casePrice = _.sumBy(grouped[x.storeName], 'casePrice');
            const itemCost = _.sumBy(grouped[x.storeName], 'itemCost');
            const regularSellPrice = _.sumBy(grouped[x.storeName], 'regularSellPrice');
            const profitMargin = _.sumBy(grouped[x.storeName], 'profitMargin');
            const unitsInCase = _.sumBy(grouped[x.storeName], 'unitsInCase');
            arrs.push({
              storeName: x.storeName, departmentDescription: '', buyingUnitQuantity: buyingUnitQuantity.toFixed(0),
              buyingCaseQuantity: buyingCaseQuantity.toFixed(0),
              invoiceValuePrice: invoiceValuePrice.toFixed(2), casePrice: casePrice.toFixed(2),
              itemCost: itemCost.toFixed(3), regularSellPrice: regularSellPrice.toFixed(2), profitMargin: profitMargin.toFixed(2),
              unitsInCase: unitsInCase.toFixed(0), isGroup: true
            });

            grouped[x.storeName].forEach(y => { arrs.push(y); });
          }
        });
        rowData = arrs;
        if (param === 'pdf') {
          this.colWidths = [65, 80, 65, 95, 50, 50, 40, 45, 50, 50, 40, 40];
          this.body.push([{ text: 'Store Name' }, { text: 'Vendor Name' },
          { text: 'UPC Code' }, { text: 'Item', }, { text: 'Unit Buying Cost' }, { text: 'Unit Buying Quantity' },
          { text: 'Case Qty' }, { text: 'Case Price' }, { text: 'Total Cost' },
          { text: 'Selling Price' }, { text: 'Margin', }, { text: 'Unit In Case' }
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
                  text: data.buyingUnitQuantity.toString(), border: [false, false, false, false],
                  bold: true, color: 'white', fillColor: 'black',
                });
                fila.push({
                  text: data.buyingCaseQuantity.toString(), border: [false, false, false, false],
                  bold: true, color: 'white', fillColor: 'black',
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
                  text: data.profitMargin.toString(), border: [false, false, false, false],
                  bold: true, color: 'white', fillColor: 'black',
                });
                fila.push({
                  text: data.unitsInCase.toString(), border: [false, false, false, false],
                  bold: true, color: 'white', fillColor: 'black',
                });
                this.body.push(fila);
              } else {


                fila.push({ text: '', border: [false, false, false, false] });
                fila.push({ text: data.vendorName.toString(), border: [false, false, false, false] });
                fila.push({ text: data.posCode.toString(), border: [false, false, false, false], });
                fila.push({ text: data.description.toString(), border: [false, false, false, false] });
                fila.push({
                  text: this.utilityService.formatCurrency(data.invoiceValuePrice).toString(),
                  border: [false, false, false, false], alignment: 'right'
                });
                fila.push({ text: data.buyingUnitQuantity.toString(), border: [false, false, false, false], });
                fila.push({ text: data.buyingCaseQuantity.toString(), border: [false, false, false, false], });
                fila.push({
                  text: this.utilityService.formatCurrency(data.casePrice).toString(),
                  border: [false, false, false, false], alignment: 'right'
                });
                fila.push({
                  text: this.utilityService.formatCurrency(data.itemCost).toString(),
                  border: [false, false, false, false], alignment: 'right'
                });
                fila.push({
                  text: this.utilityService.formatCurrency(data.regularSellPrice).toString(), alignment: 'right',
                  border: [false, false, false, false],
                });
                fila.push({
                  text: this.utilityService.formatDecimalDigit(data.profitMargin).toString(),
                  border: [false, false, false, false],
                });
                fila.push({ text: data.unitsInCase.toString(), border: [false, false, false, false], });
              }
              this.body.push(fila);
            }
          }
          this.pdfGenrateService.PDFGenrate('Purchase Report By Item Details', this.colWidths,
            this.body, this.purchaseReportForm.value.startDate, this.purchaseReportForm.value.endDate, 'landscape');
          this.body = this.colWidths = [];


        }
        if (param === 'excel') {
          const excelData = new ExcelModel();
          excelData.header = this.headRows();
          let fila = new Array();
          for (let key in this.rowData) {
            if (this.rowData.hasOwnProperty(key)) {
              let data = this.rowData[key];
              const temp = [data.storeName.toString(), data.vendorName.toString(), data.posCode.toString()
                , data.description.toString(), this.utilityService.formatCurrency(data.invoiceValuePrice).toString()
                , data.buyingCaseQuantity.toString(), data.buyingUnitQuantity.toString(),
              this.utilityService.formatCurrency(data.casePrice).toString(),
              this.utilityService.formatCurrency(data.itemCost).toString(),
              this.utilityService.formatCurrency(data.regularSellPrice).toString()
                , this.utilityService.formatDecimalDigit(data.profitMargin).toString(), data.unitsInCase.toString()];
              fila.push(temp);
            }
          }
          excelData.data = fila;
          excelData.reportName = this.checkReportName();
          this.excelGeneratedService.generateExcel(excelData);
        }

      } else
        /**
          * Purchase Report
          */
        if (this.purchaseReportForm.value.purchaseReport === 'purchaseReport') {
          const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
          const grouped = _.groupBy(arr, pet => pet.storeName);
          const data = this.purchaseReportForm.value.storeLocation;
          const arrs = [];
          data.forEach(x => {
            if (grouped && grouped[x.storeName]) {

              const invoiceAmount = _.sumBy(grouped[x.storeName], 'invoiceAmount');
              const paidAmount = _.sumBy(grouped[x.storeName], 'paidAmount');
              arrs.push({
                storeName: x.storeName, invoiceAmount: invoiceAmount.toFixed(2), paidAmount: paidAmount.toFixed(2),
                invoiceDate: '', vendorName: '', invoiceNo: '', paymentType: '', paymentDetail: '', lastCheckNumber: '',
                invoiceStatusDescription: '', isGroup: true
              });

              grouped[x.storeName].forEach(y => { arrs.push(y); });
            }
          });
          rowData = arrs;

          if (param === 'pdf') {
            this.colWidths = [55, 50, 60, 35, 35, 35, 35, 50, 35, 45];
            this.body.push([{ text: 'Store Name' }, { text: 'Invoice Date' },
            { text: 'Vendor Name', }, { text: 'Invoice No', },
            { text: 'Invoice Amount' }, { text: 'Amount Paid' }, { text: 'Payment  Type' },
            { text: 'Payment Source' }, { text: 'Check Number' }, { text: 'Invoice Status' }
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
                    text: this.utilityService.formatCurrency(data.invoiceAmount).toString(),
                    border: [false, false, false, false], alignment: 'right', bold: true,
                    color: 'white', fillColor: 'black',
                  });
                  fila.push({
                    text: this.utilityService.formatCurrency(data.paidAmount).toString(),
                    border: [false, false, false, false], alignment: 'right', bold: true,
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
                  fila.push({ text: this.utilityService.formatDate(data.invoiceDate).toString(), border: [false, false, false, false] });
                  fila.push({ text: data.vendorName.toString(), border: [false, false, false, false] });

                  fila.push({ text: data.invoiceNo.toString(), border: [false, false, false, false], });
                  fila.push({
                    text: this.utilityService.formatCurrency(data.invoiceAmount).toString(),
                    border: [false, false, false, false], alignment: 'right'
                  });
                  fila.push({
                    text: this.utilityService.formatCurrency(data.paidAmount).toString(),
                    border: [false, false, false, false], alignment: 'right'
                  });

                  fila.push({ text: data.paymentType.toString(), border: [false, false, false, false], });
                  fila.push({ text: data.paymentDetail.toString(), border: [false, false, false, false], });
                  fila.push({ text: data.lastCheckNumber.toString(), border: [false, false, false, false], });
                  fila.push({ text: data.invoiceStatusDescription.toString(), border: [false, false, false, false], });
                } this.body.push(fila);
              }
            }
            this.pdfGenrateService.PDFGenrate('Purchase Report', this.colWidths,
              this.body, this.purchaseReportForm.value.startDate, this.purchaseReportForm.value.endDate);
            this.body = this.colWidths = [];
          }
          if (param === 'excel') {
            const excelData = new ExcelModel();
            excelData.header = this.headRows();
            let fila = new Array();
            for (let key in this.rowData) {
              if (this.rowData.hasOwnProperty(key)) {
                let data = this.rowData[key];
                const temp = [data.storeName.toString(), this.utilityService.formatDate(data.invoiceDate).toString()
                  , data.vendorName.toString(), data.invoiceNo.toString(),
                this.utilityService.formatCurrency(data.invoiceAmount).toString()
                  , this.utilityService.formatCurrency(data.paidAmount).toString(), data.paymentType.toString()
                  , data.paymentDetail.toString(), data.lastCheckNumber.toString(), data.invoiceStatusDescription.toString()];
                fila.push(temp);
              }
            }
            excelData.data = fila;
            excelData.reportName = this.checkReportName();
            this.excelGeneratedService.generateExcel(excelData);
          }

        } else
          /**
           * Purchase Report By Vendor
           */
          if (this.purchaseReportForm.value.purchaseReport === 'purchaseReportByVendor') {
            const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
            const grouped = _.groupBy(arr, pet => pet.storeName);
            const data = this.purchaseReportForm.value.storeLocation;
            const arrs = [];
            data.forEach(x => {
              if (grouped && grouped[x.storeName]) {
                const amountPaid = _.sumBy(grouped[x.storeName], 'amountPaid');
                arrs.push({
                  storeName: x.storeName, vendorName: '', invoiceDate: '', invoiceNo: '',
                  paymentSource: '', checkNumber: '', amountPaid: amountPaid.toFixed(2),
                  isGroup: true
                });

                grouped[x.storeName].forEach(y => { arrs.push(y); });
              }
            });
            rowData = arrs;

            if (param === 'pdf') {
              this.colWidths = [70, 80, 50, 50, 60, 80, 60];
              this.body.push([{ text: 'Store Name' }, { text: 'Vendor Name' }, { text: 'Invoice Date' }, { text: 'Invoice No' },
              { text: 'Amount Paid' }, { text: 'Payment Source' }, { text: 'Check Number' }
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
                      text: this.utilityService.formatCurrency(data.amountPaid).toString(),
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
                    fila.push({ text: data.vendorName.toString(), border: [false, false, false, false] });
                    fila.push({ text: this.utilityService.formatDate(data.invoiceDate).toString(), border: [false, false, false, false] });
                    fila.push({ text: data.invoiceNo.toString(), border: [false, false, false, false], });

                    fila.push({
                      text: this.utilityService.formatCurrency(data.amountPaid).toString(), border: [false, false, false, false],
                      alignment: 'right'
                    });
                    fila.push({ text: data.paymentSource.toString(), border: [false, false, false, false] });
                    fila.push({ text: data.checkNumber.toString(), border: [false, false, false, false], });
                  }
                  this.body.push(fila);
                }
              }
              this.pdfGenrateService.PDFGenrate('Purchase Report By Vendor', this.colWidths,
                this.body, this.purchaseReportForm.value.startDate, this.purchaseReportForm.value.endDate);
              this.body = this.colWidths = [];
            }
            if (param === 'excel') {
              const excelData = new ExcelModel();
              excelData.header = this.headRows();
              let fila = new Array();
              for (let key in this.rowData) {
                if (this.rowData.hasOwnProperty(key)) {
                  let data = this.rowData[key];
                  const temp = [data.storeName.toString(), data.vendorName.toString()
                    , this.utilityService.formatDate(data.invoiceDate).toString()
                    , data.invoiceNo.toString(),
                  this.utilityService.formatCurrency(data.amountPaid).toString()
                    , data.paymentSource.toString(), data.checkNumber.toString()
                  ];
                  fila.push(temp);
                }
              }
              excelData.data = fila;
              excelData.reportName = this.checkReportName();
              this.excelGeneratedService.generateExcel(excelData);
            }

          } else
            /**
            * Purchase Report By Department
            */
            if (this.purchaseReportForm.value.purchaseReport === 'purchaseReportByDepartment') {
              const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
              const grouped = _.groupBy(arr, pet => pet.storeName);
              const data = this.purchaseReportForm.value.storeLocation;
              const arrs = [];
              data.forEach(x => {
                if (grouped && grouped[x.storeName]) {

                  const amountPaid = _.sumBy(grouped[x.storeName], 'amountPaid');
                  arrs.push({
                    storeName: x.storeName, departmentDescription: '', vendorName: '', invoiceDate: '',
                    amountPaid: amountPaid.toFixed(2), invoiceNo: '',
                    isGroup: true
                  });

                  grouped[x.storeName].forEach(y => { arrs.push(y); });
                }
              });
              rowData = arrs;

              if (param === 'pdf') {
                this.colWidths = [80, 90, 100, 60, 65, 65];
                this.body.push([{ text: 'Store Name' }, { text: 'Department' }, { text: 'Vendor Name' },
                { text: 'Invoice Date' }, { text: 'Invoice No' }, { text: 'Amount Paid' },
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
                        text: '', border: [false, false, false, false], bold: true, color: 'white', fillColor: 'black',
                      });
                      fila.push({
                        text: this.utilityService.formatCurrency(data.amountPaid).toString(),
                        border: [false, false, false, false], alignment: 'right', bold: true,
                        color: 'white', fillColor: 'black',
                      });

                    } else {

                      fila.push({ text: '', border: [false, false, false, false] });
                      fila.push({ text: data.departmentDescription.toString(), border: [false, false, false, false] });
                      fila.push({ text: data.vendorName.toString(), border: [false, false, false, false] });
                      fila.push({
                        text: this.utilityService.formatDate(data.invoiceDate).toString(),
                        border: [false, false, false, false]
                      });
                      fila.push({ text: data.invoiceNo.toString(), border: [false, false, false, false], });
                      fila.push({
                        text: this.utilityService.formatCurrency(data.amountPaid).toString(), border: [false, false, false, false],
                        alignment: 'right'
                      });
                    }
                    this.body.push(fila);
                  }
                }
                this.pdfGenrateService.PDFGenrate('Purchase Report By Department', this.colWidths,
                  this.body, this.purchaseReportForm.value.startDate, this.purchaseReportForm.value.endDate);
                this.body = this.colWidths = [];
              }
              if (param === 'excel') {
                const excelData = new ExcelModel();
                excelData.header = this.headRows();
                let fila = new Array();
                for (let key in this.rowData) {
                  if (this.rowData.hasOwnProperty(key)) {
                    let data = this.rowData[key];
                    const temp = [data.storeName.toString(), data.departmentDescription.toString(), data.vendorName.toString()
                      , this.utilityService.formatDate(data.invoiceDate).toString(), data.invoiceNo.toString(),
                    this.utilityService.formatCurrency(data.amountPaid).toString()];
                    fila.push(temp);
                  }
                }
                excelData.data = fila;
                excelData.reportName = this.checkReportName();
                this.excelGeneratedService.generateExcel(excelData);
              }

            } else {
              this.spinner.hide();
            }
  }

  gridHeader() {
    switch (this.purchaseReportForm.value.purchaseReport) {
      case 'purchaseReportByItem':
        this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.purchaseReportByItem);
        return;
      case 'purchaseReportByItemDetail':
        this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.purchaseReportByItemDetail);
        return;
      case 'purchaseReport':
        this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.purchaseReport);
        return;
      case 'purchaseReportByVendor':
        this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.purchaseReportByVendor);
        return;
      case 'purchaseReportByDepartment':
        this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.purchaseReportByDepartment);
        return;
    }
  }
  onGridReady(params) {

  }
}
