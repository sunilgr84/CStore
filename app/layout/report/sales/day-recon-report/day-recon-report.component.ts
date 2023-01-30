import { Component, OnInit } from '@angular/core';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment';
import { GridService } from '@shared/services/grid/grid.service';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { UtilityService } from '@shared/services/utility/utility.service';
import { ExcelGeneratedService } from '@shared/services/excelGenerate/excel-generated.service';
import { PDFGenrateService } from '@shared/services/pdf-genrate/pdf-genrate.service';
import { ExcelModel } from '@models/excel-data-model';
import { StoreService } from '@shared/services/store/store.service';

@Component({
  selector: 'app-day-recon-report',
  templateUrl: './day-recon-report.component.html',
  styleUrls: ['./day-recon-report.component.scss']
})
export class DayReconReportComponent implements OnInit {

  shiftList = [
    { name: 'Day Close', value: 0 },
    { name: 'Shift 1', value: 1 },
    { name: 'Shift 2', value: 2 },
    { name: 'Shift 3', value: 3 },
  ];
  storeLocationList: any = [];
  shiftWiseValue = 0;
  storeLocationId: any;
  currentDate = '';
  endDate = '';
  dayReconReport = '';
  userInfo = this.constantService.getUserInfo();
  movementHeaderList: any;
  repCashCheckAmounRowData: any;
  repDepartmentTypeSalesRowData: any;
  repGasGradeDatasRowData: any;
  repMOPDetailsRowData: any;
  isResponse = true;
  repCashCheckAmoungridOptions: any;
  repDepartmentTypeSalesgridOptions: any;
  repGasGradeDatasgridOptions: any;
  repMOPDetailsgridOptions: any;
  zReportGridOptions: any;
  gridApiMop: any;
  gridApiSales: any;
  gridApiCashCheck: any;
  gridApiGas: any;
  body: any = [];
  colWidths: any = [];
  rowData: any[];
  zReportData: any[] = [];
  zReportHeaders: any[];
  zReportBody: any[];
  selectedDateRange: any;
  isMultiDay = true;
  showZReport = false;
  iframe = document.createElement('iframe');
  placement = "bottom-right";
  constructor(private setupService: SetupService, private constantService: ConstantService,
    private storeService: StoreService, private spinner: NgxSpinnerService, private utilityService: UtilityService,
    private gridService: GridService, private toastr: ToastrService, private pdfGenrateService: PDFGenrateService,
    private excelGeneratedService: ExcelGeneratedService) {
    this.repCashCheckAmoungridOptions = this.gridService.getGridOption(this.constantService.gridTypes.repCashCheckAmounGrid);
    this.repDepartmentTypeSalesgridOptions = this.gridService.getGridOption(this.constantService.gridTypes.repDepartmentTypeSalesGrid);
    this.repGasGradeDatasgridOptions = this.gridService.getGridOption(this.constantService.gridTypes.repGasGradeDatasGrid);
    this.repMOPDetailsgridOptions = this.gridService.getGridOption(this.constantService.gridTypes.repMOPDetailsGrid);
    this.zReportGridOptions = this.gridService.getGridOption(this.constantService.gridTypes.zReportGrid);
    this.endDate = this.currentDate = moment(new Date()).format('MM-DD-YYYY');
  }

  ngOnInit() {
    this.getStoreLocationDetails();
  }
  onGridReadyMOP(params) {
    this.gridApiMop = params.api;
    params.api.sizeColumnsToFit();
  }
  onGridReadySales(params) {
    this.gridApiSales = params.api;
    params.api.sizeColumnsToFit();
  }
  onGridReadyGas(params) {
    this.gridApiGas = params.api;
    params.api.sizeColumnsToFit();
  }
  onGridReadyCashCheck(params) {
    this.gridApiCashCheck = params.api;
    params.api.sizeColumnsToFit();
  }

  onZGridReady(params) {
    params.api.sizeColumnsToFit();
  }
  getStoreLocationDetails() {

    if (this.storeService.storeLocation) {
      this.storeLocationList = this.storeService.storeLocation;
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.storeLocationList = this.storeService.storeLocation;
      }, (error) => {
        console.log(error);
      });
    }
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      this.storeLocationId = this.storeLocationList[0].storeLocationID;
    }
  }

  getDayReconRepot(params) {
    if (this.dayReconReport === '' || this.dayReconReport == null) {
      this.toastr.info('Please Select Report Type');
      return;
    }
    if (this.dayReconReport === 'dayRecon') {
      this.spinner.show();
      // tslint:disable-next-line:max-line-length
      this.setupService.getData(`DayReconReport/GetMopDetailsByDateRange?startDate=${this.currentDate}&endDate=${this.endDate}&storeLocationID=${this.storeLocationId}&shiftWiseValue=${this.shiftWiseValue}`)
        .subscribe((response) => {
          this.isResponse = false;
          this.isMultiDay = true;
          this.spinner.hide();
          if (response && response['statusCode']) {
            this.repCashCheckAmounRowData = [];
            this.repDepartmentTypeSalesRowData = [];
            this.repGasGradeDatasRowData = [];
            this.repMOPDetailsRowData = [];
            return;
          }
          if (response && response.repCashCheckAmountList.length > 0) {
            this.repCashCheckAmounRowData = response.repCashCheckAmountList;
          } else { this.repCashCheckAmounRowData = []; }

          if (response && response.repDepartmentTypeSalesList.length > 0) {
            const totalAmountSales = _.sumBy(response.repDepartmentTypeSalesList, 'totalAmount');
            this.repDepartmentTypeSalesRowData = [...response.repDepartmentTypeSalesList, {
              departmentTypeName: 'Total',
              totalAmount: totalAmountSales.toFixed(2)
            }];
          } else { this.repDepartmentTypeSalesRowData = []; }

          if (response && response.repGasGradeDatasList.length > 0) {
            const _fuelGradeSalesVolume = _.sumBy(response.repGasGradeDatasList, 'fuelGradeSalesVolume');
            const _fuelGradeSalesAmount = _.sumBy(response.repGasGradeDatasList, 'fuelGradeSalesAmount');
            this.repGasGradeDatasRowData = [...response.repGasGradeDatasList, {
              gasGradeName: 'Total',
              fuelGradeSalesVolume: _fuelGradeSalesVolume.toFixed(3), fuelGradeSalesAmount: _fuelGradeSalesAmount.toFixed(2)
            }];
          } else { this.repGasGradeDatasRowData = []; }

          if (response && response.repMOPDetailsList.length > 0) {
            const _mopAmount = _.sumBy(response.repMOPDetailsList, 'mopAmount');
            this.repMOPDetailsRowData = [...response.repMOPDetailsList, {
              mopName: 'Total',
              mopAmount: _mopAmount.toFixed(2)
            }];
          } else { this.repMOPDetailsRowData = []; }
          this.gridApiMop.sizeColumnsToFit();
          this.gridApiSales.sizeColumnsToFit();
          this.gridApiCashCheck.sizeColumnsToFit();
          this.gridApiGas.sizeColumnsToFit();
        }, (err) => {
          this.spinner.hide();
          console.log(err);
          this.isResponse = true;
          this.isMultiDay = true;
        });
    } else if (this.dayReconReport === 'multiDayRecon') {
      const postData = {
        storeLocationID: this.storeLocationId,
        shiftWiseValue: this.shiftWiseValue,
        startDate: this.currentDate,
        endDate: this.endDate
      };
      this.isResponse = true;
      //  this.isMultiDay = false;
      this.spinner.show();
      this.setupService.postData('Common/MultiDayReconReports', postData)
        .subscribe((res) => {
          this.spinner.hide();
          if (res && res['statusCode']) {
            this.rowData = [];
            this.toastr.error(this.constantService.infoMessages.contactAdmin, this.constantService.infoMessages.error);
            return;
          }
          const arr = _.sortBy(res, [function (o) { return o.storeName.toLowerCase(); }]);
          this.rowData = arr;
          if (this.rowData === null || this.rowData.length === 0) {
            this.toastr.info('Data not found', 'warning');
            return;
          }
          const storeObj = _.find(this.storeLocationList, ['storeLocationID', this.storeLocationId]);
          const data = [];
          this.rowData.forEach(x => {
            const arrss = [moment(new Date(x.businessDate)).format('MM-DD-YYYY'), x.columnName, x.amount, x.storeName,
              , 'Store Name'];
            data.push(arrss);
          });
          if (params === 'pdf') {
            const finalArr = this.getPivotArray(data, 0, 1, 2, params);
            console.log(finalArr);
            const pdfDocGenerator = this.pdfGenrateService.PDFMultiDayReconGenrate('Multi Day Recon Reports',
              this.colWidths, finalArr, this.currentDate, this.endDate, true, storeObj.storeName, storeObj.storeAddressLine1);
            this.isMultiDay = false;

            pdfDocGenerator.getDataUrl((dataUrl) => {
              const targetElement = document.querySelector('#iframeContainer');
              this.iframe.src = dataUrl;
              this.iframe.height = '700vh';
              this.iframe.width = '100%';
              targetElement.className = 'iframe';
              targetElement.appendChild(this.iframe);
            });
            this.body = this.rowData = this.colWidths = [];
          }
          if (params === 'excel') {
            const excelData = new ExcelModel();
            const finalArr = this.getPivotArray(data, 0, 1, 2);
            if (finalArr.length > 0) {
              excelData.data = finalArr.filter(function (value, index) {
                return index > 0;
              });
              excelData.header = finalArr[0];
              excelData.reportName = 'Multi Day Recon Reports';
              this.excelGeneratedService.generateExcelMultiDayRecon(excelData, this.currentDate, this.endDate);
            }
          }
        }, (error) => {
          this.spinner.hide();
          console.log(error);
        });
    } else if (this.dayReconReport === 'zDayRecon') {
      const postData = {
        storeLocationID: this.storeLocationId,
        shiftWiseValue: this.shiftWiseValue,
        startDate: this.currentDate,
        endDate: this.endDate
      };
      this.showZReport = true;
      this.spinner.show();
      this.setupService.postData('Common/MultiDayReconReportsTaxDetail', postData)
        .subscribe((res: any) => {
          this.spinner.hide();
          this.zReportData = [];
          this.zReportHeaders = [];
          this.zReportBody = [];
          if (res && res.length > 0) {
            let groupedByDate: any = _.groupBy(res, report => report.businessDate);
            const groupedByDateKeys = Object.keys(groupedByDate)
            groupedByDateKeys.forEach(res => {
              let response: any = {};
              response.date = moment(res).format('MM-DD-YYYY');
              let zReportRowHeaders = [];
              let zReportRows = [];
              let zReportRowsData = [];
              groupedByDate[res].forEach(res => {
                zReportRowHeaders.push(res.columnName);
                if (res.columnName.toLowerCase() === 'Gas Volume'.toLowerCase() || res.columnName.toLowerCase() === 'Customer Count'.toLowerCase()) {
                  zReportRows.push(res.coloumnAmount);
                  zReportRowsData.push(res.coloumnAmount);
                } else {
                  let amount = Number(res.coloumnAmount).toFixed(2);
                  zReportRows.push('$' + amount);
                  zReportRowsData.push(Number(res.coloumnAmount));
                }
              });
              response.zReportRowHeaders = zReportRowHeaders;
              response.zReportRows = zReportRows;
              response.zReportRowsData = zReportRowsData;
              this.zReportData.push(response);
            });
            this.zReportData = _.sortBy(this.zReportData, function (o) { return o.date; });
            const headers: any = new Set()
            headers.add('Business Date');
            this.zReportData.forEach(res => {
              res.zReportRowHeaders.forEach(res => {
                headers.add(res);
              });
            });
            this.zReportHeaders = Array.from(headers);
            this.zReportData.forEach(res => {
              let rows = [];
              headers.forEach(element => {
                if (element === 'Business Date') {
                  rows.push(res.date);
                } else {
                  let index = res.zReportRowHeaders.indexOf(element);
                  if (index === -1)
                    rows.push('');
                  else
                    rows.push(res.zReportRows[index]);
                }
              });
              this.zReportBody.push(rows);
            });
          }
        }, (error) => {
          this.spinner.hide();
          console.log(error);
        });
    }
  }

  ondateChange(event, controls) {
    if (controls === 'startDate' && event) {
      this.currentDate = event.formatedDate;
    }
    if (controls === 'endDate' && event) {
      this.endDate = event.formatedDate;
    }
  }
  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.currentDate = this.selectedDateRange.fDate;
    this.endDate = this.selectedDateRange.tDate;
  }
  headRows() {
    return [
      'Business Date', 'Store Name', 'Column Name',
      'Coloumn Amount', 'Amount'
    ];
  }

  zReportExport(exportType: any) {
    let totals: any = [];
    let totalsHeaders: any = [];
    this.body = [];
    const headers: any = new Set();
    headers.add('Business Date');
    this.zReportData.forEach(res => {
      res.zReportRowHeaders.forEach(res => {
        headers.add(res);
      });
    });
    let pdfHeaders: any = [];
    headers.forEach(value => {
      pdfHeaders.push({ text: value });
      this.colWidths.push(45);
      totalsHeaders.push(value);
      totals.push(0);
    });
    if (exportType === 'pdf') {
      this.body.push(pdfHeaders);
      this.zReportData.forEach(res => {
        let rows = [];
        headers.forEach(element => {
          if (element === 'Business Date') {
            rows.push(res.date);
          } else {
            let index = res.zReportRowHeaders.indexOf(element);
            if (index === -1)
              rows.push({ text: '' });
            else {
              rows.push({ text: res.zReportRows[index] });
              let headerIndex = totalsHeaders.indexOf(element);
              totals[headerIndex] = totals[headerIndex] + Number(res.zReportRowsData[index]);
            }
          }
        });
        this.body.push(rows);
      });
      let totalsPdf = [];
      totals.forEach((element, index) => {
        if (element === 0)
          totalsPdf.push({ text: 'Totals', fillColor: '#000000', color: '#FFFFFF' });
        else if (totalsHeaders[index].toLowerCase() === 'Gas Volume'.toLowerCase())
          totalsPdf.push({ text: element.toFixed(2), fillColor: '#000000', color: '#FFFFFF' });
        else if (totalsHeaders[index].toLowerCase() === 'Customer Count'.toLowerCase())
          totalsPdf.push({ text: element, fillColor: '#000000', color: '#FFFFFF' });
        else
          totalsPdf.push({ text: "$" + element.toFixed(2), fillColor: '#000000', color: '#FFFFFF' });
      });
      this.body.push(totalsPdf);
      this.pdfGenrateService.PDFGenrate('Z Reports', this.colWidths,
        this.body, this.currentDate, this.endDate, 'landscape', 'A2');
      this.body = this.colWidths = [];
    } else if (exportType === 'excel') {
      const excelData = new ExcelModel();
      this.zReportData.forEach(res => {
        let rows = [];
        headers.forEach(element => {
          if (element === 'Business Date') {
            rows.push(res.date);
          } else {
            let index = res.zReportRowHeaders.indexOf(element);
            if (index === -1)
              rows.push('');
            else {
              rows.push(res.zReportRowsData[index]);
              let headerIndex = totalsHeaders.indexOf(element);
              totals[headerIndex] = totals[headerIndex] + Number(res.zReportRowsData[index]);
            }
          }
        });
        this.body.push(rows);
      });
      let totalsExcel = [];
      totals.forEach((element, index) => {
        if (element === 0)
          totalsExcel.push('Totals');
        else if (totalsHeaders[index].toLowerCase() === 'Gas Volume'.toLowerCase())
          totalsExcel.push(element.toFixed(2));
        else if (totalsHeaders[index].toLowerCase() === 'Customer Count'.toLowerCase())
          totalsExcel.push(element);
        else
          totalsExcel.push("$" + element.toFixed(2));
      });
      excelData.totalsRow = totalsExcel;
      excelData.data = this.body
      excelData.header = Array.from(headers);
      excelData.reportName = 'Z Reports';
      excelData.startDate = this.currentDate;
      excelData.endDate = this.endDate;
      this.excelGeneratedService.generateExcel(excelData);
    }
  }

  getPivotArray(dataArray, rowIndex, colIndex, dataIndex, params?) {
    // Code from https://techbrij.com
    let result = {}, ret = [];
    let newCols = [];
    newCols.push('Store Name');
    for (let i = 0; i < dataArray.length; i++) {

      if (!result[dataArray[i][rowIndex]]) {
        result[dataArray[i][rowIndex]] = {};
      }
      // tslint:disable-next-line:no-unused-expression
      result[dataArray[i][rowIndex]]['Store Name'] = dataArray[i][3];
      result[dataArray[i][rowIndex]][dataArray[i][colIndex]] = dataArray[i][dataIndex];

      // To get column names
      if (newCols.indexOf(dataArray[i][colIndex]) === -1) {
        newCols.push(dataArray[i][colIndex]);
      }
    }
    // newCols.sort();
    let item = [];

    // Add Header Row
    item.push('Business Date');
    item.push.apply(item, newCols);
    ret.push(item);
    // tslint:disable-next-line:forin
    for (let key in result) {
      item = [];
      item.push(key);
      for (let i = 0; i < newCols.length; i++) {
        item.push(result[key][newCols[i]] || '-');
      }
      ret.push(item);
    }

    let totals: any = [null, null];
    let excelTotals: any = ['Totals', null];
    for (let l = 2; l < ret[0].length; l++) {
      totals.push(0);
      excelTotals.push(0);
    }
    for (let i = 1; i < ret.length; i++) {
      for (let j = 2; j <= ret.length; j++) {
        if (ret[i][j]) {
          totals[j] += ret[i][j] == '-' ? null : ret[i][j];
          excelTotals[j] += ret[i][j] == '-' ? null : ret[i][j];
        }
      }
    }
    totals[0] = {
      text: 'Totals',
      border: [false, false, false, false], bold: true,
      color: 'white',
      fillColor: 'black',
    };
    totals[1] = {
      text: '',
      border: [false, false, false, false], bold: true,
      color: 'white',
      fillColor: 'black',
    }
    for (let k = 2; k < totals.length; k++) {
      totals[k] = {
        text: totals[k].toFixed(2).toString(),
        border: [false, false, false, false], bold: true,
        color: 'white',
        fillColor: 'black'
      };
      excelTotals[k] = excelTotals[k].toFixed(2).toString();
    }
    if (params == 'pdf')
      ret.splice(1, 0, totals)
    else ret.splice(1, 0, excelTotals)
    return ret;
  }

  selectRadio(p) {
    this.rowData = null;
    this.isResponse = true;
    this.isMultiDay = true;
    this.showZReport = false;
  }
}
