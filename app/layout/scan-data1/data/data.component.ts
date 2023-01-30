import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { ScanDataService } from '@shared/services/scanDataService/scan-data.service';
import { ItemModule } from '../../items/item/item.module';
import { ToastrService } from 'ngx-toastr';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { DownloadConfirmModalComponent } from '../download-confirm-modal/download-confirm-modal.component';
import { StoreService } from '@shared/services/store/store.service';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss']
})
export class DataComponent implements OnInit {

  placement = "bottom-right";
  rowDataCopy: any[] = [];
  rowData: any[] = [];
  submittedData: any[] = [];
  page = 1;
  pageSize = 10;
  startDate = moment().format('YYYY-MM-DD');
  endDate = moment().format('YYYY-MM-DD');
  scanData: any[] = [];
  totalSalesAmt = 0;
  totalSalesQty = 0;
  manufDiscAmt = 0;
  outletDiscAmt = 0;
  manufDiscQty = 0;
  outletDiscQty = 0;
  model: any;
  dblClick: number;
  viewData: any[] = [];
  view: boolean;
  rowForm = new FormArray([]);
  rowFormCopy = new FormArray([]);
  editRowForm = new FormArray([]);
  programStatus = new FormControl();
  dataForm: FormGroup;
  sideContainer = 'side-container-close';
  warnings: any[] = [];
  userInfo: any;
  storeLocationId;
  manufacturerId = 1;
  submissionType: any;
  selectedDateRange: any;
  manufactureresByCompany: any;
  manufacturers: any[] = [];
  showResync: boolean = false;
  resyncProcess: boolean = false;
  dataStatus: string;
  invalidDataCount = 0;
  scanDataCount = 0;
  filterIsValid = true;
  filterPromotion = '';
  previosPage: number = 1;
  storeLocationList: any = [];
  constructor(private fb: FormBuilder,
    private spinner: NgxSpinnerService, private constantService: ConstantService, private scandataService: ScanDataService,
    private toaster: ToastrService, private _modalService: NgbModal, private storeService: StoreService) { }

  ngOnInit() {
    this.userInfo = this.constantService.getUserInfo();
    this.storeLocationId = this.constantService.getStoreLocationId();
    this.getScanDataByDate();
    this.getKpiCardData();
    this.createForm();
    this.getManufacturerByCompanyId(this.userInfo.companyId);
    this.getStoreLocation();
    // this.getSubmissionTypeForCompany(this.manufacturerId, this.userInfo.companyId, this.userInfo.storeList[0].storeLocationID)
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

  getManufacturerByCompanyId(id) {
    this.spinner.show();
    this.scandataService.getManufacturersByCompanyId(id).subscribe(res => {
      this.spinner.hide();
      this.manufactureresByCompany = res.result;
      this.manufacturerId = res.result[0] ? res.result[0].id : 1;
      this.getSubmissionTypeForCompany(this.manufacturerId, this.userInfo.companyId, this.storeLocationId)
    });
  }

  onManufacturereChange(e) {
    if (e) {
      this.manufacturerId = +e;
      // this.getScanDataByManuFactId(this.manufacturerId);
      this.getScanDataByDate();
      this.getKpiCardData();
    }
  }

  getScanData() {
    this.spinner.show();
    this.scandataService.getScanData(this.manufacturerId, this.userInfo.companyId, this.storeLocationId).subscribe(res => {
      this.spinner.hide();
      this.scanData = res.result;
      this.warnings = res.warnings;
      this.assignRowFormArray(res);
    });
  }

  getSubmissionTypeForCompany(manufacturerId, companyId, storeId) {
    this.scandataService.getSubmissionTypeForCompany(manufacturerId, companyId, storeId).subscribe(res => {
      this.submissionType = res.result;
    });
  }

  changeSubmissionType(setupId, submissionTypeId) {
    this.spinner.show();
    this.scandataService.changeSubmissionType(setupId, submissionTypeId).subscribe(res => {
      this.spinner.hide();
      if (res.status) {
        this.toaster.success(res.message);
      } else {
        this.toaster.error(res.message);
      }
    });
  }

  onSubmissionTypeChange() {
    console.log(this.submissionType);
    this.changeSubmissionType(this.submissionType.setupId, this.submissionType.id);
  }

  getScanDataByManuFactId(manufacturerId) {
    this.manufacturerId = manufacturerId;
    this.getScanData();
    this.getSubmissionTypeForCompany(this.manufacturerId, this.userInfo.companyId, this.storeLocationId);
  }

  downloadFile() {
    this.spinner.show();
    this.scandataService.downloadFile(this.endDate, this.manufacturerId, this.userInfo.companyId, this.storeLocationId).subscribe(res => {
      this.spinner.hide();
      let parsRes;
      try {
        parsRes = JSON.parse(res);
      } catch (e) {
      }
      if (parsRes && parsRes.result) {
        this.openDownloadConfirmModal(parsRes);
      } else {
        const blob = new Blob([res], { type: 'text' });
        saveAs(blob, `${new Date().toISOString().trim().replace(/[^a-zA-Z0-9]/g, '')}.txt`);
      }
    });
  }

  downloadFileFromLog(logId) {
    this.spinner.show();
    this.scandataService.downloadFileFromLog(logId).subscribe(res => {
      this.spinner.hide();
      const blob = new Blob([res], { type: 'text' });
      saveAs(blob, `${new Date().toISOString().trim().replace(/[^a-zA-Z0-9]/g, '')}.txt`);
    });
  }


  assignRowFormArray(res) {
    this.rowData = [];
    this.rowForm = new FormArray([]);
    this.rowFormCopy = new FormArray([]);
    this.editRowForm = new FormArray([]);
    // this.invalidDataCount = 0;
    if (res.result.length > 0) {
      res.result.forEach(element => {
        element.data = JSON.parse(element.data);
        var result1: any = {};
        for (var i = 0; i < element.data.length; i++) {
          console.log(element.data[i]);
          result1[element.data[i].Title] = element.data[i].Value;
          let key = element.data[i].Title + "_err";
          result1[key] = element.data[i].IsError;
        }
        result1.isValid = element.isValid;
        // if(!element.isValid) {
        //   this.invalidDataCount = this.invalidDataCount + 1;
        // }
        result1.id = element.id;
        result1.status = element.status;
        this.dataStatus = element.status;
        this.rowData.push(result1);
        this.rowForm.push(this.fb.group(result1));
        result1.TotalSaleAmt = "$" + Number(result1.TotalSaleAmt).toFixed(2);
        result1.MultipackDiscAmt = "$" + Number(result1.MultipackDiscAmt).toFixed(2);
        result1.AccountDiscAmt = "$" + Number(result1.AccountDiscAmt).toFixed(2);
        result1.MfgDiscAmt = "$" + Number(result1.MfgDiscAmt).toFixed(2);
        result1.ManufacturerMultipackDiscAmt = "$" + Number(result1.ManufacturerMultipackDiscAmt).toFixed(2);
        result1.MfgBuyDownAmt = "$" + Number(result1.MfgBuyDownAmt).toFixed(2);
        result1.MfgBuyDownDescription = "$" + Number(result1.MfgBuyDownDescription).toFixed(2);
        this.rowFormCopy.push(this.fb.group(result1));
      });
      // this.calcDiscAmtAndQty();
    } else {
      // this.totalSalesAmt = 0;
      // this.totalSalesQty = 0;
      // this.manufDiscAmt = 0;
      // this.outletDiscAmt = 0;
      // this.manufDiscQty = 0;
      // this.outletDiscQty = 0;
    }
  }

  calcDiscAmtAndQty() {
    this.totalSalesAmt = 0;
    this.totalSalesQty = 0;
    this.manufDiscAmt = 0;
    this.outletDiscAmt = 0;
    this.manufDiscQty = 0;
    this.outletDiscQty = 0;
    this.rowFormCopy.value.forEach(result1 => {
      this.totalSalesAmt = +result1.TotalSaleAmt + this.totalSalesAmt;
      this.totalSalesAmt = +this.totalSalesAmt.toFixed(2);
      this.totalSalesQty = +result1.SalesQty + this.totalSalesQty;
      this.outletDiscAmt = +result1.MultipackDiscAmt + this.outletDiscAmt;
      this.outletDiscQty = +result1.MultipackReqQty + this.outletDiscAmt;
      this.manufDiscAmt = +result1.MfgDiscAmt + this.manufDiscAmt;
      this.manufDiscQty = +result1.ManufacturerMultipackQty + this.manufDiscQty;
    });
  }

  updateData(data, mainSub) {
    // if(this.editRowForm.length===0 && mainSub) {
    //   this.reSubmitData();
    //   return;
    // }
    this.spinner.show();
    this.scandataService.updateScanData(data).subscribe(res => {
      this.spinner.hide();
      if (res.status === 0) {
        if (mainSub) {
          this.reSubmitData();
        }
        if (this.editRowForm.length > 0) {
          this.toaster.error(res.message);
        }

      } else {
        this.toaster.success(res.message);
        this.editRowForm = new FormArray([]);
        if (mainSub) {
          this.reSubmitData();
        } else {
          this.getScanDataByDate();
          this.getKpiCardData();
        }
        this.closeSideContainer();
      }
      this.clrearEditRowForm();
    });
  }

  reSubmitData() {
    this.spinner.show();
    this.scandataService.reSubmitData(this.endDate, this.manufacturerId, this.userInfo.companyId, this.storeLocationId, this.userInfo.userName).subscribe(res => {
      this.spinner.hide();
      if (res.status) {
        this.toaster.success(res.message);
        this.getScanDataByDate();
        this.getKpiCardData();
      } else {
        this.toaster.error(res.message);
      }
    });
  }

  reSyncData() {
    this.spinner.show();
    this.scandataService.reSyncData(this.endDate, this.manufacturerId, this.userInfo.companyId, this.storeLocationId).subscribe(res => {
      this.spinner.hide();
      if (res.status) {
        this.toaster.success(res.message);
        this.resyncProcess = true;
        this.getScanDataByDate();
        this.getKpiCardData();
      } else {
        this.toaster.error(res.message);
      }
    });
  }

  convertArrayToObject = (array, key) => {
    const initialValue = {};
    return array.reduce((obj, item) => {
      return {
        ...obj,
        [item[key]]: item,
      };
    }, initialValue);
  };

  copyRowData() {
    this.rowDataCopy = this.rowData.map(a => Object.assign({}, a));
  }

  openSideContainer(row, view) {
    if (row && !view) {
      for (const key in row) {
        if (key.includes('_err')) {
          delete row[key];
        }
      }
      this.dataForm.setValue(row);
    } else if (view) {
      this.viewData = [];
      for (let element in row) {
        let data = { key: element, value: row[element] }
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

  findEditedData(data) {
    let puData: any[] = [];
    let retData: any;
    this.scanData.forEach(element => {
      data.forEach(val => {
        if (val.id === element.id) {
          for (let item in val) {
            if (item.includes('_err')) {
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

  editField(row, id1: string, id2: string) {
    if (row.status === 'Posted') {
      return this.toaster.info('This field cannot be edited, since the data is already Posted');
    }
    for (let i = 0; i < this.editRowForm.controls.length; i++) {
      if (this.editRowForm.controls[i].value.id === row.id) {
        this.editRowForm.controls.splice(i, 1);
      }
    }
    document.getElementById(id1).style.display = 'none';
    document.getElementById(id2).style.display = 'block';
    document.getElementById(id2 + 'input').focus();
  }

  onInputBlur(index, row, id1, id2) {
    // this.dataForm.setValue(row);
    // this.rowForm.push(this.dataForm);
    this.editRowForm.push(this.fb.group(row));
    document.getElementById(id1).style.display = 'block';
    document.getElementById(id2).style.display = 'none';
  }

  onPromotion(e) {
    if (e.target.checked) {
      this.filterPromotion = 'Y';
      if (this.scanData.length > 0) {
        this.getScanDataByDate();
      }
    } else {
      this.filterPromotion = '';
      this.getScanDataByDate();
    }
  }

  onInvalidData(e) {
    if (e.target.checked) {
      this.filterIsValid = false;
      if (this.scanData.length > 0) {
        this.getScanDataByDate();
      }
    } else {
      this.filterIsValid = true;
      this.getScanDataByDate();
    }
  }

  updateRowFormCopy(sortedFormArray) {
    this.rowFormCopy = new FormArray([]);
    sortedFormArray.forEach(element => {
      this.rowFormCopy.push(this.fb.group(element));
    });
    this.calcDiscAmtAndQty();
  }

  onTableDataSubmit(mainSub) {
    // if (this.editRowForm.controls.length === 0) {
    //   return;
    // }
    let data: any[] = [];
    let val = this.editRowForm.value;
    data = this.findEditedData(val);
    this.updateData(data, mainSub);
  }

  clrearEditRowForm() {
    let i = this.editRowForm.length - 1;
    while (this.editRowForm.length !== 0) {
      this.editRowForm.removeAt(i);
      i = i - 1;
    }
  }

  closeAlert(alert) {
    this.warnings.splice(this.warnings.indexOf(alert), 1);
  }

  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.startDate = this.selectedDateRange.fDate;
    this.endDate = this.selectedDateRange.tDate;
    this.getScanDataByDate();
    this.getKpiCardData();
  }

  getKpiCardData() {
    let body = {
      manufacturerId: this.manufacturerId,
      companyId: this.userInfo.companyId,
      storeLocationId: this.storeLocationId,
      fromDate: this.startDate,
      toDate: this.endDate,
      page: this.page,
      pageSize: this.pageSize,
      filters: {
        isValid: this.filterIsValid,
        DiscountSign: this.filterPromotion
      }
    };
    this.scandataService.getKpiCardData(body).subscribe(res => {
      if (res.status) {
        this.warnings = res.warnings;
        this.totalSalesAmt = res.result.totalSalesAmt.toFixed(2);
        this.totalSalesQty = res.result.totalSalesQty.toFixed(2);
        this.manufDiscAmt = res.result.manufDiscAmt.toFixed(2);
        this.manufDiscQty = res.result.manufDiscQty.toFixed(2);
        this.outletDiscAmt = res.result.outletDiscAmt.toFixed(2);
        this.outletDiscQty = res.result.outletDiscQty.toFixed(2);
        this.invalidDataCount = res.result.inValidDataCount;
      } else {
        this.warnings = [];
        this.totalSalesAmt = 0;
        this.totalSalesQty = 0;
        this.manufDiscAmt = 0;
        this.manufDiscQty = 0;
        this.outletDiscAmt = 0;
        this.outletDiscQty = 0;
        this.invalidDataCount = 0;
      }
    });
  }

  getScanDataByDate() {
    let body = {
      manufacturerId: this.manufacturerId,
      companyId: this.userInfo.companyId,
      storeLocationId: this.storeLocationId,
      fromDate: this.startDate,
      toDate: this.endDate,
      page: this.page,
      pageSize: this.pageSize,
      filters: {
        isValid: this.filterIsValid,
        DiscountSign: this.filterPromotion
      }
    };
    this.spinner.show();
    this.showResync = false;
    this.scandataService.getScanDataByDate(body).subscribe(res => {
      this.spinner.hide();
      if (res.status) {
        if (res.result && res.result.length > 0) {
          this.resyncProcess = false;
        }
        // this.warnings = res.warnings;
        this.scanData = res.result;
        if (this.warnings !== null) {
          for (let i = 0; i < this.warnings.length; i++) {
            if (this.warnings[i].includes("Data is missing for date")) {
              this.showResync = true;
            }
          }
        }
        this.assignRowFormArray(res);
      }
    });

    this.scandataService.getScanDataByDateCount(body).subscribe(res => {
      this.scanDataCount = res.result;
    });

  }

  openSubmitAlertModal() {
    let modalRef = this._modalService.open(AlertModalComponent);
    modalRef.componentInstance.title = 'Submit Data.';
    modalRef.componentInstance.message = '<p><span style="font-size: 16px;">Are you sure you want to submit data?</span></p><p>Data will be submitted to manufacturer. <span class="text-danger">This operation can not be undone.</span></p>';
    modalRef.result.then(res => {
      if (res) {
        this.onTableDataSubmit(1);
        // this.reSubmitData();
      }
    }).catch(err => {
    });
  }

  openDownloadConfirmModal(res) {
    let modalRef = this._modalService.open(DownloadConfirmModalComponent);
    modalRef.componentInstance.title = 'Downalod File.';
    modalRef.componentInstance.body = '<span style="font-size: 16px;" class="text-danger">There are some errors in data, please fix these errors before download.</span>'
    modalRef.componentInstance.message = res.message;
    modalRef.componentInstance.errors = res.result;
    modalRef.result.then(res => {
      if (res.status) {
        this.downloadFileFromLog(res.id);
      }
    }).catch(err => {
    });
  }

  onPageChange(e) {
    if (this.editRowForm.length > 0) {
      let modalRef = this._modalService.open(AlertModalComponent);
      modalRef.componentInstance.title = 'Unsaved Data!';
      modalRef.componentInstance.message = '<p><span style="font-size: 16px;">Are you sure you want to Go to next page?</span></p><p><span class="text-danger"> There are some unsaved changes.</span></p>';
      modalRef.result.then(res => {
        if (res) {
          this.previosPage = this.page;
          this.getScanDataByDate();
        } else {
          this.page = this.previosPage;
        }
      }).catch(err => {
      });
    } else {
      this.previosPage = this.page;
      this.getScanDataByDate();
    }
  }

  onPageSizeChange(e) {
    this.pageSize = +e;
    this.getScanDataByDate();
  }

  onRefresh() {
    this.getScanDataByDate();
    this.getKpiCardData();
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
