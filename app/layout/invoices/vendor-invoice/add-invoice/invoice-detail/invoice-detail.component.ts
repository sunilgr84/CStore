import { Component, OnInit, OnChanges, Input, ViewChild, TemplateRef, Output, EventEmitter, SimpleChanges, ElementRef, ViewChildren } from '@angular/core';
import { ModalDismissReasons, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ConstantService } from '@shared/services/constant/constant.service';
import { GridService } from '@shared/services/grid/grid.service';
import { EditableGridService } from '@shared/services/editableGrid/editable-grid.service';
import { GridApi, ColumnApi } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';
import { CommonService } from '@shared/services/commmon/common.service';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'lodash';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { MessageService } from '@shared/services/commmon/message-Service';
import { isNumber } from '@shared/utils/number-utils';
import { Router } from '@angular/router';
import { StoreService } from '@shared/services/store/store.service';
import { isObservable } from 'rxjs';
import { UtilityService } from '@shared/services/utility/utility.service';

@Component({
  selector: 'app-invoice-detail',
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.scss']
})
export class InvoiceDetailComponent implements OnInit, OnChanges {
  @Input() invoiceID: any;
  @Input() _invoiceDetail: any;
  @Input() invoiceAmount?: any;
  @Input() _vendorId: any;
  @Input() _storeLocationId: any;
  @Input() invoiceFileName: any;
  @Output() changeInvoiceAmt: EventEmitter<any> = new EventEmitter();
  @Output() backToInvocieList: EventEmitter<any> = new EventEmitter();
  @Output() backToInvocie: EventEmitter<any> = new EventEmitter();
  @Input() isClickSoftCopy: boolean;
  @Input() isClickSoftCopyClick: boolean;
  @Input() isSoftCopy: boolean;
  @Input() isClosePdf: boolean;
  @Input() invoiceStatusUpdated: any;
  @Input() invoiceStatusID: any;
  @ViewChild('ctdTabset') ctdTabset;
  disableEditing: boolean = false;
  gridOptions: any;
  invoiceChargesOptions: any;
  invoicePaymentOptions: any;
  closeResult: string;
  rowData = [];
  invoiceChargesGridRowData = [];
  invoiceChargesGridApi: any;
  invoicePaymentGridApi: any;
  gridApi: GridApi;
  columnApi: ColumnApi;
  newRowAdded = false;
  tempId = 0;
  addrow = 0;
  newRowAddedPaymentGrid = false;
  tempIdPaymentGrid = 0;
  addrowPaymentGrid = 0;
  userInfo = this.constants.getUserInfo();
  vendorCode: any;
  invoicePaymentGridRowData = [];
  initialInvoiceDetailForm: any;
  invoiceLastPOSCodeDetails: any;
  invoiceDetailsForm = this.fb.group({
    vendorID: [0],
    departmentID: [0],
    departmentTypeName: [''],
    description: [''],
    invoiceDetailID: ['0'],
    inventoryValuePrice: [0],
    noOfBaseUnitsInCase: [0],
    maxInventory: [0],
    minInventory: [0],
    invoiceID: [0],
    invoiceAmount: [0],
    createdDateTime: new Date(),
    sequenceNumber: [0],
    posCode: [''],
    itemID: [0],
    posCodeWithCheckDigit: [''],
    sellingUnits: [1],
    isMultipackFlag: [false],
    buyingCaseQuantity: [0],
    buyingUnitQuantity: [0],
    invoiceValuePrice: [0],
    casePrice: [0],
    storeLocItemPrice: [0],
    suggestedSellingPrice: [0],
    previousSellingPrice: [0],
    vendorItemCode: [''],
    departmentDescription: [''],
    updateDescInEDIInvoiceFlag: [false],
    updateSellingPriceInEDIInvoiceFlag: [false],
    unitsInCase: [0],
    buyDown: [0],
    storeLocationItemID: [0],
    regularSellPrice: [0],
    currentInventory: [0],
    itemCost: [0],
    profitMargin: [0],
    isMarge: [false],
    previousCostPrice: [0],
    totalItemCost: [0],
    totalSellPrice: [0],
    profitCost: [0],
    companyID: [0],
    activeFlag: [true],
    familyUPCCode: [''],
    lastModifiedBy: [''],
    lastModifiedDateTime: [''],
    storeLocationID: [0],
    storeName: [''],
    uomid: [0],
    vendorUnitCostPrice: [0]
  });
  invoiceGridApi: any;
  sequenceNumber: any;
  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  @ViewChild('modalAddItemContent') modalAddItemContent: TemplateRef<any>;
  @ViewChild('confirmAddItem') confirmAddItem: TemplateRef<any>;
  @ViewChild('unitQtyf') _unitQuantity: any;
  @ViewChild('caseInUnit') caseInUnit: any;
  @ViewChild('itemVendorCode') vendorCodeElement: ElementRef;
  // @ViewChild('itemVendorCode') set content(content: ElementRef) {
  //   this.vendorCodeElement = content;
  // }
  bellowTen: any;
  betweenTenToTwenty: any;
  betweenTwentyToThirty: any;
  betweenThirtyToForty: any;
  greaterForty: any;
  newItems: any;
  selectedRows: any;
  unitsInCaseOldValue: any;
  modalTitle: string;
  isMearge: boolean;
  _isCloseInvoice: any;
  isAddUpcItem = false;
  upcCodeInput: any;
  viewList = [
    { id: 'all', name: 'All' },
    { id: 'bellowTen', name: '< 10%' },
    { id: 'betweenTenToTwenty', name: '10% < 20%' },
    { id: 'betweenTwentyToThirty', name: '20% < 30%' },
    { id: 'betweenThirtyToForty', name: '30% < 40%' },
    { id: 'greaterForty', name: '> 40%' },
    { id: 'newItems', name: 'New Item' },
  ];
  isUnitQtyMoreThanUPC: boolean;
  _isSearchUPC: any = false;
  filterText: any;
  isSoftCopyOpen = false;
  rowDataDepartment = [];
  gridOptionsDepartment: any;
  isAddMoreInvoice = false;
  gridApiDepartTop: any;
  gridColumnApi: any;
  isBaseCaseQty = true;
  invoiceDetailLable: any;
  isMarkup = false;
  payTypeList = [
    {
      "paymentTermID": 1,
      "paymentTermDescription": "CHECK"
    },
    {
      "paymentTermID": 2,
      "paymentTermDescription": "ACH Debit"
    },
    {
      "paymentTermID": 3,
      "paymentTermDescription": "ACH Credit"
    }
  ]
  constructor(private modalService: NgbModal, private gridService: GridService, private constants: ConstantService,
    private editableGrid: EditableGridService, private toastr: ToastrService, private _setupService: SetupService,
    private commonService: CommonService, private fb: FormBuilder, private spinner: NgxSpinnerService,
    private messageService: MessageService, private router: Router, private storeService: StoreService, private utilityService: UtilityService) {
    this.gridOptions = this.editableGrid.getGridOption(this.constants.editableGridConfig.gridTypes.addInvoicesDetailsGrid);
    this.invoiceChargesOptions = this.editableGrid.getGridOption(this.constants.editableGridConfig.gridTypes.invoiceChargesGrid);
    this.invoicePaymentOptions = this.editableGrid.getGridOption(this.constants.editableGridConfig.gridTypes.invoicePaymentGrid);
    this.gridOptionsDepartment = this.gridService.getGridOption(this.constants.gridTypes.invoicesDepartmentDetailsGrid);
    this.initialInvoiceDetailForm = this.invoiceDetailsForm.value;
  }

  ngOnInit() {
    this.getInvoiceChargeTypeList();
    this.getDepartmentList();
    this.getBankPayTypes();
    if (this.invoiceID) {
      this.fetchInvoiceDetailsList();
      this.fetchInoviceChargeList();
      this.fetchInvoicePaymentByInvoiceID();
      this.fetchDepartmentDetailsListByInvoiceID();
    }
    if (this._invoiceDetail) {
      this.invoiceDetailLable = this._invoiceDetail;
      this.invoiceAmount = this._invoiceDetail.invoiceAmount;
    }
    this.updateGridOptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes._storeLocationId && changes._storeLocationId.currentValue != undefined
      && changes._vendorId && changes._vendorId.currentValue != undefined) {
      this.getPaymentSource();
    }

    if (changes.invoiceStatusUpdated) {
      if (changes.invoiceStatusUpdated.currentValue) {
        this.invoiceStatusUpdated = changes.invoiceStatusUpdated.currentValue[0].invoiceStatusDescription;
        this.fetchInvoicePaymentByInvoiceID();
        this._invoiceDetail.invoiceStatusID = changes.invoiceStatusUpdated.currentValue[0].invoiceStatusID;
        this.updateGridOptions();
      }
    }
    if (this.isClosePdf) {
      this.closePdf();
    }
    if (this.isSoftCopyOpen) {
      return;
    }
    if (this.isSoftCopy && (this.isClickSoftCopy || this.isClickSoftCopyClick)) {
      this.openPDF();
    }
  }

  get fv() { return this.invoiceDetailsForm.value; }

  onCellValueChanged(params) {
    params.data.i = this.invoicePaymentGridRowData.length;
    var colId = params.column.getId();
    if (colId === "methodOfPaymentDescription") {
      this.invoicePaymentGridApi.getRowNode(params.data.i).data[params.data.valuefield] = params.data.value;
      this.invoicePaymentGridApi.getRowNode(params.data.i).data["mopIndex"] = params.data.value;
      this.invoicePaymentGridApi.getRowNode(params.data.i).data[params.data.textfield] = params.data.text;
      var rowNodes = [this.invoicePaymentGridApi.getRowNode(params.data.i)];
      if (params.data.methodOfPaymentDescription) {
        const mopValue = params.data.methodOfPaymentDescriptionList.filter(x => { return x["value"] == parseInt(params.data.mopIndex) })[0];
        params.data.methodOfPaymentID = mopValue.methodOfPaymentID;
      }
      //  this.invoicePaymentGridApi.redrawRows(params);
      this.invoicePaymentGridApi.updateRowData({
        update: [this.invoicePaymentGridApi.getRowNode(params.data.i).data],
        //  index:0
      });
    }
    if (colId === "sourceName") {
      this.invoicePaymentGridApi.getRowNode(params.data.i).data[params.data.valuefield] = params.data.value;
      this.invoicePaymentGridApi.getRowNode(params.data.i).data["ind"] = params.data.value;
      this.invoicePaymentGridApi.getRowNode(params.data.i).data[params.data.textfield] = params.data.text;
      let selectedItem = this.commonService.invoicePaymentList.filter(x => { return x.index == parseInt(params.data.value) })[0];
      this.invoicePaymentGridApi.getRowNode(params.data.i).data.disablemethodOfPaymentDescription = false;
      let paymentSourceObject = this.commonService.invoicePaymentList.filter(x => { return x['index'] == parseInt(params.data.sourceName) })[0];
      let filteredMOPList = [];
      if (selectedItem["methodOfPaymentID"] == 5 || selectedItem["methodOfPaymentID"] == 6 || paymentSourceObject["storeBankID"] === null) {
        this.invoicePaymentGridApi.getRowNode(params.data.i).data["methodOfPaymentDescription"] = selectedItem["methodOfPaymentDescription"];
        this.invoicePaymentGridApi.getRowNode(params.data.i).data["methodOfPaymentID"] = selectedItem["methodOfPaymentID"];
        filteredMOPList = [];
        this.invoicePaymentGridApi.getRowNode(params.data.i).data.disablemethodOfPaymentDescription = true;
      } else {
        this.invoicePaymentGridApi.getRowNode(params.data.i).data["methodOfPaymentDescription"] = null;
        this.invoicePaymentGridApi.getRowNode(params.data.i).data["methodOfPaymentID"] = null;
        this.spinner.show();
        this._setupService.getData(`PaymentSource/GetAvailableMops/${paymentSourceObject["storeBankID"]}/${this._vendorId}/${this._storeLocationId}`).subscribe(res => {
          this.spinner.hide();
          if (res && res['statusCode']) {
            filteredMOPList = [];
          } else {
            filteredMOPList = res.map((x, index) => {
              return {
                ...x,
                value: index,
                methodOfPaymentDescriptionLabel: x.methodOfPaymentDescription,
                text: x.methodOfPaymentDescription
              };
            });
            this.invoicePaymentGridApi.getRowNode(params.data.i).data["methodOfPaymentDescriptionList"] = filteredMOPList;
            this.invoicePaymentGridApi.getRowNode(params.data.i).data["sourceNameList"] = this.getDDList();
            this.invoicePaymentGridApi.updateRowData({
              update: [this.invoicePaymentGridApi.getRowNode(params.data.i).data],
            });
            this.invoicePaymentGridApi.redrawRows();
          }
        }, err => {
          this.spinner.hide();
          this.toastr.error(this.constants.infoMessages.contactAdmin);
          console.log(err);
        });
      }
      // filteredMOPList = this.commonService.invoiceBankPayTypes.filter(x => { return x["isCheck"] == true })
      // else {if (selectedItem["methodOfPaymentID"] == 1) 
      //   filteredMOPList = this.commonService.invoiceBankPayTypes;
      // }
      // filteredMOPList = this.getPayTypeList(filteredMOPList);
    }
  }
  onGridReady(params) {
    this.invoiceGridApi = params.api;
    this.gridColumnApi = params.columnApi;
    // this.closePdf();
    this.gridColumnFit();
  }
  onInvoiceGridColHideShow(isShow) {
    if (!isShow && !this.isSoftCopyOpen) {
      this.gridColumnApi.setColumnsVisible(['vendorItemCode', 'departmentDescription',
        'itemCost', 'profitMargin'
      ], isShow);
    }
  }
  onReady(params) {
    this.invoiceChargesGridApi = params.api;
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    this.invoiceChargesGridApi.sizeColumnsToFit();
  }
  onInvoicePaymentReady(params) {
    this.invoicePaymentGridApi = params.api;
    this.invoicePaymentGridApi.sizeColumnsToFit();
  }
  resetInvoiceDetailForm() {
    this._isSearchUPC = false;
    this.invoiceDetailsForm.patchValue(this.initialInvoiceDetailForm);
    this.invoiceDetailsForm.get('sequenceNumber').setValue(this.sequenceNumber);
  }
  open(content: any) {
    const ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      size: 'lg'
    };
    this.modalService.open(content, ngbModalOptions).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    this.invoiceDetailsForm.patchValue(this.initialInvoiceDetailForm);
    this.invoiceDetailsForm.get('sequenceNumber').setValue(this.sequenceNumber);
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  getDDList() {
    const invoicePaymentList = this.commonService.invoicePaymentList;
    const finalArray = [];
    if (invoicePaymentList) {
      invoicePaymentList.forEach((x) => {
        const contct = (x.storeBankID == null ? x.sourceName : x.bankNickName);
        finalArray.push({ text: contct, value: x.index });
      });
    }
    return finalArray;
  }
  getPayTypeList(filteredList?) {
    const invoiceBankPayTypes = filteredList ? filteredList : this.commonService.invoiceBankPayTypes;
    const finalArray = [];
    if (invoiceBankPayTypes) {
      invoiceBankPayTypes.forEach((x) => {
        finalArray.push({ text: x.methodOfPaymentDescription, value: x.index });
      });
    }
    return finalArray;
  }
  createNewRowData() {
    this.tempId = this.invoiceChargesGridApi.getDisplayedRowCount();
    const list = this.getDDList();
    const newData = {
      id: this.tempId, invoiceChargeAmount: 0, invoiceChargeTypeDescription: '', invoiceChargeID: 0,
      invoiceChargeTypeID: 0, invoiceID: 0, invoiceChargeDescription: '', isSaveRequired: true, hidePrintAction: true, isEdit: true,
      storeBankID: null, methodOfPaymentDescriptionLabel: null, bankNickName: null, sourceNameList: list,
      methodOfPaymentDescriptionList: null, disablemethodOfPaymentDescription: true
    };
    return newData;
  }

  onInsertRowAt() {
    if (this.newRowAdded) {
      this.toastr.error('Please save existing data first before adding another!');
      return;
    }
    this.newRowAdded = true;
    const newItem = this.createNewRowData();

    this.invoiceChargesGridApi.updateRowData({
      add: [newItem],
      addIndex: 0
    });
    this.addrow = this.addrow + 1;
    this.getStartEditingCell('invoiceChargeTypeDescription', 0);
  }
  getStartEditingCell(_colKey, _rowIndex) {
    this.invoiceChargesGridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }
  getInvoiceChargeTypeList() {
    this._setupService.getData('InvoiceChargeType/GetAll').subscribe(res => {
      if (res && res['statusCode']) {
        this.commonService.invoiceChargeList = [];
        return;
      }
      this.commonService.invoiceChargeList = res;
    }, err => {
      console.log(err);
    });
  }
  fetchInvoiceDetailsList() {
    this._setupService.getData(`InvoiceDetail/GetByInvoiceID/${this.invoiceID}`).subscribe(res => {
      const myOrderedArray = _.sortBy(res, o => o.sequenceNumber);
      this.rowData = myOrderedArray ? myOrderedArray : [];
      this.commonService.invoiceDetailList = myOrderedArray;
      this.sequenceNumber = res.length > 0 ? this.rowData[this.rowData.length - 1].sequenceNumber : 0;
      this.sequenceNumber = ++this.sequenceNumber;
      this.invoiceDetailsForm.get('sequenceNumber').setValue(this.sequenceNumber);
      _.each(this.rowData, (data) => {
        data.deptList = this.getDepartmentList();
      });
      this.bellowTen = this.commonService.invoiceDetailList.filter((x) => {
        return x.profitMargin < 10;
      });
      this.betweenTenToTwenty = this.commonService.invoiceDetailList.filter((x) => {
        return x.profitMargin >= 10 && x.profitMargin < 20;
      });
      this.betweenTwentyToThirty = this.commonService.invoiceDetailList.filter((x) => {
        return x.profitMargin >= 20 && x.profitMargin < 30;
      });
      this.betweenThirtyToForty = this.commonService.invoiceDetailList.filter((x) => {
        return x.profitMargin >= 30 && x.profitMargin < 40;
      });
      this.greaterForty = this.commonService.invoiceDetailList.filter((x) => {
        return x.profitMargin >= 40;
      });
      this.newItems = this.commonService.invoiceDetailList.filter((x) => {
        return x.isNewItem === true;
      });
      this.setInvoiceAmount();
    }, err => {
      console.log(err);
    });
  }
  fetchInoviceChargeList() {
    this.newRowAdded = false;
    this._setupService.getData(`InvoiceCharge/Get/${this.invoiceID}`).subscribe(res => {
      if (res && res['statusCode']) {
        this.invoiceChargesGridRowData = [];
        return;
      }
      this.invoiceChargesGridRowData = res;
      this.setInvoiceAmount();
    }, err => {
      console.log(err);
    });
  }

  getDepartmentList() {
    let response = this.storeService.getDepartment(this.userInfo.companyId, this.userInfo.userName)
    if (isObservable(response)) {
      response.subscribe(
        (response) => {
          let deptList = this.storeService.departmentList;
          _.each(deptList, function (data) {
            data.value = data.departmentID;
            data.text = data.departmentDescription;
          });
          return deptList;
        });
    } else {
      let deptList = this.storeService.departmentList;
      _.each(deptList, function (data) {
        data.value = data.departmentID;
        data.text = data.departmentDescription;
      });
      return deptList;
    }
  }

  editAction(params) {
    this.invoiceDetailsForm.patchValue(params.data);
    document.getElementById('open_model').click();
  }
  saveInvoiceCharges(params) {
    // const checkDuplicate = _.find(this.invoiceChargesGridRowData,
    //   function (o) {
    //     return o.invoiceChargeTypeDescription === params.data.invoiceChargeTypeDescription &&
    //       o.invoiceChargeID !== params.data.invoiceChargeID;
    //   });
    // if (checkDuplicate) {
    //   this.toastr.warning('Invoice charge type already exist', 'warning');
    //   this.getStartEditingCell('invoiceChargeTypeDescription', params.rowIndex);
    //   return;
    // }
    const descriptionObj = _.find(this.commonService.invoiceChargeList,
      ['invoiceChargeTypeDescription', params.data.invoiceChargeTypeDescription]);
    if (params.data.invoiceChargeTypeDescription === '' || params.data.invoiceChargeTypeDescription === undefined || !descriptionObj) {
      this.toastr.warning('Select Invoice Charge Type...', 'warning');
      this.getStartEditingCell('invoiceChargeTypeDescription', params.rowIndex);
      return;
    }
    if (!params.data.invoiceChargeAmount) {
      this.toastr.warning('Enter Amount paid...', 'warning');
      return;
    }
    const postData = {
      invoiceChargeTypeID: Number(descriptionObj.invoiceChargeTypeID),
      invoiceChargeDescription: params.data.invoiceChargeDescription ? params.data.invoiceChargeDescription : '',
      invoiceChargeID: params.data.invoiceChargeID ? params.data.invoiceChargeID : 0,
      invoiceChargeTypeDescription: params.data.invoiceChargeTypeDescription,
      invoiceChargeAmount: params.data.invoiceChargeAmount,
      invoiceID: this.invoiceID,
    };
    this.spinner.show();
    this._setupService.updateData('InvoiceCharge/Update', postData).subscribe(res => {
      this.spinner.hide();
      if (res && res['statusCode']) {
        this.toastr.error(postData.invoiceChargeID !== 0 ? this.constants.infoMessages.updateRecordFailed :
          this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
        return;
      }
      this.newRowAdded = false;
      if (res) {
        this.toastr.success(postData.invoiceChargeID !== 0 ? this.constants.infoMessages.updatedRecord :
          this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
        this.fetchInoviceChargeList();
      } else {
        this.toastr.error(postData.invoiceChargeID !== 0 ? this.constants.infoMessages.updateRecordFailed :
          this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
      }
    }, err => {
      this.spinner.hide();
      this.toastr.error(this.constants.infoMessages.contactAdmin);
      console.log(err);
    });
  }
  searchVendorCode(params) {
    if (!params) {
      return;
    }
    this.vendorCode = params;
    const postData = {
      locationID: this._storeLocationId,
      vendorID: this._vendorId,
      vendorItemCode: params ? params : '0',
      companyID: this.userInfo.companyId,
      posCode: '0'
    };
    this.spinner.show();
    this._setupService.postData(`InvoiceDetail/GetItemwithLastvendorPriceByVendorCode`, postData)
      .subscribe(res => {
        this.spinner.hide();
        if (res && res[0]) {
          // tslint:disable-next-line:no-unused-expression
          res[0] ? this.invoiceDetailsForm.patchValue(res[0]) : '';
          this.unitsInCaseOldValue = res[0].unitsInCase;
          this.invoiceDetailsForm.get('sequenceNumber').setValue(this.sequenceNumber);
          this._isSearchUPC = true;
          if (res[0].unitsInCase === 1) {
            this.isBaseCaseQty = false;
          }
        } else {
          this.toastr.warning('Vendor Code is not found..!', 'warning');
        }
      }, err => {
        this.spinner.hide();
        console.log(err);
      });
  }
  searchUPCCode(params) {
    if (!params) {
      return;
    }
    if (this._isSearchUPC) {
      return;
    }
    this.isAddUpcItem = false;
    this.isMearge = false;
    const postData = {
      locationID: this._storeLocationId,
      vendorID: this._vendorId,
      posCode: params,
      vendorItemCode: this.invoiceDetailsForm.get('vendorItemCode').value ? this.invoiceDetailsForm.get('vendorItemCode').value : '0',
      companyID: this.userInfo.companyId,
    };
    this.spinner.show();
    this._setupService.postData(`InvoiceDetail/GetItemWithLastVendorPrice`, postData)
      .subscribe(res => {
        this.spinner.hide();
        if (res && res[0]) {
          this._isSearchUPC = true;
          this.invoiceLastPOSCodeDetails = res[0];
          // tslint:disable-next-line:no-unused-expression
          this.invoiceDetailsForm.patchValue(res[0]);
          this.unitsInCaseOldValue = res[0].unitsInCase;
          this.invoiceDetailsForm.get('sequenceNumber').setValue(this.sequenceNumber);
          this.invoiceDetailsForm.get('invoiceValuePrice').setValue(res[0].inventoryValuePrice.toFixed(3));
          this.calculateCaseCost();
          if (res[0].unitsInCase === 1) {
            this.isBaseCaseQty = false;
          }
          if (this.caseInUnit && this.caseInUnit.nativeElement) {
            this.caseInUnit.nativeElement.focus();
          }
        } else {
          this._isSearchUPC = false;
          this.isAddUpcItem = true;
          this.isMearge = false;
          this.confirmItem(this.confirmAddItem, 'sm');
        }
      }, err => {
        this.spinner.hide();
        console.log(err);
      });
  }
  confirmItem(content: any, size: any) {
    const ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      // keyboard: false,
      size: size
    };
    this.upcCodeInput = this.invoiceDetailsForm.get('posCode').value;
    // content.preventDefault();
    this.modalService.open(content, ngbModalOptions).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  mergeItemYes() {
    document.getElementById('mergeItemClose').click();
    if (this.isAddUpcItem === true) {
      this.confirmItem(this.modalAddItemContent, 'lg');
    } else {
      if (this.isMearge === true) {
        this.invoiceDetailsForm.get('isMarge').setValue(true);
        this.saveInvoiceDetail();

      } else {
        this.isCheckMergeItem();
      }
    }
  }
  mergeItemNo() {
    document.getElementById('mergeItemClose').click();
    if (this.isAddUpcItem === true) {

    } else {
      if (this.isMearge === true) {
        this.invoiceDetailsForm.get('isMarge').setValue(false);
        this.saveInvoiceDetail();
      } else {
        this.invoiceDetailsForm.get('unitsInCase').setValue(this.unitsInCaseOldValue);
        this.isCheckMergeItem();
      }
    }
  }
  addNewInvoiceAndClose(isClose) {
    this._isCloseInvoice = isClose;

    if ((this.invoiceDetailsForm.get('buyingUnitQuantity').value === 0 || this.invoiceDetailsForm.get('buyingUnitQuantity').value === 0)) {
      if (this.invoiceDetailsForm.get('buyingCaseQuantity').value === '' || this.invoiceDetailsForm.get('buyingCaseQuantity').value === 0) {
        this.toastr.warning('Please enter buying unit qty or buying case qty');
        return;
      }
    }
    if (this.isUnitQtyMoreThanUPC) {
      this.toastr.error('Unit quantity can not more than unit per case!');
      return;
    }
    if (this.invoiceDetailsForm.invalid) {
      return;
    }
    if (this.invoiceDetailsForm.valid) {
      const id = this.invoiceDetailsForm.get('itemID').value;
      if (id === undefined || id <= 0) {
        this.toastr.error('UPC Code invalid..!', 'error');
        return;
      }
      if (this.invoiceDetailsForm.get('unitsInCase').value !== this.unitsInCaseOldValue) {
        this.modalTitle = 'Do you really want to update the primary Units In Case?';
        this.isMearge = false;
        this.modalService.open(this.modalContent, { size: 'sm' });
      } else {
        this.isCheckMergeItem();
      }
    }
  }
  isCheckMergeItem() {
    let invoiceDetails: any;
    this.rowData.map((x) => {
      if (x.posCode === this.invoiceDetailsForm.value.posCode) {
        return invoiceDetails = x;
      }
    });
    if (!invoiceDetails) {
      this.saveInvoiceDetail();
    } else {
      this.modalTitle = 'Do you want to Merge item?';
      this.isMearge = true;
      this.modalService.open(this.modalContent, { size: 'sm' });
    }
  }
  saveInvoiceDetail() {
    const id = this.invoiceDetailsForm.get('itemID').value;
    if (id === undefined || id <= 0) {
      this.toastr.error('UPC Code invalid..!', 'error');
      return;
    }
    const postData = {
      ...this.invoiceDetailsForm.value,
      invoiceID: this.invoiceID,
      invoiceDetailID: this.invoiceDetailsForm.value.invoiceDetailID,
      lastModifiedBy: this.userInfo.userName,
      lastModifiedDateTime: new Date(),
      companyID: this.userInfo.companyId,
      isMultipackFlag: false,
      updateDescInEDIInvoiceFlag: false,
      updateSellingPriceInEDIInvoiceFlag: false,
      isMarge: this.invoiceDetailsForm.value.isMarge,
      vendorID: this._invoiceDetail && this._invoiceDetail.vendorID ? this._invoiceDetail.vendorID : this._vendorId,
      invoiceAmount: this._invoiceDetail && this._invoiceDetail.invoiceAmount ? this._invoiceDetail.invoiceAmount : 0,
      storeLocationID: this._invoiceDetail && this._invoiceDetail.storeLocationID ?
        this._invoiceDetail.storeLocationID : this._storeLocationId,
      storeName: this._invoiceDetail && this._invoiceDetail.storeName ? this._invoiceDetail.storeName : '',
      uomid: this._invoiceDetail && this._invoiceDetail.uomid ? this._invoiceDetail.uomid : 0,
      vendorItemCode: this.invoiceDetailsForm.value.vendorItemCode ? this.invoiceDetailsForm.value.vendorItemCode : 0
    };
    let updateUnitIncase = 'nochange';
    if (this.invoiceLastPOSCodeDetails && this.invoiceLastPOSCodeDetails.unitsInCase !== this.invoiceDetailsForm.value.unitsInCase) {
      updateUnitIncase = 'UpdateBothUnitInCase';
    }
    this.spinner.show();
    this._setupService.updateData(`InvoiceDetail/UpdateLocationID/${updateUnitIncase}`, postData).subscribe(res => {
      this.spinner.hide();
      if (res && res['statusCode']) {
        this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
        return;
      }
      if (res) {
        this.resetInvoiceDetailForm();
        this.fetchInvoiceDetailsList();
        this.toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
        if (this._isCloseInvoice) {
          // document.getElementById('closeModal').click();
          this.isAddMoreInvoice = false;
        }
        setTimeout(() => {
          if (this.vendorCodeElement && this.vendorCodeElement.nativeElement) {
            this.vendorCodeElement.nativeElement.focus();
          }
        }, 0);
      } else {
        this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
      }
    }, err => {
      this.spinner.hide();
      this.toastr.error(this.constants.infoMessages.contactAdmin);
      console.log(err);
    });
  }
  deleteChargesInvoiceDetails(params) {
    if (params.data.invoiceChargeID === 0) {
      this.newRowAdded = false;
      this.invoiceChargesGridApi.updateRowData({ remove: [params.data] });
      return;
    }
    const invoiceChargeID = params.data.invoiceChargeID;
    this.spinner.show();
    this._setupService.deleteData(`InvoiceCharge/${invoiceChargeID}`).subscribe(res => {
      this.spinner.hide();
      this.fetchInoviceChargeList();
      this.newRowAdded = false;
      if (res === '1') {
        this.toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.success);
      } else {
        this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
      }
    }, err => {
      this.spinner.hide();
      console.log(err);
      this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
    });
  }
  fetchInvoicePaymentByInvoiceID() {
    let invoiceStatus;
    if (this.invoiceStatusUpdated) {
      invoiceStatus = this.invoiceStatusUpdated;
    } else if (this._invoiceDetail) {
      invoiceStatus = this._invoiceDetail.invoiceStatusDescription;
    } else {
      invoiceStatus = "In-Progress";
    }
    this._setupService.getData(`InvoicePayment/GetInvoicePayment/${this.invoiceID}`)
      .subscribe(res => {
        this.newRowAddedPaymentGrid = false;
        if (res && res['statusCode']) {
          this.invoicePaymentGridRowData = [];
          return;
        }
        _.forEach(res, (value) => {
          value.invoiceStatus = invoiceStatus;
          value.isEdit = false;
          value.methodOfPaymentDescriptionLabel = value.paymentMethodOfDescription;
          value.sourceNameLabel = value.storeBankID == null ? value.sourceName : value.bankNickName;
          value.sourceNameList = this.getDDList();
        });
        this.invoicePaymentGridRowData = res;
        this.setInvoiceAmount();
      }, err => {
        console.log(err);
      });
  }
  onInsertRowPaymentGrid() {
    if (this.newRowAddedPaymentGrid) {
      this.toastr.error('Please save existing data first before adding another!');
      return;
    }
    this.newRowAddedPaymentGrid = true;
    const newItem = this.createNewRowData();
    this.invoicePaymentGridApi.updateRowData({
      add: [newItem],
      addIndex: 0
    });
    this.invoicePaymentGridApi.redrawRows();
    this.addrowPaymentGrid = this.addrowPaymentGrid + 1;
    this.getStartPaymentGridEditingCell('sourceName', 0);
  }
  getStartPaymentGridEditingCell(_colKey, _rowIndex) {
    this.invoicePaymentGridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }
  saveInvoicePaymentDetails(params) {
    const checkDuplicate = _.find(this.invoicePaymentGridRowData,
      function (o) {
        return o.sourceName === params.data.sourceName &&
          o.invoicePaymentID !== params.invoicePaymentID;
      });
    if (checkDuplicate) {
      this.toastr.warning('Source Name already exist', 'warning');
      this.getStartPaymentGridEditingCell('sourceName', params.rowIndex);
      return;
    }
    let paymentSourceObject = this.commonService.invoicePaymentList.filter(x => { return x['index'] == parseInt(params.data.sourceName) })[0];
    params.data["storeBankID"] = paymentSourceObject.storeBankID;
    params.data["bankNickName"] = paymentSourceObject.bankNickName;
    params.data.sourceNameText = this.commonService.invoicePaymentList.filter(x => { return x.index == parseInt(params.data.sourceName) }).map(y => { return y.sourceName })[0];
    const descriptionObj = _.find(this.commonService.invoicePaymentList, ['sourceName', params.data.sourceNameText]);
    if (params.data.sourceName === '' || params.data.sourceName === undefined || !descriptionObj) {
      this.toastr.warning('Select Source Name...', 'warning');
      return;
    }
    if (!params.data.amountPaid) {
      this.toastr.warning('Enter Amount paid...', 'warning');
      return;
    }
    if (!params.data.methodOfPaymentID && !params.data.methodOfPaymentDescription) {
      this.toastr.warning('Select Bank Pay Type...', 'warning');
      return;
    }
    const postData = {
      amountPaid: params.data.amountPaid ? Number(params.data.amountPaid) : 0,
      checkNumber: params.data.checkNumber ? Number(params.data.checkNumber) : 0,
      memo: params.data.memo,
      paymentSourceID: Number(descriptionObj.paymentSourceID) ? Number(descriptionObj.paymentSourceID) : params.data.paymentSourceID,
      sourceName: params.data.sourceNameText,
      lastModifiedBy: this.userInfo.userName,
      lastModifiedDateTime: new Date(),
      invoiceID: this.invoiceID,
      vendorID: this._vendorId,
      loginUserName: this.userInfo.userName,
      vendorName: this._invoiceDetail && this._invoiceDetail.vendorName ? this._invoiceDetail.vendorName : '',
      invoicePaymentID: params.data.invoicePaymentID ? params.data.invoicePaymentID : 0,
      expenseTypeID: 0,
      isVendor: true,
      paymentID: params.data.paymentID ? params.data.paymentID : 0,
      companyID: this.userInfo.companyId,
      createdDateTime: new Date(),
      paymentLocalIP: '',
      paymentMachineName: '',
      paymentExternalIP: '',
      paymentMACAddress: '',
      movementHeaderID: null,
      payeeName: '',
      paymentMethodOfID: params.data.methodOfPaymentID,
      paymentMethodOfDescription: params.data.methodOfPaymentDescriptionLabel,
      lastCheckNumber: 0,
      routingNumber: '',
      accountNumber: '',
      stateCode: '',
      storeBankID: params.data.storeBankID,
      bankNickName: params.data.bankNickName
    };
    this.spinner.show();
    this._setupService.updateData('InvoicePayment/UpdateAll', postData).subscribe(res => {
      this.newRowAddedPaymentGrid = false;
      this.spinner.hide();
      if (res && res.statusCode === 400) {
        if (res && res.result && res.result.validationErrors[0]) {
          this.toastr.error(res.result.validationErrors[0].errorMessage, res.message);
        }
        return;
      }
      if (res && Number(res) > 0) {
        this.fetchInvoicePaymentByInvoiceID();
        this.toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
      } else {
        this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
      }
    }, err => {
      this.spinner.hide();
      console.log(err);
      this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
    });
  }
  deleteInvoicePaymentDetails(params) {
    const invoicePaymentID = params.data.invoicePaymentID;
    if (invoicePaymentID === 0 || invoicePaymentID === undefined) {
      this.newRowAddedPaymentGrid = false;
      this.invoicePaymentGridApi.updateRowData({ remove: [params.data] });
      return;
    }
    this.spinner.show();
    this._setupService.deleteData(`InvoicePayment/${invoicePaymentID}`).subscribe(res => {
      this.spinner.hide();
      if (res && res['statusCode']) {
        this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
        return;
      }
      if (res && Number(res) > 0) {
        this.newRowAddedPaymentGrid = false;
        this.fetchInvoicePaymentByInvoiceID();
        this.toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.success);
      } else {
        this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
      }
    }, err => {
      this.spinner.hide();
      this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
    });
  }

  printCheck(params) {
    let printCheckWindow = null;
    printCheckWindow = window.open("/#/print-check/" + params.data.paymentSourceID + "/" + params.data.paymentID + "/" + this.userInfo.userName + "/" + params.data.storeBankID, "_blank");
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
        let node = this.invoicePaymentGridApi.getRowNode(params.rowIndex);
        node.setData(params.data);
        this.invoicePaymentGridApi.redrawRows();
      }
    }, false);
  }

  getPaymentSource() {
    setTimeout(() => {
      this._setupService.getData('PaymentSource/GetPaymetSourceByVendor/' + this.userInfo.companyId + '/' + this._storeLocationId + '/' + this._vendorId).subscribe(res => {
        if (res && (res['statusCode'])) {
          this.commonService.invoicePaymentList = [];
        } else {
          res.forEach((x, i) => {
            x.index = i;
          })
          this.commonService.invoicePaymentList = res;
        }
      }, err => {
        console.log(err);
      });
    });
  }
  getBankPayTypes() {
    this._setupService.getData('MethodOfPayment/GetAllMOP').subscribe(res => {
      if (res && (res['statusCode'])) {
        this.commonService.invoiceBankPayTypes = [];
      } else {
        res.forEach((x, i) => {
          x.index = i;
        })
        this.commonService.invoiceBankPayTypes = res;
      }
    }, err => {
      console.log(err);
    });
  }
  deleteInvoiceDetails(params) {
    const invoiceDetailID = params.data.invoiceDetailID;
    this.spinner.show();
    this._setupService.deleteData(`InvoiceDetail/Delete/${invoiceDetailID}/${this.userInfo.userName}`).subscribe(res => {
      this.spinner.hide();
      if (res === '1') {
        this.fetchInvoiceDetailsList();
        this.toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.success);
      } else {
        this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
      }
    }, err => {
      this.spinner.hide();
      this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
    });
  }

  calculateUnitPerCostFrm() {
    if (Number(this.fv.buyingUnitQuantity) === 0 && Number(this.fv.buyingCaseQuantity) === 0) {
      return;
    }
    if (Number(this.fv.buyingUnitQuantity) > 0 || Number(this.fv.buyingUnitQuantity) < 0) {
      this.invoiceDetailsForm.get('buyingCaseQuantity').setValue(0);
      return;
    }
    // let txtcost: any;
    // txtcost = this.invoiceDetailsForm.get('casePrice').value;
    // if (parseFloat(txtcost) === txtcost) {

    // } else {
    //   this.invoiceDetailsForm.get('casePrice').setValue(0);
    // }

    // let UnitsInCase = 0;
    // let buyingCost = 0;
    let ItemCost = 0;
    const cost = 0;
    // let records = App.dsInvoiceDetail.data.items[0];
    let records: any;
    records = this.invoiceDetailsForm.value;
    // if (txtcost != null) {
    //   cost = txtcost;
    // }
    if (this.invoiceDetailsForm.get('buyingCaseQuantity').value !== '' &&
      Number(this.invoiceDetailsForm.get('buyingCaseQuantity').value) !== 0) {
      this.invoiceDetailsForm.get('buyingUnitQuantity').setValue(0);
      let caseqty: any;
      caseqty = this.invoiceDetailsForm.get('buyingCaseQuantity').value;
      ItemCost = caseqty * cost;
      // tslint:disable-next-line:max-line-length
    } else if (this.invoiceDetailsForm.get('buyingUnitQuantity').value !== '' && this.invoiceDetailsForm.get('buyingUnitQuantity').value !== 0) {
      this.invoiceDetailsForm.get('buyingCaseQuantity').setValue(0);
      let unitqty: any;
      unitqty = this.invoiceDetailsForm.get('buyingUnitQuantity').value;
      let unitInCase = 0;
      unitInCase = this.invoiceDetailsForm.get('unitsInCase').value;
      if (Number(unitqty) > Number(unitInCase)) {
        // this._unitQuantity.nativeElement.focus();
        this.toastr.error('Unit quantity can not more than unit per case!');
        this.isUnitQtyMoreThanUPC = true;
        return;
      } else { this.isUnitQtyMoreThanUPC = false; }
      ItemCost = (unitqty * cost) / records.unitsInCase;
    }
    this.calculateCaseCost();
    // buyingCost = (cost * records.sellingUnits) / records.unitsInCase;
    // if (cost > 0) {
    //   // this.invoiceDetailsForm.get('regularSellPrice').setValue(buyingCost.toFixed(2));
    //   this.invoiceDetailsForm.get('regularSellPrice').setValue(Number(buyingCost.toFixed(2)));
    // }
    // this.invoiceDetailsForm.get('totalItemCost').setValue(Number(ItemCost.toFixed(2)));
    // this.calculateMarginFrm();
  }
  calculateBuyingUnitQtyFrm() {
    if (Number(this.fv.buyingUnitQuantity) === 0 && Number(this.fv.buyingCaseQuantity) === 0) {
      return;
    }
    if (Number(this.fv.buyingCaseQuantity) > 0 || Number(this.fv.buyingCaseQuantity) < 0) {
      this.invoiceDetailsForm.get('buyingUnitQuantity').setValue(0);
      return;
    }
    if (Number(this.invoiceDetailsForm.get('buyingCaseQuantity').value) <= 0 &&
      (Number(this.invoiceDetailsForm.get('buyingUnitQuantity').value) >= 0 ||
        Number(this.invoiceDetailsForm.get('buyingUnitQuantity').value) < 0)) {
      let x = Number(this.invoiceDetailsForm.get('buyingUnitQuantity').value) *
        Number(this.invoiceDetailsForm.get('invoiceValuePrice').value);
      if (!isNumber(x)) { x = 0; }
      this.invoiceDetailsForm.get('totalItemCost').setValue(x.toFixed(2));
    }
  }
  calculateMarginFrm() {
    let txtRegularSellingPrice: any;
    txtRegularSellingPrice = Number(this.invoiceDetailsForm.get('sellingUnits').value);
    if (parseFloat(txtRegularSellingPrice) === txtRegularSellingPrice) {

    } else {
      this.invoiceDetailsForm.get('sellingUnits').setValue(0);

    }

    let rSellPrice = 0;
    let unitCostPrice = 0;
    // let margin = 0;
    let records: any;
    records = this.invoiceDetailsForm.value;
    if (this.invoiceDetailsForm.get('sellingUnits').value !== '') {
      rSellPrice = Number(this.invoiceDetailsForm.get('sellingUnits').value);
    }
    if (this.invoiceDetailsForm.get('invoiceValuePrice').value !== '') {
      unitCostPrice = this.invoiceDetailsForm.get('regularSellPrice').value;
    }
    let x: any;
    x = rSellPrice - (unitCostPrice - records.buyDown);
    if (rSellPrice === 0) {
      rSellPrice = 1;
    }
    let z: number;
    z = (x * 100) / rSellPrice;
    if (this.invoiceDetailsForm.get('sellingUnits').value === 0) {
      this.invoiceDetailsForm.get('profitMargin').setValue(0);
    } else {
      this.invoiceDetailsForm.get('sellingUnits').setValue(Number(z.toFixed(2)));
    }
    //  setTimeout("App.txtDSrNo.focus();App.txtDSrNo.selectText();", 100);

  }
  calculateSelling() {
    // let txtProfitMargin = App.txtProfitMargin.getValue();
    let txtProfitMargin: any;
    txtProfitMargin = Number(this.invoiceDetailsForm.get('profitMargin').value);
    if (parseFloat(txtProfitMargin) === txtProfitMargin) {

    } else {
      // App.txtProfitMargin.setValue(0);
      this.invoiceDetailsForm.get('profitMargin').setValue(0);
    }

    let profitMargin = 0;
    let unitCostPrice = 0;
    // let rSellPrice = 0;
    // let records = App.dsVendorInvoiceDetail.data.items[invDCurrentRowIndex];
    let records: any;
    records = this.invoiceDetailsForm.value;
    if (this.invoiceDetailsForm.get('profitMargin').value !== '') {
      profitMargin = Number(this.invoiceDetailsForm.get('profitMargin').value);
    }
    if (this.invoiceDetailsForm.get('casePrice').value !== '') {
      unitCostPrice = Number(this.invoiceDetailsForm.get('casePrice').value);
    }

    let x;
    let z;
    x = 100 * unitCostPrice;
    z = x / (100 - profitMargin);

    if (z > 0) {
      // App.txtRegularSellingPrice.setValue(z.toFixed(2));
      this.invoiceDetailsForm.get('sellingUnits').setValue(z.toFixed(2));
    } else {
      // App.txtRegularSellingPrice.setValue(0);
      this.invoiceDetailsForm.get('sellingUnits').setValue(0);
    }
    // saveInvoiceDetail();
  }
  bulkUpdateInvoiceDetailChanges() {
    const array = [];
    const userName = this.userInfo.userName;
    const companyID = this.userInfo.companyId;
    if (this.selectedRows) {
      this.selectedRows.forEach(function (x: any, i: number) {
        x['lastModifiedBy'] = userName;
        x['companyID'] = companyID;
        x['lastModifiedDateTime'] = new Date();
        x['deptList'] = null;
        array.push(x);
      });
    } else { return; }
    this.spinner.show();
    this._setupService.updateData('InvoiceDetail/UpdateInvoiceDetailSelect', array).subscribe((response) => {
      this.spinner.hide();
      if (response && response['statusCode']) {
        this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
        return;
      }
      if (response && Number(response) > 0) {
        this.spinner.hide();
        this.fetchInvoiceDetailsList();
        this.toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
      } else {
        this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
      }
    }, (error) => {
      this.spinner.hide();
      this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
    });
  }

  saveInvoiceDetails(params) {
    const array = [];
    const userName = this.userInfo.userName;
    const companyID = this.userInfo.companyId;
    params.data['lastModifiedBy'] = userName;
    params.data['companyID'] = companyID;
    params.data['lastModifiedDateTime'] = new Date();
    array.push(params.data);
    this.spinner.show();
    this._setupService.updateData('InvoiceDetail/UpdateInvoiceDetailSelect', array).subscribe((response) => {
      this.spinner.hide();
      if (response && response['statusCode']) {
        this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
        return;
      }
      if (response && Number(response) > 0) {
        this.spinner.hide();
        this.fetchInvoiceDetailsList();
        this.toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
      } else {
        this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
      }
    }, (error) => {
      this.spinner.hide();
      this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
    });
  }

  invoiceDetailRowSelected(params) {
    this.selectedRows = params ? params.map((x) => x.data) : null;
  }

  refreshSellingPrice() {
    // if (!this.selectedRows) { return; }
    const storeLocationItemIDs = this.rowData.map(x => x.storeLocationItemID).join(',');
    const invoiceDetailIDs = this.rowData.map(x => x.invoiceDetailID).join(',');
    this.spinner.show();
    // tslint:disable-next-line:max-line-length
    this._setupService.updateData('Invoice/UpdateInvoicePriceByItemSellPrice/' +
      this.invoiceID + '/' + storeLocationItemIDs + '/' + invoiceDetailIDs + '/' + this.userInfo.companyId, '')
      .subscribe((response) => {
        this.spinner.hide();
        if (response && response['statusCode']) {
          this.toastr.error('Invoice Price Refresh Failed !', this.constants.infoMessages.error);
          return;
        }
        if (response === '1') {
          this.fetchInvoiceDetailsList();
          this.toastr.success('Invoice Price Refresh Successfully !', this.constants.infoMessages.success);
        } else {
          this.toastr.error('Invoice Price Refresh Failed !', this.constants.infoMessages.error);
        }
      }, (error) => {
        this.spinner.hide();
        this.toastr.error('Invoice Price Refresh Failed!', this.constants.infoMessages.error);
        console.log(error);
      });
  }

  bulkDeleteInvoiceDetails() {
    if (!this.selectedRows) { return; }
    const invoiceDetailID = this.selectedRows.map(x => x.invoiceDetailID).join(',');
    this.spinner.show();
    this._setupService.deleteData(`InvoiceDetail/Delete/${invoiceDetailID}/${this.userInfo.userName}`).subscribe(res => {
      this.spinner.hide();
      if (res === '1') {
        this.fetchInvoiceDetailsList();
        this.toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.success);
      } else {
        this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
      }
    }, err => {
      this.spinner.hide();
      this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
    });
  }
  closeModel(params) {
    if (params.isClose === true) {
      this.invoiceDetailsForm.get('posCode').setValue(params.posCode);
      this.searchUPCCode(params.posCode);
      document.getElementById('close_addItemModel').click();
    }
  }

  calculateCaseCost() {
    let buyingCost = 0;
    let unitsInCase = 0;
    let caseCost = 0;
    buyingCost = this.invoiceDetailsForm.get('invoiceValuePrice').value;
    unitsInCase = this.invoiceDetailsForm.get('unitsInCase').value;
    caseCost = buyingCost * unitsInCase;
    if (!isNumber(caseCost)) { caseCost = 0; }
    this.invoiceDetailsForm.get('casePrice').setValue(Number(caseCost).toFixed(2));
    this.calculateTotalCost();
    this.calculateMargin();
  }

  calculateTotalCost() {
    let buyingCase = 0;
    let _buyingUnitQuantity = 0;
    let caseCost = 0;
    let totalCost = 0;
    buyingCase = Number(this.invoiceDetailsForm.get('buyingCaseQuantity').value);
    _buyingUnitQuantity = Number(this.invoiceDetailsForm.get('buyingUnitQuantity').value);
    caseCost = Number(this.invoiceDetailsForm.get('casePrice').value);
    // if (buyingCase === 0 || buyingCase === null) {
    //   buyingCase = this.invoiceDetailsForm.get('buyingUnitQuantity').value;
    //   let buyingCost = 0;
    //   buyingCost = this.invoiceDetailsForm.get('invoiceValuePrice').value;
    //   totalCost = buyingCase * buyingCost;
    //   this.invoiceDetailsForm.get('totalItemCost').setValue(Number(totalCost).toFixed(2));
    // } else {
    //   totalCost = buyingCase * caseCost;
    //   this.invoiceDetailsForm.get('totalItemCost').setValue(Number(totalCost).toFixed(2));
    // }
    if ((buyingCase > 0 || buyingCase < 0) && _buyingUnitQuantity === 0) {
      totalCost = buyingCase * caseCost;
      if (!isNumber(totalCost)) { totalCost = 0; }
      this.invoiceDetailsForm.get('totalItemCost').setValue(Number(totalCost).toFixed(2));
    }
    if ((_buyingUnitQuantity > 0 || _buyingUnitQuantity < 0) && buyingCase === 0) {
      let buyingCost = 0;
      buyingCost = Number(this.invoiceDetailsForm.get('invoiceValuePrice').value);
      totalCost = _buyingUnitQuantity * buyingCost;
      if (!isNumber(totalCost)) { totalCost = 0; }
      this.invoiceDetailsForm.get('totalItemCost').setValue(Number(totalCost).toFixed(2));
    }
  }

  calculateBuyingCost() {
    let buyingCost = 0;
    let unitsInCase = 0;
    let caseCost = 0;
    caseCost = this.invoiceDetailsForm.get('casePrice').value;
    unitsInCase = this.invoiceDetailsForm.get('unitsInCase').value;
    if (Number(caseCost) > 0) {
      buyingCost = caseCost / unitsInCase;
      if (!isNumber(buyingCost)) { buyingCost = 0; }
      this.invoiceDetailsForm.get('invoiceValuePrice').setValue(Number(buyingCost).toFixed(3));
      this.calculateTotalCost();
      this.calculateMargin();
    }

    // this.calculateMarginFrm();
  }
  unitInCaseChange() {
    this.isBaseCaseQty = true;
    if (this.fv.unitsInCase.toString() === '1') {
      this.isBaseCaseQty = false;
    }
    this.calculateBuyingCost();
  }
  totalCostChange() {
    const totalCost = this.invoiceDetailsForm.get('totalItemCost').value;
    const buyingCaseQuantity = this.invoiceDetailsForm.get('buyingCaseQuantity').value;
    const buyingUnitQuantity = this.invoiceDetailsForm.get('buyingUnitQuantity').value;
    if (Number(this.invoiceDetailsForm.get('buyingCaseQuantity').value) === 0 &&
      (Number(this.invoiceDetailsForm.get('buyingUnitQuantity').value) >= 0
        || Number(this.invoiceDetailsForm.get('buyingUnitQuantity').value) < 0)) {
      let inventoryValuePrice = Number(totalCost) / Number(buyingUnitQuantity);
      if (!isNumber(inventoryValuePrice)) { inventoryValuePrice = 0; }
      this.invoiceDetailsForm.get('invoiceValuePrice').setValue(inventoryValuePrice.toFixed(3));
      let dos = (Number(inventoryValuePrice) * Number(this.fv.unitsInCase));
      if (!isNumber(dos)) { dos = 0; }
      this.invoiceDetailsForm.get('casePrice').setValue(dos.toFixed(2));
    }
    if ((Number(this.invoiceDetailsForm.get('buyingCaseQuantity').value) >= 0 ||
      Number(this.invoiceDetailsForm.get('buyingCaseQuantity').value) < 0) &&
      Number(this.invoiceDetailsForm.get('buyingUnitQuantity').value) === 0) {
      let caseCost = Number(totalCost) / Number(buyingCaseQuantity);
      if (!isNumber(caseCost)) { caseCost = 0; }
      this.invoiceDetailsForm.get('casePrice').setValue(caseCost.toFixed(2));
      const unitsInCase = this.invoiceDetailsForm.get('unitsInCase').value;
      if (Number(caseCost) > 0) {
        let invoiceValuePrice = caseCost / unitsInCase;
        if (!isNumber(invoiceValuePrice)) { invoiceValuePrice = 0; }
        this.invoiceDetailsForm.get('invoiceValuePrice').setValue(Number(invoiceValuePrice.toFixed(3)));
      }
      this.calculateMargin();
    }

  }

  calculateMargin() {
    const regularSellPrice = this.invoiceDetailsForm.get('regularSellPrice').value;
    const inventoryValuePrice = this.invoiceDetailsForm.get('invoiceValuePrice').value;
    const buyDown = this.invoiceDetailsForm.get('buyDown').value ? this.invoiceDetailsForm.get('buyDown').value : 0;
    const finalBuying = Number(inventoryValuePrice) - Number(buyDown);
    const x = Number(regularSellPrice) - (Number(inventoryValuePrice) - Number(buyDown));
    //  let z = (Number(regularSellPrice) - Number(inventoryValuePrice) / Number(inventoryValuePrice) * 100);
    let z = (x * 100) / regularSellPrice;
    // let z = (Number(regularSellPrice) - finalBuying / finalBuying * 100);
    if (!isNumber(z)) { z = 0; }
    this.invoiceDetailsForm.get('profitMargin').setValue(Number(z.toFixed(3)));
  }
  changeGrid(params) {
    if (params === undefined || params === '') {
      this.rowData = this.commonService.invoiceDetailList;
      return;
    }
    if (params.id === 'all') {
      this.rowData = this.commonService.invoiceDetailList;
    } else if (params.id === 'bellowTen') {
      this.rowData = this.bellowTen;
    } else if (params.id === 'betweenTenToTwenty') {
      this.rowData = this.betweenTenToTwenty;
    } else if (params.id === 'betweenTwentyToThirty') {
      this.rowData = this.betweenTwentyToThirty;
    } else if (params.id === 'betweenThirtyToForty') {
      this.rowData = this.betweenThirtyToForty;
    } else if (params.id === 'greaterForty') {
      this.rowData = this.greaterForty;
    } else if (params.id === 'newItems') {
      this.rowData = this.newItems;
    } else {
      this.rowData = this.commonService.invoiceDetailList;
    }
  }

  // add invoice Amount sum logic
  setInvoiceAmount() {
    let _invoiceChargeAmount = 0.0; let _itemCost = 0.0; let amountPaid = 0.0; let sum = 0.0;
    // The `_.property` iteratee shorthand.
    _invoiceChargeAmount = this.invoiceChargesGridRowData.reduce((x, current) => x + current.invoiceChargeAmount, 0);
    _itemCost = this.rowData.reduce((x, current) => Number(x) + Number(current.itemCost), 0);
    amountPaid = this.invoicePaymentGridRowData.reduce((x, current) => x + current.amountPaid, 0);
    sum = Number(_invoiceChargeAmount) + Number(_itemCost);
    let tQty = 0; let tIPur = 0;
    let tBunitQty = 0; let pur = 0;
    if (this.rowData && this.rowData.length > 0) {
      this.rowData.forEach(x => {
        if (x.unitsInCase > 0) {
          tBunitQty = (x.buyingUnitQuantity) / (x.unitsInCase);
        } else {
          tBunitQty = (x.buyingUnitQuantity);
        }
        tQty = tQty + (x.buyingCaseQuantity) + (tBunitQty);
        pur = (x.unitsInCase) * (x.buyingCaseQuantity);
        tIPur = tIPur + pur + (x.buyingUnitQuantity);
      });
    }
    this.changeInvoiceAmt.emit({
      _invoiceChargeAmount: _invoiceChargeAmount ? _invoiceChargeAmount.toFixed(2) : 0,
      _itemCost: _itemCost.toFixed(2), amountPaid: amountPaid.toFixed(2), sum: sum.toFixed(2),
      tQty: tQty.toFixed(2), tIPur: tIPur.toFixed(2)
    });
  }
  openPDF() {
    const postData = {
      companyId: this.userInfo.companyId,
      companyName: '',
      storeLocationId: this._storeLocationId,
      storeName: '',
      bucketName: '',
      filePath: this.invoiceFileName,
      fileName: this.invoiceFileName,
      fileType: '',
      fileData: '',
      contentType: ''
    };
    this.spinner.show();
    this._setupService.postData(`InvoiceBin/DownloadInvocie`, postData).subscribe(response => {
      this.spinner.hide();
      if (response && response.length > 0) {
        this.isSoftCopyOpen = true;
        this.buildSSQImage(response);
        this.messageService.sendMessage('expanded_collaps');
        this.onInvoiceGridColHideShow(false);
        this.gridColumnFit();
      } else {
        this.isSoftCopyOpen = false;
        this.backToInvocie.emit(false);
        this.toastr.warning('Invocie Not Found', 'warning');
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error('Invocie Failed', this.constants.infoMessages.error);
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
    let dataUrl = '';
    let showPdf = false;
    for (let x = 0; x < res.length; x++) {
      if (res[x].fileContentType == 'application/pdf')
        showPdf = true;
      dataUrl = 'data:' + res[x].fileContentType + ';base64,' + res[x].fileData;
      dd.content.push({
        image: 'data:' + res[x].fileContentType + ';base64,' + res[x].fileData,
        fit: [500, 500],
        margin: [0, 15, 0, 0]
      });
    }
    if (showPdf) {
      setTimeout(() => {
        const targetElement = document.getElementById('iframeContainer');
        targetElement.className = 'iframe';
        const iframe = document.createElement("embed");
        var x = document.createElement("EMBED");
        x.setAttribute("src", dataUrl);
        iframe.id = 'test';
        iframe.src = dataUrl;
        iframe.height = '555vh';
        iframe.width = '100%';
        targetElement.appendChild(iframe);
      }, 0);
    }
    else {
      const pdfDocGenerator = pdfMake.createPdf(dd);
      pdfDocGenerator.getDataUrl((dataUrl) => {
        console.log('dataUrl', dataUrl);
        const targetElement = document.querySelector('#iframeContainer');
        const iframe = document.createElement('iframe');
        iframe.src = dataUrl;
        iframe.height = '555vh';
        iframe.width = '100%';
        targetElement.className = 'iframe';
        targetElement.appendChild(iframe);
      });
    }
  }
  openSoftCopy() {
    this.openPDF();
  }
  closePdf() {
    this.isSoftCopyOpen = false;
    this.onInvoiceGridColHideShow(true);
    // this.backToInvocie.emit(false);
    this.gridColumnFit();
  }
  closePdfButton() {
    this.isSoftCopyOpen = false;
    this.backToInvocie.emit(false);
  }
  // add
  fetchDepartmentDetailsListByInvoiceID() {
    this._setupService.getData(`InvoiceDetail/GetFromDepartment/${this.invoiceID}/${this.userInfo.companyId}`).subscribe(res => {
      this.rowDataDepartment = res;
    }, err => {
      console.log(err);
    });
  }
  backToList() {
    this.backToInvocieList.emit(false);
  }
  onGridDepartmentReady(params) {
    this.gridApiDepartTop = params.api;
    this.gridApiDepartTop.sizeColumnsToFit();
  }
  gridColumnFit() {
    setTimeout(() => {
      if (!this.isSoftCopyOpen && this.rowData.length > 0)
        this.invoiceGridApi.sizeColumnsToFit();
      if (this.invoiceChargesGridApi) {
        this.invoiceChargesGridApi.sizeColumnsToFit();
      }
      if (this.invoicePaymentGridApi) {
        this.invoicePaymentGridApi.sizeColumnsToFit();
      }
    }, 500);
  }
  onMarkup() {
    this.commonService.isMarkup = this.isMarkup;
    if (!this.isMarkup) {
      this.fetchInvoiceDetailsList();
    }
  }

  updateGridOptions() {
    if (this._invoiceDetail && this._invoiceDetail.invoiceStatusID === 3) {
      this.disableEditing = true;
      this.gridOptions = this.editableGrid.getGridOption(this.constants.editableGridConfig.gridTypes.addInvoicesDetailsGridNonEditable);
      this.invoiceChargesOptions = this.editableGrid.getGridOption(this.constants.editableGridConfig.gridTypes.invoiceChargesGridNonEditable);
      this.invoicePaymentOptions = this.editableGrid.getGridOption(this.constants.editableGridConfig.gridTypes.invoicePaymentGridNonEditable);
      //temporary work around should be removed later
      setTimeout(() => {
        if (this.ctdTabset) this.ctdTabset.select('tab2');
        setTimeout(() => {
          if (this.ctdTabset) this.ctdTabset.select('tab1');
        }, 100);
      }, 100);
    } else {
      this.disableEditing = false;
      this.gridOptions = this.editableGrid.getGridOption(this.constants.editableGridConfig.gridTypes.addInvoicesDetailsGrid);
      this.invoiceChargesOptions = this.editableGrid.getGridOption(this.constants.editableGridConfig.gridTypes.invoiceChargesGrid);
      this.invoicePaymentOptions = this.editableGrid.getGridOption(this.constants.editableGridConfig.gridTypes.invoicePaymentGrid);
    }
  }

  onCellClickedInvoiceGrid(params) {
    if (params.colDef.field === "posCodeWithCheckDigit") {
      this.utilityService.copyText(params.value);
      this.toastr.success('UPC Code Copied');
    }
    if (params.colDef.field === "description") {
      this.utilityService.copyText(params.value);
      this.toastr.success('Description Copied');
    }
  }
}
