import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { GridOptions } from 'ag-grid-community';
import { StoreService } from '@shared/services/store/store.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-fuel-invoice',
  templateUrl: './fuel-invoice.component.html',
  styleUrls: ['./fuel-invoice.component.scss', '../vendor-invoice/vendor-invoice.component.scss']
})
export class FuelInvoiceComponent implements OnInit {
  filterText: string = '';
  userInfo = this.constantService.getUserInfo();
  vendorList: any;
  locationList: any;
  gridOptions;
  rowData: any = [];
  isHideAddFuelInvoice = false;
  isAdvanceSearchCollapsed = true;
  isStoreLocationLoading = true;
  isVendorLoading = true;
  selectedDateRange: any = {};
  advanceSearchForm = {
    storeLocationID: null, vendorID: null, dtFrom: null, dtTo: null, invoiceNo: '', CompanyID: 0,
    username: '', bolNo: ''
  };
  editData = null;
  showAddInvoiceOptions: boolean = false;
  selectedInvoice: any;
  selectedidlst: any;
  gridApi: any;
  selectAllInvoiceFlag: any;
  showSelectAll: boolean = false;
  isStatusLoading: boolean = true;
  reInitialize = true;

  @ViewChild('invoiceFilter') invoiceFilter: ElementRef;

  constructor(private gridService: PaginationGridService, private constantService: ConstantService,
    private storeService: StoreService, private setupService: SetupService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService) {
    this.gridOptions = this.gridService.getGridOption(this.constantService.gridTypes.fuelInvoiceGrid);
    this.gridOptions.rowHeight = 45;
    this.advanceSearchForm.dtFrom = moment().add(-1, 'months').format('MM-DD-YYYY');
    this.advanceSearchForm.dtTo = moment().format('MM-DD-YYYY');
    this.selectedDateRange.fDate = moment().add(-1, 'months').format('YYYY-MM-DD');
    this.selectedDateRange.tDate = moment().format('YYYY-MM-DD');
    this.selectedDateRange.selectionType = "CustomRange";
  }

  ngOnInit() {
    this.getStoreByCompanyId();
    this.getVendorByCompanyId();
    this.subscribeToSearchKeyUp();
    //this.getInvoiceStatus();
    //this.searchInvoices();
  }

  subscribeToSearchKeyUp() {
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

  // onGridReady(params) {
  //   params.api.sizeColumnsToFit();
  // }
  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    var datasource = this.serverSideDatasource();
    this.gridApi.setServerSideDatasource(datasource);
  }
  serverSideDatasource() {
    return {
      getRows: (params) => {
        this.searchInvoices(params);
      },
    };
  }

  getStoreByCompanyId() {
    if (this.storeService.storeLocation) {
      this.isStoreLocationLoading = false;
      this.locationList = this.storeService.storeLocation;
      // this.bindStoreLocationID();
      this.updategridColumnBasedOnStores();

    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.isStoreLocationLoading = false;
        this.locationList = this.storeService.storeLocation;
        //this.updategridColumnBasedOnStores();
        //   this.bindStoreLocationID();
      }, (error) => {
        console.log(error);
      });
    }
  }
  updategridColumnBasedOnStores() {
    if (this.locationList && this.locationList.length <= 1) {

      // this.gridApi.setColumnDefs(colDefsMedalsIncluded);
      //  this.gridApi.setColumnDefs(this.fuelInvoiceColumnsWithoutStore);
      // this.gridApi.setColumnDefs(this.gridService.getGridOption(this.constantService.gridTypes.fuelInvoiceGridWithoutStore));
    }
    else {
      // this.gridOptions = this.gridService.getGridOption(this.constantService.gridTypes.fuelInvoiceGrid);
    }
  }
  getVendorByCompanyId() {
    if (this.storeService.vendorList) {
      const res = this.storeService.vendorList;
      const data = res.filter(
        x => x.isFuelVendor === true);
      this.vendorList = data;
      this.isVendorLoading = false;
    } else {
      this.storeService.getVendorList(this.userInfo.companyId).subscribe((response) => {
        const res = this.storeService.vendorList;
        const data = res.filter(
          x => x.isFuelVendor === true);
        this.vendorList = data;
        this.isVendorLoading = false;
      }, (error) => {
        console.log(error);
      });
    }
  }
  invoiceSearch() {
    this.isAdvanceSearchCollapsed = !this.isAdvanceSearchCollapsed;
    // this.getInvoiceBulk();
    this.gridApi.purgeServerSideCache([]);
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
  handleCallback(params, data) {
    if (Number(data.totalRecordCount) > 0) {
      params.successCallback(data.objFuelInvoice, data.totalRecordCount);
      let invoiceIDs = data.objFuelInvoice.map(a => a.fuelInvoiceID);
      setTimeout(() => {
        this.selectAllInvoice(invoiceIDs);
      }, 100);
      this.showSelectAll = true;
    } else {
      params.successCallback([], 0);
      this.gridApi.showNoRowsOverlay();
      this.showSelectAll = false;
    }
  }
  searchInvoices(params) {
    const noOfRecords = params.request.endRow - params.request.startRow;
    const pageNumber = params.request.startRow === 0 ? 1 : params.request.startRow / noOfRecords + 1;
    // tslint:disable-next-line:max-line-length
    const storeLocation = this.advanceSearchForm.storeLocationID ? this.advanceSearchForm.storeLocationID.map(x => x.storeLocationID).join(',') : '';
    // tslint:disable-next-line:max-line-length
    const vendoeLst = this.advanceSearchForm.vendorID ? this.advanceSearchForm.vendorID.map(x => x.vendorID).join(',') : '';
    const postData = {
      storeLocationID: storeLocation,
      vendorID: vendoeLst
      , dtFrom: this.advanceSearchForm.dtFrom,
      dtTo: this.advanceSearchForm.dtTo
      , invoiceNo: this.advanceSearchForm.invoiceNo ? this.advanceSearchForm.invoiceNo : ''
      , CompanyID: this.userInfo.companyId,
      username: this.userInfo.userName,
      bolNo: this.advanceSearchForm.bolNo ? this.advanceSearchForm.bolNo : '',
    };
    this.spinner.show();
    let url = '';
    if (params && params.request) {
      if (params.request.sortModel.length > 0)
        url += '&sortColumn=' + params.request.sortModel[0].colId + '&sortOrder=' + params.request.sortModel[0].sort;
    }
    this.setupService.getData('FuelInvoice/list/' + postData.CompanyID + '/' + postData.username +
      '?storeLocationID=' + postData.storeLocationID + '&vendorID=' + postData.vendorID + '&dtFrom=' + postData.dtFrom
      + '&dtTo=' + postData.dtTo + '&invoiceNo=' + postData.invoiceNo + '&PageNumber=' + pageNumber
      + '&noOfRecords=' + noOfRecords + '&searchValue=' + this.filterText + url).subscribe(
        (res) => {
          this.spinner.hide();
          this.handleCallback(params, res);
        }, (error) => {
          params.failCallback();
          this.spinner.hide();
        });
  }
  deleteAction(_rowIndex) {
    if (_rowIndex && _rowIndex.data && _rowIndex.data.fuelInvoiceID) {
      this.spinner.show();
      const fuelInvoiceId = _rowIndex.data.fuelInvoiceID;
      if (parseInt(fuelInvoiceId) > 0) {
        this.setupService.deleteData('FuelInvoice/' + fuelInvoiceId)
          .subscribe(response => {
            this.spinner.hide();

            if (response && response['statusCode']) {
              this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, 'Deleted');
              return;
            }
            if (response && Number(response) > 0) {
              this.toastr.success(this.constantService.infoMessages.deletedRecord, 'Deleted');
              this.gridApi.purgeServerSideCache([]);
            } else {
              this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, 'Deleted');
              return;
            }



          });
      }
    }
  }

  editAction(params) {
    this.editData = params.data;
    this.isHideAddFuelInvoice = true;
  }
  addFuelInvoice() {
    this.isHideAddFuelInvoice = true;
  }
  backToList(rowData) {
    this.editData = null;
    this.isHideAddFuelInvoice = false;
    if (rowData && rowData.vendorID) {
      this.setRowData(rowData);
    }
    else
      this.gridApi.purgeServerSideCache([]);
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

  resetAdv() {
    this.advanceSearchForm = {
      storeLocationID: null, vendorID: null, dtFrom: null, dtTo: null, invoiceNo: '', CompanyID: 0,
      username: '', bolNo: '',
    };
    this.advanceSearchForm.dtFrom = moment().add(-1, 'months').format('MM-DD-YYYY');
    this.advanceSearchForm.dtTo = moment().format('MM-DD-YYYY');
    const dateRange = { fDate: moment().add(-1, 'months').format('YYYY-MM-DD'), tDate: moment().format('YYYY-MM-DD'), selectionType: "CustomRange" };
    this.selectedDateRange = dateRange;
  }
  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.advanceSearchForm.dtFrom = this.selectedDateRange.fDate;
    this.advanceSearchForm.dtTo = this.selectedDateRange.tDate;
  }
  onRowSelected(params) {
    if (params.length > 0) this.showAddInvoiceOptions = true;
    else this.showAddInvoiceOptions = false;
    this.selectedInvoice = params.length;
    this.selectedidlst = params ? params.map(x => x.data.fuelInvoiceID).join(',') : '';
  }
  // getInvoiceStatus() {
  //   this.setupService.getData(`InvoiceStatus/GetAll`).subscribe(response => {
  //     if (response && response['statusCode']) {
  //       this.invoiceStatusList = [];
  //       return;
  //     }
  //     // this.invoiceStatusList = response;
  //     this.invoiceStatusList = response.filter((item) => item.invoiceStatusID !== 4);
  //     this.isStatusLoading = false;
  //   }, error => {
  //     console.log(error);
  //   });
  // }
  deleteBulkInvoice() {
    if (!this.selectedidlst || this.selectedidlst === '') {
      this.toastr.warning('  Please check the invoices to be changed !', 'warning');
      return;
    }
    this.spinner.show();
    this.setupService.deleteDataString('FuelInvoice/DeleteBulkFuelInvoice?fuelinvoiceIDList=' + this.selectedidlst)
      .subscribe((response) => {
        this.spinner.hide();
        if (response && response === 'success') {
          this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
          // this.getInvoiceBulk();
          this.gridApi.purgeServerSideCache([]);
          this.reInitialize = false;
          setTimeout(() => {
            this.reInitialize = true;
          });
          this.showAddInvoiceOptions = false;
          this.selectedidlst = [];
        } else {
          this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
        }
      }, (error) => {
        console.log(error);
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
      });
  }

  statusChange(params) {
    if (!params) { return; }
  }
  downloadInvoice(event) {
    const postData = {
      companyId: this.userInfo.companyId,
      companyName: '',
      storeLocationId: event.data.storeLocationID,
      storeName: '',
      bucketName: '',
      filePath: event.data.fuelInvoiceFileName,
      fileName: event.data.fuelInvoiceFileName,
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
        this.toastr.error('Invoice Failed', this.constantService.infoMessages.error);
        console.log(error);
      });
  }

  uploadInvoice(event) {
    console.log("Uploading....");
    console.log(event);
    this.spinner.show();
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


    setTimeout(() => {
      let postData = {
        fuelInvoiceID: event.data.fuelInvoiceID,
        companyID: event.data.companyID,
        files: updateInvoiceFiles
      }
      this.setupService.postData('FuelInvoice/UpdateFuelInvoiceFiles', postData).subscribe(result => {
        this.spinner.hide();
        this.gridApi.purgeServerSideCache([]);

        if (result.status === 1) {
          this.toastr.success("Files Uploaded Successfully", this.constantService.infoMessages.success);

        } else
          this.toastr.error("Files Upload Failed", this.constantService.infoMessages.success);
      }, error => {
        this.toastr.error("Files Upload Failed", this.constantService.infoMessages.success);
        this.spinner.hide();
        console.log(error);
      });
    }, 100);


  }
}
