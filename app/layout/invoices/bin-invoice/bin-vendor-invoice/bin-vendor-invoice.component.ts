import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
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
import { MessageService } from '@shared/services/commmon/message-Service';
@Component({
  selector: 'app-bin-vendor-invoice',
  templateUrl: './bin-vendor-invoice.component.html',
  styleUrls: ['./bin-vendor-invoice.component.scss']
})
export class BinVendorInvoiceComponent implements OnInit {
  @Output() backToList: EventEmitter<any> = new EventEmitter();
  @Input() _invoiceID: any;
  @Input() invoiceDetail: any;
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
  defaultForm: any;
  submitted = false;
  gridOptions: any;
  rowData: any;
  _vendorId: any;
  _storeLocationId: any;
  isDisassociate = false;
  fileName = 'Upload File';
  fileUpload: any;
  percentDone: number;
  uploadSuccess: boolean;
  invoiceFileName: any;
  isClickSoftCopy: boolean;
  isClickSoftCopyClick = true;
  isSoftCopy: boolean;
  isClosePdf = false;
  binData: any;
  binInvoiceId: any;
  summary = { _invoiceChargeAmount: 0, _itemCost: 0, amountPaid: 0, sum: 0 };
  constructor(private gridService: GridService, private constants: ConstantService, private _toastr: ToastrService,
    private setupService: SetupService, private storeService: StoreService, private modalService: NgbModal,
    private spinner: NgxSpinnerService, private _fb: FormBuilder, private dataImport: DataImportService,
    private messageService: MessageService) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.invoicesDepartmentDetailsGrid);
    this.defaultForm = this.invoiceForm.value;
  }

  ngOnInit() {
    this.getByCompanyId();
    this.getVendorByCompanyId();
    this.getInvoiceStatus();
    this.fileUpload = null;
    if (this.invoiceDetail) {
      // this.isEdit = true;
      this.invoiceForm.patchValue(this.invoiceDetail);
      this._vendorId = this.invoiceDetail.vendorID;
      this.binInvoiceId = this._invoiceID;
      this._storeLocationId = this.invoiceDetail.storeLocationID;
      this.invoiceFileName = this.invoiceForm.get('invoiceFileName').value;
      this.invoiceForm.get('invoiceStatusID').setValue(1);
      this.invoiceDate = this.invoiceDetail.invoiceDate;
      this.binData = this.invoiceDetail;
      this.editOrSave('');
    }

    this.bindStoreLocationID();
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
    this.storeService.getByCompanyId(this.userInfo.companyId, this.userInfo.userName).subscribe(
      (response) => {
        this.storeLocationList = response;
        this.bindStoreLocationID();
        this.isStoreLocationLoading = false;
      },
      (error) => {
        console.log(error);
      });
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
      this.invoiceForm.patchValue(response);
      this._vendorId = this.invoiceForm.value.vendorID;
      this._storeLocationId = this.invoiceForm.value.storeLocationID;
      this.invoiceForm.get('invoiceDate').setValue(moment(response.invoiceDate).format('MM-DD-YYYY'));
      this.invoiceDate = moment(response.invoiceDate).format('MM-DD-YYYY');
    }, error => {
      this.spinner.hide();
      console.log(error);
    });
  }
  backToInvocieList() {
    this.backToList.emit(false);
  }
  bindStoreLocationID() {
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      this.invoiceForm.get('storeLocationID').setValue(this.storeLocationList[0].storeLocationID);
      this._storeLocationId = this.storeLocationList[0].storeLocationID;
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
    this.editOrSave(event, () => { this.backToInvocieList(); });
  }
  editOrSave(_event, callBack = () => { }) {
    this.submitted = true;
    if (this.invoiceForm.valid) {
      const postData = {
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
        isCloned: this.isEdit ? true : false,
        physicalAmount: this.invoiceForm.value.invoiceAmount,
        lastModifiedBy: this.userInfo.userName,
        lastModifiedDateTime: this.invoiceForm.value.invoiceDate,
        createdDateTime: this.invoiceForm.value.invoiceDate,
      };
      this.spinner.show();
      this.setupService.updateData(`Invoice/UpdateInvoice`, postData).subscribe(response => {
        this.spinner.hide();
        this.submitted = false;
        if (response && response['statusCode']) {
          if (response['statusCode'] === 400 && response.result && response.result.validationErrors
            && response.result.validationErrors[0]) {
            this._toastr.warning(response.result.validationErrors[0]['errorMessage'], 'warning');
          }
          return;
        }
        if (response && Number(response) > 0) {
          this.associate();
          this.isDisassociate = true;
          this._toastr.success(this.isEdit ? this.constants.infoMessages.updatedRecord : this.constants.infoMessages.addedRecord,
            this.isEdit ? 'Update' : 'Save');
          if (!this.isEdit) {
            this._invoiceID = response;
            this._storeLocationId = postData.storeLocationID;
            this._vendorId = postData.vendorID;
            this.invoiceForm.get('invoiceID').setValue(response);
            this.isEdit = true;
            this.title = 'Edit New Invoice';
          }
          callBack();
        }
      }, error => {
        this.spinner.hide();
        console.log(error);
      });
    }
  }
  fetchDepartmentDetailsListByInvoiceID() {
    this.setupService.getData(`InvoiceDetail/GetFromDepartment/${this._invoiceID}/${this.userInfo.companyId}`).subscribe(res => {
      console.log(res);
      this.rowData = res;
    }, err => {
      console.log(err);
    });
  }
  dateChangeInvoice(event) {
    this.invoiceForm.get('invoiceDate').setValue(event.formatedDate);
    this.invoiceDate = event.formatedDate;
  }
  associate() {
    this.spinner.show();
    // tslint:disable-next-line:max-line-length
    const quary = `${this.binInvoiceId}/${this.binData.invoiceNo}/${this.binData.vendorID}/${this.binData.storeLocationID}/${this.userInfo.userName}`;
    this.setupService.deleteData(`InvoiceBin/DeleteInvoiceBinSaveHistory/${quary}`)
      .subscribe(response => {
        this.spinner.hide();
      }, error => {
        this.spinner.hide();
        console.log(error);
      });
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
          this._toastr.warning('Invocie Not Found', 'warning');
        }
      }, error => {
        this.spinner.hide();
        this._toastr.error('Invocie Failed', this.constants.infoMessages.error);
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
  loadData(arg0: any) {
    if (!arg0) {
      return;
    }
    this.spinner.hide();
    if (Number(arg0.data) > 0) {
      this._toastr.success('Upload File successfuly..', 'success');
    }

  }
  onChangeInvoiceAmt(event) {
    this.summary = event;
    this.invoiceForm.get('invoiceAmount').setValue(this.summary.sum);
  }
  backToInvocie(event) {
    this.messageService.sendMessage('expand_collaps');
    this.closePDF();
  }
}
