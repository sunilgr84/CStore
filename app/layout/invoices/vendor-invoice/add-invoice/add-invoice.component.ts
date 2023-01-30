import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, ViewChild, TemplateRef } from '@angular/core';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { StoreService } from '@shared/services/store/store.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { DataImportService } from '@shared/services/dataImport/data-import.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-add-invoice',
  templateUrl: './add-invoice.component.html',
  styleUrls: ['./add-invoice.component.scss']
})
export class AddInvoiceComponent implements OnInit {
  @Output() backToList: EventEmitter<any> = new EventEmitter();
  @Input() _invoiceID: any;
  @Input() invoiceDetail: any;
  @Input() _invoiceActionID: any;
  editRowData: any;
  invoiceStatusUpdated: any;
  title = 'Add New Invoice';
  storeLocationList: any[];
  invoiceStatusList: any;
  vendorList: any;
  isStoreLocationLoading = true;
  isInvoiceStatusLoading = true;
  isVendorLoading = true;
  invoiceDate = moment().format('MM-DD-YYYY');
  userInfo = this.constants.getUserInfo();
  invoiceForm = this._fb.group({
    invoiceID: [0],
    vendorID: [null, Validators.required],
    storeLocationID: [null, Validators.required],
    invoiceStatusID: [null, Validators.required],
    invoiceNo: ['', Validators.required],
    invoiceDate: this.invoiceDate,
    invoiceFileName: [''],
    invoiceAmount: [null, Validators.required],
    updateInventoryInItem: [false],
    isEDIInvoice: [false],
    isCustomInvoiceAmount: [true],
    isCloned: [false],
    physicalAmount: [0],
    lastModifiedBy: [''],
    lastModifiedDateTime: new Date(),
    createdDateTime: new Date()
  });
  isEdit = false;
  disableEditing = false;
  defaultForm: any;
  submitted = false;
  gridOptions: any;
  rowData: any;
  _vendorId: any;
  _storeLocationId: any;
  isDisassociate = false;
  fileName = 'Upload File';
  fileUpload: any;
  newInvoiceFiles: any[] = [];
  showDownloadInvoice: boolean = false;
  percentDone: number;
  uploadSuccess: boolean;
  invoiceFileName: any;
  isClickSoftCopy: boolean;
  isClickSoftCopyClick = true;
  isSoftCopy: boolean;
  isClosePdf = false;
  summary = {
    _invoiceChargeAmount: 0, _itemCost: 0, amountPaid: 0, sum: 0
    , tQty: 0, tIPur: 0
  };
  showAssociateInvoice: boolean | false;
  @ViewChild('modalInvUpdtCft') modalInvUpdtCft: TemplateRef<any>;
  isItemPushToPos: boolean = false;
  showDiffAmount: boolean | false;
  diffAmnt: number | 0;
  constructor(private gridService: GridService, private constants: ConstantService, private _toastr: ToastrService,
    private setupService: SetupService, private storeService: StoreService, private modalService: NgbModal,
    private spinner: NgxSpinnerService, private _fb: FormBuilder, private dataImport: DataImportService) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.invoicesDepartmentDetailsGrid);
    this.defaultForm = this.invoiceForm.value;
  }

  ngOnInit() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    this.getByCompanyId();
    // this.getVendorByCompanyId();
    this.getInvoiceStatus();
    if (this._invoiceActionID && this._invoiceActionID == 3) {
      this.showAssociateInvoice = true;
    }
    if (this.invoiceDetail && this.invoiceDetail.isBinInvoice) {//for bin invoice
      this.invoiceForm.patchValue(this.invoiceDetail);
      this._vendorId = this.invoiceForm.value.vendorID;
      this._storeLocationId = this.invoiceForm.value.storeLocationID;
      this.getVendorsByStoreLocationID(this._storeLocationId);
      this.invoiceForm.get('invoiceDate').setValue(moment(this.invoiceDetail.invoiceDate).format('MM-DD-YYYY'));
      this.invoiceDate = moment(this.invoiceDetail.invoiceDate).format('MM-DD-YYYY');
      this.invoiceFileName = this.invoiceDetail.invoiceFileName;
      this.invoiceForm.get('invoiceStatusID').setValue(1);
      const isExistFile = !this.invoiceDetail.invoiceFileName ? false : true;
      this.invoiceDetail.isFileExist = isExistFile;
    } else if (this._invoiceID) {//for edit invoice
      this.isEdit = true;
      this.title = 'Edit Invoice';
      if (this.editRowData) {
        this.invoiceFileName = this.editRowData.invoiceFileName;
      }
      if (this.editRowData && this.editRowData['isClone']) {
        this.InsertInvoiceClone(this._invoiceID, this.userInfo.userName);
      }
      this.fillInvoiceUpdate(this._invoiceID);
      // this.fetchDepartmentDetailsListByInvoiceID();
    } else {//for new invoice
      this.invoiceForm.get('invoiceStatusID').setValue(5);
      this.isVendorLoading = false;
      this.showDownloadInvoice = false;
    }
    this.bindStoreLocationID();
    this.disableEditing = false;
  }
  ngOnChanges(changes: SimpleChanges) {
    this.editRowData = changes.invoiceDetail.currentValue;
  }
  callAsscInvc() {
    this.spinner.show();
    this.setupService.updateData(`InvoiceAction/AssociateInvoice/${this._invoiceID}/${this.userInfo.userName}`, '')
      .subscribe(result => {
        this.spinner.hide();
        if (result && result['statusCode']) {
          this._toastr.error('Please try again', this.constants.infoMessages.error);
          return;
        }
        this.showAssociateInvoice = false;
      }, error => {
        this.spinner.hide();
        this._toastr.error(this.constants.infoMessages.updateRecordsdFailed, this.constants.infoMessages.error);
      });
  }
  get invoiceF() { return this.invoiceForm.controls; }
  InsertInvoiceClone(InvoiceID, UserName) {
    this.setupService.updateData('Invoice/InsertInvoiceClone?InvoiceID=' + InvoiceID +
      '&UserName=' + UserName, '').subscribe(
        (response) => {
          if (response && response['statusCode']) {
            return;
          }
          if (response) {
            this._toastr.success('Clone of invoice saved', 'success');
          }
        },
        (error) => {
          console.log(error);
        });
  }
  getByCompanyId() {
    // this.storeService.getByCompanyId(this.userInfo.companyId, this.userInfo.userName).subscribe(
    //   (response) => {
    //     this.storeLocationList = response;
    //     this.bindStoreLocationID();
    //     this.isStoreLocationLoading = false;
    //   },
    //   (error) => {
    //     console.log(error);
    //   });
    if (this.storeService.storeLocation) {
      this.isStoreLocationLoading = false;
      this.storeLocationList = this.storeService.storeLocation;
      if (this.storeLocationList.length === 1) {
        this.getVendorsByStoreLocationID(this.storeLocationList[0].storeLocationID);
      }
      this.bindStoreLocationID();
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.isStoreLocationLoading = false;
        this.storeLocationList = this.storeService.storeLocation;
        if (this.storeLocationList.length === 1) {
          this.getVendorsByStoreLocationID(this.storeLocationList[0].storeLocationID);
        }
        this.bindStoreLocationID();
      }, (error) => {
        console.log(error);
      });
    }
  }
  onGridReady(params) {
    params.api.sizeColumnsToFit();
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
      // this.invoiceStatusList = response;
      this.invoiceStatusList = response.filter((item) => item.invoiceStatusID !== 4);
      this.isInvoiceStatusLoading = false;
    }, error => {
      console.log(error);
    });
  }
  // edit invoice
  fillInvoiceUpdate(_invoiceID) {
    this.spinner.show();
    this.setupService.getData(`Invoice/GetById/` + _invoiceID).subscribe(response => {
      this.spinner.hide();
      this.isEdit = true;
      //   this.editRowData = response;
      this.invoiceForm.patchValue(response);
      if (this.invoiceForm.value.invoiceStatusID === 3) {
        this.disableEditableFields();
      }
      this._vendorId = this.invoiceForm.value.vendorID;
      this._storeLocationId = this.invoiceForm.value.storeLocationID;
      if (typeof this._storeLocationId === 'undefined') {
        this._storeLocationId = this.invoiceForm.getRawValue().storeLocationID;
      }
      this.getVendorsByStoreLocationID(this._storeLocationId);
      this.invoiceForm.get('invoiceDate').setValue(moment(response.invoiceDate).format('MM-DD-YYYY'));
      this.invoiceForm.get('invoiceAmount').setValue(response.invoiceAmount.toFixed(2));
      this.invoiceDate = moment(response.invoiceDate).format('MM-DD-YYYY');
      if (response.invoiceFileName === null || response.invoiceFileName === "") {
        this.showDownloadInvoice = false;
      } else this.showDownloadInvoice = true;
    }, error => {
      this.spinner.hide();
      console.log(error);
    });
  }
  backToInvocieList(rowData?) {
    if (rowData) {
      this.backToList.emit(rowData);
    } else
      this.backToList.emit(false);

  }
  bindStoreLocationID() {
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      this.invoiceForm.get('storeLocationID').setValue(this.storeLocationList[0].storeLocationID);
      // this._storeLocationId = this.storeLocationList[0].storeLocationID;
    }
  }
  resetInvoiceForm() {
    this.invoiceForm.patchValue(this.defaultForm);
    this.bindStoreLocationID();
    this.submitted = false;
    this.isEdit = false;
    this.invoiceDate = moment().format('MM-DD-YYYY');
  }
  editOrSaveClose(event) {
    this.title = 'Edit';
    this.checkInvoiceConfirmation(event, (rowData) => { this.backToInvocieList(rowData); });
  }

  checkInvoiceConfirmation(_event, callBack = (rowData) => { }) {
    this.isItemPushToPos = false;
    if (this.isEdit) {
      let invoiceStatus = this.invoiceStatusList.filter((invoiceStatus) => invoiceStatus.invoiceStatusID === this.invoiceForm.value.invoiceStatusID)[0].invoiceStatusDescription;
      if (invoiceStatus === "Completed") {
        this.setupService.getData(`Invoice/GetInvoice/${this.invoiceForm.value.invoiceID}/${this.invoiceForm.value.storeLocationID}/${this.userInfo.companyId}`).subscribe(response => {
          if (response && parseInt(response) > 0) {
            const ngbModalOptions: NgbModalOptions = {
              backdrop: 'static',
              size: 'sm'
            };
            this.modalService.open(this.modalInvUpdtCft);
          } else {
            this.editOrSave(_event, callBack);
          }
        });
      } else {
        this.editOrSave(_event, callBack);
      }
    } else {
      this.editOrSave(_event, callBack);
    }
  }

  editOrSave(_event, callBack = (rowData) => { }) {
    this.submitted = true;
    if (this.invoiceForm.valid) {
      this.spinner.show();
      let postData;
      let requestURL = "";
      if (this.isEdit) {
        requestURL = "Invoice/UpdateInvoiceAction";
        postData = {
          invoiceID: this.isEdit ? this.invoiceForm.value.invoiceID : 0,
          vendorID: this.invoiceForm.value.vendorID,
          storeLocationID: this.invoiceForm.value.storeLocationID,
          invoiceStatusID: this.invoiceForm.value.invoiceStatusID,
          invoiceNo: this.invoiceForm.value.invoiceNo,
          invoiceDate: this.invoiceForm.value.invoiceDate,
          invoiceFileName: this.invoiceForm.value.invoiceFileName,
          invoiceAmount: this.invoiceForm.value.invoiceAmount,
          updateInventoryInItem: this.isEdit ? true : false,
          isEDIInvoice: this.isEdit ? true : false,
          isCustomInvoiceAmount: true,
          physicalAmount: this.invoiceForm.value.invoiceAmount,
          lastModifiedBy: this.userInfo.userName,
          lastModifiedDateTime: this.invoiceForm.value.invoiceDate,
          IsItemPushToPos: this.isItemPushToPos,
          invoiceStatusDescription: "",
          storeName: "",
          vendorCode: "",
          vendorName: "",
          vendorIsActive: true,
          totalChargeAmount: 0,
          totalItemCost: 0,
          totalInvoiceAmount: 0,
          totalItemPurchase: 0,
          companyID: this.userInfo.companyId,
          totalCaseQty: 0,
        };
        this.setupService.updateData(requestURL, postData).subscribe(response => {
          this.spinner.hide();
          this.submitted = false;
          this.afterInvoiceUpdate(response, postData, callBack);
        }, error => {
          this.spinner.hide();
          console.log(error);
        });
      } else {
        requestURL = "Invoice/AddInvoice";
        // let invoiceFiles = <File>this.newInvoiceFiles;
        postData = {
          companyID: this.userInfo.companyId,
          storeLocationID: this.invoiceForm.value.storeLocationID,
          invoicestatusId: this.invoiceForm.value.invoiceStatusID,
          vendorid: this.invoiceForm.value.vendorID,
          invoiceno: this.invoiceForm.value.invoiceNo,
          invoiceAmount: this.invoiceForm.value.invoiceAmount,
          invoicedate: this.invoiceForm.value.invoiceDate,
          userName: this.userInfo.userName,
          sourceName: "",
          paymentSourceID: 0,
          chequeNo: "",
          methodOfPaymentId: 0,
          vendorName: "",
          storeBankID: 0,
          invoicePaymentAmount: 0,
          memo: "",
          movementHeaderID: 0,
          files: []
        };
        if (this.newInvoiceFiles && this.newInvoiceFiles.length > 0) postData.files = this.newInvoiceFiles;
        this.setupService.postData(requestURL, postData).subscribe(response => {
          this.spinner.hide();
          this.submitted = false;
          this.newInvoiceFiles = [];
          this.afterInvoiceUpdate(response, postData, callBack);
        }, error => {
          this.spinner.hide();
          console.log(error);
        });
      }
    }
  }

  afterInvoiceUpdate(response, postData, callBack = (rowData) => { }) {
    if (response && response['statusCode']) {
      if (response['statusCode'] === 400 && response.result && response.result.validationErrors
        && response.result.validationErrors[0]) {
        this._toastr.warning(response.result.validationErrors[0]['errorMessage'], 'warning');
      } else {
        this._toastr.warning("Something Went Wrong", 'warning');
      }
      return;
    }
    if (response) {
      this.invoiceStatusUpdated = this.invoiceStatusList.filter((item) => item.invoiceStatusID === this.invoiceForm.value.invoiceStatusID);
      this.isDisassociate = true;
      this._toastr.success(this.isEdit ? this.constants.infoMessages.updatedRecord : this.constants.infoMessages.addedRecord,
        this.isEdit ? 'Update' : 'Save');
      if (!this.isEdit) {
        this._invoiceID = response;
        this._storeLocationId = postData.storeLocationID;
        this._vendorId = this.invoiceForm.value.vendorID;
        this.invoiceForm.get('invoiceID').setValue(response);
        this.isEdit = true;
        this.title = 'Edit Invoice';
      }
      let invoiceStatusDescription = (this.invoiceStatusList.filter(k => k.invoiceStatusID === postData.invoiceStatusID))[0].invoiceStatusDescription;
      postData = Object.assign({ invoiceStatusDescription: invoiceStatusDescription }, postData);
      if (this.invoiceForm.value.invoiceStatusID === 3) {
        this.disableEditableFields();
      } else {
        this.enableEditableFields();
      }
      callBack(postData);
    }
  }

  fetchDepartmentDetailsListByInvoiceID() {
    this.setupService.getData(`InvoiceDetail/GetFromDepartment/${this._invoiceID}/${this.userInfo.companyId}`).subscribe(res => {
      if (res && res.length === 1 && res[0].departmentDescription === 'Total') {
        this.rowData = [];
        return;
      }
      this.rowData = res;
    }, err => {
      console.log(err);
    });
  }
  dateChangeInvoice(event) {
    this.invoiceForm.get('invoiceDate').setValue(event.formatedDate);
    this.invoiceDate = event.formatedDate;
  }
  disassociate() {
    this.spinner.show();
    this.setupService.updateData(`Invoice/DeleteByInvoiceId/${this.invoiceForm.value.invoiceID}`, '')
      .subscribe(response => {
        this.spinner.hide();
        if (response === '1') {
          this.backToList.emit(false);
          this._toastr.success('Invoice disassociate successfully', this.constants.infoMessages.success);
        } else {
          this._toastr.error('Failed to invoice disassociate', this.constants.infoMessages.error);
        }
      }, error => {
        this.spinner.hide();
        console.log(error);
      });
  }

  openPDF() {
    const postData = {
      companyId: this.userInfo.companyId,
      companyName: '',
      storeLocationId: this.invoiceForm.get('storeLocationID').value,
      storeName: '',
      bucketName: '',
      filePath: this.invoiceForm.get('invoiceFileName').value,
      fileName: this.invoiceForm.get('invoiceFileName').value,
      fileType: '',
      fileData: '',
      contentType: ''
    };
    this.spinner.show();
    this.setupService.postData(`InvoiceBin/DownloadInvocie`, postData)
      .subscribe(response => {
        this.spinner.hide();
        if (response && response.length > 0) {
          this.buildSSQImage(response);
        } else {
          this._toastr.warning('Invoice Not Found', 'warning');
        }
      }, error => {
        this.spinner.hide();
        this._toastr.error('Invoice Failed', this.constants.infoMessages.error);
        console.log(error);
      });
  }
  open() {
    this.isClickSoftCopy = !this.isClickSoftCopy;
    this.isClickSoftCopyClick = !this.isClickSoftCopyClick;
    this.isSoftCopy = true; this.isClosePdf = false;
  }
  closePDF() {
    this.isClickSoftCopy = !this.isClickSoftCopy;
    this.isClickSoftCopyClick = !this.isClickSoftCopyClick;
    this.isSoftCopy = false;
    this.isClosePdf = true;
  }
  buildSSQImage(res) {
    const dd = {
      pageMargins: [40, 0, 0, 25],
      content: [
      ]
    };
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    for (let x = 0; x < res.length; x++) {
      dd.content.push({
        image: 'data:' + res[x].fileContentType + ';base64,' + res[x].fileData,
        fit: [500, 500],
        margin: [0, 15, 0, 0]
      });
    }
    const pdfDocGenerator = pdfMake.createPdf(dd);
    pdfDocGenerator.getDataUrl((dataUrl) => {
      const targetElement = document.querySelector('#iframeContainer');
      const iframe = document.createElement('iframe');
      iframe.src = dataUrl;
      iframe.height = '500px';
      iframe.width = '100%';
      targetElement.className = 'iframe';
      targetElement.appendChild(iframe);
    });
  }
  uploadFile(files) {
    this.fileUpload = files;
    this.fileName = 'Choose file';
    this.percentDone = 0;
    if (files && files[0]) {
      this.fileName = files[0].name;
    }
  }
  uploadInvoiceFile(files: File[]) {
    if (!files) {
      this._toastr.warning('Please provide file', 'warning');
      return;
    }
    const fileToUpload = <File>files[0];
    const formData = new FormData();
    formData.append('file', fileToUpload, fileToUpload.name);
    this.spinner.show();
    // tslint:disable-next-line:max-line-length
    this.dataImport.postData(`Invoice/UploadInvoiceMobile?CompanyID=${this.userInfo.companyId}&StoreLocationID=${this.invoiceForm.value.storeLocationID}&vendorcode=${75}&vendorid=${this.invoiceForm.value.vendorID}&invoiceno=${this.invoiceForm.value.invoiceNo}&invoiceAmount=${this.invoiceForm.value.invoiceAmount}&invoicedate=${this.invoiceDate}&paymenSourceID=${0}&chequeNo=${0}&filename=${this.fileName}`
      , formData).subscribe(
        (res) => {
          if (res.type === HttpEventType.UploadProgress) {
            this.percentDone = Math.round((100 * res.loaded) / res.total);
            // tslint:disable-next-line: deprecation
          } else if (event instanceof HttpResponse) {
            this.uploadSuccess = true;
          }
          this.loadData(res['body']);
        }, (error) => {
          this.spinner.hide();
        }
      );
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
    if (this.isEdit) {
      this.spinner.show();
      setTimeout(() => {
        let postData = {
          invoiceId: this.invoiceDetail.invoiceID,
          companyID: this.invoiceDetail.companyID,
          files: this.newInvoiceFiles
        }
        this.setupService.postData('Invoice/UpdateInvoiceFiles', postData).subscribe(result => {
          this.spinner.hide();
          if (result.status === 1) {
            this._toastr.success("Files Uploaded Successfully", this.constants.infoMessages.success);
            this.fillInvoiceUpdate(this._invoiceID);
          } else
            this._toastr.error("Files Upload Failed", this.constants.infoMessages.success);
        }, error => {
          this._toastr.error("Files Upload Failed", this.constants.infoMessages.success);
          this.spinner.hide();
          console.log(error);
        });
      }, 100);
    }
  }
  loadData(arg0: any) {
    if (!arg0) {
      return;
    }
    this.spinner.hide();
    if (Number(arg0.data) > 0) {
      this._toastr.success('Upload File successfuly..', 'success');
    }

  }
  onInvcAmntChanged() {
    this.calcDiffAmount();
  }
  calcDiffAmount() {
    let invoiceAmount = this.invoiceForm.get('invoiceAmount').value;
    this.diffAmnt = invoiceAmount - this.summary.sum;
    this.diffAmnt = Number(this.diffAmnt.toFixed(2));
    if (Number(this.summary.sum) > 0 && this.diffAmnt > 0) {
      this.showDiffAmount = true;
    }
    else {
      this.showDiffAmount = false;
    }
  }
  onChangeInvoiceAmt(event) {
    this.summary = event;
    this.calcDiffAmount();
    // this.invoiceForm.get('invoiceAmount').setValue(this.summary.sum);
  }
  backToInvocie(event) {
    this.closePDF();
  }

  yesUpdtInv(_event?, callBack = (rowData) => { }) {
    this.isItemPushToPos = true;
    this.editOrSave(_event, callBack = (rowData) => { });
    this.modalService.dismissAll('yes Clicked');
  }

  noUpdtInv(_event?, callBack = (rowData) => { }) {
    this.editOrSave(_event, callBack = (rowData) => { });
    this.modalService.dismissAll('no Clicked');
  }

  cancelUpdtInv() {
    this.modalService.dismissAll('Cancel Clicked');
  }

  disableEditableFields() {
    this.disableEditing = true;
    this.invoiceForm.controls['storeLocationID'].disable();
    this.invoiceForm.controls['vendorID'].disable();
    this.invoiceForm.controls['invoiceAmount'].disable();
    this.invoiceForm.controls['invoiceNo'].disable();
  }

  enableEditableFields() {
    this.disableEditing = false;
    this.invoiceForm.controls['storeLocationID'].enable();
    this.invoiceForm.controls['vendorID'].enable();
    this.invoiceForm.controls['invoiceAmount'].enable();
    this.invoiceForm.controls['invoiceNo'].enable();
  }

  onStoreLocationChange() {
    this.getVendorsByStoreLocationID(this.invoiceForm.value.storeLocationID);
  }

  getVendorsByStoreLocationID(storeLocationID) {
    this.setupService.getData(`Vendor/GetStoreVendorByStoreID?StoreID=${storeLocationID}&CompanyID=${this.userInfo.companyId}`).subscribe(res => {
      if (res) {
        this.isVendorLoading = false;
        this.vendorList = res;
      } else {
        this.spinner.hide();
        this._toastr.error('Error Fetching Vendors', this.constants.infoMessages.error);
      }
    }, err => {
      this.spinner.hide();
      this._toastr.error('Error Fetching Vendors', this.constants.infoMessages.error);
      console.log(err);
    });
  }

  downloadInvoice() {
    const postData = {
      companyId: this.userInfo.companyId,
      companyName: '',
      storeLocationId: this.invoiceForm.get('storeLocationID').value,
      storeName: '',
      bucketName: '',
      filePath: this.invoiceForm.get('invoiceFileName').value,
      fileName: this.invoiceForm.get('invoiceFileName').value,
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
          this._toastr.warning('Invoice Not Found', 'warning');
        }
      }, error => {
        this.spinner.hide();
        this._toastr.error('Invoice Failed', this.constants.infoMessages.error);
        console.log(error);
      });
  }

  onAmountFocusOut(event) {
    let amount = Number(this.invoiceForm.get('invoiceAmount').value);
    this.invoiceForm.get('invoiceAmount').setValue(amount.toFixed(2));
  }
}
