import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { GridOptions } from 'ag-grid-community';
import { SetupService } from '@shared/services/setupService/setup-service';
import { StoreService } from '@shared/services/store/store.service';
import { FormBuilder } from '@angular/forms';
import { TestService } from '@shared/services/test/test.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

@Component({
  selector: 'app-bin-invoice',
  templateUrl: './bin-invoice.component.html',
  styleUrls: ['./bin-invoice.component.scss']
})
export class BinInvoiceComponent implements OnInit {
  isAdvanceSearchCollapsed = true;
  gridOptions: GridOptions;
  rowData: any;
  userInfo = this.constantService.getUserInfo();
  storeLocationList: any;
  vendorList: any;
  selectedDateRange: any;
  searchBinInvoiceForm = this.fb.group({
    locationCriteria: [],
    vendorCriteria: [],
    dtFromCriteria: [],
    dtToCriteria: [],
    dtInvCreatedDate: [],
    invoiceNo: [],
    filterText: ''
  });
  associateInvoiceForm = this.fb.group({
    storeLocationID: [],
    vendorID: [''],
    invoiceNo: [0],
    invoiceAmount: [''],
    invoiceDate: [''],
    isFileExist: false,
    invoiceFileName: ['']
  });
  initialFormValue: any;
  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  selectedBinInvoice: any;
  invoiceId: number;
  invoiceDetail: any;
  isVendorInovice: boolean;
  createdDate = moment().format('MM-DD-YYYY');
  toDate = moment().format('MM-DD-YYYY');
  fromDate = moment().format('MM-DD-YYYY');
  downLoadImg: any;
  isDownload: boolean;
  demoImg: string;
  constructor(private gridService: GridService, private constantService: ConstantService,
    private setupService: SetupService, private storeService: StoreService, private fb: FormBuilder,
    private spinner: NgxSpinnerService, private modal: NgbModal,
    private datePipe: DatePipe, private toastr: ToastrService) {
    this.gridOptions = this.gridService.getGridOption(this.constantService.gridTypes.binInvoiceGrid);
    this.initialFormValue = this.searchBinInvoiceForm.value;
  }

  ngOnInit() {
    this.getVendorList();
    this.getByCompanyId();
    this.search();
  }
  onGridReady(params) {
    params.api.sizeColumnsToFit();
  }

  getByCompanyId() {
    // this.storeService.getByCompanyId(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
    //   this.storeLocationList = response;
    // },
    //   (error) => {
    //     console.log(error);
    //   });
    if (this.storeService.storeLocation) {
      // this.isStoreLocationLoading = false;
      this.storeLocationList = this.storeService.storeLocation;
      this.bindStoreLocationID();

    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        //  this.isStoreLocationLoading = false;
        this.storeLocationList = this.storeService.storeLocation;
        this.bindStoreLocationID();
      }, (error) => {
        console.log(error);
      });
    }
  }
  bindStoreLocationID() {
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      const constStoreLocation = [];
      constStoreLocation.push(this.storeLocationList[0]);
      this.searchBinInvoiceForm.get('locationCriteria').setValue(constStoreLocation);
    }
  }
  getVendorList() {
    if (this.storeService.vendorList) {
      this.vendorList = this.storeService.vendorList;
    } else {
      this.storeService.getVendorList(this.userInfo.companyId).subscribe((response) => {
        this.vendorList = this.storeService.vendorList;
      }, (error) => {
        console.log(error);
      });
    }

  }
  dateChange(event, controls) {
    this.searchBinInvoiceForm.get('dtInvCreatedDate').setValue(event.formatedDate);
    this.createdDate = event.formatedDate;
  }

  reset() {
    this.searchBinInvoiceForm.patchValue(this.initialFormValue);
    this.fromDate = this.toDate = this.createdDate = moment().format('MM-DD-YYYY');
    const dateRange = { fDate: moment().format('YYYY-MM-DD'), tDate: moment().format('YYYY-MM-DD'), selectionType: "CustomRange" };
    this.selectedDateRange = dateRange;
  }
  search() {
    const postData = {
      locationCriteria: this.searchBinInvoiceForm.value.locationCriteria ? this.searchBinInvoiceForm.value.locationCriteria : '',
      vendorCriteria: this.searchBinInvoiceForm.value.vendorCriteria ? this.searchBinInvoiceForm.value.vendorCriteria : '',
      dtFromCriteria: this.searchBinInvoiceForm.value.dtFromCriteria ? this.searchBinInvoiceForm.value.dtFromCriteria : '',
      dtToCriteria: this.searchBinInvoiceForm.value.dtToCriteria ? this.searchBinInvoiceForm.value.dtToCriteria : '',
      dtInvCreatedDate: this.searchBinInvoiceForm.value.dtInvCreatedDate ? this.searchBinInvoiceForm.value.dtInvCreatedDate : '',
      invoiceNo: this.searchBinInvoiceForm.value.invoiceNo ? this.searchBinInvoiceForm.value.invoiceNo : '',
    };

    this.spinner.show();
    this.setupService.getData('InvoiceBin/Get/' + this.userInfo.userName + '/' +
      this.userInfo.companyId + '?locationCriteria=' + postData.locationCriteria + '&vendorCriteria=' + postData.vendorCriteria +
      '&dtFromCriteria=' + postData.dtFromCriteria + '&dtToCriteria=' + postData.dtToCriteria
      + '&dtInvCreatedDate=' + postData.dtInvCreatedDate + '&invoiceNo=' + postData.invoiceNo).subscribe((response) => {
        this.rowData = response;
        this.spinner.hide();
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });
  }

  edit(params) {
    this.selectedBinInvoice = params.data;
    let sampleDate: any;
    sampleDate = new Date(params.data.invoiceDate);
    this.invoiceId = params.data.invoiceBinID;
    this.associateInvoiceForm.patchValue(params.data);
    const isExistFile = !params.data.invoiceFileName ? false : true;
    this.associateInvoiceForm.get('isFileExist').setValue(isExistFile);
    this.associateInvoiceForm.get('invoiceDate').setValue(this.datePipe.transform(sampleDate, 'yyyy-MM-dd'));
    this.modal.open(this.modalContent, { windowClass: 'myCustomModalClass', backdrop: 'static' });
  }
  
  associateInvoice() {
    this.invoiceDetail = this.selectedBinInvoice;
    this.invoiceDetail.isBinInvoice = true;
    this.modal.dismissAll();
    this.isVendorInovice = true;
  }
  backToList() {
    this.search();
    this.isVendorInovice = false;
  }

  deleteAction(params) {
    this.spinner.show();
    this.setupService.deleteData(`InvoiceBin/${params.data.invoiceBinID}`)
      .subscribe(response => {
        this.spinner.hide();
        if (response === '1') {
          this.search();
          this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
        } else {
          this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
        console.log(error);
      });
  }
  openPDF(isCheck, params?) {
    const postData = {
      companyId: this.userInfo.companyId,
      companyName: '',
      storeLocationId: isCheck ? params.data.storeLocationID : this.associateInvoiceForm.get('storeLocationID').value,
      storeName: '',
      bucketName: '',
      filePath: '',
      fileName: isCheck ? params.data.invoiceFileName : this.associateInvoiceForm.get('invoiceFileName').value,
      fileType: '',
      fileData: '',
      contentType: ''
    };
    this.isDownload = false;
    this.spinner.show();
    this.setupService.postData(`InvoiceBin/DownloadInvocie`, postData)
      .subscribe(response => {
        this.spinner.hide();
        // if (response && response.fileData) {
        if (response && response.length > 0) {
          this.isDownload = true;
          this.downLoadImg = response;
          // this.buildSSQImage(response);
          response.map(element => {
            const linkSource = `data:${element.fileContentType};base64,${element.fileData}`;
            const downloadLink = document.createElement('a');
            const fileName = element.fileName;
            downloadLink.href = linkSource;
            downloadLink.download = fileName;
            downloadLink.click();
          });
          this.toastr.success('Download Invocie', this.constantService.infoMessages.success);
        } else {
          this.toastr.error('Download Invocie Failed', this.constantService.infoMessages.error);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error('Download Invocie Failed', this.constantService.infoMessages.error);
        console.log(error);
      });
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
  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.fromDate = this.selectedDateRange.fDate;
    this.toDate = this.selectedDateRange.tDate;
    this.searchBinInvoiceForm.get('dtFromCriteria').setValue(this.selectedDateRange.fDate);
    this.searchBinInvoiceForm.get('dtToCriteria').setValue(this.selectedDateRange.tDate);
  }
}
