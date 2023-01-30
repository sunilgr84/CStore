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
import { ExcelGeneratedService } from '@shared/services/excelGenerate/excel-generated.service';
import { ExcelModel } from '@models/excel-data-model';
import { ReportGridService } from '@shared/services/report/report-grid.service';

@Component({
  selector: 'app-modifier-sales-report',
  templateUrl: './modifier-sales-report.component.html',
  styleUrls: ['./modifier-sales-report.component.scss']
})
export class ModifierSalesReportComponent implements OnInit {


  startDate = moment().format('MM-DD-YYYY');
  endDate = moment().format('MM-DD-YYYY');
  selectedDateRange:any;
  ModifierSalesForm = this.formBuilder.group({
    storeLocation: [''],
    department: [''],
    startDate: this.startDate,
    endDate: this.endDate
  });
  userInfo = this.constantsService.getUserInfo();
  body: any = [];
  colWidths: any = [];
  rowData: any;
  storeLocationList: any[];
  departmentList: any[];
  gridOption: any;
  constructor(private storeService: StoreService, private constantsService: ConstantService,
    private setupService: SetupService, private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService, private pdfGenrateService: PDFGenrateService,
    private toastr: ToastrService, private utilityService: UtilityService,
    private excelGeneratedService: ExcelGeneratedService, private reportGridService: ReportGridService) { }

  ngOnInit() {
    this.getStoreLocationList();
    this.getDepartmentList();
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
      this.ModifierSalesForm.get('storeLocation').setValue(this.storeLocationList);
    }
  }
  getDepartmentList() {
    this.setupService.getData(`Department/GetByfuel/${this.userInfo.userName}/${this.userInfo.companyId}/false`).subscribe(res => {
      if (res && res['statusCode']) {
        this.departmentList = [];
      }
      res.forEach(function (element) {
        element.companyID = 0;
      });
      this.departmentList = res;
    });
  }

  dateChange(event, controls) {
    if (controls === 'startDate') {
      this.ModifierSalesForm.get('startDate').setValue(event.formatedDate);
      this.startDate = event.formatedDate;
    }
    if (controls === 'endDate') {
      this.ModifierSalesForm.get('endDate').setValue(event.formatedDate);
      this.endDate = event.formatedDate;
    }
  } 
  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.ModifierSalesForm.get('startDate').setValue(this.selectedDateRange.fDate);
    this.startDate = this.selectedDateRange.fDate;
    this.ModifierSalesForm.get('endDate').setValue(this.selectedDateRange.tDate);
    this.endDate = this.selectedDateRange.tDate;
  }


  generatePDF() {

    const constStoreLocationIds = this.ModifierSalesForm.value.storeLocation ?
      this.ModifierSalesForm.value.storeLocation.map(x => x.storeLocationID).join(',') : '';
    const constDepartmentIds = this.ModifierSalesForm.value.department ?
      this.ModifierSalesForm.value.department.map(x => x).join(',') : '';

    const postData = {
      ...this.ModifierSalesForm.value,
      storeLocation: constStoreLocationIds,
      department: constDepartmentIds,
    };
    this.spinner.show();
    this.setupService.postData('Common/ModifierSalesReports', postData).subscribe((res) => {
      this.spinner.hide();
      if (res && res['statusCode']) {
        this.rowData = [];
        this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
        return;
      } else {
        this.rowData = res;
      }
      if (this.rowData === null || this.rowData.length === 0) {
       // this.toastr.info('Data not found', 'warning');
        return;
      }
      this.gridHeader();
    }, (error) => {
      this.spinner.hide();
      console.log(error);
      this.rowData = [];
    });
  }

  searchModifierSalesReport(params) {
    if (params === 'pdf') {
      this.colWidths = [75, 75, 100, 70, 70, 70];
      this.body.push([
        // { text: 'Department Description' },
        { text: 'Item Code' }, { text: 'UPC Code' }, { text: 'Description' },
        { text: 'Sales Quantity' }, { text: 'Min Inventory' }, { text: 'Max Inventory' },
      ]);

      for (const key in this.rowData) {
        if (this.rowData.hasOwnProperty(key)) {
          const data = this.rowData[key];
          const fila = new Array();
          // fila.push({ text: data.departmentDescription.toString(), border: [false, false, false, false] });
          fila.push({ text: data.vendorItemCode.toString(), border: [false, false, false, false] });
          fila.push({ text: data.poscode.toString(), border: [false, false, false, false] });
          fila.push({ text: data.description.toString(), border: [false, false, false, false] });

          fila.push({
            text: data.salesQuantity ? data.salesQuantity.toString() : data.salesQuantity,
            border: [false, false, false, false],
          });
          fila.push({ text: data.minInventory, border: [false, false, false, false], });
          fila.push({ text: data.maxInventory, border: [false, false, false, false], });

          this.body.push(fila);
        }
      }
      this.pdfGenrateService.PDFGenrate('Modifier Sales Report', this.colWidths,
        this.body, this.ModifierSalesForm.value.startDate, this.ModifierSalesForm.value.endDate);
      this.body = this.colWidths = [];
    }
    if (params === 'excel') {
      const excelData = new ExcelModel();
      excelData.header = ['Item Code', 'UPC Code', 'Description',
        'Sold Quantity', 'Min Inventory', 'Max Inventory',
        // 'Department Description',
      ];
      let fila = new Array();
      for (let key in this.rowData) {
        if (this.rowData.hasOwnProperty(key)) {
          let data = this.rowData[key];
          const temp = [
            // data.departmentDescription.toString(),
            data.vendorItemCode?data.vendorItemCode.toString():'',
            data.poscode? data.poscode.toString():'',
            data.description?data.description.toString():'',
            data.salesQuantity?data.salesQuantity.toString():'',
            data.minInventory? data.minInventory.toString():'',
            data.maxInventory? data.maxInventory.toString():'',
          ];
          fila.push(temp);
        }
      }
      excelData.data = fila;
      excelData.reportName = 'Modifier Sales Report';
      this.excelGeneratedService.generateExcel(excelData);
    }
  }
  gridHeader() {
    this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.modifierSalesReport);
  }
  onGridReady(params) { }
}
