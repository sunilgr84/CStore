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
  selector: 'app-unupdated-inventory-report',
  templateUrl: './unupdated-inventory-report.component.html',
  styleUrls: ['./unupdated-inventory-report.component.scss']
})
export class UnupdatedInventoryReportComponent implements OnInit {


  isStoreLoading = true;
  storeLocationList: any[] = [];
  departmentList: any[] = [];
  userInfo = this.constantsService.getUserInfo();
  unupdatedInvReportRowData: any;

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
  unUpdatedinventoryReportForm = this.fb.group({
    storeLocationIDs: '',
    departmentIDs: '',
    startDate: this.startDate,
    endDate: this.endDate,
    groupID: '',
    orderBy: '',
  });
  isDepartmentLoading = true;
  constructor(private constantsService: ConstantService, private storeService: StoreService, private fb: FormBuilder, private setupService: SetupService,
    private reportGridService: ReportGridService, private toastr: ToastrService, private spinner: NgxSpinnerService, private pdfGenrateService: PDFGenrateService,
    private excelGeneratedService: ExcelGeneratedService, private utilityService: UtilityService, private reportService: ReportService) {
    this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.unupdatedInventoryReport);
  }

  ngOnInit() {
    this.getStoreLocationList();
    this.getDepartmentList();
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
    this.unUpdatedinventoryReportForm.get('startDate').setValue(this.selectedDateRange.fDate);
    this.unUpdatedinventoryReportForm.get('endDate').setValue(this.selectedDateRange.tDate);
  }
  setLocationId() {
    if (this.storeLocationList.length === 1) {
      this.unUpdatedinventoryReportForm.get('storeLocationIDs').setValue(this.storeLocationList);
    }
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
 /*  getDepartmentList() {
    this.setupService.getData(`Department/getAll/${this.userInfo.userName}/${this.userInfo.companyId}`).subscribe(res => {
      if (res && res['statusCode']) {
        this.departmentList = [];
      }
      this.departmentList = res;
    });
  }
 */
  onGridReady(params) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  unupdatedInventoryReport() {
    if (this.unUpdatedinventoryReportForm.value.storeLocationIDs === '') {
      this.toastr.info('Please Select Atleast One Store Location');
      return;
    }

    if (this.unUpdatedinventoryReportForm.value.departmentIDs === '') {
      this.toastr.info('Please Select Atleast One Department');
      return;
    }
    this.unupdatedInvReportRowData = [];
    const storeLocationIdObj = this.unUpdatedinventoryReportForm.value.storeLocationIDs ?
      this.unUpdatedinventoryReportForm.value.storeLocationIDs.map(x => x.storeLocationID).join(',') : '';
    const departmentObj = this.unUpdatedinventoryReportForm.value.departmentIDs ?
      this.unUpdatedinventoryReportForm.value.departmentIDs.map(x => x.departmentID).join(',') : '';
    const postData = {
      storeLocation: storeLocationIdObj,
      department: departmentObj,
      startDate: this.unUpdatedinventoryReportForm.value.startDate,
      endDate: this.unUpdatedinventoryReportForm.value.endDate,
    };
    this.spinner.show();
    this.setupService.postData('UnupdatedInventoryReport/InventoryDetailsReportPage', postData).subscribe((res) => {
      this.spinner.hide();
      if (res && res['statusCode']) {
        this.unupdatedInvReportRowData = [];
        this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
        return;
      }
      const arr = _.sortBy(res, [function (o) { return o.posCode.toLowerCase(); }]);
      this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.unupdatedInventoryReport);
      this.unupdatedInvReportRowData = arr;
    }, (error) => {
      this.spinner.hide();
      console.log(error);
      this.unupdatedInvReportRowData = [];
    });
  }

  searchUnupdatedInvReport(params) {
    let res = this.unupdatedInvReportRowData;
    let rowData = [];
    const arr = _.sortBy(res, [function (o) { return o.posCode.toLowerCase(); }]);
    rowData = arr;
    if (params === 'pdf') {
      this.colWidths = [60, 60, 60, 160, 60, 45];
      this.body.push([{ text: 'Store Name' }, { text: 'Department Description' },
      { text: 'POS Code' }, { text: 'Description' },
      { text: 'Inventory As Of Date' }, { text: 'Current Inventory' }
      ]);
      for (const key in rowData) {
        if (rowData.hasOwnProperty(key)) {
          const data = rowData[key];
          const fila = new Array();
          fila.push({ text: data.storeName.toString(), border: [false, false, false, false] });
          fila.push({ text: data.departmentDescription.toString(), border: [false, false, false, false] });
          fila.push({ text: data.posCode.toString(), border: [false, false, false, false] });
          fila.push({ text: data.description.toString(), border: [false, false, false, false] });
          if (data.inventoryAsOfDate) {
            fila.push({ text: data.inventoryAsOfDate.toString(), border: [false, false, false, false] });
          } else {
            fila.push({ text: '', border: [false, false, false, false] });
          }
          if (data.currentInventory) {
            fila.push({ text: data.currentInventory.toString(), border: [false, false, false, false] });
          } else {
            fila.push({ text: '', border: [false, false, false, false] });
          }
          this.body.push(fila);
        }
      }
      this.pdfGenrateService.PDFGenrate('Unupdated Inventory Report', this.colWidths,
        this.body, this.startDate, this.endDate);
      this.body = this.colWidths = [];
    }
    if (params === 'excel') {
      const excelData = new ExcelModel();
      excelData.header = this.reportService.getColumnDef(this.constantsService.reportTypes.unupdatedInventoryReport);
      let fila = new Array();
      for (let key in rowData) {
        if (rowData.hasOwnProperty(key)) {
          let currInventory = '';
          let inventoryAsOfDate = '';
          let data = rowData[key];
          if (data.currentInventory) {
            currInventory = data.currentInventory.toString();
          }
          if (data.inventoryAsOfDate) {
            inventoryAsOfDate = data.inventoryAsOfDate.toString();
          }
          const temp = [
            data.storeName.toString(),
            data.departmentDescription.toString(),
            data.posCode.toString(),
            data.description.toString(),
            inventoryAsOfDate,
            currInventory
          ];
          fila.push(temp);
        }
      }
      excelData.data = fila;
      excelData.reportName = 'Unupdated Inventory Report';
      excelData.startDate = this.startDate;
      excelData.endDate = this.endDate;
      this.excelGeneratedService.generateExcel(excelData);
    }

  }
}
