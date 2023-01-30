import { Component, OnInit } from '@angular/core';
import { StoreService } from '@shared/services/store/store.service';
import * as moment from 'moment';
import { ConstantService } from '@shared/services/constant/constant.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UtilityService } from '@shared/services/utility/utility.service';
import { PDFGenrateService } from '@shared/services/pdf-genrate/pdf-genrate.service';
import * as _ from 'lodash';
import { ExcelGeneratedService } from '@shared/services/excelGenerate/excel-generated.service';
import { ExcelModel } from '@models/excel-data-model';
import { ReportGridService } from '@shared/services/report/report-grid.service';

@Component({
  selector: 'app-abnormal-profit-margin',
  templateUrl: './abnormal-profit-margin.component.html',
  styleUrls: ['./abnormal-profit-margin.component.scss']
})
export class AbnormalProfitMarginComponent implements OnInit {

  startDate = moment().format('MM-DD-YYYY');
  endDate = moment().format('MM-DD-YYYY');
  selectedDateRange: any;
  userInfo = this.constantsService.getUserInfo();
  storeLocationList: any[];
  vendorList: any[];
  abnormalProfitSearchForm = this.formBuilder.group({
    storeLocationIDs: [''],
    vendorIDs: [''],
    companyID: [''],
    startDate: this.startDate,
    endDate: this.endDate
  });
  body: any = [];
  colWidths: any = [];
  rowData: any;
  gridOption: any;
  isVendorLoading = true;
  constructor(private storeService: StoreService, private constantsService: ConstantService,
    private setupService: SetupService, private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService, private pdfGenrateService: PDFGenrateService,
    private toastr: ToastrService, private utilityService: UtilityService,
    private excelGeneratedService: ExcelGeneratedService, private reportGridService: ReportGridService) { }

  ngOnInit() {
    this.getStoreLocationList();
    this.getVendorByCompanyID();
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
      this.abnormalProfitSearchForm.get('storeLocationIDs').setValue(this.storeLocationList);
    }
  }
  getVendorByCompanyID() {
    if (this.storeService.vendorList) {
      this.isVendorLoading = false;
      this.vendorList = this.storeService.vendorList;
    } else {
      this.storeService.getVendorList(this.userInfo.companyId).subscribe((response) => {
        this.isVendorLoading = false;
        this.vendorList = this.storeService.vendorList;
      }, (error) => {
        console.log(error);
      });
    }
  }
  dateChange(event, controls) {
    if (controls === 'startDate') {
      this.abnormalProfitSearchForm.get('startDate').setValue(event.formatedDate);
      this.startDate = event.formatedDate;
    }
    if (controls === 'endDate') {
      this.abnormalProfitSearchForm.get('endDate').setValue(event.formatedDate);
      this.endDate = event.formatedDate;
    }
  }
  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.abnormalProfitSearchForm.get('startDate').setValue(this.selectedDateRange.fDate);
    this.startDate = this.selectedDateRange.fDate;
    this.abnormalProfitSearchForm.get('endDate').setValue(this.selectedDateRange.tDate);
    this.endDate = this.selectedDateRange.tDate;
  }
  generatePDF() {

    const constStoreLocationIds = this.abnormalProfitSearchForm.value.storeLocationIDs ?
      this.abnormalProfitSearchForm.value.storeLocationIDs.map(x => x.storeLocationID).join(',') : '';
    const constVendorIDs = this.abnormalProfitSearchForm.value.vendorIDs ?
      this.abnormalProfitSearchForm.value.vendorIDs.map(x => x).join(',') : '';
    const postData = {
      ...this.abnormalProfitSearchForm.value,
      storeLocationIDs: constStoreLocationIds,
      vendorIDs: constVendorIDs,
      companyID: this.userInfo.companyId,
    };
    this.spinner.show();
    this.setupService.postData('Common/AbnormalProfitReports', postData).subscribe((res) => {
      this.spinner.hide();
      if (res && res['statusCode']) {
        this.rowData = [];
        this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
        return;
      } else {
        const arr = _.sortBy(res, [function (o) { return o.vendorName.toLowerCase(); }]);
        this.rowData = arr;
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
  searchReport(params) {
    if (params === 'pdf') {
      this.colWidths = ['*', '*', '*', '*', '*', '*', '*'];
      this.body.push([{ text: 'Vendor Name' }, { text: 'Invoice No' }, { text: 'Created Date Time' },
      { text: 'Invoice Value Price' }, { text: 'Regular Sell Price' }, { text: 'Profit Margin' },
      { text: 'Invoice Status Description' }
      ]);

      for (const key in this.rowData) {
        if (this.rowData.hasOwnProperty(key)) {
          const data = this.rowData[key];
          const fila = new Array();
          fila.push({ text: data.vendorName.toString(), border: [false, false, false, false] });
          fila.push({ text: data.invoiceNo.toString(), border: [false, false, false, false] });
          fila.push({ text: this.utilityService.formatDate(data.createdDateTime).toString(), border: [false, false, false, false] });
          fila.push({
            text: this.utilityService.formatCurrency(data.invoiceValuePrice).toString(),
            border: [false, false, false, false]
          });
          fila.push({ text: this.utilityService.formatCurrency(data.regularSellPrice).toString(), border: [false, false, false, false] });
          fila.push({ text: data.profitMargin.toString(), border: [false, false, false, false] });
          fila.push({ text: data.invoiceStatusDescription.toString(), border: [false, false, false, false] });
          this.body.push(fila);
        }
      }
      this.pdfGenrateService.PDFGenrate('Abnormal Profit Margin', this.colWidths,
        this.body, this.abnormalProfitSearchForm.value.startDate, this.abnormalProfitSearchForm.value.endDate);
      this.body = this.rowData = this.colWidths = [];
    }
    if (params === 'excel') {
      const excelData = new ExcelModel();
      excelData.header = ['Vendor Name', 'Invoice No', 'Created Date Time',
        'Invoice Value Price', 'Regular Sell Price', 'Profit Margin', 'Invoice Status Description'];
      let fila = new Array();
      for (let key in this.rowData) {
        if (this.rowData.hasOwnProperty(key)) {
          let data = this.rowData[key];
          const temp = [
            data.vendorName.toString(),
            data.invoiceNo.toString(),
            this.utilityService.formatDate(data.createdDateTime).toString(),

            this.utilityService.formatCurrency(data.invoiceValuePrice).toString(),
            this.utilityService.formatCurrency(data.regularSellPrice).toString(),
            data.profitMargin.toString(),
            data.invoiceStatusDescription.toString(),
          ];
          fila.push(temp);
        }
      }
      excelData.data = fila;
      excelData.reportName = 'Abnormal Profit Margin';
      this.excelGeneratedService.generateExcel(excelData);
    }
  }
  onGridReady(params) {

  }
  gridHeader() {
    this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.abnormalProfitMarginReport);
  }
}
