import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { FormBuilder, Validators } from '@angular/forms';
import { EditableGridService } from '@shared/services/editableGrid/editable-grid.service';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { StoreService } from '@shared/services/store/store.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-fuel-management',
  templateUrl: './fuel-management.component.html',
  styleUrls: ['./fuel-management.component.scss']
})
export class FuelManagementComponent implements OnInit {

  isShowSearch = true;
  loadList: any;
  storeList: any;
  vendorList: any;
  paginationGridOptions: any;
  initialFormValue: any;
  closeResult: string;
  editBOLGridOptions: any;
  editBOLRowData: any;
  editBOLData: any;
  editBOLGridApi: any;
  editBOLGridColumnApi: any;
  editBOLGridResponseOptions: any;
  editBOLResponseRowData: any;
  showResponseGrid = false;
  inputDate = moment().format('MM-DD-YYYY');
  bolDate = moment().format('MM-DD-YYYY');
  _currentDate = moment().format('MM-DD-YYYY');
  // currentDate = moment().format('DD-MM-YYYY');
  userInfo = this.constantService.getUserInfo();
  searchForm = this._fb.group({
    storeLocationID: [null],
    fromDate: this._currentDate,
    toDate: this._currentDate,
    VendorID: [null]
  });
  selectedDateRange: any;
  billOfLaddingForm = this._fb.group({
    boLNumber: [''],
    boLCompanyName: [''],
    businessDate: [this.bolDate, Validators.required],
    storeLocationID: [null],
    fuelGradeName: [''],
    fuelGradeID: 0,
    fuelInvoiceID: 0,
    grossFuelGradeVolume: 0,
    orderedFuelVoulme: 0,
    bolLoadName: [{ value: '', disabled: true }, Validators.required],
    bolLoadID: [null],
    netFuelGradeVolume: 0,
    boLID: 0,
    boLDetailID: 0,
    invoiceNo: [''],
    invoiceAmount: 0,
    createdDateTime: this._currentDate,
    lastModifiedBy: [''],
    lastModifiedDateTime: this._currentDate,
    isCheck: [true],
    isNetVolume: [false],
    isGrossVolume: [false],
    time: moment().format("HH:mm:SS"),
    volume: null,
    VendorID: [null]
  });
  isAddNew = false;
  isEdit = false;
  submitted = false;
  isDublicateBOLNo: boolean;
  @ViewChild('bolNo') bolNo: any;
  filterText: any;
  gridApi: any;
  newInvoiceFiles: any = [];

  constructor(private setupService: SetupService, private constantService: ConstantService,
    private _fb: FormBuilder, private editGridService: EditableGridService, private storeService: StoreService,
    private spinner: NgxSpinnerService, private toastr: ToastrService, private paginationGridService: PaginationGridService) {
    this.paginationGridOptions = this.paginationGridService.getGridOption(this.constantService.gridTypes.editBillofLadingGrid);
    this.editBOLGridOptions = this.editGridService.getGridOption(this.constantService.editableGridConfig.gridTypes.edittableBOLGrid);
    this.editBOLGridResponseOptions = this.editGridService.getGridOption(
      this.constantService.editableGridConfig.gridTypes.edittableBOLResponseGrid);
    this.initialFormValue = this.billOfLaddingForm.value;
  }

  ngOnInit() {
    // this.getLoadList();
    this.getStoreLocationList();
    this.getVendorByCompanyId();
  }

  getLoadList() {
    this.setupService.getData(`BillOfLading/GetBolLoad`).subscribe((response) => {
      if (response && response['statusCode']) {
        this.loadList = [];
        return;
      }
      this.loadList = response;
    });
  }

  getBillLoadList(storeLocationID: any) {
    this.setupService.getData(`BillOfLading/GetBolLoadNo?storelocationID=${storeLocationID}&Boldate=${this.billOfLaddingForm.get('businessDate').value}`).subscribe((response) => {
      if (response && response['statusCode']) {
        return;
      }
      this.billOfLaddingForm.get('bolLoadID').setValue(response.bolLoadID);
      this.billOfLaddingForm.get('bolLoadName').setValue(response.bolLoadName);
    });
  }

  getStoreLocationList() {
    if (this.storeService.storeLocation) {
      this.storeList = this.storeService.storeLocation;
      if (this.storeList && this.storeList.length === 1) {
        this.searchForm.get('storeLocationID').setValue(this.storeList[0].storeLocationID);
      }
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.storeList = this.storeService.storeLocation;
        if (this.storeList && this.storeList.length === 1) {
          this.searchForm.get('storeLocationID').setValue(this.storeList[0].storeLocationID);
        }
      }, (error) => {
        console.log(error);
      });
    }
  }
  get bolControl() { return this.billOfLaddingForm.controls; }

  getNewBOLData(params) {
    if (params && params.storeLocationID) {
      this.getBillLoadList(params.storeLocationID);
      this.setupService.getData(`BillOfLading/GetNewBOLData?StoreID=${params.storeLocationID}`).subscribe((response) => {
        if (response && response['statusCode']) {
          this.editBOLRowData = [];
          return;
        }
        this.editBOLRowData = response;
      }, (error) => {
        console.log(error);
      });
    }
  }

  checkBolExists() {
    if (this.bolFormValue.businessDate === null || this.bolFormValue.businessDate === ''
      || this.bolFormValue.storeLocationID === null) { return; }
    // tslint:disable-next-line:max-line-length
    this.setupService.getData(`BillOfLading/CheckBolExists?BOLNumber=${this.bolFormValue.boLNumber}&StoreID=${this.bolFormValue.storeLocationID}&BusinessDate=${this.bolFormValue.businessDate}&BOLID=${this.bolFormValue.boLID}`)
      .subscribe((response) => {
        if (response === 'true') {
          this.isDublicateBOLNo = true;
          this.bolNo.nativeElement.focus();
          this.toastr.error('Dublicate BOL Number', this.constantService.infoMessages.error);
        } else { this.isDublicateBOLNo = false; }
      }, (error) => {
        console.log(error);
      });
  }
  onEditableBOLGridReady(params) {
    this.editBOLGridApi = params.api;
    this.editBOLGridColumnApi = params.columnApi;
    this.editBOLGridApi.sizeColumnsToFit();
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(this.filterText);
  }

  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.searchForm.get('fromDate').setValue(this.selectedDateRange.fDate);
    this.searchForm.get('toDate').setValue(this.selectedDateRange.tDate);
  }

  dateChange(event, controls) {
    if (controls === 'searchDate') {
      this.searchForm.get('businessDate').setValue(event.formatedDate);
    }
    if (controls === 'bolDate') {
      this.billOfLaddingForm.get('businessDate').setValue(event.formatedDate);
      this.bolDate = event.formatedDate;
      this.checkBolExists();
    }
  }

  searchBOL() {
    if (!this.searchForm.value.storeLocationID) {
      this.toastr.error('Please select store location!', this.constantService.infoMessages.error);
      return;
    }
    this.getFuelInvoiceWithBOL();
  }
  addMore() {
    this.isShowSearch = false;
    this.showResponseGrid = false;
    this.editBOLResponseRowData = [];
    this.billOfLaddingForm.patchValue(this.initialFormValue);
  }
  resetBillofLadingForm() {
    this.editBOLRowData = [];
    this.showResponseGrid = false;
    this.editBOLResponseRowData = [];
    this.submitted = false;
    this.billOfLaddingForm.patchValue(this.initialFormValue);
  }
  get bolFormValue() { return this.billOfLaddingForm.value; }

  saveBillofLading() {
    if (this.isDublicateBOLNo) {
      this.bolNo.nativeElement.focus();
      this.toastr.error('Dublicate BOL Number', this.constantService.infoMessages.error);
      return;
    }
    if (this.bolFormValue.volume === null) {
      this.toastr.error('Volume Selection Required', this.constantService.infoMessages.error);
      return;
    }
    this.bolFormValue.volume === 'isNetVolume' ? this.bolFormValue.isNetVolume = true : this.bolFormValue.isNetVolume = false;
    this.bolFormValue.volume === 'isGrossVolume' ? this.bolFormValue.isGrossVolume = true : this.bolFormValue.isGrossVolume = false;

    const obj = this.getvalidateGrid();

    this.submitted = true;
    if (this.billOfLaddingForm.valid) {
      this.spinner.show();
      this.setupService.postData(`BillOfLading/addNew`, obj)
        .subscribe((response) => {
          this.spinner.hide();
          if (response) {
            this.showResponseGrid = true;
            this.submitted = false;
            this.editBOLResponseRowData = response;
            this.backToList();
            this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
            this.populateBillOfLading(response);
          } else {
            this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
          }
        }, (error) => {
          this.spinner.hide();
          this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
        });
    }
  }

  updateBillofLading() {
    if (this.isDublicateBOLNo) {
      this.bolNo.nativeElement.focus();
      this.toastr.error('Dublicate BOL Number', this.constantService.infoMessages.error);
      return;
    }
    if (this.bolFormValue.volume === null) {
      this.toastr.error('Volume Selection Required', this.constantService.infoMessages.error);
      return;
    }
    this.bolFormValue.volume === 'isNetVolume' ? this.bolFormValue.isNetVolume = true : this.bolFormValue.isNetVolume = false;
    this.bolFormValue.volume === 'isGrossVolume' ? this.bolFormValue.isGrossVolume = true : this.bolFormValue.isGrossVolume = false;

    const obj = this.getvalidateGrid();

    this.submitted = true;
    if (this.billOfLaddingForm.valid) {
      this.spinner.show();
      this.setupService.updateData(`BillOfLading/Update`, obj)
        .subscribe((response) => {
          this.spinner.hide();
          if (response) {
            this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
            // this.showResponseGrid = true;
            // this.submitted = false;
            // this.editBOLResponseRowData = response;
            // this.backToList();
            this.populateBillOfLading(response);
          } else {
            this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
          }
        }, (error) => {
          this.spinner.hide();
          this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
        });
    }
  }

  getFuelInvoiceWithBOL() {
    const postData = {
      fromDate: this.searchForm.value.fromDate,
      toDate: this.searchForm.value.toDate,
      StoreID: this.searchForm.value.storeLocationID,
      VendorID: this.searchForm.value.VendorID ? this.searchForm.value.VendorID : ""
    };
    this.spinner.show();
    this.setupService.getData(`BillOfLading/GetBolSearchData?fromDate=${postData.fromDate}&toDate=${postData.toDate}&StoreLocationIDs=${postData.StoreID}&VendorID=${postData.VendorID}`)
      .subscribe((response) => {
        this.spinner.hide();
        this.gridApi.setRowData(response);
        this.gridApi.sizeColumnsToFit();
      }, (error) => {
        this.spinner.hide();
      });
  }

  editBillOfLading(params) {
    this.spinner.show();
    this.setupService.getData(`BillOfLading/GetBOLDetailsByID?BOLID=${params.data.BoLID}`)
      .subscribe((response) => {
        this.spinner.hide();
        this.populateBillOfLading(response);
      }, (error) => {
        this.spinner.hide();
      });
  }

  populateBillOfLading(response) {
    this.editBOLData = response;
    this.isAddNew = true;
    this.isEdit = true;
    response.VendorID = response.vendorID;
    if (response.isNetVolume) {
      response.volume = 'isNetVolume';
    } else if (response.isGrossVolume) {
      response.volume = 'isGrossVolume';
    }
    this.billOfLaddingForm.patchValue(response);
    this.bolDate = response.businessDate;
    this.editBOLResponseRowData = [];
    if (response.details) {
      response.details.map(data => {
        data.fuelGradeName = data.storeFuelGradeName;
      });
      this.editBOLRowData = response.details;
    }
    this.showResponseGrid = false;
    this.submitted = false;
  }

  deleteBillOfLading(params) {
    this.spinner.show();
    this.setupService.deleteData(`BillOfLading/DeleteBOL?BOLID=${params.data.BoLID}`)
      .subscribe((response) => {
        this.spinner.hide();
        if (response === '1') {
          this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
          this.getFuelInvoiceWithBOL();
        } else {
          this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
        }
      }, (error) => {
        this.spinner.hide();
      });
  }

  downloadBillOfLading(event) {
    const postData = {
      companyId: this.userInfo.companyId,
      companyName: '',
      storeLocationId: event.data.storeLocationID,
      storeName: '',
      bucketName: '',
      filePath: event.data.BOLFileName,
      fileName: event.data.BOLFileName,
      fileType: '',
      fileData: '',
      contentType: ''
    };
    this.downloadFile(postData);
  }

  downloadFile(postData) {
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
          this.toastr.warning('File Not Found', 'warning');
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error('Download Failed', this.constantService.infoMessages.error);
        console.log(error);
      });
  }

  editAction(params) {
    if (params.data.storeLocationID === null || params.data.businessDate === null || params.data.boLID === null) {
      return;
    }
    const postData = {
      ...params.data,
    };
    this.spinner.show();
    // tslint:disable-next-line:max-line-length
    this.setupService.postData(`BillOfLading/UpdateJobberFuelInvoiceWithBol?StoreLocationID=${postData.storeLocationID}&BusinessDate=${postData.businessDate}&InvoiceNo=${postData.invoiceNo}&InvoiceAmount=${postData.invoiceAmount}&BOLID=${postData.boLID}&UserName=${this.userInfo.userName}`, '')
      .subscribe((response) => {
        this.spinner.hide();
        if (response === '1') {
          this.getFuelInvoiceWithBOL();
          this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
        } else {
          this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
        }
      }, (error) => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
      });
  }

  addNewBOL() {
    this.isAddNew = true;
    this.isEdit = false;
    this.billOfLaddingForm.patchValue(this.initialFormValue);
    this.bolDate = this._currentDate;
    this.editBOLResponseRowData = [];
    this.editBOLRowData = [];
    this.showResponseGrid = false;
    this.submitted = false;
    this.editBOLData = {};
    console.log(this.initialFormValue);
  }

  getvalidateGrid() {
    this.editBOLGridApi.stopEditing();
    const formData = { ...this.billOfLaddingForm.value, };
    let postData = {
      "boLID": formData.boLID,
      "boLNumber": formData.boLNumber,
      "companyID": this.userInfo.companyId,
      "boLCompanyName": formData.boLCompanyName,
      "businessDate": formData.businessDate,
      "storeLocationID": formData.storeLocationID,
      "fuelInvoiceID": formData.fuelInvoiceID,
      "createdDateTime": new Date(),
      "lastModifiedBy": this.userInfo.userName,
      "lastModifiedDateTime": new Date(),
      "isCheck": formData.isCheck,
      "isNetVolume": formData.isNetVolume,
      "isGrossVolume": formData.isGrossVolume,
      "vendorID": formData.VendorID,
      // "bolLoadName": "string",
      "bolLoadID": formData.bolLoadID,
      // "bolFileName": "string",
      "files": [],
      "details": []
    }
    const bolDetails = [];
    this.editBOLGridApi.forEachNode(function (rowNode: any, i: number) {
      let details = {};
      details['fuelGradeName'] = rowNode.data.fuelGradeName;
      details['storeFuelGradeID'] = rowNode.data.storeFuelGradeID;
      details['grossFuelGradeVolume'] = rowNode.data.grossFuelGradeVolume;
      details['orderedFuelVoulme'] = rowNode.data.orderedFuelVoulme;
      details['netFuelGradeVolume'] = rowNode.data.netFuelGradeVolume;
      details['boLDetailID'] = rowNode.data.boLDetailID;
      bolDetails.push(details);
    });
    postData.details = bolDetails;
    postData.files = this.newInvoiceFiles;
    return postData;
  }

  uploadNewInvoiceFiles(event) {
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
        this.newInvoiceFiles.push(newInvoiceFile);
      };
    }
  }

  editBOLDetail(params) {
    this.spinner.show();
    this.setupService.postData('BillOfLadingDetail/Update', params.data).subscribe((response) => {
      this.spinner.hide();
      if (response) {
        this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
      } else {
        this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
      }
    }, (error) => {
      this.spinner.hide();
      this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
    });
  }
  deleteBOL(params) {
    this.spinner.show();
    this.setupService.deleteData(`BillOfLading/DeleteBOL?BOLID=${params.data.boLID}`).subscribe((response) => {
      this.spinner.hide();
      if (response === '1') {
        // this.editBOLGridApi.updateRowData({ remove: [params.data] });
        this.isAddNew = false;
        this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
      } else {
        this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
      }
    }, (error) => {
      this.spinner.hide();
      this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
    });
  }
  backToList() {
    this.isAddNew = false;
    this.isEdit = false;
    this.newInvoiceFiles = [];
    this.getFuelInvoiceWithBOL();
  }

  getVendorByCompanyId() {
    if (this.storeService.vendorList) {
      this.vendorList = this.storeService.vendorList.filter(
        x => x.isFuelVendor === true);
    } else {
      this.storeService.getVendorList(this.userInfo.companyId).subscribe((response) => {
        this.vendorList = this.storeService.vendorList.filter(
          x => x.isFuelVendor === true);;
      }, (error) => {
        console.log(error);
      });
    }
  }

  volumeTypeChange() {
    setTimeout(() => {
      if (this.billOfLaddingForm.value.volume === "isNetVolume") {
        this.editBOLGridColumnApi.setColumnsVisible(["grossFuelGradeVolume"], false);
        this.editBOLGridColumnApi.setColumnsVisible(["netFuelGradeVolume"], true);
      } else if (this.billOfLaddingForm.value.volume === "isGrossVolume") {
        this.editBOLGridColumnApi.setColumnsVisible(["grossFuelGradeVolume"], true);
        this.editBOLGridColumnApi.setColumnsVisible(["netFuelGradeVolume"], false);
      }
    });
  }

  downloadInvoice() {
    const postData = {
      companyId: this.userInfo.companyId,
      companyName: '',
      storeLocationId: this.editBOLData.storeLocationID,
      storeName: '',
      bucketName: '',
      filePath: this.editBOLData.bolFileName,
      fileName: this.editBOLData.bolFileName,
      fileType: '',
      fileData: '',
      contentType: ''
    };
    this.downloadFile(postData);
  }
}
