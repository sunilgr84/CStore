import { Component, OnInit } from '@angular/core';
import { StoreService } from '@shared/services/store/store.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { FormBuilder, Validators } from '@angular/forms';
import { PDFGenrateService } from '@shared/services/pdf-genrate/pdf-genrate.service';
import { UtilityService } from '@shared/services/utility/utility.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { SetupService } from '@shared/services/setupService/setup-service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { ExcelModel } from '@models/excel-data-model';
import { ExcelGeneratedService } from '@shared/services/excelGenerate/excel-generated.service';
import { ReportGridService } from '@shared/services/report/report-grid.service';
@Component({
  selector: 'app-taxable-items-report',
  templateUrl: './taxable-items-report.component.html',
  styleUrls: ['./taxable-items-report.component.scss']
})
export class TaxableItemsReportComponent implements OnInit {

  date = moment().format('MM-DD-YYYY');
  taxableItemReportForm = this.formBuilder.group({
    storeLocation: ['', Validators.required],
    taxStrategyDescription: [0, Validators.required],
    date: this.date,
  });
  userInfo = this.constantsService.getUserInfo();
  body: any = [];
  colWidths: any = [];
  rowData: any;
  storeLocationList: any[];
  groupbyList = [{ id: 0, name: 'Taxable Items' }, { id: 1, name: 'Non Taxable Items' }];
  gridOption: any;

  constructor(private storeService: StoreService, private constantsService: ConstantService,
    private setupService: SetupService, private formBuilder: FormBuilder, private reportGridService: ReportGridService,
    private spinner: NgxSpinnerService, private pdfGenrateService: PDFGenrateService,
    private toastr: ToastrService, private utilityService: UtilityService, private excelGeneratedService: ExcelGeneratedService) { }

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
      this.taxableItemReportForm.get('storeLocation').setValue(this.storeLocationList);
    }
  }
  dateChange(event, controls) {
    if (controls === 'date') {
      this.taxableItemReportForm.get('date').setValue(event.formatedDate);
      this.date = event.formatedDate;
    }

  }
  generatePDF() {

    const constStoreLocationIds = this.taxableItemReportForm.value.storeLocation ?
      this.taxableItemReportForm.value.storeLocation.map(x => x.storeLocationID).join(',') : '';

    const postData = {
      ...this.taxableItemReportForm.value,
      storeLocation: constStoreLocationIds,
    };
    this.spinner.show();
    this.setupService.postData('Common/TaxableItemReports', postData).subscribe((res) => {
      this.spinner.hide();
      if (res && res['statusCode']) {
        this.rowData = [];
        this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
        return;
      } else {
        const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
        this.rowData = arr;
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
  searchTaxableItemReport(params) {
    let res = this.rowData;
    let rowData = [];

    const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
    const grouped = _.groupBy(arr, pet => pet.storeName);
    const data = this.taxableItemReportForm.value.storeLocation;
    const arrs = [];
    data.forEach(x => {
      if (grouped && grouped[x.storeName]) {
        arrs.push({
          storeName: x.storeName, posCode: '', description: '', taxStrategyDescription: '',
          businessDate: '', departmentName: '', isGroup: true
        });
        grouped[x.storeName].forEach(y => {
          arrs.push(y);
        });
      }
    });
    rowData = arrs;

    if (params === 'pdf') {
      this.colWidths = [70, 70, 90, 70, 90, 70];
      this.body.push([{ text: 'Store Name' }, { text: 'Business Date' }, { text: 'Department Name' },
      { text: 'UPC Code' }, { text: 'Description' }, { text: 'Tax Strategy Description' },
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
            fila.push({
              text: '', border: [false, false, false, false], bold: true, color: 'white', fillColor: 'black',
            });

            this.body.push(fila);
          } else {
            fila.push({ text: data.storeName.toString(), border: [false, false, false, false] });
            fila.push({ text: this.utilityService.formatDate(data.businessDate).toString(), border: [false, false, false, false] });

            fila.push({ text: data.departmentName.toString(), border: [false, false, false, false] });
            fila.push({ text: data.posCode, border: [false, false, false, false] });
            fila.push({ text: data.description.toString(), border: [false, false, false, false] });
            fila.push({ text: data.taxStrategyDescription.toString(), border: [false, false, false, false] });
          }
          this.body.push(fila);
        }
      }
      this.pdfGenrateService.PDFGenrate('Taxable Items Report', this.colWidths,
        this.body, this.taxableItemReportForm.value.date, this.taxableItemReportForm.value.endDate);
      this.body = this.colWidths = [];
    }
    if (params === 'excel') {
      const excelData = new ExcelModel();
      excelData.header = ['Store Name', 'Business Date', 'Department Name',
        'UPC Code', 'Description', 'Tax Strategy Description'];
      let fila = new Array();
      for (let key in this.rowData) {
        if (this.rowData.hasOwnProperty(key)) {
          let data = this.rowData[key];
          const temp = [
            data.storeName.toString(),
            this.utilityService.formatDate(data.businessDate).toString(),
            data.departmentName.toString(),
            data.posCode.toString(),
            data.description.toString(),
            data.taxStrategyDescription.toString(),

          ];
          fila.push(temp);
        }
      }
      excelData.data = fila;
      excelData.reportName = 'Taxable Items Report';
      this.excelGeneratedService.generateExcel(excelData);
    }
  }

  gridHeader() {
    this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.taxableItemsReport);
  }
  onGridReady(params) { }
}
