import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { routerTransition } from 'src/app/router.animations';
import { StoreService } from '@shared/services/store/store.service';
import { FormBuilder } from '@angular/forms';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalOptions, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '@shared/services/commmon/common.service';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';
import { fromEvent } from 'rxjs';
import { saveAs } from 'file-saver';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
declare var $: any;
@Component({
  selector: 'app-vendor-invoice',
  templateUrl: './vendor-invoice.component.html',
  styleUrls: ['./vendor-invoice.component.scss'],
  animations: [routerTransition()]
})
export class VendorInvoiceComponent implements OnInit {

  isAdvanceSearchOpen: boolean = false;
  showSelectAll: boolean = false;
  selectAllInvoiceFlag: any;

  filterText: any = "";
  showAddInvoiceOptions: boolean = false;
  private getRowNodeId;
  isAddNew = false;
  invoiceId: any;
  invoiceDetail: any;
  isAdvanceSearchCollapsed = true;
  rowData: any;
  gridOptions: any;
  fromDate: any;
  toDate: any;
  storeLocationList: any[];
  paymentSourceList: any;
  invoiceStatusList: any;
  vendorList: any;
  defaultForm: any;
  gridApi: any;
  isStoreLocationLoading = true;
  isVendorLoading = true;
  isStatusLoading = true;
  isPaymentSourceLoading = true;
  userInfo = this.constants.getUserInfo();
  selectedDateRange: any;
  advanceSearchForm = this._fb.group({
    locationCriteria: [null],
    vendorCriteria: [null],
    statusCriteria: [null],
    paymentSourceIDs: [null],
    dtFromCriteria: [''],
    dtToCriteria: [''],
    invoiceNo: [''],
    upcCode: [''],
    CompanyID: [0],
    username: ''
  });
  invoiceList: any;
  selectedInvoice: any;
  selectedidlst: any;
  statusid: any;
  closeResult: string;
  invoiceNotes: any;
  @ViewChild('confirmClone') confirmClone: TemplateRef<any>;
  @ViewChild('noteModalContent') noteModalContent: TemplateRef<any>;
  @ViewChild('invoiceFilter') invoiceFilter: ElementRef;
  invoiceNoteForm = {
    invoiceNoteID: 0,
    invoiceID: 0,
    invoiceNotes: '',
    lastModifiedBy: '',
    lastModifiedDateTime: new Date(),
    createdBy: '',
    createdDateTime: new Date(),
  };
  ediUploadData: any;
  invoiceActionID: any;
  constructor(private gridService: PaginationGridService, private constants: ConstantService,
    private setupService: SetupService, private storeService: StoreService, private modalService: NgbModal,
    private spinner: NgxSpinnerService, private commonService: CommonService,
    private _fb: FormBuilder, private toastr: ToastrService) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.invoicesDetailsGrid);
    this.defaultForm = this.advanceSearchForm.value;
    this.fromDate = moment().subtract(30, 'd').format('MM-DD-YYYY'); // moment().add(-1, 'months').format('MM-DD-YYYY');
    this.toDate = moment().format('MM-DD-YYYY');
    const dateRange = { fDate: moment().subtract(30, 'd').format('YYYY-MM-DD'), tDate: moment().format('YYYY-MM-DD'), selectionType: "CustomRange" };
    this.selectedDateRange = dateRange;
    this.rowData = [];
    this.getRowNodeId = function (data) {
      return data.invoiceID;
    };
  }

  ngOnInit() {
    if (this.commonService.invoiceid) {
      this.invoiceId = this.commonService.invoiceid;
      this.commonService.invoiceid = null;
      this.addVendorInvoiceNew();
      return;
    }

    // this.getVendorByInvoice();
    this.getPaymentByCompanyID();
    this.getByCompanyId();
    this.getVendorByCompanyId();
    this.getInvoiceStatus();
    // this.getInvoiceBulk();
    this.bindStoreLocationID();
    setTimeout(() => {
      fromEvent(this.invoiceFilter.nativeElement, 'keyup').pipe(
        // get value
        map((event: any) => {
          return event.target.value;
        })
        , debounceTime(1000)
        , distinctUntilChanged()
      ).subscribe((text: string) => {
        this.filterText = text;
        this.gridApi.purgeServerSideCache([]);
      });
    });
  }

  setRowData(updateddata) {
    var rowNode = this.gridApi.getRowNode(updateddata.invoiceID);
    let data = rowNode.data;
    updateddata.storeName = (this.storeService.storeLocation.filter(k => k.storeLocationID === updateddata.storeLocationID))[0].storeName;
    const vendor = (this.storeService.vendorList.filter(k => k.vendorID === updateddata.vendorID));
    updateddata.vendorName = vendor[0].vendorName;
    updateddata.vendorIsActive = vendor[0].vendorIsActive;
    updateddata = Object.assign(data, updateddata);
    rowNode.setData(updateddata);
  }

  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    var datasource = this.serverSideDatasource();
    this.gridApi.setServerSideDatasource(datasource);
  }

  addVendorInvoiceNew() {
    this.invoiceId = this.invoiceId;
    this.invoiceDetail = null;
    this.isAddNew = true;
  }
  getPaymentByCompanyID() {
    this.storeService.getPaymentByCompanyID(this.userInfo.companyId).subscribe(
      (response) => {
        this.paymentSourceList = response;
        this.isPaymentSourceLoading = false;
      },
      (error) => {
        console.log(error);
      });
  }
  getByCompanyId() {
    if (this.storeService.storeLocation) {
      this.isStoreLocationLoading = false;
      this.storeLocationList = this.storeService.storeLocation;
      this.bindStoreLocationID();
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.isStoreLocationLoading = false;
        this.storeLocationList = this.storeService.storeLocation;
        this.bindStoreLocationID();
      }, (error) => {
        console.log(error);
      });
    }
  }
  getVendorByCompanyId() {
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
  getInvoiceStatus() {
    this.setupService.getData(`InvoiceStatus/GetAll`).subscribe(response => {
      if (response && response['statusCode']) {
        this.invoiceStatusList = [];
        return;
      }
      // this.invoiceStatusList = response;
      this.invoiceStatusList = response.filter((item) => item.invoiceStatusID !== 4);
      this.isStatusLoading = false;
    }, error => {
      console.log(error);
    });
  }
  addNew(param) {
    this.invoiceId = null;
    this.invoiceDetail = null;
    this.isAddNew = param;
  }
  backToList(rowData) {
    this.invoiceId = null;
    this.invoiceDetail = null;
    this.isAddNew = false;
    if (rowData && rowData.vendorID) {
      this.setRowData(rowData);
    }
    else
      this.gridApi.purgeServerSideCache([]);
    // this.getInvoiceBulk();
  }

  onFilterTextBoxChanged() {
    this.gridApi.purgeServerSideCache([]);
    // this.gridApi.setQuickFilter(this.filterText);
    // this.totalPageCount = this.gridApi.rowModel.getRowCount();
  }

  edit(param) {
    this.invoiceActionID = param.data.invoiceActionID;
    this.invoiceId = param.data.invoiceID;
    this.invoiceDetail = param.data
    this.invoiceDetail['isClone'] = false;
    this.isAddNew = true;
  }

  cloneAction(param) {
    this.invoiceId = param.data.invoiceID;
    this.invoiceDetail = param.data;
    this.invoiceDetail['isClone'] = true;
    const ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      size: 'sm'
    };
    this.modalService.open(this.confirmClone, ngbModalOptions);
    // this.isAddNew = true;
  }
  CloneYes() {
    document.getElementById('confirmCloneClose').click();
    this.isAddNew = true;
  }
  CloneNo() {
    this.invoiceId = null;
    this.invoiceDetail = null;
    document.getElementById('confirmCloneClose').click();
  }
  noteAction(params) {
    this.invoiceNoteForm.invoiceID = params.data.invoiceID;
    this.getNotes(params.data.invoiceID);
  }
  getNotes(id) {
    if (!id) {
      return;
    }
    this.spinner.show();
    this.setupService.getData('InvoiceNote/GetByInvoiceID/' + id).subscribe(
      (res) => {
        this.spinner.hide();
        if (res && res[0]) {
          this.invoiceNoteForm = res[0];
        } else {
          this.invoiceNoteForm = {
            invoiceNoteID: 0,
            invoiceID: id,
            invoiceNotes: '',
            lastModifiedBy: '',
            lastModifiedDateTime: new Date(),
            createdBy: '',
            createdDateTime: new Date(),
          };
        }
        this.noteOpen();
      }, (err) => {
        this.spinner.hide();
      }

    );
  }
  noteOpen() {
    const ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      size: 'sm'
    };
    this.modalService.open(this.noteModalContent, ngbModalOptions).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  uploadInvoice(event) {
    let updateInvoiceFiles: any[] = [];
    for (var i = 0; i < event.target.files.length; i++) {
      let file = event.target.files[i];
      let newInvoiceFile = {
        file: "",
        fileName: file.name,
        fileType: file.type
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        newInvoiceFile.file = reader.result as string;
        updateInvoiceFiles.push(newInvoiceFile);
      };
    }

    this.spinner.show();
    setTimeout(() => {
      let postData = {
        invoiceId: event.data.invoiceID,
        companyID: event.data.companyID,
        files: updateInvoiceFiles
      }
      this.setupService.postData('Invoice/UpdateInvoiceFiles', postData).subscribe(result => {
        this.spinner.hide();
        if (result.status === 1) {
          this.toastr.success("Files Uploaded Successfully", this.constants.infoMessages.success);
          this.gridApi.purgeServerSideCache([]);
        } else
          this.toastr.error("Files Upload Failed", this.constants.infoMessages.success);
      }, error => {
        this.toastr.error("Files Upload Failed", this.constants.infoMessages.success);
        this.spinner.hide();
        console.log(error);
      });
    }, 100);
  }

  bindStoreLocationID() {
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      const constStoreLocation = [];
      constStoreLocation.push(this.storeLocationList[0]);
      this.advanceSearchForm.get('locationCriteria').setValue(constStoreLocation);
    }
  }

  clearAdvanceSearch() {
    this.advanceSearchForm.patchValue(this.defaultForm);
    this.fromDate = moment().subtract(7, 'd').format('MM-DD-YYYY');
    this.toDate = moment().format('MM-DD-YYYY');
    const dateRange = { fDate: moment().subtract(7, 'd').format('YYYY-MM-DD'), tDate: moment().format('YYYY-MM-DD'), selectionType: "CustomRange" };
    this.selectedDateRange = dateRange;
    this.bindStoreLocationID();
  }
  invoiceSearch() {
    this.isAdvanceSearchCollapsed = !this.isAdvanceSearchCollapsed;
    // this.getInvoiceBulk();
    this.gridApi.purgeServerSideCache([]);
  }

  getInvoiceBulk() {
    // tslint:disable-next-line:max-line-length
    const storeLocation = this.advanceSearchForm.value.locationCriteria ? this.advanceSearchForm.value.locationCriteria.map(x => x.storeLocationID).join(',') : '';
    // tslint:disable-next-line:max-line-length
    const vendoeLst = this.advanceSearchForm.value.vendorCriteria ? this.advanceSearchForm.value.vendorCriteria.map(x => x.vendorID).join(',') : '';
    // tslint:disable-next-line:max-line-length
    const departmentLst = this.advanceSearchForm.value.statusCriteria ? this.advanceSearchForm.value.statusCriteria.map(x => x.invoiceStatusID).join(',') : '';
    // tslint:disable-next-line:max-line-length
    const paymentSourceIDs = this.advanceSearchForm.value.paymentSourceIDs ? this.advanceSearchForm.value.paymentSourceIDs.map(x => x.paymentSourceID).join(',') : '';
    const data = {
      locationCriteria: storeLocation,
      vendorCriteria: vendoeLst,
      statusCriteria: departmentLst,
      paymentSourceIDs: paymentSourceIDs,
      dtFromCriteria: this.fromDate ? this.fromDate : '',
      dtToCriteria: this.toDate ? this.toDate : '',
      invoiceNo: this.advanceSearchForm.value.invoiceNo ? this.advanceSearchForm.value.invoiceNo : '',
      upcCode: this.advanceSearchForm.value.upcCode ? this.advanceSearchForm.value.upcCode : '',
      CompanyID: this.userInfo.companyId,
      Username: this.userInfo.userName
    };
    this.spinner.show();
    this.setupService.postData('Invoice/GetBulk', data).subscribe(result => {
      this.spinner.hide();
      this.gridApi.setRowData(result);
      this.invoiceList = result;
    }, error => {
      this.spinner.hide();
      console.log(error);
    });
  }
  onRowSelected(params) {
    if (params.length > 0) this.showAddInvoiceOptions = true;
    else this.showAddInvoiceOptions = false;
    this.selectedInvoice = params.length;
    this.selectedidlst = params ? params.map(x => x.data.invoiceID).join(',') : '';
  }
  statusChange(params) {
    if (!params) { return; }
  }
  UpdateStatus() {
    if (!this.selectedidlst || this.selectedidlst === '') {
      this.toastr.warning('  Please check the invoices to be changed !', 'warning');
      return;
    }
    if (!this.statusid || this.statusid === '') {
      this.toastr.warning('Status not select', 'warning');
      return;
    }
    const postData = {
      idlst: this.selectedidlst,
      statusid: this.statusid,
      updateSellingPrice: this.statusid === 3 ? true : false,
      username: this.userInfo.userName,
      CompanyID: this.userInfo.companyId,
    };
    this.spinner.show();
    this.setupService.updateData('Invoice/UpdateStatus?idlst=' + postData.idlst +
      '&statusid=' + postData.statusid + '&updateSellingPrice=' + postData.updateSellingPrice
      + '&username=' + postData.username + '&CompanyID=' + postData.CompanyID, '').subscribe(
        (response) => {
          this.spinner.hide();
          if (response && response > 0) {
            this.toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
            // this.getInvoiceBulk();
            this.gridApi.purgeServerSideCache([]);
            this.selectedidlst = null; this.statusid = null;
          } else {
            this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
          }
        }, (error) => { this.spinner.hide(); console.log(error); }
      );
  }
  saveAndClose() {
    if (!this.invoiceNoteForm.invoiceNotes) {
      this.toastr.warning('Please Fill the Notes!', 'warning');
      return;
    }
    const postData = {
      invoiceNoteID: this.invoiceNoteForm.invoiceNoteID,
      InvoiceNotes: this.invoiceNoteForm.invoiceNotes,
      UserName: this.userInfo.userName,
      InvoiceID: this.invoiceNoteForm.invoiceID,
    };
    this.spinner.show();
    this.setupService.updateData('InvoiceNote/AddOrUpdateInvoiceNote?invoiceNoteID=' + postData.invoiceNoteID +
      '&InvoiceNotes=' + postData.InvoiceNotes + '&UserName=' + postData.UserName
      + '&InvoiceID=' + postData.InvoiceID, '').subscribe(
        (response) => {
          this.spinner.hide();
          if (response && response.invoiceNoteID) {
            if (this.invoiceNoteForm.invoiceNoteID === 0) {
              this.toastr.success(this.constants.infoMessages.addedRecord, 'Added');
            } else {
              this.toastr.success(this.constants.infoMessages.updatedRecord, 'Updated');
            }
            document.getElementById('noteClose').click();
          }
        }, (error) => { this.spinner.hide(); console.log(error); }
      );
  }
  deleteInvoice() {
    if (!this.selectedidlst || this.selectedidlst === '') {
      this.toastr.warning('  Please check the invoices to be changed !', 'warning');
      return;
    }
    this.spinner.show();
    this.setupService.deleteDataString('Invoice/DeleteBulkInvoice?invoiceIDList=' + this.selectedidlst)
      .subscribe((response) => {
        this.spinner.hide();
        if (response && response === 'success') {
          this.toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.success);
          // this.getInvoiceBulk();
          this.gridApi.purgeServerSideCache([]);
        } else {
          this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
        }
      }, (error) => {
        console.log(error);
        this.spinner.hide();
        this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
      });
  }
  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.fromDate = this.selectedDateRange.fDate;
    this.toDate = this.selectedDateRange.tDate;
    this.advanceSearchForm.get('dtFromCriteria').setValue(this.selectedDateRange.fDate);
    this.advanceSearchForm.get('dtToCriteria').setValue(this.selectedDateRange.tDate);
  }

  serverSideDatasource() {
    return {
      getRows: (params) => {
        this.searchInvoices(params);
      },
    };
  }

  searchInvoices(params) {
    const noOfRecords = params.request.endRow - params.request.startRow;
    const pageNumber = params.request.startRow === 0 ? 1 : params.request.startRow / noOfRecords + 1;
    // tslint:disable-next-line:max-line-length
    const storeLocation = this.advanceSearchForm.value.locationCriteria ? this.advanceSearchForm.value.locationCriteria.map(x => x.storeLocationID).join(',') : '';
    // tslint:disable-next-line:max-line-length
    const vendoeLst = this.advanceSearchForm.value.vendorCriteria ? this.advanceSearchForm.value.vendorCriteria.map(x => x.vendorID).join(',') : '';
    // tslint:disable-next-line:max-line-length
    const departmentLst = this.advanceSearchForm.value.statusCriteria ? this.advanceSearchForm.value.statusCriteria.map(x => x.invoiceStatusID).join(',') : '';
    // tslint:disable-next-line:max-line-length
    const paymentSourceIDs = this.advanceSearchForm.value.paymentSourceIDs ? this.advanceSearchForm.value.paymentSourceIDs.map(x => x.paymentSourceID).join(',') : '';
    const data = {
      locationCriteria: storeLocation,
      vendorCriteria: vendoeLst,
      statusCriteria: departmentLst,
      paymentSourceIDs: paymentSourceIDs,
      dtFromCriteria: this.fromDate ? this.fromDate : '',
      dtToCriteria: this.toDate ? this.toDate : '',
      invoiceNo: this.advanceSearchForm.value.invoiceNo ? this.advanceSearchForm.value.invoiceNo : '',
      upcCode: this.advanceSearchForm.value.upcCode ? this.advanceSearchForm.value.upcCode : '',
      companyID: this.userInfo.companyId,
      username: this.userInfo.userName
    };
    this.spinner.show();
    let url = '';
    if (params && params.request) {
      if (params.request.sortModel.length > 0)
        url += '&sortColumn=' + params.request.sortModel[0].colId + '&sortOrder=' + params.request.sortModel[0].sort;
    }
    this.setupService.getData('Invoice/GetInvoicePayments?pageNo=' + pageNumber + '&noOfRecords=' + noOfRecords + '&searchValue=' + this.filterText + url + '&storelocations=' + storeLocation + '&dateFrom=' + data.dtFromCriteria + '&dateTo=' + data.dtToCriteria).subscribe(result => {
      this.spinner.hide();
      if (Number(result.totalRecords) > 0) {
        this.gridApi.hideOverlay();
        let invoiceIDs = [];
        result.invoices.forEach((data) => {
          data.vendorName = this.vendorList.find(vendor => vendor.vendorID === data.vendorID).vendorName;
          data.storeName = this.storeLocationList.find(store => store.storeLocationID === data.storeLocationID).storeName;
          invoiceIDs.push(data.invoiceID);
        });
        params.successCallback(result.invoices, result.totalRecords);
        setTimeout(() => {
          this.selectAllInvoice(invoiceIDs);
        }, 100);
        this.showSelectAll = true;
      } else {
        params.successCallback([], 0);
        this.gridApi.showNoRowsOverlay();
        this.showSelectAll = false;
      }
    }, error => {
      params.failCallback();
      params.successCallback([], 0);
      this.gridApi.showNoRowsOverlay();
      this.spinner.hide();
      console.log(error);
    });
  }

  printCheck(params) {
    let selectedPaymentIndex = params.selectedPaymentIndex;
    let printCheckWindow = null;
    printCheckWindow = window.open("/#/print-check/" + params.data.lstInvoicePayments[selectedPaymentIndex].paymentSourceID + "/" + params.data.lstInvoicePayments[selectedPaymentIndex].paymentID + "/" + this.userInfo.userName + "/" + params.data.lstInvoicePayments[selectedPaymentIndex].storeBankID, "_blank");
    window.addEventListener('message', (e: any) => {
      if (e && (e.data.statusCode == 400 || e.data.statusCode == 500 || e.data.statusCode)) {
        let errorMessage = '';
        if (e.data.result && e.data.result.validationErrors) {
          e.data.result.validationErrors.forEach(vError => {
            errorMessage += vError.errorMessage;
          });
          this.toastr.error(errorMessage);
        }
        printCheckWindow.close();
      } else {
        params.data.checkNumber = e.data.checkNumber;
        // let node = this.invoicePaymentGridApi.getRowNode(params.rowIndex);
        // node.setData(params.data);
        // this.invoicePaymentGridApi.redrawRows();
      }
    }, false);
  }

  delete(event) { }

  downloadInvoice(event) {
    const postData = {
      companyId: this.userInfo.companyId,
      companyName: '',
      storeLocationId: event.data.storeLocationID,
      storeName: '',
      bucketName: '',
      filePath: event.data.invoiceFileName,
      fileName: event.data.invoiceFileName,
      fileType: '',
      fileData: '',
      contentType: ''
    };
    this.spinner.show();
    this.setupService.postData(`InvoiceBin/DownloadInvocie`, postData)
      .subscribe(response => {
        this.spinner.hide();
        if (response && response.length > 0) {
          for (let i = 0; i < response.length; i++) {
            let file = response[i];
            const byteString = window.atob(file.fileData);
            const arrayBuffer = new ArrayBuffer(byteString.length);
            const int8Array = new Uint8Array(arrayBuffer);
            for (let i = 0; i < byteString.length; i++) {
              int8Array[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([int8Array], { type: file.fileContentType });
            // const blob = new Blob([file.fileData], { type: file.fileContentType });
            saveAs(blob, file.fileName);
          }
        } else {
          this.toastr.warning('Invoice Not Found', 'warning');
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error('Download Failed', this.constants.infoMessages.error);
        console.log(error);
      });
  }

  selectAllInvoice(invoiceIds?) {
    const checked = this.selectAllInvoiceFlag;
    this.gridApi.forEachNode(function (rowNode) {
      if (invoiceIds) {
        if (invoiceIds.find(k => k === rowNode.data.invoiceID))
          rowNode.setSelected(checked);
      } else
        rowNode.setSelected(checked);
    });
  }
}



