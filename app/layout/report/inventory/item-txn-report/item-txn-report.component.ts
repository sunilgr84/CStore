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
  selector: 'app-item-txn-report',
  templateUrl: './item-txn-report.component.html',
  styleUrls: ['./item-txn-report.component.scss']
})
export class ItemTxnReportComponent implements OnInit {

  isStoreLoading = true;
  storeLocationList: any[] = [];
  departmentList: any[] = [];
  startDate = moment().format('MM-DD-YYYY');
  endDate = moment().format('MM-DD-YYYY');
  selectedDateRange: any;
  userInfo = this.constantsService.getUserInfo();
  itemTxnReportRowData: any;
  itemTxnReportForm = this.fb.group({
    storeLocationIDs: '',
    departmentID: '',
    startDate: this.startDate,
    endDate: this.endDate
  });

  body: any = [];
  colWidths: any = [];
  gridApi: any;
  columnApi: any;
  gridOption: GridOptions;
  filterText = '';
  isDepartmentLoading=true;
  constructor(private constantsService: ConstantService, private storeService: StoreService, private fb: FormBuilder, private setupService: SetupService,
    private reportGridService: ReportGridService, private toastr: ToastrService, private spinner: NgxSpinnerService, private pdfGenrateService: PDFGenrateService,
    private excelGeneratedService: ExcelGeneratedService, private utilityService: UtilityService, private reportService: ReportService) {
    this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.departmentSalesReportDetail);
  }

  ngOnInit() {
    this.getStoreLocationList();
    this.getDepartmentList();
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
  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.startDate = this.selectedDateRange.fDate;
    this.endDate = this.selectedDateRange.tDate;
    this.itemTxnReportForm.get('startDate').setValue(this.selectedDateRange.fDate);
    this.itemTxnReportForm.get('endDate').setValue(this.selectedDateRange.tDate);
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
      this.itemTxnReportForm.get('storeLocationIDs').setValue(this.storeLocationList);
    }
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  itemTxnReport() {
    if (this.itemTxnReportForm.value.storeLocationIDs === '') {
      this.toastr.info('Please Select Atleast One Store Location');
      return;
    }

    if (this.itemTxnReportForm.value.departmentID === '') {
      this.toastr.info('Please Select Department');
      return;
    }

    this.itemTxnReportRowData = [];
    const storeLocationIdObj = this.itemTxnReportForm.value.storeLocationIDs ?
      this.itemTxnReportForm.value.storeLocationIDs.map(x => x.storeLocationID).join(',') : '';
    const departmentObj = this.itemTxnReportForm.value.departmentID.departmentID;
    const postData = {
      companyID: this.userInfo.companyId,
      storeLocationID: storeLocationIdObj,
      departmentID: departmentObj,
      isDebug: 0,
      posCodeOrDesc: null,
      startDate: this.startDate,
      endDate: this.endDate
    };
    // const postData = {
    //   companyID: 2,
    //   storeLocationID: "10,",
    //   departmentID: 182,
    //   isDebug: 0,
    //   posCodeOrDesc: null,
    //   startDate: "12-26-2013",
    //   endDate: "12-26-2019"
    // }
    this.spinner.show();
    this.setupService.postData('ItemTransactionReport/InventorySummary', postData).subscribe((res) => {
      this.spinner.hide();
      if (res && res['statusCode']) {
        this.itemTxnReportRowData = [];
        this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
        return;
      }
      const arr = _.sortBy(res, [function (o) { return o.posCode.toLowerCase(); }]);
      this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.itemTxnReport);
      this.itemTxnReportRowData = arr;
    }, (error) => {
      this.spinner.hide();
      console.log(error);
      this.itemTxnReportRowData = [];
    });
  }

  searchItemTxnReport(params) {
    let res = this.itemTxnReportRowData;
    let rowData = [];
    const arr = _.sortBy(res, [function (o) { return o.posCode.toLowerCase(); }]);
    rowData = arr;
    if (params === 'pdf') {
      this.colWidths = [70, 150, 50, 50, 80, 80];
      this.body.push([{ text: 'UPC Code' }, { text: 'Description' },
      { text: 'Purchases' }, { text: 'Sales' }, { text: 'Stock Adjustment' },
      { text: 'Current Inventory' }
      ]);
      for (const key in rowData) {
        if (rowData.hasOwnProperty(key)) {
          const data = rowData[key];
          const fila = new Array();
          fila.push({ text: data.posCode.toString(), border: [false, false, false, false] });
          fila.push({ text: data.description.toString(), border: [false, false, false, false] });
          fila.push({ text: data.purchases.toString(), border: [false, false, false, false] });
          fila.push({ text: data.sales.toString(), border: [false, false, false, false] });
          fila.push({ text: data.stockAdjustment.toString(), border: [false, false, false, false] });
          fila.push({ text: data.currentInventory.toString(), border: [false, false, false, false] });
          this.body.push(fila);
        }
      }
      this.pdfGenrateService.PDFGenrate('Item Transaction Report', this.colWidths,
        this.body, this.startDate, this.endDate);
      this.body = this.colWidths = [];
    }
    if (params === 'excel') {
      const excelData = new ExcelModel();
      excelData.header = this.reportService.getColumnDef(this.constantsService.reportTypes.itemTxnReport);
      let fila = new Array();
      for (let key in rowData) {
        if (rowData.hasOwnProperty(key)) {
          let data = rowData[key];
          const temp = [
            data.posCode.toString(),
            data.description.toString(),
            data.purchases.toString(),
            data.sales.toString(),
            data.stockAdjustment.toString(),
            data.currentInventory.toString(),
          ];
          fila.push(temp);
        }
      }
      excelData.data = fila;
      excelData.reportName = 'Item Transaction Report';
      excelData.startDate = this.startDate;
      excelData.endDate = this.endDate;
      this.excelGeneratedService.generateExcel(excelData);
    }

  }

}
