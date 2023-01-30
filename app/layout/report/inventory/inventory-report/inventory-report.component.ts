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

@Component({
  selector: 'app-inventory-report',
  templateUrl: './inventory-report.component.html',
  styleUrls: ['./inventory-report.component.scss']
})
export class InventoryReportComponent implements OnInit {

  isStoreLoading = true;
  storeLocationList: any[] = [];
  departmentList: any[] = [];
  userInfo = this.constantsService.getUserInfo();
  inventoryReportRowData: any;
  inventoryReportForm = this.fb.group({
    storeLocationIDs: '',
    departmentIDs: '',
    upcCode: '',
    groupID: '',
    orderBy: '',
  });

  body: any = [];
  colWidths: any = [];
  gridApi: any;
  columnApi: any;
  gridOption: GridOptions;
  filterText = '';
  upcCode = '';
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
  getDepartmentList() {
    if (this.storeService.departmentList) {
      this.isDepartmentLoading = false;
      this.departmentList = this.storeService.departmentList;
    } else {
      this.storeService.getDepartment(this.userInfo.companyId,this.userInfo.userName).subscribe(
          (response) => {
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

  setLocationId() {
    if (this.storeLocationList.length === 1) {
      this.inventoryReportForm.get('storeLocationIDs').setValue(this.storeLocationList);
    }
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  inventoryReport() {
    if (this.inventoryReportForm.value.storeLocationIDs === '') {
      this.toastr.info('Please Select Atleast One Store Location');
      return;
    }

    if (this.inventoryReportForm.value.departmentIDs === '') {
      this.toastr.info('Please Select Atleast One Department');
      return;
    }

    this.inventoryReportRowData = [];
    const storeLocationIdObj = this.inventoryReportForm.value.storeLocationIDs ?
      this.inventoryReportForm.value.storeLocationIDs.map(x => x.storeLocationID).join(',') : '';
    const departmentObj = this.inventoryReportForm.value.departmentIDs ?
      this.inventoryReportForm.value.departmentIDs.map(x => x.departmentID).join(',') : '';
    const postData = {
      storeLocationID: storeLocationIdObj,
      department: departmentObj,
      posCodeOrDesc: this.inventoryReportForm.value.upcCode,
    };
    // const postData = {
    //   "storeLocationID": "264",
    //   "department": "1995",
    //   "posCodeOrDesc": ""
    // };
    this.spinner.show();
    this.setupService.postData('InventoryReport/ItemData', postData).subscribe((res) => {
      this.spinner.hide();
      if (res && res['statusCode']) {
        this.inventoryReportRowData = [];
        this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
        return;
      }
      const arr = _.sortBy(res, [function (o) { return o.posCode.toLowerCase(); }]);
      this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.inventoryReport);
      this.inventoryReportRowData = arr;
    }, (error) => {
      this.spinner.hide();
      console.log(error);
      this.inventoryReportRowData = [];
    });
  }

  searchInventoryReport(params) {
    let res = this.inventoryReportRowData;
    let rowData = [];
    const arr = _.sortBy(res, [function (o) { return o.posCode.toLowerCase(); }]);
    rowData = arr;
    if (params === 'pdf') {
      this.colWidths = [45, 70, 45, 45, 35, 45, 40, 40, 45, 45];
      this.body.push([{ text: 'UPC Code' }, { text: 'Description' },
      { text: 'Department' }, { text: 'Store Name' }, { text: 'Quantity' },
      { text: 'Buying Cost' }, { text: 'Selling Price' }, { text: 'Current Inventory' },
      { text: 'Buying Value' }, { text: 'Selling Value' }
      ]);
      for (const key in rowData) {
        if (rowData.hasOwnProperty(key)) {
          const data = rowData[key];
          const fila = new Array();
          fila.push({ text: data.posCode.toString(), border: [false, false, false, false] });
          fila.push({ text: data.description.toString(), border: [false, false, false, false] });
          fila.push({ text: data.departmentDescription.toString(), border: [false, false, false, false] });
          fila.push({ text: data.storeName.toString(), border: [false, false, false, false] });
          fila.push({ text: data.posCodeModifier? data.posCodeModifier.toString():'', border: [false, false, false, false] });
          fila.push({
            text: this.utilityService.formatCurrency(data.inventoryValuePrice).toString(),
            border: [false, false, false, false]
          });
          fila.push({
            text: this.utilityService.formatCurrency(data.regularSellPrice).toString(),
            border: [false, false, false, false]
          });
          if (data.currentInventory) {
            fila.push({ text: data.currentInventory.toString(), border: [false, false, false, false] });
          } else {
            fila.push({ text: '', border: [false, false, false, false] });
          }
          fila.push({
            text: this.utilityService.formatCurrency(data.buyingValue).toString(),
            border: [false, false, false, false]
          });
          fila.push({
            text: this.utilityService.formatCurrency(data.sellingValue).toString(),
            border: [false, false, false, false]
          });
          this.body.push(fila);
        }
      }
      this.pdfGenrateService.PDFGenrate('Inventory Report', this.colWidths,
        this.body, '', '');
      this.body = this.colWidths = [];
    }
    if (params === 'excel') {
      const excelData = new ExcelModel();
      excelData.header = this.reportService.getColumnDef(this.constantsService.reportTypes.inventoryReport);
      let fila = new Array();
      for (let key in rowData) {
        if (rowData.hasOwnProperty(key)) {
          let currInventory = '';
          let posCodeModifier ='';
          let data = rowData[key];
          if (data.currentInventory) {
            currInventory = data.currentInventory.toString();
          }
          posCodeModifier=data.posCodeModifier? data.posCodeModifier.toString():'';
          const temp = [
            data.posCode.toString(),
            data.description.toString(),
            data.departmentDescription.toString(),
            data.storeName.toString(),
            posCodeModifier,
            this.utilityService.formatCurrency(data.inventoryValuePrice).toString(),
            this.utilityService.formatCurrency(data.regularSellPrice).toString(),
            currInventory,
            this.utilityService.formatCurrency(data.buyingValue).toString(),
            this.utilityService.formatCurrency(data.sellingValue).toString(),
          ];
          fila.push(temp);
        }
      }
      excelData.data = fila;
      excelData.reportName = 'Inventory Report';
      this.excelGeneratedService.generateExcel(excelData);
    }

  }

}