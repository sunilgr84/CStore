import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { GridOptions } from 'ag-grid-community';
import { NgbModal, NgbModalOptions, ModalDismissReasons, NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder } from '@angular/forms';
import { SetupService } from '@shared/services/setupService/setup-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '@shared/services/commmon/common.service';
import * as _ from 'lodash';
import { Router } from '@angular/router';


@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.scss']
})
export class AddItemComponent implements OnInit {
  @ViewChild('tabs') public tabs: NgbTabset;
  @Output() backtoList: EventEmitter<any> = new EventEmitter();
  @Input() itemId?: any;
  @Input() _upcCode?: any;
  @Input() _departmentList?: any;
  isImportPopCancel = false;
  public isCollapsed = true;
  isEditMode = false;
  isEditModeRedOnly = false;
  isAddParameter = true;
  userInfo = this.constantService.getUserInfo();
  isDefaultValue = false;
  initailFormValue: any;
  closeResult: string;
  isHideButtons = true;
  isHideAddMultiplier = true;
  isPriceGridEditMode = false;
  isCancelClick = false;
  isUnitsOfMeasurementLoading = true;
  itemDetailsForm = this._fb.group({
    itemID: [0],
    companyID: [0],
    departmentID: [null],  //
    activeFlag: [true],
    posCode: [''],   //
    // posCodeFormatID: [0],
    uomid: [null],
    description: [''],  //
    isDefault: false,
    sellingUnits: [1],   //
    unitsInCase: [],  //
    lastModifiedBy: [''],
    lastModifiedDateTime: [''],
    departmentDescription: [''],
    uomDescription: [''],
    regularSellPrice: [0],
    unitCostPrice: [0],
    maxInventory: [0],
    minInventory: [0],
    storeLocationItemID: [0],
    storeLocationID: [0],
    storeName: [''],
    priceRequiredFlag: [false],
    isFractionalQtyAllowedFlag: [false],
    allowFoodStampsFlag: [false],
    isItemReturnableFlag: [false],
    isLoyaltyRedeemEligibleFlag: [false],
    areSpecialDiscountsAllowedFlag: [false],
    storelocationlst: [''],
    buyingCost: [0],
    sellingPrice: [0],
    isMultipackFlag: [false], //
    noOfBaseUnitsInCase: [''],   //
    buyDown: [0],
    basicBuyDown: [0],
    rackAllowance: [0],
    isMultiplier: [0],
    multiplierPOSCode: [''],
    multiplierQuantity: [0],
    manufacturerID: [0],
    manufacturerName: [''],
    posCodeWithCheckDigit: [''],
    grossProfit: [0],
    isTrackItem: [true],
    inventoryValuePrice: [0],
    currentInventory: [0],
    inventoryAsOfDate: new Date(),
    vendorID: [0],
    posCodeModifier: [0],
    regularPackageSellPrice: [0],
    mulType: [''],
    multipackItemID: [0],
  });
  departmentList: any[];
  uomList: any;
  // model popup vendor & price Group
  modalOption: NgbModalOptions = {};
  // grid
  multiplierGridOptions: GridOptions;
  multiplierGridApi: any;
  multiplierRowData: any;
  isAddRowMultip = false;
  vendorOptions: GridOptions;
  vendorGridApi: any;
  vendorRowData: any;
  priceGGridOptions: GridOptions;
  priceGGridApi: any;
  priceGRowData: any;
  isApplyPriceChangestoAllStores = false;
  linkedIGridOptions: GridOptions;
  linkedIGridApi: any;
  linkedIRowData: any;
  isAddRowLinked = false;
  editStoreItemsGridOptions: GridOptions;
  editStoreItemsGridApi: any;
  editStoreItemsRowData: any;

  multipacksIGridOptions: GridOptions;
  multipacksIGridApi: any;
  multipacksIRowData: any;

  multipacksIEditGridOptions: GridOptions;
  multipacksIEditGridApi: any;
  multipacksIEditRowData: any;

  isAddMultipacks = false;
  selectStore: any;
  format = 'UPC'; // 'CODE128';  // 'CODE128A'; // 'CODE128B';
  elementType = 'svg';
  // value = 'someValue12340987';
  lineColor = '#000000';
  width = 1.3;
  height = 30;
  displayValue = true;
  fontOptions = '';
  font = 'monospace';
  textAlign = 'center';
  textPosition = 'bottom';
  textMargin = 2;
  fontSize = 18;
  background = '#ffffff';
  margin = 10;
  marginTop = 10;
  marginBottom = 10;
  marginLeft = 10;
  marginRight = 10;
  tempId = 0;
  addrow = 0;

  // linked gobal veri
  addlinkedId = 0;
  addlinkedRow = 0;
  newRowAdded = false;
  itemID: any;
  submitedItem = false;
  priceRowAdded = false;
  storeItemsGridEditableOptions: any;
  _noOfBaseUnitsInCase: any;
  _departmentID: any;
  _masterPriceBookItemID: any;
  isLoading = true;
  hideBaseUnitsInCase = true;
  _pricingRowIndex = null;
  modalReference: any;
  // add new feature Item Import Group
  masterPriceBookDetails: any;
  popDepartmentID = null;
  multiplierGridColumnApi: any;
  masterData: any;
  initailUpdateFormValue: any;
  descriptionLable: any;

  get values(): string[] {
    return this.itemDetailsForm.controls.posCode.value.split('\n');
  }
  constructor(private constantService: ConstantService,
    private modalService: NgbModal,
    private toastr: ToastrService, private dataSerice: SetupService, private _fb: FormBuilder,
    private spinner: NgxSpinnerService, private commonService: CommonService,
    private router: Router) {
    this.initailFormValue = this.itemDetailsForm.value;
  }

  ngOnInit() {
    this.commonService.advItemSearch.isBackTolist = false;
    this.commonService.multipackModifierList =
      this.commonService.itemStoreList = [];
    if (this.commonService.storageItem) {
      this.itemId = this.commonService.storageItem.itemID;
      this._upcCode = this.commonService.storageItem.upcCode;
      if (this.commonService.storageItem.navigateToSalesActivity) {
        this.tabs.activeId = 'tab-sales-activity';
      }
      if (this.commonService.storageItem.navigateToItemHistory) {
        this.tabs.activeId = 'tab-item-history';
      }
    }
    this.commonService.storageItem = null;
    this.getDepartment();
    this.getUOM();
    this.getVendorItem();
    this.getCompanyPriceGroup();
    this.GetMultiplierInventoryType();
    this.itemID = null;
    this.commonService.isEditable = false;
    if (this.itemId) {
      // this.isEditModeRedOnly = this.isEditMode = true;
      this.fetchItemById(this.itemId);
      // this.fetchVendorItemItemID(this.itemId);
      // this.getItemPriceGroup();
      // this.GetMultipliersByItemID();
      // this.GetLocalLinkedItem();
      this.EditModeRedOnly();
      this.isHideButtons = false;
      this.isHideAddMultiplier = false;
      this.isAddParameter = false;
    }
  }
  // convenience getter for easy access to form fields
  get _item() { return this.itemDetailsForm.controls; }
  get _itemValue() { return this.itemDetailsForm.value; }
  EditModeRedOnly() {
    this.descriptionLable = this.itemDetailsForm.value.description;
    this.isEditMode = this.isEditModeRedOnly = true;
    this.itemDetailsForm.controls['noOfBaseUnitsInCase'].disable();
    this.itemDetailsForm.controls['unitsInCase'].disable();
    this.itemDetailsForm.controls['sellingUnits'].disable();
    this.itemDetailsForm.controls['uomid'].disable();
    // this.itemDetailsForm.controls['posCode'].disable();
    this.itemDetailsForm.controls['departmentID'].disable();
    this.itemDetailsForm.controls['isMultipackFlag'].disable();
    this.itemDetailsForm.controls['description'].disable();
    this.isAddParameter = false; this.isCancelClick = false;
  }
  onMultiplierGridReady(params) {
    this.multiplierGridApi = params.api;
    this.multiplierGridApi.sizeColumnsToFit();
    this.multiplierGridColumnApi = params.columnApi;
    this.setColumnHideShow(this.itemDetailsForm.get('isDefault').value);
  }
  setColumnHideShow(isDefault) {
    if (isDefault === true && this.multiplierGridColumnApi) {
      this.multiplierGridColumnApi.setColumnsVisible(['params'], false);
    } else {
      if (this.multiplierGridColumnApi) {
        this.multiplierGridColumnApi.setColumnsVisible(['params'], true);
      }
    }
  }
  onVendorGridReady(params) {
    this.vendorGridApi = params.api;
    this.vendorGridApi.sizeColumnsToFit();
  }
  onPriceGGridReady(params) {
    this.priceGGridApi = params.api;
    this.priceGGridApi.sizeColumnsToFit();
  }
  onLinkedGridReady(params) {
    this.linkedIGridApi = params.api;
    this.linkedIGridApi.sizeColumnsToFit();
  }
  onEditGridReady(params) {
    this.editStoreItemsGridApi = params.api;
    this.editStoreItemsGridApi.sizeColumnsToFit();
  }
  backToMainList() {
    this.backtoList.emit(false);
  }
  getCompanyPriceGroup() {
    this.dataSerice.getData(`CompanyPriceGroup/getByCompanyID/${this.userInfo.companyId}`).subscribe((response) => {
      if (response && response['statusCode']) {
        this.commonService._companyPriceGroupRow = [];
        return;
      }
      this.commonService._companyPriceGroupRow = response;
    }, (error) => {
      console.log(error);
    }
    );
  }
  createNewRowData() {
    this.tempId = 0;
    this.tempId = this.vendorGridApi.getDisplayedRowCount();
    const newData = {
      id: this.tempId,
      isSaveRequired: true,
      vendorItemID: 0,
      vendorID: 0,
      itemID: this.itemId,
      vendorItemCode: '',
      itemName: '',
      itemPosCode: '',
      vendorName: '',
      vendorCode: '',
      vendorExists: false,
      description: '',
    };

    return newData;
  }
  getStartEditingCell(_colKey, _rowIndex) {
    this.vendorGridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }

  // price group code start
  getItemPriceGroup() {
    this.dataSerice.getData('ItemPriceGroup/getByItemId/' + this.itemId + '/' + this.userInfo.companyId)
      .subscribe((response) => {
        if (response && response['statusCode']) {
          this.priceGRowData = [];
          return;
        }
        this.priceGRowData = response ? response : [];
      }, (error) => {
        console.log(error);

      });
  }
  editPriceGAction(params) {
    const finalObj = this.commonService._companyPriceGroupRow.filter(
      x => x.CompanyPriceGroupName === params.data.CompanyPriceGroupName);
    if (finalObj && finalObj.length === 0) {
      this.toastr.error('Please Select Price Group', this.constantService.infoMessages.error);
      return;
    }
    const postData = {
      itemGroupID: params.data.itemGroupID,
      itemID: this.itemId,
      priceGroupID: finalObj[0].companyPriceGroupID,
      companyPriceGroupName: finalObj[0].companyPriceGroupName,
      masterPriceGroupID: finalObj[0]['masterPriceGroupID'],
      groupIDs: finalObj[0]['groupIDs'],
      isSuperGroup: finalObj[0]['isSuperGroup'],
      companyID: this.userInfo.companyId,
      groupExists: null
    };
    this.spinner.show();
    if (params.data.itemGroupID > 0) {
      this.dataSerice.updateData('ItemPriceGroup/update', postData).subscribe(res => {
        this.spinner.hide();
        if (res) {
          this.priceRowAdded = false;
          this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
          // this.getItemPriceGroup();
        } else {
          this.toastr.error(this.constantService.infoMessages.alreadyExists, this.constantService.infoMessages.error);
        }
      }, err => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.alreadyExists, this.constantService.infoMessages.error);
        console.log(err);
      });
    } else {
      this.dataSerice.postData('ItemPriceGroup/addNew', postData).subscribe(res => {
        this.spinner.hide();
        if (res && res.itemGroupID) {
          this.priceRowAdded = false;
          this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
          this.getItemPriceGroup();
        } else {
          this.toastr.error(this.constantService.infoMessages.alreadyExists, this.constantService.infoMessages.error);
        }
      }, err => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.alreadyExists, this.constantService.infoMessages.error);
        console.log(err);
      });
    }


  }
  deletepriceGroup(params) {
    if (params.data.itemGroupID === 0) {
      this.priceGGridApi.updateRowData({ remove: [params.data] });
      this.priceRowAdded = false;
      return;
    } else {
      this.spinner.show();
      this.dataSerice.deleteData('ItemPriceGroup?id=' + params.data.itemGroupID).subscribe(res => {
        this.spinner.hide();
        if (res === '1') {
          this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
          this.priceGGridApi.updateRowData({ remove: [params.data] });
        } else {
          this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
        }
      }, err => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
        console.log(err);
      });
    }
  }
  // end
  // Multipliers Grid Add New Row
  GetMultipliersByItemID() {
    this.dataSerice.getData('Multiplier/GetMultipliersByItemID/' + this.itemId)
      .subscribe((response) => {
        if (response && response['statusCode']) {
          this.multiplierRowData = [];
          return;
        }
        this.multiplierRowData = response;
      }, (error) => {
        console.log(error);
      });
  }
  GetMultiplierInventoryType() {
    this.dataSerice.getData('MultiplierInventoryType/get')
      .subscribe((response) => {
        this.commonService._multiplierInventoryType = response;
      }, (error) => {
        console.log(error);
      });
  }

  addRowMultiplier() {
    if (this.isAddRowMultip) {
      this.toastr.error('Please save existing data first before adding another!');
      return;
    }
    this.isAddRowMultip = true;
    this.tempId = 0;
    this.tempId = this.multiplierGridApi.getDisplayedRowCount();
    this.multiplierGridApi.updateRowData({
      add: [{
        isSaveRequired: true,
        multiplierID: 0,
        quantity: 0,
        itemID: 0,
        containedItemID: 0,
        upcCode: '',
        multiplierInventoryTypeID: 0,
        multiplierDescription: null,
        cItemID: 0,
        multiplierInventoryDescription: null,
        itemName: null,
        mulType: null
      }],
      addIndex: 0
    });
    this.addrow = this.addrow + 1;
    this.getStartMultipliersEditingCell('mulType', 0);
  }
  // set edit cell
  getStartMultipliersEditingCell(_colKey, _rowIndex) {
    this.multiplierGridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }

  onCellValueChanged(params) {
    if (params.column.colId === 'upcCode') {
      if (params.rowIndex === 0) {
        this.setRowValue(this.multiplierGridApi.getRowNode(this.addrow === 0 ? params.rowIndex : this.tempId), params);
      } else {
        this.setRowValue(this.multiplierGridApi.getRowNode(params.rowIndex - this.addrow), params);
      }
    }
  }
  setRowValue(rowNode, params) {
    if (!rowNode) {
      rowNode = this.multiplierGridApi.getDisplayedRowAtIndex(0);
    }
    if (rowNode && rowNode.data && rowNode.data.upcCode) {
      this.spinner.show();
      this.dataSerice.getData('Item/checkPOSCode/' + rowNode.data.upcCode + '/' + this.userInfo.companyId).subscribe(
        (response) => {
          this.spinner.hide();
          if (response && response.itemID === this.itemId) {
            this.toastr.error('You can not make relation with same item', this.constantService.infoMessages.warning);
            this.getStartMultipliersEditingCell('upcCode', params.rowIndex);
            return;
          }
          if (response) {
            rowNode.setDataValue('itemDescription', response.description);
            rowNode.setDataValue('containedItemID', response.itemID);
            // rowNode.setDataValue('itemID', response.itemID);
          } else {
            rowNode.setDataValue('upcCode', params.oldValue);
            this.toastr.warning('Item pos code not found', this.constantService.infoMessages.warning);
          }
        }, (error) => {
          this.spinner.hide();
          console.log(error);
        }
      );
    }
  }

  saveMultiplier(params?) {
    // const mulTypes = params.data.mulType ? params.data.mulType.split(',') : '';
    if (!this.itemId) {
      this.toastr.warning('Please first added item!', 'warning');
      return;
    }
    let postData = {};
    if (this.masterData && this.masterData.masterCartonPriceBookDetails) {
      postData = {
        multiplierID: this.masterData.masterCartonPriceBookDetails.multiplierID ?
          this.masterData.masterCartonPriceBookDetails.multiplierID : 0,
        quantity: this.masterData.masterCartonPriceBookDetails.unitsInCase ? this.masterData.masterCartonPriceBookDetails.unitsInCase : 0,
        itemID: this.itemId,
        containedItemID: null,
        multiplierInventoryTypeID: this.masterData.masterCartonPriceBookDetails.isPack ? 3 : 2,
        multiplierDescription: this.masterData.masterCartonPriceBookDetails.description,
        cItemID: 0,
        multiplierInventoryDescription: null,
        itemName: null,
        mulType: null,
        masterPriceBookItemID: this.masterData.masterCartonPriceBookDetails.masterPriceBookItemID,
        departmentID: this.itemDetailsForm.get('departmentID').value ? this.itemDetailsForm.get('departmentID').value : 0,
        companyID: this.userInfo.companyId
      };

      this.spinner.show();
      this.dataSerice.postData('Multiplier/addNew?isSingleView=false', postData).subscribe(
        (res) => {
          this.spinner.hide();
          if (res && res.multiplierID) {
          } else {
          }
        },
        (err) => {
          this.spinner.hide();
        }
      );


    }
  }
  // Multipliers Grid Delete Row
  deleteMultiplierAction(params) {
    if (params.data.multiplierID === 0) {
      this.multiplierGridApi.updateRowData({ remove: [params.data] });
      this.isAddRowMultip = false;
      this.getMultiplierRow();
      return;
    } else {
      this.spinner.show();
      this.dataSerice.deleteData('Multiplier?id=' + params.data.multiplierID).subscribe((response) => {
        this.spinner.hide();
        if (response === '1') {
          this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
          this.multiplierGridApi.updateRowData({ remove: [params.data] });
          this.getMultiplierRow();
        } else {
          this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.success);

        }

      }, (error) => {
        this.spinner.hide();
        console.log(error);
      }
      );
    }
  }
  getMultiplierRow() {
    const arr = [];
    // tslint:disable-next-line:no-unused-expression
    this.multiplierGridApi && this.multiplierGridApi.forEachNode(function (node) {
      arr.push(node.data);
    });
    this.multiplierRowData = arr;
  }
  GetLocalLinkedItem() {
    this.dataSerice.getData('LocalLinkedItem/GetByItemID?itemID=' + this.itemId).subscribe((response) => {
      if (response && response['statusCode']) {
        this.linkedIRowData = [];
        return;
      }
      this.linkedIRowData = response;
    }, (error) => {
      console.log(error);
    });
  }
  // Linked Grid Add New Row
  addRowLinked() {
    if (this.isAddRowLinked) {
      this.toastr.error('Please save existing data first before adding another!');
      return;
    }
    this.isAddRowLinked = true;

    this.addlinkedId = this.linkedIGridApi.getDisplayedRowCount();
    this.linkedIGridApi.updateRowData({
      add: [{
        isSaveRequired: true,
        localLinkedItemID: 0,
        localLinkMasterItemID: this.itemId,
        posCode: '',
        description: '',
        linkItemID: 0,
        discountAmount: null,
        createdBy: this.userInfo.userName,
        createdDateTime: new Date(),
        lastModifiedDateTime: new Date(),
        isDefault: true
      }],
      addIndex: 0
    });
    this.addlinkedRow = this.addlinkedRow + 1;
    this.getStartlinkedEditingCell('posCode', 0);
  }
  // set edit cell
  getStartlinkedEditingCell(_colKey, _rowIndex) {
    this.linkedIGridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }
  onLinkedCellValueChanged(params) {
    if (params && params.column && params.column.colId === 'posCode') {
      if (params.rowIndex === 0) {
        this.setLinkedRowValue(this.linkedIGridApi.getRowNode(this.addlinkedRow === 0 ? params.rowIndex : this.addlinkedId), params);
      } else {
        this.setLinkedRowValue(this.linkedIGridApi.getRowNode(params.rowIndex - this.addlinkedRow), params);
      }
    }
  }
  setLinkedRowValue(rowNode, params) {
    if (!rowNode) {
      rowNode = this.linkedIGridApi.getDisplayedRowAtIndex(0);
    }
    if (rowNode && rowNode.data && rowNode.data.posCode) {
      this.spinner.show();
      this.dataSerice.getData('Item/checkPOSCode/' + rowNode.data.posCode + '/' + this.userInfo.companyId).subscribe(
        (response) => {
          this.spinner.hide();
          if (response && response.itemID === this.itemId) {
            this.toastr.error('You can not make relation with same item', this.constantService.infoMessages.warning);
            this.getStartlinkedEditingCell('posCode', params.rowIndex);
            return;
          }
          if (response && response.itemID) {
            rowNode.setDataValue('description', response.description);
            rowNode.setDataValue('linkItemID', response.itemID);
            // rowNode.setDataValue('itemID', response.itemID);
          } else {
            rowNode.setDataValue('posCode', params.oldValue);
            this.toastr.warning('Item pos code not found', this.constantService.infoMessages.warning);
          }
        }, (error) => {
          this.spinner.hide();
          console.log(error);
        }
      );
    }
  }

  saveLocalLinkedItem(params?) {
    if (this.masterData && this.masterData.masterPriceBookLinkedItemDetails) {
      for (let l = 0; l < this.masterData.masterPriceBookLinkedItemDetails.length; l++) {
        const entity = {
          // isSaveRequired: true,
          localLinkedItemID: 0,
          localLinkMasterItemID: this.itemDetailsForm.get('itemID').value,
          linkItemID: 0,
          discountAmount: this.masterData.masterPriceBookLinkedItemDetails[l].promoDiscountAmount ?
            this.masterData.masterPriceBookLinkedItemDetails[l].promoDiscountAmount : 0,
          createdBy: this.userInfo.userName,
          createdDateTime: new Date(),
          lastModifiedDateTime: new Date(),
          linkedItemTypeID: this.masterData.masterPriceBookLinkedItemDetails[l].linkedItemTypeID,
          linkedTypeDescription: '',
          isDefault: true,
          posCode: this.masterData.masterPriceBookLinkedItemDetails[l].upcCode,
          description: this.masterData.masterPriceBookLinkedItemDetails[l].description,
          masterPriceBookIemID: this.masterData.masterPriceBookLinkedItemDetails[l].masterLinkPriceBookItemID,
          departmentID: this.itemDetailsForm.get('departmentID').value,
          companyID: this.userInfo.companyId
        };
        this.spinner.show();
        this.dataSerice.postData('LocalLinkedItem', entity).subscribe((res) => {
          this.spinner.hide();
        },
          (err) => {
            this.spinner.hide();
          }
        );
      }
    }
  }
  // Linked Grid Delete Row
  deleteLinkedAction(params) {
    if (params.data.localLinkedItemID === 0) {
      this.linkedIGridApi.updateRowData({ remove: [params.data] });
      this.getLinkedAction();
      this.isAddRowLinked = false;
      return;
    } else {
      this.spinner.show();
      this.dataSerice.deleteData('LocalLinkedItem?id=' + params.data.localLinkedItemID).subscribe((response) => {
        this.spinner.hide();
        if (response && Number(response) === 1) {
          this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
          this.linkedIGridApi.updateRowData({ remove: [params.data] });
          this.getLinkedAction();
        } else {
          this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.success);

        }

      }, (error) => {
        this.spinner.hide();
        console.log(error);
      }
      );
    }
  }
  getLinkedAction() {
    const arr = [];
    // tslint:disable-next-line:no-unused-expression
    this.linkedIGridApi && this.linkedIGridApi.forEachNode(function (node) {
      arr.push(node.data);
    });
    this.linkedIRowData = arr;
  }
  fetchItemById(itemId) {
    this.spinner.show();
    this.dataSerice.getData('Item/get/' + itemId, '').subscribe((response) => {
      this.spinner.hide();
      this.commonService.storageItem = null;
      if (response) {
        this.initailUpdateFormValue = response;
        this.itemDetailsForm.patchValue(response);
        this.descriptionLable = response.description;
        this.commonService.isItemDefault = this.itemDetailsForm.get('isDefault').value;
        const upc = this._upcCode ? this._upcCode : response.posCode;
        this.itemDetailsForm.get('posCode').setValue(upc);
        this._departmentID = response.departmentID;
        this._noOfBaseUnitsInCase = this.itemDetailsForm.get('unitsInCase').value;
        if (this.itemDetailsForm.get('isMultipackFlag').value === true) {
          this.isAddMultipacks = true;
          // this.addMultipack();
          // this.GetMultipacks(itemId);
        } else {
          this.isAddMultipacks = false;
        }
        response.isDefault === false || response.isDefault === null ? this.isHideAddMultiplier = false : this.isHideAddMultiplier = true;
        this.setColumnHideShow(this.isHideAddMultiplier);
      }

    }, (error) => {
      this.spinner.hide();
      console.log(error);
    }
    );
  }
  getDepartment() {
    // tslint:disable-next-line:max-line-length
    this.dataSerice.getData(`Department/getAll/${this.userInfo.userName}/${this.userInfo.companyId}`)
      .subscribe(res => {
        this.isLoading = false;
        if (res && res['statusCode']) {
          this.departmentList = [];
          return;
        }
        this.departmentList = res;
      }, err => {
        console.log(err);
      });

  }

  getUOM() {
    this.dataSerice.getData('UOM/getAll').subscribe((response) => {
      this.uomList = response;
      this.isUnitsOfMeasurementLoading = false;
    }, (error) => {
      console.log(error);
    });
  }
  cancel() {
    this.itemDetailsForm.patchValue(this.initailUpdateFormValue);
    this.descriptionLable = '';
    this.EditModeRedOnly();
  }
  setDescriptionUpperCase(value) {
    this.itemDetailsForm.get('description').setValue(value.toUpperCase());
  }
  checkUPCCode(params) {
    if (!this.isEditMode) {
      this.editStoreItemsRowData = [];
      this.enableFields();
      const upcCodelength = params.length;
      if (upcCodelength === 8) {
        this.convertUpceToUpca(params);
      } else if (upcCodelength === 12 || upcCodelength === 13 || (upcCodelength >= 1 && upcCodelength <= 4)) {
        this.checkPosCode(params);
      } else if ((upcCodelength >= 5 && upcCodelength <= 7) || (upcCodelength >= 9 && upcCodelength <= 11) ||
        upcCodelength > 13) {
        this.toastr.error('Invaild UPC Code..!', this.constantService.infoMessages.error);
      }
    }

  }

  convertUpceToUpca(params) {
    this.dataSerice.getDataResponse(`Item/ConvertUPCETOUPCA/${params}`)
      .subscribe((response) => {
        if (response && response['statusCode'] === 200) {
          let upcaCode = response.data ? response.data : '';
          upcaCode = response.message ? response.message : upcaCode;
          this.itemDetailsForm.get('posCode').setValue(upcaCode);
          if (upcaCode.length === 12 || upcaCode.length === 13) {
            this.checkPosCode(upcaCode);
          }
        }

      }, (err) => {
        this.toastr.error('Please enter correct POS code', this.constantService.infoMessages.error);
      });
  }
  disableFields() {
    this.itemDetailsForm.controls['noOfBaseUnitsInCase'].disable();
    this.itemDetailsForm.controls['unitsInCase'].disable();
    this.itemDetailsForm.controls['sellingUnits'].disable();
    this.itemDetailsForm.controls['uomid'].disable();
    this.itemDetailsForm.controls['departmentID'].enable();
    this.itemDetailsForm.controls['isMultipackFlag'].enable();
    this.itemDetailsForm.controls['description'].enable();
  }
  enableFields() {
    this.itemDetailsForm.controls['noOfBaseUnitsInCase'].enable();
    this.itemDetailsForm.controls['unitsInCase'].enable();
    this.itemDetailsForm.controls['sellingUnits'].enable();
    this.itemDetailsForm.controls['uomid'].enable();
    this.itemDetailsForm.controls['departmentID'].enable();
    this.itemDetailsForm.controls['isMultipackFlag'].enable();
    this.itemDetailsForm.controls['description'].enable();
  }
  checkPosCode(params) {
    this.isHideButtons = true;
    this.isHideAddMultiplier = true;
    this.dataSerice.getData(`Item/checkPOSCode/${params}/${this.userInfo.companyId}`).subscribe(res => {
      if (res && res.itemID) {
        this.toastr.info('ITEM EXISTS', 'success');
        this.itemDetailsForm.patchValue(res);
        this.initailUpdateFormValue = res;
        this.descriptionLable = res.description;
        this.itemDetailsForm.get('posCode').setValue(params);
        this.commonService.isItemDefault = this.itemDetailsForm.get('isDefault').value;
        this.itemId = this.itemID = res.itemID;
        if (this.itemDetailsForm.get('isMultipackFlag').value === true) {
          this.isAddMultipacks = true;
          // this.addMultipack();
          // this.GetMultipacks(itemId);
        } else {
          this.isAddMultipacks = false;
        }
        this._departmentID = res.departmentID;
        this._noOfBaseUnitsInCase = this.itemDetailsForm.get('unitsInCase').value;
        this.isHideButtons = false;
        res.isDefault === false || res.isDefault === null ? this.isHideAddMultiplier = false : this.isHideAddMultiplier = true;
        this.setColumnHideShow(this.isHideAddMultiplier);
        this.EditModeRedOnly();
      } else {
        this.getMasterPriceBookItem(params);
      }
    }, err => {
      this.toastr.error(this.constantService.infoMessages.contactAdmin);
      console.log(err);
    });
  }
  getMasterPriceBookItem(upcCode) {
    this.masterPriceBookDetails = null;
    this.dataSerice.getData(`MasterPriceBookItem/GetMastersItemDetails/${upcCode}`).subscribe(res => {
      if (res && res.masterPriceBookDetails && res.masterPriceBookDetails.masterPriceBookItemID) {
        this.masterData = res;
        this.masterPriceBookDetails = res.masterPriceBookDetails;
        this.toastr.info('Retrieved from the master price book', 'success');
        this.itemDetailsForm.get('itemID').setValue(0);
        //  this.itemDetailsForm.get('departmentID').setValue(res.masterPriceBookDetails.masterDepartmentID);
        this._noOfBaseUnitsInCase = res.masterPriceBookDetails.unitsInCase;
        //   this.EditModeRedOnly();
        this.isHideButtons = true;
        this.isHideAddMultiplier = true;
        this.setColumnHideShow(this.isHideAddMultiplier);
        this.itemId = this.itemID = 0;
        this.itemDetailsForm.get('posCode').setValue(res.masterPriceBookDetails.upcCode);
        this.itemDetailsForm.get('isDefault').setValue(res.masterPriceBookDetails.isDefault);
        this.itemDetailsForm.get('uomid').setValue(res.masterPriceBookDetails.uomid);
        this.itemDetailsForm.get('description').setValue(res.masterPriceBookDetails.description);
        this.itemDetailsForm.get('sellingUnits').setValue(res.masterPriceBookDetails.sellingUnits);
        this.itemDetailsForm.get('noOfBaseUnitsInCase').setValue(res.masterPriceBookDetails.sellingUnits);
        this.itemDetailsForm.get('unitsInCase').setValue(res.masterPriceBookDetails.unitsInCase);
        const pushData = [];
        this.linkedIRowData = res.masterPriceBookLinkedItemDetails;
        if (res.masterPriceBookDetails.isDefault) {
          this.disableFields();
        }
        if (!this.isImportPopCancel) {
          document.getElementById('open_model').click();
        }
      } else {
        this.toastr.warning('UPC Code doesn’t exist.', 'warning');
      }
    }, err => {
      // this.toastr.error(this.constantService.infoMessages.contactAdmin);
      // console.log(err);
    });
  }
  itemImportClose() {
    this.isImportPopCancel = true;
    this.modalService.dismissAll();
  }
  itemImportOpen(itemImport: any) {
    const ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false
    };

    this.modalReference = this.modalService.open(itemImport, ngbModalOptions); // content
    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  addNewItem() {
    this.submitedItem = true;
    if (this.itemDetailsForm.valid) {
      const postData = {
        ...this.itemDetailsForm.value,
        priceRequiredFlag: false,
        noOfBaseUnitsInCase: this.itemDetailsForm.value.isMultipackFlag ?
          this.itemDetailsForm.get('unitsInCase').value : 0,
        posCode: this.itemDetailsForm.get('posCode').value,
        isDefault: this.itemDetailsForm.get('isDefault').value,
        uomid: this.itemDetailsForm.get('uomid').value,
        description: this.itemDetailsForm.get('description').value,
        sellingUnits: this.itemDetailsForm.get('sellingUnits').value,
        unitsInCase: this.itemDetailsForm.get('unitsInCase').value,
        companyID: this.userInfo.companyId,
        lastModifiedBy: this.userInfo.userName,
        lastModifiedDateTime: new Date(),
      };
      this.itemDetailsForm.get('noOfBaseUnitsInCase').setValue(postData.noOfBaseUnitsInCase);
      if (postData.itemID === 0) {
        this.spinner.show();
        this.dataSerice.postData('Item/addNew?isMobile=false', postData).subscribe(res => {
          this.spinner.hide();
          if (res && res.itemID) {
            this.submitedItem = false;
            this.itemDetailsForm.patchValue(res);
            this.initailUpdateFormValue = res;
            this.commonService.isItemDefault = this.itemDetailsForm.get('isDefault').value;
            this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
            this._noOfBaseUnitsInCase = this.itemDetailsForm.get('unitsInCase').value;
            this.itemId = this.itemID = res.itemID;
            this.saveMultiplier();
            this.saveLocalLinkedItem();
            this._departmentID = res.departmentID;
            if (this.itemDetailsForm.get('isMultipackFlag').value === true) {
              this.isAddMultipacks = true;
              // this.addMultipack();
              // this.GetMultipacks(itemId);
            } else {
              this.isAddMultipacks = false;
            }
            this.EditModeRedOnly();
            this.isHideButtons = false;
            this.isHideAddMultiplier = false;
            this.setColumnHideShow(this.isHideAddMultiplier);
          } else {
            this.toastr.error(this.constantService.infoMessages.addRecordFailed);
          }

        }, err => {
          this.spinner.hide();
          this.toastr.error(this.constantService.infoMessages.addRecordFailed);
          console.log(err);
        });

      } else {
        this.spinner.show();
        this.dataSerice.updateData('Item/update?isMobile=false', postData).subscribe(res => {
          this.spinner.hide();
          if (res && res['statusCode']) {
            this.toastr.error(this.constantService.infoMessages.updateRecordFailed);
            return;
          }
          if (res && Number(res) > 0) {
            this.toastr.success(this.constantService.infoMessages.updatedRecord, 'Update');
            this.itemDetailsForm.get('isDefault').value === false || this.itemDetailsForm.get('isDefault').value === null
              ? this.isHideAddMultiplier = false : this.isHideAddMultiplier = true;
            this.setColumnHideShow(this.itemDetailsForm.get('isDefault').value);
            this._noOfBaseUnitsInCase = this.itemDetailsForm.get('unitsInCase').value;
            this.itemId = this.itemID = this.itemDetailsForm.get('itemID').value;
            this._departmentID = this.itemDetailsForm.get('departmentID').value;
            if (this.itemDetailsForm.get('isMultipackFlag').value === true) {
              this.isAddMultipacks = true;
              // this.addMultipack();
              // this.GetMultipacks(itemId);
            } else {
              this.isAddMultipacks = false;
            }
            this.EditModeRedOnly();

          } else {
            this.toastr.error(this.constantService.infoMessages.updateRecordFailed);

          }
        }, err => {
          this.spinner.hide();
          console.log(err);
        });
      }
    }
  }
  addMoreItem() {
    this.isImportPopCancel = false;
    this.commonService.multipackModifierList = this.commonService.itemStoreList = this.commonService.storageItem = null;
    this.itemDetailsForm.patchValue(this.initailFormValue);
    this.initailUpdateFormValue = '';
    this.commonService.isItemDefault = this.itemDetailsForm.get('isDefault').value;
    this.isEditMode = this.isEditModeRedOnly = false;
    this.itemID = this.itemId = null;
    this.isAddMultipacks = this.isAddRowMultip = false;
    this.isAddRowLinked = false;
    this.priceRowAdded = false; this.tempId = this.addrow = 0;
    this.isHideButtons = true;
    this.isHideAddMultiplier = true;
    this.setColumnHideShow(this.isHideAddMultiplier);
    this.isPriceGridEditMode = false;
    this.submitedItem = false;
    this.isAddParameter = false;
    this._masterPriceBookItemID = this._departmentID = this._noOfBaseUnitsInCase = null;
    this.selectStore = null;
    this.hideBaseUnitsInCase = true;
    this.enableFields();
  }
  editItem() {
    if (this.itemDetailsForm.get('isDefault').value) {
      this.disableFields();
    } else {
      this.enableFields();
    }
    this.isAddParameter = true;
    this.isEditModeRedOnly = false;
    this.isCancelClick = true;
  }
  onCellChanged(params) {
    if (params.column.colId === 'storeName' && params.value !== ''
      && params.value) {
      const storeItem = _.find(this.commonService.itemStoreList, ['storeName', params.data.storeName]);
      this.addMultipack(storeItem.storeLocationItemID);
    }

  }
  addMultipack(storeId?: any) {
    const buc = this.itemDetailsForm.get('unitsInCase').value;
    const storeIds = storeId ? storeId : 0;
    this.dataSerice.getData('MultipackItem/getSellingUnitByStoreLocationItems/' + buc
      + '/' + this.itemId +
      '/' + storeIds).subscribe(
        (res) => {
          if (res && (res['statusCode'])) {
            this.commonService.multipackModifierList = this.multipacksIEditRowData = [];
            return;
          }
          this.commonService.multipackModifierList = res ? res : [];
          this.multipacksIEditRowData = res ? res : [];
        }, (err) => {
          console.log(err);
        }
      );
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

  getVendorItem() {
    this.dataSerice.getData('Vendor/getAll/' + this.userInfo.companyId).subscribe(
      (response) => {
        if (response && response['statusCode']) {
          this.commonService.vendorItemList = [];
          return;
        }
        this.commonService.vendorItemList = response;
      });
  }

  cancelPriceingList() {
    this._pricingRowIndex = null;
    this.isApplyPriceChangestoAllStores = false;
    // this.isPriceGridEditMode =
  }
  deletePricingAction(params) {

  }

  cellValueChanged(params) {
    if (Number(params.oldValue) !== Number(params.newValue)) {
      this._pricingRowIndex = params.rowIndex;
    }
  }
  addParameters(contentParameter) {
    this.modalService.open(contentParameter, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  ImportData(ngForm) {
    if (ngForm.valid && this.popDepartmentID) {
      const importData = {
        DestinationCompanyID: this.userInfo.companyId,
        DestStoreLocationID: null,
        DestDepartmentID: this.popDepartmentID,
        MasterPriceGroupID: this.masterPriceBookDetails ? this.masterPriceBookDetails['masterPriceGroupID'] : 0,
      };
      this.spinner.show();
      this.dataSerice.updateData('MasterPriceGroup/ImportCompanyPriceGroupsFromMasterPriceGroup/' + importData.DestinationCompanyID + '/' +
        importData.DestDepartmentID + '/' + importData.MasterPriceGroupID, '').subscribe(
          (response) => {
            this.spinner.hide();
            if (response === '1') {
              this.toastr.success(this.constantService.infoMessages.importRecords, this.constantService.infoMessages.success);
              this.modalService.dismissAll();
              this.popDepartmentID = null;
              this.checkPosCode(this.itemDetailsForm.get('posCode').value);
            } else {
              this.toastr.error(this.constantService.infoMessages.contactAdmin, this.constantService.infoMessages.error);
            }
          }, (error) => {
            this.spinner.hide();
            console.log(error);
            this.toastr.error(this.constantService.infoMessages.contactAdmin, this.constantService.infoMessages.error);

          }
        );
    } else {
      this.toastr.error('Select Department...!', 'Error');
      return;
    }
  }

  // add new feture tab change
  navigateTap(params) {
    this.tabs.select(params);
  }
  tabChange(param) {
    this.priceRowAdded = this.newRowAdded = this.isAddRowLinked = this.isAddRowMultip = false;
    this.tempId = this.addrow = 0;
    // this.isAddMultipacks
  }
  backToAdvSearchList() {
    this.commonService.advItemSearch.isBackTolist = true;
    this.router.navigate(['/items']);
  }
}
