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
  selector: 'app-shrinkage-report',
  templateUrl: './shrinkage-report.component.html',
  styleUrls: ['./shrinkage-report.component.scss']
})
export class ShrinkageReportComponent implements OnInit {
  isStoreLoading = true;
  storeLocationList: any[] = [];
  departmentList: any[] = [];
  userInfo = this.constantsService.getUserInfo();
  shrinkageReportRowData: any;

  body: any = [];
  colWidths: any = [];
  gridApi: any;
  columnApi: any;
  gridOption: GridOptions;
  filterText = '';
  upcCode = '';
  selectedDateRange: any;
  startDate = moment().format('MM-DD-YYYY');
  endDate = moment().format('MM-DD-YYYY');
  shrinkageReportForm = this.fb.group({
    storeLocationIDs: '',
    departmentIDs: '',
    startDate: this.startDate,
    endDate: this.endDate,
    upcCode: ''
  });
  isDepartmentLoading = true;
  constructor(private constantsService: ConstantService, private storeService: StoreService, private fb: FormBuilder, private setupService: SetupService,
    private reportGridService: ReportGridService, private toastr: ToastrService, private spinner: NgxSpinnerService, private pdfGenrateService: PDFGenrateService,
    private excelGeneratedService: ExcelGeneratedService, private utilityService: UtilityService, private reportService: ReportService) {
    this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.shrinkageReport);
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
  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.startDate = this.selectedDateRange.fDate;
    this.endDate = this.selectedDateRange.tDate;
    this.shrinkageReportForm.get('startDate').setValue(this.selectedDateRange.fDate);
    this.shrinkageReportForm.get('endDate').setValue(this.selectedDateRange.tDate);
  }
  setLocationId() {
    if (this.storeLocationList.length === 1) {
      this.shrinkageReportForm.get('storeLocationIDs').setValue(this.storeLocationList);
    }
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  shrinkageReport() {
     if (this.shrinkageReportForm.value.storeLocationIDs === '') {
      this.toastr.info('Please Select Atleast One Store Location');
      return;
    }

    if (this.shrinkageReportForm.value.departmentIDs === '') {
      this.toastr.info('Please Select Atleast One Department');
      return;
    }  
    this.shrinkageReportRowData = [];
    const storeLocationIdObj = this.shrinkageReportForm.value.storeLocationIDs ?
      this.shrinkageReportForm.value.storeLocationIDs.map(x => x.storeLocationID).join(',') : '';
    const departmentObj = this.shrinkageReportForm.value.departmentIDs ?
      this.shrinkageReportForm.value.departmentIDs.map(x => x.departmentID).join(',') : '';
    const postData =  {
      companyID: this.userInfo.companyId,
      isDebug: 0,
      itemUPC: this.shrinkageReportForm.value.upcCode,
      storeLocationID: storeLocationIdObj,
      departmentID: departmentObj,
      startDate: this.shrinkageReportForm.value.startDate,
      endDate: this.shrinkageReportForm.value.endDate,
    }; 

    /* {
      companyID: 17,
        isDebug: 0,
          itemUPC: "01820000942",
            startDate: "10/01/2014",
              endDate: "12/02/2014",
                departmentID: "1170",
                  storeLocationID: "45"
    }  */

    this.spinner.show();
    this.setupService.postData('ShrinkageReport/ShrinkageReport', postData).subscribe((res) => {
      this.spinner.hide();
      if (res && res['statusCode']) {
        this.shrinkageReportRowData = [];
        this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
        return;
      }
      const arr = _.sortBy(res, [function (o) { return o.upc.toLowerCase(); }]);
      this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.shrinkageReport);
      this.shrinkageReportRowData = arr;
    }, (error) => {
      this.spinner.hide();
      console.log(error);
      this.shrinkageReportRowData = [];
    });
  }

  searchShrinkageReport(params) {
    let res = this.shrinkageReportRowData;
    let rowData = [];
    const arr = _.sortBy(res, [function (o) { return o.upc.toLowerCase(); }]);
    rowData = arr;
    if (params === 'pdf') {
      this.colWidths = [35, 40, 40, 50, 40, 40, 40, 25, 30, 30, 30];
      this.body.push([{ text: 'Store Name' }, { text: 'Department Description' },
      { text: 'UPC' }, { text: 'Description' },
      { text: 'Start Inventory Date' }, { text: 'Starting Inventory' },
      { text: 'Purchases' }, { text: 'Sales' },
      { text: 'Final Inventory' }, { text: 'Final Inventory Date' }, { text: 'Shrinkage' }
      ]);
      for (const key in rowData) {
        if (rowData.hasOwnProperty(key)) {
          const data = rowData[key];
          const fila = new Array();
          fila.push({ text: data.storeName.toString(), border: [false, false, false, false] });
          fila.push({ text: data.departmentDescription.toString(), border: [false, false, false, false] });
          fila.push({ text: data.upc.toString(), border: [false, false, false, false] });
          fila.push({ text: data.description.toString(), border: [false, false, false, false] });
          if (data.startInventoryDate) {
            fila.push({ text: this.utilityService.formatDateEmpty(data.startInventoryDate).toString(), border: [false, false, false, false] });
          } else {
            fila.push({ text: '', border: [false, false, false, false] });
          }
          if (data.startingInventory) {
            fila.push({ text: data.startingInventory.toString(), border: [false, false, false, false] });
          } else {
            fila.push({ text: '', border: [false, false, false, false] });
          }
          fila.push({ text: data.purchases.toString(), border: [false, false, false, false] });
          fila.push({ text: data.sales.toString(), border: [false, false, false, false] });

          if (data.finalInventory) {
            fila.push({ text: data.finalInventory.toString(), border: [false, false, false, false] });
          } else {
            fila.push({ text: '', border: [false, false, false, false] });
          }
          if (data.finalInventoryDate) {
            fila.push({ text: this.utilityService.formatDateEmpty(data.finalInventoryDate).toString(), border: [false, false, false, false] });
          } else {
            fila.push({ text: '', border: [false, false, false, false] });
          }
          fila.push({ text: data.shrinkage.toString(), border: [false, false, false, false] });
          this.body.push(fila);
        }
      }
      this.pdfGenrateService.PDFGenrate('Shrinkage Report', this.colWidths,
        this.body, this.startDate, this.endDate);
      this.body = this.colWidths = [];
    }
    if (params === 'excel') {
      const excelData = new ExcelModel();
      excelData.header = this.reportService.getColumnDef(this.constantsService.reportTypes.shrinkageReport);
      let fila = new Array();
      for (let key in rowData) {
        if (rowData.hasOwnProperty(key)) {
          let startInventoryDate = '';
          let startingInventory = '';
          let finalInventory = '';
          let finalInventoryDate = '';
          let data = rowData[key];
          if (data.startInventoryDate) {
            startInventoryDate = data.startInventoryDate.toString();
          }
          if (data.startingInventory) {
            startingInventory = this.utilityService.formatDateEmpty(data.startInventoryDate).toString()
          }
          if (data.finalInventory) {
            finalInventory = data.finalInventory.toString();
          }
          if (data.finalInventoryDate) {
            finalInventoryDate = this.utilityService.formatDateEmpty(data.finalInventoryDate).toString()
          }
          const temp = [
            data.storeName.toString(),
            data.departmentDescription.toString(),
            data.upc.toString(),
            data.description.toString(),
            startInventoryDate,
            startingInventory,
            data.purchases.toString(),
            data.sales.toString(),
            finalInventory,
            finalInventoryDate,
            data.shrinkage.toString()
          ];
          fila.push(temp);
        }
      }
      excelData.data = fila;
      excelData.reportName = 'Shrinkage Report';
      excelData.startDate = this.startDate;
      excelData.endDate = this.endDate;
      this.excelGeneratedService.generateExcel(excelData);
    }

  }

}
