import { Component, OnInit } from '@angular/core';
import { StoreService } from '@shared/services/store/store.service';
import { FormBuilder } from '@angular/forms';
import { ConstantService } from '@shared/services/constant/constant.service';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ReportGridService } from '@shared/services/report/report-grid.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridOptions } from 'ag-grid-community';
import * as moment from 'moment';
import * as jspdf from 'jspdf';
import { PDFGenrateService } from '@shared/services/pdf-genrate/pdf-genrate.service';
import * as _ from 'lodash';
import { ExcelModel } from '@models/excel-data-model';
import { ExcelGeneratedService } from '@shared/services/excelGenerate/excel-generated.service';
import { UtilityService } from '@shared/services/utility/utility.service';
import { ReportService } from '@shared/services/report/report.service';


@Component({
  selector: 'app-lottery-inventory-report',
  templateUrl: './lottery-inventory-report.component.html',
  styleUrls: ['./lottery-inventory-report.component.scss']
})
export class LotteryInventoryReportComponent implements OnInit {
  storeLocationList: any[] = [];
  isStoreLoading = true;
  gridApi: any;
  columnApi: any;
  gridOption: GridOptions;
  body: any = [];
  colWidths: any = [];
  lotteryInvReportForm = this.fb.group({
    storeLocation: '',
    lotteryInventoryReport: '',
  });
  reportRowData: any;
  userInfo = this.constantsService.getUserInfo();


  constructor(private constantsService: ConstantService, private storeService: StoreService, private fb: FormBuilder, private spinner: NgxSpinnerService,
    private toastr: ToastrService, private setupService: SetupService, private reportGridService: ReportGridService, private pdfGenrateService: PDFGenrateService,
    private excelGeneratedService: ExcelGeneratedService, private utilityService: UtilityService, private reportService: ReportService, ) {
    this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.lotteryInventoryReport);
  }

  ngOnInit() {
    this.getStoreLocationList();
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
      this.lotteryInvReportForm.get('storeLocation').setValue(this.storeLocationList);
    }
  }

  inventoryReport() {
    this.reportRowData = [];
    if (this.lotteryInvReportForm.value.lotteryInventoryReport === '') {
      this.toastr.info('Please Select Report Type');
      return;
    }

    const storeLocationIdObj = this.lotteryInvReportForm.value.storeLocation ?
      this.lotteryInvReportForm.value.storeLocation.map(x => x.storeLocationID).join(',') : '';
    const postData = {
      storeLocation: storeLocationIdObj,
    };
    this.spinner.show();
    this.setupService.postData('LotteryInventoryReport/LotteryInventoryReport', postData).subscribe((res) => {
      this.spinner.hide();
      if (res && res['statusCode']) {
        this.reportRowData = [];
        this.toastr.error(this.constantsService.infoMessages.contactAdmin, this.constantsService.infoMessages.error);
        return;
      }
      // const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
      this.gridOption = this.reportGridService.getGridOption(this.constantsService.reportTypes.lotteryInventoryReport);
      this.reportRowData = res;
    }, (error) => {
      this.spinner.hide();
      console.log(error);
      this.reportRowData = [];
    });
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  searchInventoryReport(params) {
    let res = this.reportRowData;
    let rowData = [];
    const grouped = _.groupBy(res, pet => pet.storeName);
    const data = this.lotteryInvReportForm.value.storeLocation;
    // const arrs = [];
    // data.forEach(x => {
    //   if (grouped && grouped[x.storeName]) {
    //     const salesAmount = _.sumBy(grouped[x.storeName], 'salesAmount');
    //     const totalSalesAmount = _.sumBy(grouped[x.storeName], 'totalSalesAmount');
    //     const buyingCost = _.sumBy(grouped[x.storeName], 'buyingCost');
    //     const salesQuantity = _.sumBy(grouped[x.storeName], 'salesQuantity');
    //     arrs.push({
    //       storeName: x.storeName, departmentDescription: '', salesQuantity: salesQuantity.toFixed(0),
    //       salesAmount: salesAmount.toFixed(2), totalSalesAmount: totalSalesAmount.toFixed(2),
    //       buyingCost: buyingCost.toFixed(3), prof: '', margin: '', isGroup: true
    //     });
    //     grouped[x.storeName].forEach(y => {
    //       arrs.push(y);
    //     });
    //   }
    // });
    // rowData = arrs;
    rowData = res;
    if (params === 'pdf') {
      this.colWidths = [45, 45, 80, 60, 60, 45, 50, 60];
      this.body.push([{ text: 'Game No' }, { text: 'Game Id' },
      { text: 'Game Name' }, { text: 'Confirms Pack' }, { text: 'Activated Pack' },
      { text: 'Total Pack' }, { text: 'Ticket Value' }, { text: 'Pack Value' }
      ]);
      for (const key in rowData) {
        if (rowData.hasOwnProperty(key)) {
          const data = rowData[key];
          const fila = new Array();
          if (data.isGroup) {
            fila.push({
              text: data.gameNo.toString(),
              border: [false, false, false, false], bold: true,
              color: 'white',
              fillColor: 'black',
            });
            fila.push({
              text: data.lotteryGameID.toString(),
              border: [false, false, false, false], bold: true,
              color: 'white',
              fillColor: 'black',
            });
            fila.push({
              text: data.gameName.toString(),
              border: [false, false, false, false], bold: true,
              color: 'white',
              fillColor: 'black',
            });
            fila.push({
              text: data.confirmsPack.toString(),
              border: [false, false, false, false], bold: true,
              color: 'white',
              fillColor: 'black',
            });
            fila.push({
              text: data.activatedPack.toString(),
              border: [false, false, false, false], bold: true,
              color: 'white',
              fillColor: 'black',
            });
            fila.push({
              text: data.totalPack.toString(),
              border: [false, false, false, false], bold: true,
              color: 'white',
              fillColor: 'black',
            });
            fila.push({
              text: data.ticketValue.toString(),
              border: [false, false, false, false], bold: true,
              color: 'white',
              fillColor: 'black',
            });
            fila.push({
              text: data.packValue.toString(),
              border: [false, false, false, false], bold: true,
              color: 'white',
              fillColor: 'black',
            });
            this.body.push(fila);
          } else {
            fila.push({ text: data.gameNo.toString(), border: [false, false, false, false], alignment: 'center' });
            fila.push({ text: data.lotteryGameID.toString(), border: [false, false, false, false], alignment: 'center' });
            fila.push({ text: data.gameName.toString(), border: [false, false, false, false], alignment: 'center' });
            fila.push({
              text: data.confirmsPack.toString(),
              border: [false, false, false, false], alignment: 'center'
            });
            fila.push({
              text: data.activatedPack.toString(),
              border: [false, false, false, false], alignment: 'center'
            });
            fila.push({
              text: data.totalPack.toString(),
              border: [false, false, false, false],
              alignment: 'center'
            });
            fila.push({ text: data.ticketValue.toString(), border: [false, false, false, false], alignment: 'center' });
            fila.push({ text: data.packValue.toString(), border: [false, false, false, false], alignment: 'center' });
          }
          this.body.push(fila);
        }
      }
      this.pdfGenrateService.PDFGenrate('Lottery Inventory Report', this.colWidths, this.body, '', '');
      this.body = this.colWidths = [];
    }
    if (params === 'excel') {
      const excelData = new ExcelModel();
      excelData.header = this.reportService.getColumnDef(this.constantsService.reportTypes.lotteryInventoryReport);
      let fila = new Array();
      for (let key in rowData) {
        if (rowData.hasOwnProperty(key)) {
          let data = rowData[key];
          const temp = [
            data.gameNo.toString(),
            data.lotteryGameID.toString(),
            data.gameName.toString(),
            data.confirmsPack.toString(),
            data.activatedPack.toString(),
            data.totalPack.toString(),
            data.ticketValue.toString(),
            data.packValue.toString(),
          ];
          fila.push(temp);
        }
      }
      excelData.data = fila;
      excelData.reportName = 'Lottery Inventory Report';
      this.excelGeneratedService.generateExcel(excelData);
    }
  }

  public captureScreen() {
    const doc = new jspdf('p', 'pt');

    const headerData = {
      reportName: 'Lottery Inventory Report',
    };
    doc.autoTable({
      //  html: '#my-table',
      head: this.reportService.getColumnDef(this.constantsService.reportTypes.lotteryInventoryReport),
      body: this.reportRowData,
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

}