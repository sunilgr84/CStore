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
  selector: 'app-fuel',
  templateUrl: './fuel.component.html',
  styleUrls: ['./fuel.component.scss']
})
export class FuelReportComponent implements OnInit {
  isSingalStore: any;
  storeLocationList: any;
  rowData: any;
  _endDate = moment().format('YYYY-MM-DD');
  _startDate = moment().format('YYYY-MM-DD');
  userInfo = this.constantsService.getUserInfo();
  reportName: any;
  fuelSalesReportForm = this.fb.group({
    storeLocation: '', vendorIDs: '',
    startDate: this._startDate, endDate: this._endDate,
    departmentIDs: '', paymentSourceID: '',
  });
  body: any = [];
  colWidths: any = [];
  gridOption: any;
  selectedDateRange: any;
  constructor(private constantsService: ConstantService, private spinner: NgxSpinnerService, private storeService: StoreService,
    private toastr: ToastrService, private reportService: ReportService, private utilityService: UtilityService,
    private setupService: SetupService, private fb: FormBuilder, private pdfGenrateService: PDFGenrateService,
    private excelGeneratedService: ExcelGeneratedService, private reportGridService: ReportGridService) { }

  ngOnInit() {
    this.getStoreLocationList();
  }
  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.fuelSalesReportForm.get('startDate').setValue(this.selectedDateRange.fDate);
    this._startDate = this.selectedDateRange.fDate;
    this.fuelSalesReportForm.get('endDate').setValue(this.selectedDateRange.tDate);
    this._endDate = this.selectedDateRange.tDate;
  }

  getStoreLocationList() {
    if (this.storeService.storeLocation) {
      this.storeLocationList = this.storeService.storeLocation;
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.storeLocationList = this.storeService.storeLocation;
      }, (error) => {
        console.log(error);
      });
    }
  }

  checkReportName() {
    return 'Fuel Sales Reports';
  }

  public captureScreen() {
    const doc = new jspdf('p', 'pt');

    const headerData = {
      reportName: this.checkReportName(),
      fromDate: this.fuelSalesReportForm.value.startDate, toDate: this.fuelSalesReportForm.value.endDate
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
    return this.reportService.getColumnDef(this.constantsService.reportTypes.fuelSalesReport);
  }

  dateChange(event, controls) {
    if (controls === 'startDate') {
      this.fuelSalesReportForm.get('startDate').setValue(event.formatedDate);
      this._startDate = event.formatedDate;
    }
    if (controls === 'endDate') {
      this.fuelSalesReportForm.get('endDate').setValue(event.formatedDate);
      this._endDate = event.formatedDate;
    }
  }

  searchPurchaseReport() {
    if (this.fuelSalesReportForm.value.purchaseReport === '') {
      this.toastr.info('Please Select Report Type');
      return;
    }
    let storeLocationIds = this.fuelSalesReportForm.value.storeLocation ? this.fuelSalesReportForm.value.storeLocation.map(x => x.storeLocationID).join(',') : '';
    if(!storeLocationIds){
      this.toastr.error('Please select store location');
      return;
    }
    this.spinner.show();
    this.rowData = [];
    this.setupService.getData('MovementHeader/GetFuelSalesByGrade?StoreLocationID=' + storeLocationIds + '&StartBusinessDate=' + this.fuelSalesReportForm.value.startDate + '&EndBusinessDate=' + this.fuelSalesReportForm.value.endDate).subscribe((res) => {
      this.spinner.hide();
      if (res && res['statusCode']) {
        this.rowData = [];
        this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
        return;
      } else {
        this.rowData = res;
      }
      if (this.rowData === null || this.rowData.length === 0) {
        this.toastr.error('Data not found', this.constantsService.infoMessages.error);
        return;
      }
      const arr = _.sortBy(res, [function (o) { return o.BusinessDate.toLowerCase(); }]);
      this.gridHeader();
      this.rowData = arr;
    }, (error) => {
      console.log(error);
      this.rowData = [];
      this.spinner.hide();
    });

  }

  searchSalesReport(param) {
    if (param === 'pdf') {
      this.colWidths = [80, 90, 75, 100, 70, 45, 55, 50, 55, 55];
      this.body.push([{ text: 'Store Name' },{ text: 'Gas Grade' }, { text: 'Date' },
       { text: 'Gas Volume (gal)', }, { text: 'Gas Amount' },
      ]);
      for (const key in this.rowData) {
        if (this.rowData.hasOwnProperty(key)) {
          const data = this.rowData[key];
          const fila = new Array();

          fila.push({ text: data.StoreName.toString(), border: [false, false, false, false] });
          fila.push({ text: data.FuelGradeName.toString(), border: [false, false, false, false] });
          fila.push({ text: this.utilityService.formatDateEmpty(data.BusinessDate).toString(), border: [false, false, false, false] });
          fila.push({ text: data.SaleVolume.toString(), border: [false, false, false, false] });
          fila.push({ text: this.utilityService.formatCurrency(data.SaleAmount).toString(), border: [false, false, false, false] });
          this.body.push(fila);
        }
      }
      this.pdfGenrateService.PDFGenrate('Fuel Sales Reports', this.colWidths,
        this.body, this.fuelSalesReportForm.value.startDate, this.fuelSalesReportForm.value.endDate, 'landscape');
      this.body = this.colWidths = [];
    }
    if (param === 'excel') {
      const excelData = new ExcelModel();
      excelData.header = this.headRows();
      let fila = new Array();
      for (let key in this.rowData) {
        if (this.rowData.hasOwnProperty(key)) {
          let data = this.rowData[key];
          const temp = [
            data.StoreName.toString(),
            data.FuelGradeName.toString(),
            this.utilityService.formatDateEmpty(data.BusinessDate).toString(),
            data.SaleVolume.toString(),
            this.utilityService.formatCurrency(data.SaleAmount).toString()
          ];
          fila.push(temp);
        }
      }
      excelData.data = fila;
      excelData.reportName = this.checkReportName();
      this.excelGeneratedService.generateExcel(excelData);
    }
  }

  gridHeader() {
    this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.fuelSalesReport);
  }
  onGridReady(params) {

  }
}
