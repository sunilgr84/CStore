import { Component, OnInit } from '@angular/core';
import { StoreService } from '@shared/services/store/store.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { FormBuilder } from '@angular/forms';
import { PDFGenrateService } from '@shared/services/pdf-genrate/pdf-genrate.service';
import { UtilityService } from '@shared/services/utility/utility.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { SetupService } from '@shared/services/setupService/setup-service';
import * as moment from 'moment';
import { ExcelModel } from '@models/excel-data-model';
import { ExcelGeneratedService } from '@shared/services/excelGenerate/excel-generated.service';
import { ReportGridService } from '@shared/services/report/report-grid.service';

@Component({
  selector: 'app-sales-history-by-upc-report',
  templateUrl: './sales-history-by-upc-report.component.html',
  styleUrls: ['./sales-history-by-upc-report.component.scss']
})
export class SalesHistoryByUpcReportComponent implements OnInit {


  startDate = moment().format('MM-DD-YYYY');
  endDate = moment().format('MM-DD-YYYY');
  SalesHistorySearchReport = this.formBuilder.group({
    sDate: this.startDate,
    eDate: this.endDate,
    storeID: [''],
    poscode: ['']
  });
  userInfo = this.constantsService.getUserInfo();
  body: any = [];
  colWidths: any = [];
  rowData: any;
  selectedDateRange: any;
  storeLocationList: any[];
  gridOption: any;
  constructor(private storeService: StoreService, private constantsService: ConstantService,
    private setupService: SetupService, private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService, private pdfGenrateService: PDFGenrateService,
    private toastr: ToastrService, private utilityService: UtilityService,
    private excelGeneratedService: ExcelGeneratedService, private reportGridService: ReportGridService) { }

  ngOnInit() {
    this.getStoreLocationList();
  }

  getStoreLocationList() {
    if (this.storeService.storeLocation) {
      this.storeLocationList = this.storeService.storeLocation;
      this.setLocationId();
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.storeLocationList = this.storeService.storeLocation;
        this.setLocationId();
      }, (error) => {
        console.log(error);
      });
    }

  }
  setLocationId() {
    if (this.storeLocationList.length === 1) {
      this.SalesHistorySearchReport.get('storeID').setValue(this.storeLocationList);
    }
  }
  dateChange(event, controls) {
    if (controls === 'startDate') {
      this.SalesHistorySearchReport.get('sDate').setValue(event.formatedDate);
      this.startDate = event.formatedDate;
    }
    if (controls === 'endDate') {
      this.SalesHistorySearchReport.get('eDate').setValue(event.formatedDate);
      this.endDate = event.formatedDate;
    }
  }
  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.SalesHistorySearchReport.get('sDate').setValue(this.selectedDateRange.fDate);
    this.startDate = this.selectedDateRange.fDate;
    this.SalesHistorySearchReport.get('eDate').setValue(this.selectedDateRange.tDate);
    this.endDate = this.selectedDateRange.tDate;
  }
  generatePDF() {

    const constStoreLocationIds = this.SalesHistorySearchReport.value.storeID ?
      this.SalesHistorySearchReport.value.storeID.map(x => x.storeLocationID).join(',') : '';

    const postData = {
      ...this.SalesHistorySearchReport.value,
      storeID: constStoreLocationIds,
    };
    this.spinner.show();
    this.setupService.postData('SalesHistoryByUPCReport/SalesHistoryByUPCReport', postData).subscribe((res) => {
      this.spinner.hide();
      if (res && res['statusCode']) {
        this.rowData = [];
        this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
        return;
      } else {
        this.rowData = res;
      }
      this.gridHeader();
    }, (error) => {
      this.spinner.hide();
      console.log(error);
      this.rowData = [];
    });
  }
  searchSalesHistoryReport(params) {
    if (params === 'pdf') {
      this.colWidths = [55, 65, 110, 30, 30, 40, 40, 40, 40];
      this.body.push([{ text: 'Business Date' }, { text: 'POS Code' }, { text: 'Description' },
      { text: 'Department Description' }, { text: 'Units In Case' }, { text: 'Last Inventory' },
      { text: 'Purchase' }, { text: 'Sales Qty' }, { text: 'Current Inventory' }
      ]);

      for (const key in this.rowData) {
        if (this.rowData.hasOwnProperty(key)) {
          const data = this.rowData[key];
          const fila = new Array();
          fila.push({ text: this.utilityService.formatDate(data.businessDate).toString(), border: [false, false, false, false] });
          fila.push({ text: data.posCode.toString(), border: [false, false, false, false] });  
          fila.push({ text: data.description.toString(), border: [false, false, false, false] });
          fila.push({ text: data.departmentDescription.toString(), border: [false, false, false, false] });
          fila.push({ text: data.unitsInCase.toString(), border: [false, false, false, false] });
          fila.push({ text: data.lastInventory.toString(), border: [false, false, false, false] });
          fila.push({ text: data.purchase.toString(), border: [false, false, false, false] });
          fila.push({ text: data.salesqty.toString(), border: [false, false, false, false] });
          fila.push({ text: data.currentInventory.toString(), border: [false, false, false, false] });
          this.body.push(fila);
        }
      }

      this.pdfGenrateService.PDFGenrate('Sales History By UPC Report', this.colWidths,
        this.body, this.SalesHistorySearchReport.value.sDate, this.SalesHistorySearchReport.value.eDate);
      this.body = this.rowData = this.colWidths = [];
    }
    if (params === 'excel') {
      const excelData = new ExcelModel();
      excelData.header = ['Business Date', 'POS Code',  'Description','Department Description',
      'Units In Case','Last Inventory','Purchase','Sales Qty', 'Current Inventory'];
      let fila = new Array();
      for (let key in this.rowData) {
        if (this.rowData.hasOwnProperty(key)) {
          let data = this.rowData[key];
          const temp = [
            this.utilityService.formatDate(data.businessDate).toString(),
            data.posCode.toString(),
            data.description.toString(),
            data.departmentDescription.toString(),
            data.unitsInCase.toString(),
            data.lastInventory.toString(),
            data.purchase.toString(),
            data.salesqty.toString(),
            data.currentInventory.toString(),
          ];
          fila.push(temp);
        }
      }
      excelData.data = fila;
      excelData.reportName = 'Sales History By UPC Report';
      this.excelGeneratedService.generateExcel(excelData);
    }
  }
  onGridReady(params) { }

  gridHeader() {
    this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.salesHistoryByUPCReport);
  }
}
