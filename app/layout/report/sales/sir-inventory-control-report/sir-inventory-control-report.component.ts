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
  selector: 'app-sir-inventory-control-report',
  templateUrl: './sir-inventory-control-report.component.html',
  styleUrls: ['./sir-inventory-control-report.component.scss']
})
export class SirInventoryControlReportComponent implements OnInit {

  startDate = moment().format('MM-DD-YYYY');
  endDate = moment().format('MM-DD-YYYY');
  sirInventorySearchForm = this.formBuilder.group({
    storeLocation: [''],
    fuelGradeID: [''],
    startDate: this.startDate,
    endDate: this.endDate
  });
  userInfo = this.constantsService.getUserInfo();
  body: any = [];
  colWidths: any = [];
  rowData: any;
  storeLocationList: any[];
  fuelGradeList: any[];
  gridOption: any;
  selectedDateRange:any;
  constructor(private storeService: StoreService, private constantsService: ConstantService,
    private setupService: SetupService, private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService, private pdfGenrateService: PDFGenrateService,
    private toastr: ToastrService, private utilityService: UtilityService,
    private excelGeneratedService: ExcelGeneratedService, private reportGridService: ReportGridService) { }

  ngOnInit() {
    this.getStoreLocationList();
    this.getfuelGrade();
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
      this.sirInventorySearchForm.get('storeLocation').setValue(this.storeLocationList);
    }
  }
  getfuelGrade() {
    this.setupService.getData(`FuelGrade/list/${this.userInfo.companyId}`).subscribe((res) => {
      console.log(res);
      this.fuelGradeList = res;
    }, (error) => { console.log(error); });
  }

  dateChange(event, controls) {
    if (controls === 'startDate') {
      this.sirInventorySearchForm.get('startDate').setValue(event.formatedDate);
      this.startDate = event.formatedDate;
    }
    if (controls === 'endDate') {
      this.sirInventorySearchForm.get('endDate').setValue(event.formatedDate);
      this.endDate = event.formatedDate;
    }
  }

  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.sirInventorySearchForm.get('startDate').setValue(this.selectedDateRange.fDate);
    this.startDate = this.selectedDateRange.fDate;
    this.sirInventorySearchForm.get('endDate').setValue(this.selectedDateRange.tDate);
    this.endDate = this.selectedDateRange.tDate;
  }

  generatePDF() {

    const constStoreLocationIds = this.sirInventorySearchForm.value.storeLocation ?
      this.sirInventorySearchForm.value.storeLocation.map(x => x.storeLocationID).join(',') : '';
    const fuelGradeID = this.sirInventorySearchForm.value.fuelGradeID ?
      this.sirInventorySearchForm.value.fuelGradeID.map(x => x.fuelGradeID).join(',') : '';
    const postData = {
      ...this.sirInventorySearchForm.value,
      storeLocation: constStoreLocationIds,
      fuelGradeID: fuelGradeID,
    };
    this.spinner.show();
    this.setupService.postData('Common/InventoryControlReportsBySIRs', postData).subscribe((res) => {
      this.spinner.hide();
      if (res && res['statusCode']) {
        this.rowData = [];
        this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
        return;
      } else {
        this.rowData = res;
      }
      if (this.rowData === null || this.rowData.length === 0) {
      //  this.toastr.info('Data not found', 'warning');
        return;
      }
      this.gridHeader();
    }, (error) => {
      this.spinner.hide();
      console.log(error);
      this.rowData = [];
    });
  }
  searchSirInvContReport(params) {
    if (params === 'pdf') {
      this.colWidths = ['*', '*', '*', '*', '*', '*'];
      this.body.push([{ text: 'Fuel Grade Name' }, { text: 'Business Date' }, { text: 'Fuel Grade Sales Volume' },
      { text: 'Quantity Received' }, { text: 'Physical Inventory' }, { text: 'Prev Inventory' },
      ]);

      for (const key in this.rowData) {
        if (this.rowData.hasOwnProperty(key)) {
          const data = this.rowData[key];
          const fila = new Array();
          fila.push({ text: data.fuelGradeName.toString(), border: [false, false, false, false] });
          fila.push({ text: this.utilityService.formatDate(data.bdate).toString(), border: [false, false, false, false] });
          if (data.fuelGradeSalesVolume) {
            fila.push({ text: data.fuelGradeSalesVolume, border: [false, false, false, false] });
          } else {
            fila.push({ text: "", border: [false, false, false, false] });
          }
          fila.push({ text: data.quantityReceived, border: [false, false, false, false] });
          fila.push({ text: data.physicalInventory.toString(), border: [false, false, false, false] });
          if (data.previnv) {
            fila.push({ text: data.previnv.toString(), border: [false, false, false, false] });
          } else {
            fila.push({ text: "", border: [false, false, false, false] });
          }
          this.body.push(fila);
        }
      }
      this.pdfGenrateService.PDFGenrate('SIR Inventory Control Report', this.colWidths,
        this.body, this.sirInventorySearchForm.value.startDate, this.sirInventorySearchForm.value.endDate);
      this.body = this.colWidths = [];
    }
    if (params === 'excel') {
      const excelData = new ExcelModel();
      excelData.header = ['Fuel Grade Name', 'Business Date', 'Fuel Grade Sales Volume',
        'Quantity Received', 'Physical Inventory', 'Prev Inventory'];
      let fila = new Array();
      for (let key in this.rowData) {
        if (this.rowData.hasOwnProperty(key)) {
          let data = this.rowData[key];
          let fuelGradeVolume = "";
          let preInvDetail = "";
          let qtyReceived = "";
          if (data.fuelGradeSalesVolume) {
            fuelGradeVolume = data.fuelGradeSalesVolume.toString();
          }
          if (data.previnv) {
            preInvDetail = data.previnv.toString();
          }
          if (data.quantityReceived) {
            qtyReceived = data.quantityReceived.toString();
          }
          const temp = [
            data.fuelGradeName.toString(),
            this.utilityService.formatDate(data.bdate).toString(),
            fuelGradeVolume,
            qtyReceived,
            data.physicalInventory.toString(),
            preInvDetail,
          ];
          fila.push(temp);
        }
      }
      excelData.data = fila;
      excelData.reportName = 'SIR Inventory Control Report';
      this.excelGeneratedService.generateExcel(excelData);
    }
  }

  gridHeader() {
    this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.sirInventoryControlReport);
  }
  onGridReady(params) { }
}
