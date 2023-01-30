import { Component, OnInit } from '@angular/core';
import { StoreService } from '@shared/services/store/store.service';
import { GridOptions } from 'ag-grid-community';
import { ExcelGeneratedService } from '@shared/services/excelGenerate/excel-generated.service';
import { ReportGridService } from '@shared/services/report/report-grid.service';
import { ExcelModel } from '@models/excel-data-model';
import { PDFGenrateService } from '@shared/services/pdf-genrate/pdf-genrate.service';
import { UtilityService } from '@shared/services/utility/utility.service';
import { ReportService } from '@shared/services/report/report.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConstantService } from '@shared/services/constant/constant.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { FormBuilder } from '@angular/forms';
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'app-purchase-report',
  templateUrl: './purchase-report.component.html',
  styleUrls: ['./purchase-report.component.scss']
})
export class PurchaseReportComponent implements OnInit {

  isStoreLoading = true;
  isShowDepartment = true;
  isShowVendor = false;
  storeLocationList: any[] = [];
  departmentList: any[] = [];
  vendorList: any[] = [];
  userInfo = this.constantsService.getUserInfo();
  purchaseReportRowData: any;
  selectedDateRange: any;
  startDate = moment().format('MM-DD-YYYY');
  endDate = moment().format('MM-DD-YYYY');
  purchaseReportForm = this.fb.group({
    storeLocationIDs: '',
    departmentIDs: '',
    vendorIDs: '',
    purchaseReportType: '',
    startDate: this.startDate,
    endDate: this.endDate,
  });

  body: any = [];
  colWidths: any = [];
  gridApi: any;
  columnApi: any;
  gridOption: GridOptions;
  filterText = '';
  isDepartmentLoading = true;
  constructor(private constantsService: ConstantService, private storeService: StoreService, private fb: FormBuilder, private setupService: SetupService,
    private reportGridService: ReportGridService, private toastr: ToastrService, private spinner: NgxSpinnerService, private pdfGenrateService: PDFGenrateService,
    private excelGeneratedService: ExcelGeneratedService, private utilityService: UtilityService, private reportService: ReportService) {
    this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.departmentSalesReportDetail);
  }

  ngOnInit() {
    this.getStoreLocationList();
    this.getDepartmentList();
  }
  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.startDate = this.selectedDateRange.fDate;
    this.endDate = this.selectedDateRange.tDate;
    this.purchaseReportForm.get('startDate').setValue(this.selectedDateRange.fDate);
    this.purchaseReportForm.get('endDate').setValue(this.selectedDateRange.tDate);
  }

  purchaseByDeptClick() {
    this.isShowDepartment = true;
    this.isShowVendor = false;
    this.getDepartmentList();
  }

  purchaseByDeptDetailClick() {
    this.isShowDepartment = true;
    this.isShowVendor = false;
    this.getDepartmentList();
  }

  purchaseByVendorClick() {
    this.isShowDepartment = false;
    this.isShowVendor = true;
    this.getVendorList();
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
      this.purchaseReportForm.get('storeLocationIDs').setValue(this.storeLocationList);
    }
  }

  getDepartmentList() {
    if (this.storeService.departmentList) {
      this.isDepartmentLoading = false;
      this.departmentList = this.storeService.departmentList;
    } else {
      this.storeService.getDepartment(this.userInfo.companyId,this.userInfo.userName).subscribe(
          (response) => {
            this.isDepartmentLoading = false;
            this.departmentList = this.storeService.departmentList;
          });
    }
  }

  getVendorList() {
    if (this.storeService.vendorList) {
      this.vendorList = this.storeService.vendorList;
    } else {
      this.storeService.getVendorList(this.userInfo.companyId).subscribe((response) => {
        this.vendorList = this.storeService.vendorList;
      }, (error) => {
        console.log(error);
      });
    }

  }

  onGridReady(params) {
    console.log(params);
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  purchaseReport() {
    if (this.purchaseReportForm.value.purchaseReportType === '') {
      this.toastr.info('Please Select Purchase Report Type');
      return;
    }
    if (this.purchaseReportForm.value.storeLocationIDs === '') {
      this.toastr.info('Please Select Atleast One Store Location');
      return;
    }
    if (this.purchaseReportForm.value.purchaseReportType === 'purchaseByDeptReport' || this.purchaseReportForm.value.purchaseReportType === 'purchaseByDeptReportDetail') {
      if (this.purchaseReportForm.value.departmentIDs === '') {
        this.toastr.info('Please Select Atleast One Department');
        return;
      }
    } else if (this.purchaseReportForm.value.purchaseReportType === 'purchaseByVendor') {
      if (this.purchaseReportForm.value.vendorIDs === '') {
        this.toastr.info('Please Select Atleast One Vendor');
        return;
      }
    }

    this.purchaseReportRowData = [];
    const storeLocationIdObj = this.purchaseReportForm.value.storeLocationIDs ?
      this.purchaseReportForm.value.storeLocationIDs.map(x => x.storeLocationID).join(',') : '';
    const departmentObj = this.purchaseReportForm.value.departmentIDs ?
      this.purchaseReportForm.value.departmentIDs.map(x => x.departmentID).join(',') : '';
    const vendorObj = this.purchaseReportForm.value.vendorIDs ? this.purchaseReportForm.value.vendorIDs.map(x => x.vendorID).join(',') : '';

    if (this.purchaseReportForm.value.purchaseReportType === 'purchaseByDeptReport') {
      const postData = {
        storeLocation: storeLocationIdObj,
        department: departmentObj,
        startDate: this.startDate,
        endDate: this.endDate
      };
      // const postData = {
      //   "department": "1988,1989,1990,1991,1992,1993,1994,1995,1996,1997",
      //   "startDate": "06-02-2013",
      //   "endDate": "06-02-2014",
      //   "storeLocation": "94,251,261"
      // }
      this.spinner.show();
      this.setupService.postData('SalesPurchaseReport/SalesPurchaseByDeptReportPage', postData).subscribe((res) => {
        this.spinner.hide();
        if (res && res['statusCode']) {
          this.purchaseReportRowData = [];
          this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
          return;
        }
        const arr = _.sortBy(res, [function (o) { return o.departmentDescription.toLowerCase(); }]);
        this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.inventoryPurchaseReport);
        this.purchaseReportRowData = arr;
      }, (error) => {
        this.spinner.hide();
        console.log(error);
        this.purchaseReportRowData = [];
      });
    } else if (this.purchaseReportForm.value.purchaseReportType === 'purchaseByDeptReportDetail') {
      const postData = {
        storeLocation: storeLocationIdObj,
        department: departmentObj,
        startDate: this.startDate,
        endDate: this.endDate
      };
      // const postData = {
      //   department: "1988,1989,1990,1991,1992,1993,1994,1995,1996,1997,1998,2000,",
      //   startDate: "06-02-2014",
      //   endDate: "06-15-2014",
      //   storeLocation: "94"
      // }
      this.spinner.show();
      this.setupService.postData('SalesPurchaseReport/SalesPurchaseByDeptDetailReportPage', postData).subscribe((res) => {
        this.spinner.hide();
        if (res && res['statusCode']) {
          this.purchaseReportRowData = [];
          this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
          return;
        }
        this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.inventoryPurchaseDetailReport);
        this.purchaseReportRowData = res;
      }, (error) => {
        this.spinner.hide();
        console.log(error);
        this.purchaseReportRowData = [];
      });
    } else if (this.purchaseReportForm.value.purchaseReportType === 'purchaseByVendor') {
      //under implementation
    }
  }

  searchPurchaseReport(params) {
    let res = this.purchaseReportRowData;
    let rowData = [];
    if (this.purchaseReportForm.value.purchaseReportType === 'purchaseByDeptReport') {
      const arr = _.sortBy(res, [function (o) { return o.departmentDescription.toLowerCase(); }]);
      const grouped = _.groupBy(arr, pet => pet.storeName);
      // let data = [{ 'storeName': 'QuickBuy116' }, { 'storeName': 'QuickBuy51' }];
      const data = this.purchaseReportForm.value.storeLocationIDs;
      const arrs = [];
      data.forEach(x => {
        if (grouped && grouped[x.storeName]) {
          const totalSalesAmount = _.sumBy(grouped[x.storeName], 'salesAmount');
          const totalPurchaseAmount = _.sumBy(grouped[x.storeName], 'purchaseAmount');
          arrs.push({
            storeName: x.storeName, totalSalesAmount: totalSalesAmount.toFixed(0), totalPurchaseAmount: totalPurchaseAmount.toFixed(0), isGroup: true
          });
          grouped[x.storeName].forEach(y => {
            arrs.push(y);
          });
        }
      });
      rowData = arrs;
      if (params === 'pdf') {
        this.colWidths = [90, 90, 90, 90];
        this.body.push([{ text: 'Store Name' }, { text: 'Department' }, { text: 'Sales Amount' },
        { text: 'Purchase Amount' }
        ]);
        for (const key in rowData) {
          if (rowData.hasOwnProperty(key)) {
            console.log(rowData);
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
                text: data.totalSalesAmount.toString(), border: [false, false, false, false], bold: true, color: 'white', fillColor: 'black',
              });
              fila.push({
                text: data.totalPurchaseAmount.toString(), border: [false, false, false, false], bold: true, color: 'white', fillColor: 'black',
              });
              this.body.push(fila);
            } else {
              fila.push({ text: '', border: [false, false, false, false] });
              fila.push({ text: data.departmentDescription.toString(), border: [false, false, false, false] });
              fila.push({ text: data.salesAmount ? data.salesAmount.toString() : "", border: [false, false, false, false] });
              fila.push({ text: data.purchaseAmount ? data.purchaseAmount.toString() : "-", border: [false, false, false, false] });
              this.body.push(fila);
            }
          }
        }
        this.pdfGenrateService.PDFGenrate('Purchase Report', this.colWidths,
          this.body, this.startDate, this.endDate);
        this.body = this.colWidths = [];
      }
      if (params === 'excel') {
        const excelData = new ExcelModel();
        excelData.header = this.reportService.getColumnDef(this.constantsService.reportTypes.inventoryPurchaseReport);
        let fila = new Array();
        excelData.groupedData = true;
        for (let key in rowData) {
          if (rowData.hasOwnProperty(key)) {
            let data = rowData[key];
            let temp;
            if (data.isGroup) {
              temp = [
                data.storeName.toString(),
                '',
                data.totalSalesAmount,
                data.totalPurchaseAmount
              ];
            } else {
              temp = [
                '',
                data.departmentDescription ? data.departmentDescription.toString() : '',
                data.salesAmount ? data.salesAmount.toString() : '0',
                data.purchaseAmount ? data.purchaseAmount.toString() : '0'
              ];
            }
            fila.push(temp);
          }
        }
        excelData.data = fila;
        excelData.startDate = this.startDate;
        excelData.endDate = this.endDate;
        excelData.reportName = 'Purchase Report';
        this.excelGeneratedService.generateExcel(excelData);
      }
    } else if (this.purchaseReportForm.value.purchaseReportType === 'purchaseByDeptReportDetail') {
      const arr = _.sortBy(res, [function (o) { return o.departmentDescription.toLowerCase(); }]);
      const grouped = _.groupBy(arr, pet => pet.storeName);
      // let data = [{ 'storeName': 'QuickBuy116' }, { 'storeName': 'QuickBuy51' }];
      const data = this.purchaseReportForm.value.storeLocationIDs;
      const arrs = [];
      data.forEach(x => {
        if (grouped && grouped[x.storeName]) {
          const totalSalesAmount = _.sumBy(grouped[x.storeName], 'salesAmount');
          const totalPurchaseAmount = _.sumBy(grouped[x.storeName], 'purchaseAmount');
          arrs.push({
            storeName: x.storeName, totalSalesAmount: totalSalesAmount.toFixed(2), totalPurchaseAmount: totalPurchaseAmount.toFixed(2), isGroup: true
          });
          const groupedByDate = _.groupBy(grouped[x.storeName], pet => pet.date);
          let sortedDates = Object.keys(groupedByDate).sort((a, b) => { return new Date(a).getTime() - new Date(b).getTime(); });
          if (groupedByDate) {
            for (let sortedDate in sortedDates) {
              const totalSalesAmountByDate = _.sumBy(groupedByDate[sortedDates[sortedDate]], 'salesAmount');
              const totalPurchaseAmountByDate = _.sumBy(groupedByDate[sortedDates[sortedDate]], 'purchaseAmount');
              arrs.push({
                groupedDate: sortedDates[sortedDate], totalSalesAmount: totalSalesAmountByDate.toFixed(2), totalPurchaseAmount: totalPurchaseAmountByDate.toFixed(2), isSubGroup: true
              });
              groupedByDate[sortedDates[sortedDate]].forEach(y => {
                arrs.push(y);
              });
            }

          }
        }
      });
      rowData = arrs;
      if (params === 'pdf') {
        this.colWidths = [90, 90, 90, 90, 90];
        this.body.push([{ text: 'Store Name' }, { text: 'Date' }, { text: 'Department' }, { text: 'Sales Amount' },
        { text: 'Purchase Amount' }
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
              this.body.push(fila);
            } else if (data.isSubGroup) {
              fila.push({
                text: '', border: [false, false, false, false], bold: true, color: 'white', fillColor: 'white',
              });
              fila.push({
                text: this.utilityService.formatDateEmpty(data.groupedDate).toString(), border: [false, false, false, false], bold: true,
                color: 'white', fillColor: 'black',
              });
              fila.push({
                text: '', border: [false, false, false, false], bold: true, color: 'white', fillColor: 'black',
              });
              fila.push({
                text: data.totalSalesAmount ? data.totalSalesAmount.toString() : 0, border: [false, false, false, false], bold: true, color: 'white', fillColor: 'black',
              });
              fila.push({
                text: data.totalPurchaseAmount ? data.totalPurchaseAmount.toString() : 0, border: [false, false, false, false], bold: true, color: 'white', fillColor: 'black',
              });
              this.body.push(fila);
            } else {
              fila.push({ text: '', border: [false, false, false, false] });
              fila.push({ text: '', border: [false, false, false, false] });
              fila.push({ text: data.departmentDescription.toString(), border: [false, false, false, false] });
              fila.push({ text: data.salesAmount ? data.salesAmount.toString() : 0, border: [false, false, false, false] });
              fila.push({ text: data.purchaseAmount ? data.purchaseAmount.toString() : 0, border: [false, false, false, false] });
              this.body.push(fila);
            }

          }
        }
        this.pdfGenrateService.PDFGenrate('Purchase Detail Report', this.colWidths,
          this.body, this.startDate, this.endDate);
        this.body = this.colWidths = [];
      }
      if (params === 'excel') {
        const excelData = new ExcelModel();
        excelData.header = this.reportService.getColumnDef(this.constantsService.reportTypes.inventoryPurchaseDetailReport);
        let fila = new Array();
        excelData.groupedData = true;
        excelData.subGroupedData = true;
        for (let key in rowData) {
          if (rowData.hasOwnProperty(key)) {
            let data = rowData[key];
            let temp;
            if (data.isGroup) {
              temp = [
                data.storeName.toString(),
                '',
                '',
                data.totalSalesAmount,
                data.totalPurchaseAmount
              ];
            } else if (data.isSubGroup) {
              temp = [
                '',
                this.utilityService.formatDateEmpty(data.groupedDate),
                '',
                data.totalSalesAmount,
                data.totalPurchaseAmount
              ];
            } else {
              temp = [
                '',
                '',
                data.departmentDescription ? data.departmentDescription.toString() : '',
                data.salesAmount ? data.salesAmount.toString() : '0',
                data.purchaseAmount ? data.purchaseAmount.toString() : '0'
              ];
            }
            fila.push(temp);
          }
        }
        excelData.data = fila;
        excelData.startDate = this.startDate;
        excelData.endDate = this.endDate;
        excelData.reportName = 'Purchase Detail Report';
        this.excelGeneratedService.generateExcel(excelData);
      }
    } else if (this.purchaseReportForm.value.purchaseReportType === 'purchaseByVendor') {
      // under implementation
    }
  }
}
