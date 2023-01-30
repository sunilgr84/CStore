import { Component, OnInit } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ToastrService } from 'ngx-toastr';
import { HttpResponse, HttpEventType, HttpClient } from '@angular/common/http';
import { GridService } from '@shared/services/grid/grid.service';
import { GridOptions } from 'ag-grid-community';
import { EditableGridService } from '@shared/services/editableGrid/editable-grid.service';
import { CommonService } from '@shared/services/commmon/common.service';
import * as _ from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';
import { DataImportService } from '@shared/services/dataImport/data-import.service';
import { Router } from '@angular/router';
import { isNumber } from '@shared/utils/number-utils';
import { StoreService } from '@shared/services/store/store.service';

@Component({
  selector: 'app-upload-edi-invoice',
  templateUrl: './upload-edi-invoice.component.html',
  styleUrls: ['./upload-edi-invoice.component.scss']
})
export class UploadEdiInvoiceComponent implements OnInit {
  isEDIUpload = true;
  fileUpload: any;
  fileName = 'Upload File';
  percentDone = 0;
  storeLocationList: any;
  isStoreLoading = true;
  isVendorLoading = true;
  vendorItemList: any;
  uploadSuccess: any;
  userInfo = this.constantService.getUserInfo();
  uploadForm = { storeLocationId: null, vendorCode: null, departmentID: null };
  ediGridOption: GridOptions;
  ediGridApi: any;
  ediRowData: any;
  isGDIGridShow: boolean;
  editParams: any;

  ediProcessRowData: any;
  ediProcessGridOption: GridOptions;
  ediProcessGridApi: any;
  isProcessGDIGridShow: boolean;
  selectedItems: any = 0;
  // deparment array
  departmentList: any;
  editableSellingPriceGridOption: any;
  editableSellingGridApi: any;
  sellingPriceRowData: any;
  editableProductNameForEDIGridOption: any;
  editableProductNameForEDIGridApi: any;
  productNameForEDIRowData: any;
  isAddRowEDI: boolean;
  isAddSellingPriceEDI: any;
  constructor(private constantService: ConstantService, private _setupService: SetupService, private spinner: NgxSpinnerService,
    private toastr: ToastrService, private storeService: StoreService, private gridService: GridService, private router: Router
    , private editableService: EditableGridService, private commonService: CommonService, private dataImportService: DataImportService) {
    this.ediGridOption = this.gridService.getGridOption(this.constantService.gridTypes.ediInvoiceGrid);
    this.ediProcessGridOption = this.gridService.getGridOption(this.constantService.gridTypes.ediProcessGrid);
    this.editableSellingPriceGridOption =
      this.editableService.getGridOption(this.constantService.editableGridConfig.gridTypes.departmentUpdateSellingPriceGrid);
    this.editableProductNameForEDIGridOption =
      this.editableService.getGridOption(this.constantService.editableGridConfig.gridTypes.departmentProductNameForEDIGrid);
  }

  ngOnInit() {
    this.getStoreLocationByCompanyId();
    this.getVendorItem();
    // this.getDepartment();
  }
  onGridReady(params) {
    this.ediGridApi = params.api;
  }
  onEDIGridReady(params) {
    this.ediProcessGridApi = params.api;
  }
  onProductNameForEDIReady(params) {
    this.editableProductNameForEDIGridApi = params.api;
    params.api.sizeColumnsToFit();
  }
  onSellingPriceReady(params) {
    this.editableSellingGridApi = params.api;
    params.api.sizeColumnsToFit();
  }
  getStoreLocationByCompanyId() {
    this.storeService.getByCompanyId(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
      this.isStoreLoading = false;
      if (response && response['statusCode']) {
        this.storeLocationList = [];
        return;
      }
      this.storeLocationList = response;
      this.setLocationId();
    });
  }
  setLocationId() {
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      this.uploadForm.storeLocationId = this.storeLocationList[0].storeLocationID;
      this.SelectStoreLocation(this.uploadForm.storeLocationId);
    }
  }
  getVendorItem() {
    if (this.storeService.vendorList) {
      this.isVendorLoading = false;
      this.vendorItemList = this.storeService.vendorList;
    } else {
      this.storeService.getVendorList(this.userInfo.companyId).subscribe((response) => {
        this.vendorItemList = this.storeService.vendorList;
        this.isVendorLoading = false;
      }, (error) => {
        console.log(error);
      });
    }
  }
  // tempary declare. confirmation after remove this method
  getDepartment() {
    this._setupService.getData(`Department/getAll/${this.userInfo.userName}/${
      this.userInfo.companyId
      }`).subscribe(
        (response) => {
          this.departmentList = response;
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
  Reset() {
    this.fileName = 'Choose file';
    this.percentDone = 0;
    this.fileUpload = null;
    this.editParams = null;
    this.ediProcessRowData = null;
    this.selectedItems = 0;
  }
  basicUpload(files: File[]) {
    this.isGDIGridShow = false;
    if (!files) {
      this.toastr.warning('Please provide file', 'warning');
      return;
    }
    if (!this.uploadForm.storeLocationId) {
      this.toastr.warning('Please select store location', 'warning');
      return;
    }
    const fileToUpload = <File>files[0];
    const formData = new FormData();
    formData.append('file', fileToUpload, fileToUpload.name);
    // 'CMARK'
    // this.uploadForm.vendorCode = 'CMARK';
    this.dataImportService.postData('Invoice/EDIFileUpload?CompanyID=' + this.userInfo.companyId +
      '&StoreLocationID=' + this.uploadForm.storeLocationId + '&vendorcode=' + this.uploadForm.vendorCode + '&fileExtension=txt', formData)
      .subscribe(response => {
        if (response.type === HttpEventType.UploadProgress) {
          this.percentDone = Math.round((100 * response.loaded) / response.total);
          // tslint:disable-next-line: deprecation
        } else if (event instanceof HttpResponse) {
          this.uploadSuccess = true;
        }
        this.loadData(response['body']);
      });
  }
  loadData(body) {
    if (!body) {
      return;
    }

    this.ediRowData = body.data;
    this.isEDIUpload = false;
    this.isGDIGridShow = true;
  }
  cloneAction(params) {
    this.editParams = params;
    const postData = {
      filepath: params.data.invoiceDetails[0].fileName,
      invoiceNo: params.data.invoiceNo,
      StoreLocationID: this.uploadForm.storeLocationId,
      vendorCode: params.data.vendorCode,
      CompanyID: this.userInfo.companyId
    };
    this.spinner.show();
    this._setupService.getData('Invoice/GetEDIInvoiceByInvoiceNo?filepath=' + postData.filepath +
      '&invoiceNo=' + postData.invoiceNo + '&StoreLocationID=' + postData.StoreLocationID + '&vendorCode='
      + postData.vendorCode + '&CompanyID=' + postData.CompanyID+ '&UserName=' + this.userInfo.userName).subscribe(
        (response) => {
          this.spinner.hide();
          if (isNumber(response)) {
            this.commonService.invoiceid = Number(response);
            this.VendorInvoiceRoutering();
            return;
          }
          if (response && response.invoiceNo) {
            this.ediProcessRowData = response;
            this.isGDIGridShow = false;
            this.isProcessGDIGridShow = true;
          } else {
            this.toastr.error('Unable to fetch record');
          }
        }, (error) => {
          this.spinner.hide();
          console.log(error);
        }
      );
  }
  onRowSelected(params) {
    this.selectedItems = params.length;
    // this.selectedItemsIds = params ? params.map(x => x.data.itemID).join(',') : '';
  }
  ShowEDIUpload() {
    this.isEDIUpload = true;
    this.isGDIGridShow = false;
    this.isProcessGDIGridShow = false;
    this.editParams = null;
    this.uploadForm.departmentID = null;
    this.ediProcessRowData = null;
  }
  BacktoEDIInvoice() {
    this.isGDIGridShow = true;
    this.isProcessGDIGridShow = false;
    this.editParams = null;
    this.ediProcessRowData = null;
    this.uploadForm.departmentID = null;
    this.selectedItems = 0;
  }
  SelectStoreLocation(id) {
    this.isAddSellingPriceEDI = this.isAddRowEDI = false;
    if (id) {
      this._setupService.GetEDIProductName(id).subscribe(
        (response) => {
          if (response) {
            this.productNameForEDIRowData = response[0];
            this.departmentList = this.commonService._departmenEDIList = response[1];
            this.sellingPriceRowData = response[2];
            this.isAddSellingPriceEDI = this.isAddRowEDI = false;
          } else {
            this.productNameForEDIRowData = [];
            this.sellingPriceRowData = [];
            this.isAddSellingPriceEDI = this.isAddRowEDI = false;
          }
        }, (error) => {
          console.log(error);
        }
      );
    } else {
      this.productNameForEDIRowData = [];
      this.sellingPriceRowData = [];
    }
  }

  GetDepartmentByUpdateProductNameForEDI(id) {
    this.isAddRowEDI = false;
    this._setupService.getData('DepartmentLocation/GetDepartmentByUpdateProductNameForEDI/' + id).subscribe(
      (response) => {
        this.productNameForEDIRowData = response;
        this.isAddSellingPriceEDI = false;
        this.isAddRowEDI = false;
      },
      (error) => {

        this.isAddRowEDI = false;
      }
    );
  }

  GetDepartmentByUpdateSellingPrice(id) {
    this.isAddSellingPriceEDI = false;
    this._setupService.getData('DepartmentLocation/GetDepartmentByUpdateSellingPrice/' + id).subscribe(
      (response) => {
        this.sellingPriceRowData = response;
        this.isAddSellingPriceEDI = false;
      },
      (error) => {
        this.isAddSellingPriceEDI = false;
      }
    );
  }
  /* AddProductNameForEDI  Start  */

  AddProductNameForEDI() {
    if (!this.uploadForm.storeLocationId) {
      this.toastr.warning('Select Store Location', 'Warning');
      return;
    }
    if (this.isAddRowEDI) {
      this.toastr.error('Please save existing data first before adding another!');
      return;
    }
    this.isAddRowEDI = true;
    this.editableProductNameForEDIGridApi.updateRowData({
      add: [{
        departmentLocationID: 0,
        posDepartmentDescription: '',
        DepartmentID: 0,
        StoreLocationID: this.uploadForm.storeLocationId,
        UpdateDescInEDIInvoiceFlag: false,
        UpdateSellingPriceInEDIInvoiceFlag: false,
        isSaveRequired: true,
      }],
      addIndex: 0
    });
    this.getStartEDIEditingCell('posDepartmentDescription', 0);
  }
  // set edit cell
  getStartEDIEditingCell(_colKey, _rowIndex) {
    this.editableProductNameForEDIGridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }
  SaveProductNameForEDI(params) {
    // tslint:disable-next-line:max-line-length
    const findObj = _.find(this.commonService._departmenEDIList, ['departmentDescription', params.data.posDepartmentDescription]);

    if (!params.data.posDepartmentDescription || !findObj) {
      this.toastr.warning('Select Department', 'Warning');
      this.getStartEDIEditingCell('posDepartmentDescription', params.rowIndex);
      return;
    }
    this.spinner.show();
    // tslint:disable-next-line:max-line-length
    this._setupService.updateData(`DepartmentLocation/SaveEDIOptionDepartment?DepartmentID=${findObj.departmentID}&StoreLocationID=${this.uploadForm.storeLocationId}&UpdateDescInEDIInvoiceFlag=${true}&UpdateSellingPriceInEDIInvoiceFlag=${findObj.updateSellingPriceInEDIInvoiceFlag}`, '')
      .subscribe((response) => {
        this.spinner.hide();
        if (response === '1') {
          this.isAddRowEDI = false;
          this.toastr.success(this.constantService.infoMessages.addedRecord, 'Save');
          this.GetDepartmentByUpdateProductNameForEDI(this.uploadForm.storeLocationId);
        } else {
          this.toastr.error(this.constantService.infoMessages.addRecordFailed, 'Error');
        }
      }, (error) => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.addRecordFailed, 'Error');
      });


  }
  deleteRowProductNameForEDI(params) {
    if (params.data.departmentLocationID === 0) {
      this.editableProductNameForEDIGridApi.updateRowData({ remove: [params.data] });
      this.isAddRowEDI = false;
      this.getEDIRowData();
      return;
    }
  }
  getEDIRowData() {
    const arr = [];
    // tslint:disable-next-line:no-unused-expression
    this.editableProductNameForEDIGridApi && this.editableProductNameForEDIGridApi.forEachNode(function (node) {
      arr.push(node.data);
    });
    this.productNameForEDIRowData = arr;
  }
  /* AddProductNameForEDI  End  */
  /* SaveSellingPriceEDI  Start  */
  AddSellingPriceEDI() {
    if (!this.uploadForm.storeLocationId) {
      this.toastr.warning('Select Store Location', 'Warning');
      return;
    }
    if (this.isAddSellingPriceEDI) {
      this.toastr.error('Please save existing data first before adding another!');
      return;
    }
    this.isAddSellingPriceEDI = true;
    this.editableSellingGridApi.updateRowData({
      add: [{
        departmentLocationID: 0,
        posDepartmentDescription: '',
        DepartmentID: 0,
        StoreLocationID: this.uploadForm.storeLocationId,
        UpdateDescInEDIInvoiceFlag: false,
        UpdateSellingPriceInEDIInvoiceFlag: false,
        isSaveRequired: true,
      }],
      addIndex: 0
    });
    this.getStartSellingPriceEditingCell('posDepartmentDescription', 0);
  }
  // set edit cell
  getStartSellingPriceEditingCell(_colKey, _rowIndex) {
    this.editableSellingGridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }
  SaveSellingPriceEDI(params) {
    // tslint:disable-next-line:max-line-length
    const findObj = _.find(this.commonService._departmenEDIList, ['departmentDescription', params.data.posDepartmentDescription]);

    if (!params.data.posDepartmentDescription || !findObj) {
      this.toastr.warning('Select Department', 'Warning');
      this.getStartSellingPriceEditingCell('posDepartmentDescription', params.rowIndex);
      return;
    }
    this.spinner.show();
    // tslint:disable-next-line:max-line-length
    this._setupService.updateData(`DepartmentLocation/SaveEDIOptionDepartment?DepartmentID=${findObj.departmentID}&StoreLocationID=${this.uploadForm.storeLocationId}&UpdateDescInEDIInvoiceFlag=${false}&UpdateSellingPriceInEDIInvoiceFlag=${true}`, '')
      .subscribe((response) => {
        this.spinner.hide();
        if (response === '1') {
          this.isAddSellingPriceEDI = false;
          this.toastr.success(this.constantService.infoMessages.addedRecord, 'Save');
          this.GetDepartmentByUpdateSellingPrice(this.uploadForm.storeLocationId);
        } else {
          this.toastr.error(this.constantService.infoMessages.addRecordFailed, 'Error');
        }
      }, (error) => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.addRecordFailed, 'Error');
      });
  }

  deleteSellingPriceRow(params) {
    if (params.data.departmentLocationID === 0) {
      this.editableSellingGridApi.updateRowData({ remove: [params.data] });
      this.isAddSellingPriceEDI = false;
      this.getSellingPriceRowData();
      return;
    }
  }
  getSellingPriceRowData() {
    const arr = [];
    // tslint:disable-next-line:no-unused-expression
    this.editableSellingGridApi && this.editableSellingGridApi.forEachNode(function (node) {
      arr.push(node.data);
    });
    this.sellingPriceRowData = arr;
  }
  /* SaveSellingPriceEDI  End  */

  /*---- Save EDI File Process Start -------*/
  SaveEDIFileProcess() {
    const selectedRows = this.ValidateFileProcessGrid();
    console.log(selectedRows);
    if (selectedRows.length === 0) {
      this.toastr.warning('Please check the rows to save ', 'Warning');
      return;
    }
    if (!this.uploadForm.departmentID) {
      this.toastr.warning('Select Department', 'Warning');
      return;
    }
    // this.uploadForm.vendorCode = 'CMARK';
    const postData = {
      path: selectedRows[0].fileName,
      CompanyID: this.userInfo.companyId,
      StoreLocationID: this.uploadForm.storeLocationId,
      VnedorCode: this.uploadForm.vendorCode,
      UserName: this.userInfo.userName,
      invoiceNo: this.ediProcessRowData.invoiceNo,
      invoiceDetails: selectedRows
    };
    this.spinner.show();
    this._setupService.postData('Invoice/SaveEDIFileProcess?path=' + postData.path +
      '&CompanyID=' + postData.CompanyID + '&StoreLocationID=' + postData.StoreLocationID + '&VnedorCode='
      + postData.VnedorCode + '&UserName=' + postData.UserName + '&invoiceNo=' + postData.invoiceNo, postData.invoiceDetails)
      .subscribe(
        (response) => {
          this.spinner.hide();
          if (isNumber(response)) {
            this.commonService.invoiceid = Number(response);
            this.VendorInvoiceRoutering();
            return;
          }
          if (response && response.invoiceNo) {
            this.toastr.success(this.constantService.infoMessages.addedRecord, 'Save');
            this.ediProcessRowData = response;
            this.uploadForm.departmentID = null; this.selectedItems = 0;
          } else {
            this.toastr.error(this.constantService.infoMessages.alreadyExists, 'Error');
          }
        }, (error) => {
          this.spinner.hide();
          console.log(error);
          this.toastr.error(this.constantService.infoMessages.addRecordFailed, 'Error');
        }
      );
  }
  ValidateFileProcessGrid() {
    const selectedRows = this.ediProcessGridApi.getSelectedRows();
    const finalArray = [];
    const departId = this.uploadForm.departmentID;
    if (selectedRows) {
      selectedRows.forEach(x => {
        x['departmentID'] = departId;
        finalArray.push(x);
      });
    }
    return finalArray;
  }
  /*---- Save EDI File Process END -------*/
  VendorRoutering() {
    this.router.navigate(['invoice/vendor']);
  }
  VendorInvoiceRoutering() {
    this.router.navigate(['invoice/vendor-invoice']);
  }
}

