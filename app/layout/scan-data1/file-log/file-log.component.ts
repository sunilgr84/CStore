import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { ScanDataService } from '@shared/services/scanDataService/scan-data.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DownloadConfirmModalComponent } from '../download-confirm-modal/download-confirm-modal.component';
import { saveAs } from 'file-saver';
import { FormArray, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
// import * as moment from 'moment';
import { DateAdapter } from 'angular-calendar';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatDatepicker } from '@angular/material';
import * as _moment from 'moment';
import {defaultFormat as _rollupMoment, Moment} from 'moment';
import { HttpResponse } from '@angular/common/http';
import { StoreService } from '@shared/services/store/store.service';

const moment = _rollupMoment || _moment;


@Component({
  selector: 'app-file-log',
  templateUrl: './file-log.component.html',
  styleUrls: ['./file-log.component.scss'],
})
export class FileLogComponent implements OnInit {

  fileLogs: any[] = [];
  scanDataCount;
  scanData = [];
  rowForm = new FormArray([]);
  rowFormCopy = new FormArray([]);
  editRowForm = new FormArray([]);
  rowDataCopy: any[] = [];
  rowData: any[] = [];
  page = 1;
  previosPage = 1;
  pageSize = 10;
  logPage = 1;
  logPreviosPage = 1;
  logPageSize = 10;
  dataStatus = '';
  manufacturerId;
  companyId;
  storeId;
  storeLocationId;
  storeLocationList: any = [];
  dataForm: FormGroup;
  view: boolean;
  viewData: any[] = [];
  weekEndDate;
  sideContainer = 'side-container-close';
  startDate = _moment().format('YYYY-MM-DD');
  endDate = _moment().format('YYYY-MM-DD');
  month = new FormControl(_moment());
  toDate;
  fromDate;
  logsuccessCount = 0;
  logfailedCount = 0;
  totalLogCount = 0;
  filter = '';
  userInfo;
  manufactureresByCompany: any;
  selectedDateRange: any;
  mainManuFactId;
  logMessage = "Please select manufacturer.";
  filterIsValid = "";
  journalId = "";
  upcCode = "";
  transactionId = "";
  isJournal = false;
  isUpc = false;
  isTransaction = false;
  errorList: any = {};
  constructor(
    private spinner: NgxSpinnerService,
    private _setupService: SetupService,
    private constantService: ConstantService,
    private scandataService: ScanDataService,
    private toaster: ToastrService,
    private _modalService: NgbModal,
    private fb: FormBuilder,
    private storeService: StoreService) { }

  ngOnInit() {
    this.userInfo = this.constantService.getUserInfo();
    this.getManufacturerByCompanyId(this.userInfo.companyId);
    // this.getFileLog();
    this.createForm();
    // this.getFileLogCount();
    this.storeLocationId = this.constantService.getStoreLocationId();
    this.getStoreLocation();
  }

  createForm() {
    this.dataForm = this.fb.group({
      id: [],
      AccountDiscAmt: [],
      AccountDiscDescription: [],
      AccountNo: [],
      Category: [],
      ConsumerUnits: [],
      CouponAmt: [],
      CouponId: [],
      Description: [],
      DiscountSign: [],
      LoyaltyNumber: [],
      ManufacturerMultipackDiscAmt: [],
      ManufacturerMultipackIndicator: [],
      ManufacturerMultipackQty: [],
      ManufacturerName: [],
      MfgBuyDownAmt: [],
      MfgBuyDownDescription: [],
      MfgDiscAmt: [],
      MfgDiscAmt2: [],
      MfgDiscAmt3: [],
      MfgDiscDescription: [],
      MfgDiscDescription2: [],
      MfgDiscDescription3: [],
      MultipackDiscAmt: [],
      MultipackIndicator: [],
      MultipackReqQty: [],
      ProductGroupingCode: [],
      ProductGroupingName: [],
      RegisterId: [],
      SalesQty: [],
      ScanTransactionId: [],
      Sku: [],
      StoreAddress: [],
      StoreAddress2: [],
      StoreCity: [],
      StoreContactEmail: [],
      StoreContactName: [],
      StoreId: [],
      StoreName: [],
      StoreState: [],
      StoreTelphone: [],
      StoreZip: [],
      TotalSaleAmt: [],
      TransactionDate: [],
      TransactionId: [],
      TransactionTime: [],
      Uom: [],
      Upc: [],
      WeekEndDate: [],
      isValid: [],
      status: [],
    });
  }

  openSideContainer(row, view) {
    if (row && !view) {
      for (const key in row) {
        if ( key.includes('_err') ) {
          delete row[key];
        }
      }
      this.dataForm.setValue(row);
    } else if (view) {
      this.viewData = [];
      for (let element in row) {
        let data = {key: element, value: row[element]}
        this.viewData.push(data);
      }
      console.log(this.viewData);
      this.view = true;
    }
    document.getElementById("overlay").style.display = "block";
    // document.getElementById("upper-side-container").style.display = "flex";
    document.getElementById("upper-side-container").style.width = "50.9%";
    document.getElementById("upper-side-container").style.transition = "width 0.5s";
    document.getElementById("upper-side-container").style.visibility = "visible";
    this.sideContainer = 'side-container-open';
  }
  closeSideContainer() {
    this.dataForm.reset();
    this.view = false;
    // document.getElementById("upper-side-container").style.display = "none";
    document.getElementById("upper-side-container").style.width = "0";
    document.getElementById("upper-side-container").style.visibility = "collapse";
    document.getElementById("overlay").style.display = "none";
    this.sideContainer = 'side-container-close';
  }

  ondataFormSubmit(mainSub) {
    if (this.dataForm.invalid) {
      return;
    }
    let data: any;
    data = this.findEditDataForSingleRow(this.dataForm.value);
    this.updateData(data, mainSub);
  }

  findEditDataForSingleRow(data) {
    let retData: any[] = [];
    this.scanData.forEach(element => {
      if (element.id === data.id) {
        delete data.id;
          delete data.isValid;
          delete data.status;
          let strData = JSON.stringify(data);
          retData.push(
            {
              id: element.id,
              manufactureId: element.manufactureId,
              companyId: element.companyId,
              storeLocationId: element.storeLocationId,
              transactionDate: element.transactionDate,
              data: strData,
              isValid: element.isValid,
              status: element.status
            }
          );
      }
    });
    return retData;
  }



  getFileLog() {
    let body = {
      // date: this.month.value.format('YYYY-MM-DD'),
      manufacturerId: this.manufacturerId,
      fromDate: this.startDate,
      toDate: this.endDate,
      page: this.logPage,
      pageSize: this.logPageSize,
      filter: this.filter
    }
    this.spinner.show();
    this.scandataService.getFileLog(body).subscribe(res => {
      this.spinner.hide();
      if(res.status) {
        if(res.result) {
          this.fileLogs = res.result.fileLogData;
          this.totalLogCount = res.result.totalCount;
        } else {
          this.fileLogs = [];
          this.totalLogCount = 0;
          this.logMessage = "No log found.";
        }
      } else {
        this.fileLogs = [];
        this.totalLogCount = 0;
        this.logMessage = "No log found.";
      }
    });
  }

  getFileLogCount() {
    // this.spinner.show();
    this.scandataService.getFileLogCount().subscribe(res => {
      // this.spinner.hide();
      if(res.status) {
        this.logsuccessCount = res.result.successCount;
        this.logfailedCount = res.result.failedCount;
      }
    });
  }

  onMonthChange(e) {
    // this.month = e;
    this.getFileLog();
  }

  onDownload(logId) {
    this.downloadFileFromLog(logId);
  }

  downloadFileFromLog(logId) {
    this.spinner.show();
    this.scandataService.downloadFileFromLog(logId).subscribe(res => {
      this.spinner.hide();
      const blob = new Blob([res], {type : 'text'});
      saveAs(blob, `${new Date().toISOString().trim().replace(/[^a-zA-Z0-9]/g, '')}.txt`);
    });
  }

  onShowErrors(errors) {
    let error = JSON.parse(errors);
    let res = {
      body: "",
      result: error
    };
    this.openDownloadConfirmModal(res);
  }

  onScanDataShowErrors() {
    let res = {
      body: "",
      result: this.errorList
    };
    this.openDownloadConfirmModal(res);
  }

  openDownloadConfirmModal(res) {
    let modalRef = this._modalService.open(DownloadConfirmModalComponent);
    modalRef.componentInstance.title = 'Errors.';
    modalRef.componentInstance.body = res.body;
    modalRef.componentInstance.message = res.message;
    modalRef.componentInstance.errors = res.result;
    modalRef.result.then(res => {
        if(res.status) {
          // this.downloadFileFromLog(res.id);
        }
      }).catch(err => {
    });
  }

  onEdit(row) {
    this.mainManuFactId = row.manufacturerId;
    this.companyId = row.companyId;
    this.storeId = row.storeId;
    this.weekEndDate = row.weekendDate;
    this.toDate = new Date(row.weekendDate);
    this.fromDate = new Date(row.weekendDate);
    this.fromDate.setDate(this.fromDate.getDate() - 6);
    this.journalId = row.journalId;
    this.errorList = JSON.parse(row.error);
    this.getScanDataByJournal();
    // this.getScanDataByDate();
  }

  getScanDataByJournal() {
    let body = {
      journalId: this.journalId,
      page: this.page,
      pageSize: this.pageSize,
      filter: this.filterIsValid
    };
    this.spinner.show();
    this.scandataService.getScanDataByJournal(body).subscribe( res => {
      this.spinner.hide();
      this.scanData = res.result.scannedData;
      this.scanDataCount = res.result.totalCount;
      if(res.status) {
        this.isJournal = true;
        this.isUpc = false;
        this.isTransaction = false;
        this.assignRowFormArray(res);
      }
    });
  }

  getScanDataByTransaction() {
    let body = {
      transactionId: this.transactionId,
      upcCode: this.upcCode,
      journalId: this.journalId,
      page: this.page,
      pageSize: this.pageSize
    };
    this.spinner.show();
    this.scandataService.getScanDataByTransaction(body).subscribe( res => {
      this.spinner.hide();
      if(res.status) {
        this.scanData = res.result.scannedData;
        this.scanDataCount = res.result.totalCount;
        this.isJournal = false;
        this.isUpc = false;
        this.isTransaction = true;
        this.assignRowFormArray(res);
      } else {
        this.toaster.error(res.message);
      }
    });
  }

  getScanDataByUPC() {
    let body = {
      transactionId: this.transactionId,
      upcCode: this.upcCode,
      journalId: this.journalId,
      page: this.page,
      pageSize: this.pageSize
    };
    this.spinner.show();
    this.scandataService.getScanDataByUPC(body).subscribe( res => {
      this.spinner.hide();
      if(res.status) {
        this.scanData = res.result.scannedData;
        this.scanDataCount = res.result.totalCount;
        this.isJournal = false;
        this.isUpc = true;
        this.isTransaction = false;
        this.assignRowFormArray(res);
      } else {
        this.toaster.error(res.message);
      }
    });
  }

  assignRowFormArray(res) {
    this.rowData = [];
    this.rowForm = new FormArray([]);
    this.rowFormCopy = new FormArray([]);
    this.editRowForm = new FormArray([]);
    if(res.result.scannedData.length > 0) {
      res.result.scannedData.forEach(element => {
        element.data = JSON.parse(element.data);
        var result1: any = {};
        for (var i = 0; i < element.data.length; i++) {
          result1[element.data[i].Title] = element.data[i].Value;
          let key = element.data[i].Title + "_err";
          result1[key] = element.data[i].IsError;
        }
        result1.isValid = element.isValid;
        result1.id = element.id;
        result1.status = element.status;
        this.dataStatus = element.status;
        this.rowData.push(result1);
        this.rowForm.push(this.fb.group(result1));
        this.rowFormCopy.push(this.fb.group(result1));
      });
    }
  }

  editField(row, id1: string, id2: string) {
    for (let i=0; i<this.editRowForm.controls.length; i++) {
      if(this.editRowForm.controls[i].value.id === row.id){
        this.editRowForm.controls.splice(i,1);
      }
    }
    document.getElementById(id1).style.display = 'none';
    document.getElementById(id2).style.display = 'block';
    document.getElementById(id2 + 'input').focus();
  }

  onInputBlur(index,row, id1,id2) {
    this.editRowForm.push(this.fb.group(row));
    document.getElementById(id1).style.display = 'block';
    document.getElementById(id2).style.display = 'none';
  }


  updateData(data, mainSub) {
    this.spinner.show();
    this.scandataService.updateScanData(data).subscribe( res => {
      this.spinner.hide();
      if ( res.status === 0 ) {
        if(this.editRowForm.length > 0) {
          this.toaster.error(res.message);
        }

      } else {
        this.toaster.success(res.message);
        this.editRowForm = new FormArray([]);
        this.getScanDataByJournal();
        this.closeSideContainer();
      }
      this.clrearEditRowForm();
    });
  }

  validatData() {
    this.spinner.show();
    this.scandataService.validateData(this.journalId).subscribe(res => {
      this.spinner.hide();
      if(res.status) {
        this.toaster.success(res.message);
        this.clearAllScanData();
      } else {
        res.body = '<span style="font-size: 16px;" class="text-danger">There are still some errors, please fix them.</span>';
        this.openDownloadConfirmModal(res);
      }
    });
  }

  clrearEditRowForm() {
    let i = this.editRowForm.length - 1;
      while (this.editRowForm.length !== 0) {
        this.editRowForm.removeAt(i);
        i = i-1;
      }
  }

  onTableDataSubmit(mainSub) {
    let data: any[] = [];
    let val = this.editRowForm.value;
    data = this.findEditedData(val);
    this.updateData(data, mainSub);
  }

  findEditedData(data) {
    let puData: any[] = [];
    let retData: any;
    this.scanData.forEach(element => {
      data.forEach(val => {
        if(val.id === element.id) {
          for ( let item in val ) {
            if ( item.includes('_err') ) {
              delete val[item];
            }
          }
          delete val.id;
          delete val.isValid;
          delete val.status;
          let strData = JSON.stringify(val);
          retData = {
            id: element.id,
            manufactureId: element.manufactureId,
            companyId: element.companyId,
            storeLocationId: element.storeLocationId,
            transactionDate: element.transactionDate,
            data: strData,
            isValid: element.isValid,
            status: element.status
          }
         puData.push(retData);
        }
      })
    });
    return puData;
  }


  onPageChange(e) {
    if(this.editRowForm.length > 0) {
      let modalRef = this._modalService.open(AlertModalComponent);
      modalRef.componentInstance.title = 'Unsaved Data!';
      modalRef.componentInstance.message = '<p><span style="font-size: 16px;">Are you sure you want to Go to next page?</span></p><p><span class="text-danger"> There are some unsaved changes.</span></p>';
      modalRef.result.then(res => {
          if(res) {
            this.previosPage = this.page;
            if(this.isJournal) {
              this.getScanDataByJournal();
            } else if(this.isTransaction) {
              this.getScanDataByTransaction();
            } else {
              this.getScanDataByUPC();
            }
          } else {
            this.page = this.previosPage;
          }
        }).catch(err => {
      });
    } else {
      this.previosPage = this.page;
      if(this.isJournal) {
        this.getScanDataByJournal();
      } else if(this.isTransaction) {
        this.getScanDataByTransaction();
      } else {
        this.getScanDataByUPC();
      }
    }
  }

  onPageSizeChange(e) {
    this.pageSize = +e;
    if(this.isJournal) {
      this.getScanDataByJournal();
    } else if(this.isTransaction) {
      this.getScanDataByTransaction();
    } else {
      this.getScanDataByUPC();
    }
  }

  onLogPageChange(e) {
    this.logPreviosPage = this.logPage;
    this.getFileLog();
  }

  onLogPageSizeChange(e) {
    this.logPageSize = +e;
    this.getFileLog();
  }

  // openSubmitAlertModal() {
  //   let modalRef = this._modalService.open(AlertModalComponent);
  //   modalRef.componentInstance.title = 'Submit Data.';
  //   modalRef.componentInstance.message = '<p><span style="font-size: 16px;">Are you sure you want to submit data?</span></p><p>Data will be submitted to manufacturer. <span class="text-danger">This operation can not be undone.</span></p>';
  //   modalRef.result.then(res => {
  //       if(res) {
  //         this.validatData();
  //       }
  //     }).catch(err => {
  //   });
  // }

  clearAllScanData() {
    this.scanData = [];
    this.rowData = [];
    this.rowForm = new FormArray([]);
    this.rowFormCopy = new FormArray([]);
    this.editRowForm = new FormArray([]);
    this.dataForm.reset();
    this.page = 1;
    this.pageSize =10;
    this.journalId = "";
    this.filterIsValid = "";
    this.journalId = "";
    this.upcCode = "";
    this.transactionId = "";
    this.isJournal = false;
    this.isUpc = false;
    this.isTransaction = false;
    this.previosPage = 1;
    this.logPage = 1;
    this.logPageSize = 10;
    this.filter = ""
    this.getFileLog();
    this.getFileLogCount();
  }

  onFilter(e) {
    this.getFileLog();
  }

  getManufacturerByCompanyId(id) {
    this.spinner.show();
    this.scandataService.getManufacturersByCompanyId(id).subscribe( res => {
      this.spinner.hide();
      this.manufactureresByCompany = res.result;
    });
  }

  onManufacturereChange(e) {
    this.manufacturerId = +e;
    this.getFileLog();
    this.getFileLogCount();
  }

  dateRangeChange(e) {
    this.selectedDateRange = e;
    this.startDate = this.selectedDateRange.fDate;
    this.endDate = this.selectedDateRange.tDate;
    this.getFileLog();
    this.getFileLogCount();
  }

  onInvalidData(e) {
    if (e.target.checked) {
      this.filterIsValid = "error";
      if(this.scanData.length > 0) {
        this.getScanDataByJournal();
      }
    } else {
      this.filterIsValid = "";
      this.getScanDataByJournal();
    }
  }

  onUpcSearch(e) {
    this.getScanDataByUPC();
  }

  onTransactionSearch(e) {
    this.getScanDataByTransaction();
  }


  getStoreLocation() {
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

  onStoreSelection(event) {
    this.storeLocationId = event.storeLocationID;
  }

}
