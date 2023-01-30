import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ColumnApi } from 'ag-grid-community';
import * as _ from 'lodash';
import { FormBuilder } from '@angular/forms';
import { StoreService } from '@shared/services/store/store.service';
import { GroupDetailCellRenderer } from '@shared/component/pagination-grid/partials/group-detail-cell-renderer.component';
import { MessageService } from '@shared/services/commmon/message-Service';
import { CommonService } from '@shared/services/commmon/common.service';

@Component({
  selector: 'app-price-group2',
  templateUrl: './price-group2.component.html',
  styleUrls: ['./price-group2.component.scss']
})
export class PriceGroup2Component implements OnInit {
  selectedItem: any;
  priceGroupsList: any;
  columnApi: ColumnApi;
  childGrpExpGridOptions: any;
  detailCellRenderer;
  expColumnApi: ColumnApi;
  departmentListByUser: any[];
  isStoreLocationLoading = true;
  storeLocationList: any[];
  storeLocationID = null;
  vendorList: any;
  activeUpdateList = [
    { id: false, name: 'False' },
    { id: true, name: 'True' },
  ];
  posSyncStatusList: any;
  isLoading: boolean | false;
  priceGroupList: any;
  searchByList = [
    { name: 'None', id: null },
    { name: 'Unknown Department', id: 1 },
    { name: 'Top 50 selling items', id: 2 },
    { name: 'Least 50 selling Items', id: 3 },
    { name: 'Items with no Selling Units', id: 4 },
    { name: 'Items with no Cost Price', id: 5 },
    { name: 'Items with no Selling Price', id: 6 },
    { name: 'Item with no Units in a case', id: 7 },
    { name: 'Items with no Description', id: 8 },
    { name: 'Items without Store location', id: 9 },
    { name: 'Items with Parent / Child', id: 10 }
  ];
  unitsCasePriceCost = [{ id: 1, name: 'Equal' }, { id: 2, name: 'Less than Equal to' },
  { id: 3, name: 'Greater than Equal to' }, { id: 4, name: 'Between' }];
  initialAdvanceForm: any;
  isAdvanceSearchCollapsed = true;
  gridProperties = { showPricing: false, showMultipackPricing: false, showDetails: false };
  itemGrpRowData: any;
  itemCatalogGridOptions: any;
  prcGrpDesc: string;
  posCodeOrDesc: string;
  isShowPrice = false;
  showPriceStoreLocationId: any;
  filterText: string;
  filterTextChild: string;
  filterTextOverlay: string;
  childStoreLocationID: any;
  showChildPriceStoreLocationId: any;
  showPricingChild: boolean | false;
  showPricingPrcGrp: boolean | false;
  showPricePrcGrpStoreLocationId: any;
  overlayItem: any;
  showPricing: any;
  itemList: string;
  recordsCount: any;
  itemsCount: any = -1;
  public isItemsCatalogCollapse = true;
  isItemCatalogStore = false;
  itemCatalogGridData: any;
  constructor(private cdr: ChangeDetectorRef, private storeService: StoreService, private fb: FormBuilder, private spinner: NgxSpinnerService, private toastr: ToastrService, private setupService: SetupService,
    private gridService: PaginationGridService, private constants: ConstantService, private messageService: MessageService, private commonService: CommonService) {
    this.messageService.sendMessage('expanded_collaps');
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.companyPriceGroupNewGrid);
    this.gridOptions.pagination = false;
    this.childGridOptions = this.gridService.getGridOption(this.constants.gridTypes.priceGrpNewItemDetailGrid1);
    this.subContGridOptions = this.gridService.getGridOption(this.constants.gridTypes.itemListOverlayGrpGrid);
    this.childGrpExpGridOptions = this.gridService.getGridOption(this.constants.gridTypes.itemListChildGrpGrid);
    this.itemCatalogGridOptions = this.gridService.getGridOption(this.constants.gridTypes.itemCatalogGrid);
    this.userInfo = this.constants.getUserInfo();
    this.initialAdvanceForm = this.advancedSearchForm.value;
    this.detailCellRenderer = GroupDetailCellRenderer;
    this.childStoreLocationID = null;
    this.showPricePrcGrpStoreLocationId = null;
  }

  ngOnInit() {
    this.getCompanyPriceGroup();
    this.getDepartment();
    this.getStoreLocation();
    this.getVendorByCompanyId();
    this.getPOSGroup();
  }
  childStoreChange() {
    this.renderChildGridData();
  }
  catalogStoreChange() {
    this.isItemCatalogStore = true;
    this.getAdvanceSerach();
  }
  groupStoreChange() {
    if (this.overlayItem) {
      this.searchItems(this.overlayItem);
    }
  }
  onFilterOverlayBoxChanged() {
    if (this.selectedRadio == 'itemsCatalog') {
      this.itemCatalogGridApi.setQuickFilter(this.filterTextOverlay);
    }
    else if (this.selectedRadio == 'priceGroups') {
      this.subContGridApi.setQuickFilter(this.filterTextOverlay);
    }
  }
  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(this.filterText);
  }
  onChildFilterTextBoxChanged() {
    // this.expGridApi.setQuickFilter(this.filterTextChild);
    this.commonService.setCellChange(this.filterTextChild);
  }
  addToGrps() {
    if (this.selectedRadio == 'itemsCatalog') {
      if (this.itemList && this.itemList.length > 0) {
        this.spinner.show();
        this.setupService.postData('Promotion/itemlist/addListItems?itemListId=' + this.selectedItem.ItemListID + '&itemId=' + this.itemList + '&username=' + this.userInfo.userName, '').subscribe(
          (res) => {
            this.spinner.hide();
            this.toastr.success("List Items Added Successfully");
            this.renderChildGridData();
            this.closeSideContainer();
          }, (error) => {
            console.log(error);
            this.spinner.hide();
          }
        );
      } else {
        this.toastr.warning('Please Select Any Value', 'warning');
      }
    }
  }
  showPriceChange($event) {
    this.isShowPrice = $event.checked;
    if (!$event.checked)
      this.showPriceStoreLocationId = null;
  }
  showPricePrcGrpChange($event) {
    if (!$event.checked)
      this.showPricePrcGrpStoreLocationId = null;
  }
  showPriceChildChange($event) {

    if (!$event.checked)
      this.childStoreLocationID = null;
  }
  itemCatalogRowSelected($event) {
    let nodes = $event;
    this.itemList = '';
    this.itemList = nodes ? nodes.map(x => { return x.data.ItemID }).join(',') : '';
  }

  onPrcGrpDescChanged() {
    this.searchPriceGrp(this.prcGrpDesc);
  }
  dynamicValidation() {
    if (this.selectedRadio == "itemsCatalog") {
      if (!this.advancedSearchForm.get('posCodeOrDesc').value && (!this.advancedSearchForm.get('department').value
        || this.advancedSearchForm.get('department').value.length === 0)
        && (!this.advancedSearchForm.get('locationCriteria').value || this.advancedSearchForm.get('locationCriteria').value.length === 0) &&
        (!this.advancedSearchForm.get('vendorCriteria').value || this.advancedSearchForm.get('vendorCriteria').value.length === 0)) {
        return false;
      }
    }
    return true;
  }
  getAdvanceSerach(advanceFilterSearch?) {
    if (!advanceFilterSearch && !this.dynamicValidation()) {
      this.toastr.warning('Please Select Any Value', 'warning');
      return;
    }
    this.isAdvanceSearchCollapsed = true;
    let storeLocation: any;
    if (this.storeLocationList && this.storeLocationList.length !== 1 && this.showPriceStoreLocationId == null) {
      storeLocation = this.advancedSearchForm.value.locationCriteria ?
        this.advancedSearchForm.value.locationCriteria.map(x => x.storeLocationID).join(',') : '';
    } else {
      storeLocation = this.showPriceStoreLocationId;
    }
    const vendoeLst = this.advancedSearchForm.value.vendorCriteria ?
      this.advancedSearchForm.value.vendorCriteria.map(x => x.vendorID).join(',') : '';
    const departmentLst = this.advancedSearchForm.value.department ?
      this.advancedSearchForm.value.department.map(x => x.departmentID).join(',') : '';

    // sellingUnit
    // tslint:disable-next-line:max-line-length
    if (this.advancedSearch.sellingUnits === '1') { this.advancedSearchForm.get('sellingUnitEnd').setValue(this.advancedSearchForm.get('sellingUnitStart').value); }
    if (this.advancedSearch.sellingUnits === '2') { this.advancedSearchForm.get('sellingUnitStart').setValue(Number(0)); }
    if (this.advancedSearch.sellingUnits === '3') { this.advancedSearchForm.get('sellingUnitEnd').setValue(10000); }

    // unitsInCase
    // tslint:disable-next-line:max-line-length
    if (this.advancedSearch.unitinCase === '1') { this.advancedSearchForm.get('unitsInCaseEnd').setValue(this.advancedSearchForm.get('unitsInCaseStart').value); }
    if (this.advancedSearch.unitinCase === '2') { this.advancedSearchForm.get('unitsInCaseStart').setValue(Number(0)); }
    if (this.advancedSearch.unitinCase === '3') { this.advancedSearchForm.get('unitsInCaseEnd').setValue(10000); }


    // sellingPrice
    // tslint:disable-next-line:max-line-length
    if (this.advancedSearch.sellingPrice === '1') { this.advancedSearchForm.get('sellingPriceEnd').setValue(this.advancedSearchForm.get('sellingPriceStart').value); }
    if (this.advancedSearch.sellingPrice === '2') { this.advancedSearchForm.get('sellingPriceStart').setValue(Number(0)); }
    if (this.advancedSearch.sellingPrice === '3') { this.advancedSearchForm.get('sellingPriceEnd').setValue(10000); }
    if (this.advancedSearch.sellingPrice === '0') {
      this.advancedSearchForm.get('sellingPriceStart').setValue(null);
      this.advancedSearchForm.get('sellingPriceEnd').setValue(null);
    }

    // inventoryValuePriceEnd
    // tslint:disable-next-line:max-line-length
    if (this.advancedSearch.inventoryValuePrice === '1') { this.advancedSearchForm.get('inventoryValuePriceEnd').setValue(this.advancedSearchForm.get('inventoryValuePriceStart').value); }
    if (this.advancedSearch.inventoryValuePrice === '2') { this.advancedSearchForm.get('inventoryValuePriceStart').setValue(Number(0)); }
    if (this.advancedSearch.inventoryValuePrice === '3') { this.advancedSearchForm.get('inventoryValuePriceEnd').setValue(10000); }
    if (this.advancedSearch.inventoryValuePrice === '0') {
      this.advancedSearchForm.get('inventoryValuePriceStart').setValue(null);
      this.advancedSearchForm.get('inventoryValuePriceEnd').setValue(null);
    }

    // currentInventory
    // tslint:disable-next-line:max-line-length
    if (this.advancedSearch.currentInventory === '1') { this.advancedSearchForm.get('currentInventoryEnd').setValue(this.advancedSearchForm.get('currentInventoryStart').value); }
    if (this.advancedSearch.currentInventory === '2') { this.advancedSearchForm.get('currentInventoryStart').setValue(Number(0)); }
    if (this.advancedSearch.currentInventory === '3') { this.advancedSearchForm.get('currentInventoryEnd').setValue(10000); }

    // Profit margin
    // tslint:disable-next-line:max-line-length
    if (this.advancedSearch.pmCriteria === '1') { this.advancedSearchForm.get('pmEndCriteria').setValue(this.advancedSearchForm.get('pMStartCriteria').value); }
    if (this.advancedSearch.pmCriteria === '2') { this.advancedSearchForm.get('pMStartCriteria').setValue(Number(0)); }
    if (this.advancedSearch.pmCriteria === '3') { this.advancedSearchForm.get('pmEndCriteria').setValue(10000); }
    if (this.advancedSearch.pmCriteria === '0') {
      this.advancedSearchForm.get('pMStartCriteria').setValue(null);
      this.advancedSearchForm.get('pmEndCriteria').setValue(null);
    }

    const constLocationList = this.storeLocationList ? this.storeLocationList.map(x => x.storeLocationID).join(',') : '';
    this.filterTextOverlay = "";
    this.spinner.show();
    this.setupService.getData(`Promotion/itemlist/getSearchItemsListItems?CompanyID=${this.userInfo.companyId}
&isShowPricing=${this.isShowPrice}
&posCodeOrDesc=${this.advancedSearchForm.value.posCodeOrDesc ? this.advancedSearchForm.value.posCodeOrDesc : ''}
&Location=${storeLocation ? storeLocation : constLocationList}
&Vendor=${vendoeLst ? vendoeLst : ''}
&Department=${departmentLst ? departmentLst : ''}
&SellingPriceStart=${this.advancedSearch.sellingPrice ? this.advancedSearchForm.value.sellingPriceStart : null}
&SellingPriceEnd=${this.advancedSearch.sellingPrice ? this.advancedSearchForm.value.sellingPriceEnd : null}
&InventoryValuePriceStart=${this.advancedSearch.inventoryValuePrice ? this.advancedSearchForm.value.inventoryValuePriceStart : null}
&InventoryValuePriceEnd=${this.advancedSearch.inventoryValuePrice ? this.advancedSearchForm.value.inventoryValuePriceEnd : null}
&POSSyncStatus=${this.advancedSearchForm.value.posSyncStatus ? this.advancedSearchForm.value.posSyncStatus : ''}
&GroupID=${this.advancedSearchForm.value.priceGroup ? this.advancedSearchForm.value.priceGroup : null}
&ItemListID=${this.selectedItem.ItemListID}
&ProfitMarginStart=${this.advancedSearch.pmCriteria ? this.advancedSearchForm.value.pMStartCriteria : null}
&ProfitMarginEnd=${this.advancedSearch.pmCriteria ? this.advancedSearchForm.value.pmEndCriteria : null}
&isActive=${this.advancedSearch.isActive ? this.advancedSearchForm.value.isActive : null}
&searchBy=${this.advancedSearch.searchBy ? this.advancedSearchForm.value.searchBy : null}
`, '').subscribe((response) => {

      this.spinner.hide();
      if (response && response['statusCode']) {
        this.rowData = [];
        this.toastr.warning('Unable to fetch record', 'warning');
        return;
      }
      this.itemGrpRowData = response;
      this.recordsCount = this.itemGrpRowData.length;
      this.selectedRadio = "";
      setTimeout(() => {
        this.selectedRadio = 'itemsCatalog';
        this.itemCatalogGridData = response;
      });
      this.itemCatalogGridApi.setRowData(this.itemGrpRowData);
    }, (error) => {
      this.spinner.hide();
      this.rowData = [];
      this.toastr.error('Unable to fetch record');
    });
  }

  clearAdvanceSearch() {
    this.advancedSearchForm.patchValue(this.initialAdvanceForm);
    this.bindStoreLocationID();
  }
  selectStore() {
    this.storeLocationID = this.advancedSearchForm.value.locationCriteria;
  }
  selectUnits(formControl) {
    if (formControl === 'sellingUnits') {
      this.advancedSearchForm.get('sellingUnitStart').setValue(0);
      this.advancedSearchForm.get('sellingUnitEnd').setValue(0);
    }
    if (formControl === 'unitinCase') {
      this.advancedSearchForm.get('unitsInCaseStart').setValue(0);
      this.advancedSearchForm.get('unitsInCaseEnd').setValue(0);
    }
    if (formControl === 'sellingPrice') {
      this.advancedSearchForm.get('sellingPriceStart').setValue(0);
      this.advancedSearchForm.get('sellingPriceEnd').setValue(0);
    }
    if (formControl === 'inventoryValuePrice') {
      this.advancedSearchForm.get('inventoryValuePriceStart').setValue(0);
      this.advancedSearchForm.get('inventoryValuePriceEnd').setValue(0);
    }
    if (formControl === 'currentInventory') {
      this.advancedSearchForm.get('currentInventoryStart').setValue(0);
      this.advancedSearchForm.get('currentInventoryEnd').setValue(0);
    }
    if (formControl === 'pmCriteria') {
      this.advancedSearchForm.get('pMStartCriteria').setValue(null);
      this.advancedSearchForm.get('pmEndCriteria').setValue(null);
    }

  }
  get advancedSearch() { return this.advancedSearchForm.value; }
  getPOSGroup() {
    this.setupService.getPOSGroupDepartment().subscribe((response) => {
      this.isLoading = false;
      this.posSyncStatusList = response[0];
      this.priceGroupList = response[1];
    });
  }
  getVendorByCompanyId() {
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
  bindStoreLocationID() {
    if (this.storeLocationList && this.storeLocationList.length === 1) {

      this.showPricingChild = true;
      this.childStoreLocationID = this.storeLocationList[0].storeLocationID;

      this.showPricing = true;
      this.showPriceStoreLocationId = this.storeLocationList[0].storeLocationID;

      this.showPricingPrcGrp = true;
      this.showPricePrcGrpStoreLocationId = this.storeLocationList[0].storeLocationID;

      this.advancedSearchForm.get('locationCriteria').setValue(this.storeLocationList[0].storeLocationID);
      this.storeLocationID = this.storeLocationList[0].storeLocationID;

      this.isShowPrice = true;
    } else {
      this.showPricingChild = false;
      this.childStoreLocationID = null;

      this.showPricing = false;
      this.showPriceStoreLocationId = null;

      this.showPricingPrcGrp = false;
      this.showPricePrcGrpStoreLocationId = null;
    }
  }
  getStoreLocation(): any {
    if (this.storeService.storeLocation) {
      this.isStoreLocationLoading = false;
      this.storeLocationList = this.storeService.storeLocation;
      this.bindStoreLocationID();
      // this.bindBulkUpdateStoreLocationID();
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.storeLocationList = this.storeService.storeLocation;
        this.isStoreLocationLoading = false;
        this.bindStoreLocationID();
        //    this.bindBulkUpdateStoreLocationID();
      }, (error) => {
        console.log(error);
      });
    }

  }
  onExpGridReady(params) {
    this.expGridApi = params.api;
    this.expColumnApi = params.columnApi;
    params.api.sizeColumnsToFit();
  }
  addItem() {
    if (this.newRowAdded) {
      this.toastr.error('Please save existing data first before adding another!');
      return;
    }
    this.filterText = "";
    this.onFilterTextBoxChanged();
    this.newRowAdded = true;
    this.gridApi.updateRowData({
      add: [{
        Description: '',
        itemListID: 0,
        isNewRow: true,
        "isEdit": true,
        "isCancel": true
      }], addIndex: 0
    });
    this.gridApi.redrawRows();
    this.getStartEditingCell('Description', 0);
  }
  getStartEditingCell(_colKey, _rowIndex) {
    this.gridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }
  userInfo: any;
  rowData: any = [];
  gridOptions: any;
  gridApi: any;
  expGridApi: any;
  //grid2
  childRowData: any = [];
  childGridOptions: any;
  childGridApi: any;

  //overlay grid
  sideContainer: any = "side-container-close";
  subContGridOptions: any;
  subContGridApi: any;
  itemCatalogGridApi: any;
  newRowAdded = false;
  selectedRadio: any;
  isPriceGroupAdded = false;
  advancedSearchForm = this.fb.group({
    posCodeOrDesc: [null],
    sellingUnits: [''],
    sellingUnitStart: [null], // 0,
    sellingUnitEnd: [null], // 0,
    unitinCase: [0],
    unitsInCaseStart: [null], // 0,
    unitsInCaseEnd: [null], // 0,
    sellingPrice: [0],
    sellingPriceStart: [null], // 0,
    sellingPriceEnd: [null], // 0,
    inventoryValuePrice: [0],
    inventoryValuePriceStart: [null], // 0,
    inventoryValuePriceEnd: [null], // 0,
    currentInventory: [0],
    currentInventoryStart: [null], // 0,
    currentInventoryEnd: [null], // 0,
    pMStartCriteria: [null], // 0,
    pmEndCriteria: [null], // 0,
    pmCriteria: [0],
    locationCriteria: [''],
    vendorCriteria: [null],
    department: [''],
    posSyncStatus: [0], // 0,
    isShowPricing: [null],
    isClick: [true],
    isOnWatchList: [''],
    priceGroup: [], // 0,
    isMultipack: [true],
    isActive: [''],
    searchBy: [null], // 0,
    isShowMultiPackPricing: [false],
    isShowDetails: [false],
    searchByDepat: [true],
    searchByPriceGroup: [false]
  });
  getDepartment() {
    this.setupService.getData(`Department/getAll/${this.userInfo.userName}/${this.userInfo.companyId}`)
      .subscribe(res => {
        const myOrderedArray = _.sortBy(res, o => o.departmentDescription);
        this.departmentListByUser = myOrderedArray;
      }, err => {
        console.log(err);
      });
  }
  searchItems(item, index?) {
    this.overlayItem = item;
    this.spinner.show();
    this.setupService.postData('Promotion/itemlist/addGroups?itemListId=' + this.selectedItem.ItemListID + '&groupId=' + item.CompanyPriceGroupID + '&username=' + this.userInfo.userName, '').subscribe(
      (res) => {
        this.spinner.hide();
        if (res == "1") {
          this.priceGroupsList.splice(index, 1);
          this.spinner.show();
          this.setupService.getData('Promotion/ItemList/GetitemListDetailsByItemListID?ItemListID=' + this.selectedItem.ItemListID + '&StorelocationID=' + this.showPricePrcGrpStoreLocationId).subscribe(
            (res) => {
              this.spinner.hide();
              let itemListItems;
              if (this.showPricePrcGrpStoreLocationId) {
                itemListItems = res.itemListStorelocationItems;
              }
              else {
                itemListItems = res.itemListItems;
              }
              let itemListGroup = res.itemListGroups;
              itemListGroup.unshift({
                "companyPriceGroupName": "Items",
                "childGridData": itemListItems,
                "companyPriceGroupID": null,
                "storeLocationID": this.showPricePrcGrpStoreLocationId,
              });
              itemListGroup.forEach(element => {
                element.storeLocationID = this.showPricePrcGrpStoreLocationId;
                element.itemListID = this.selectedItem.ItemListID;
              });
              this.recordsCount = itemListGroup.length;
              this.subContGridApi.setRowData(itemListGroup);
              this.isPriceGroupAdded = true;
              this.subContGridApi.sizeColumnsToFit();
            }, (error) => {
              this.spinner.hide();
              console.log(error);
            }
          );
        }
      }, (error) => {
        console.log(error);
      }
    );
  }
  searchPriceGrp(searchTerm) {
    this.spinner.show();
    searchTerm = searchTerm ? searchTerm : ''
    this.setupService.getData('Promotion/ItemList/SearchCompanyPricegroup?itemListId=' + this.selectedItem.ItemListID + '&companyPriceGroupName=' + searchTerm + '&companyID=' + this.userInfo.companyId, '').subscribe(
      (res) => {
        this.spinner.hide();
        let orderedArray = _.sortBy(res, o => o.CompanyPriceGroupName);
        this.priceGroupsList = orderedArray;
        this.subContGridApi.setRowData([]);
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }
  radioChange(e) {
    this.overlayItem = null;
    this.recordsCount = 0;
    if (this.selectedRadio == "priceGroups") {
      this.searchPriceGrp('');
      this.showPricing = false;
      this.showPriceStoreLocationId = null;
    }
    else if (this.selectedRadio == "itemsCatalog") {
      this.showPricingPrcGrp = false;
      this.isShowPrice = false;
      this.showPricePrcGrpStoreLocationId = null;
    }
    this.bindStoreLocationID();
  }
  getCompanyPriceGroup() {
    this.spinner.show();
    this.setupService.getData('Promotion/ItemList/GetitemListItemscount?companyID=' + this.userInfo.companyId).subscribe(
      (res) => {
        this.spinner.hide();
        this.rowData = res;
        if (this.gridApi)
          this.gridApi.setRowData(res);
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }
  Cancel(_rowIndex) {
    this.gridApi.getRowNode(_rowIndex).data = this.gridApi.getRowNode(_rowIndex).data.copy;
    this.gridApi.getRowNode(_rowIndex).data.isEdit = false;
    this.gridApi.stopEditing(true);
    this.gridApi.refreshCells();
    this.gridApi.redrawRows();
  }
  deleteRow(_rowIndex) {
    const allNodesData = Array<any>()
    this.gridApi.forEachNode((node, i) => {
      if (_rowIndex !== parseInt(node.id)) {
        allNodesData.push(node.data);
      }
    });
    this.gridApi.setRowData(allNodesData);
    this.toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.delete);
    this.spinner.hide();
  }
  Delete(_rowIndex) {
    this.spinner.show();
    const ItemListID = this.gridApi.getRowNode(_rowIndex).data.ItemListID;
    if (parseInt(ItemListID) > 0) {
      this.setupService.deleteData(`Promotion/itemlist/delete/${ItemListID}`).subscribe(result => {
        this.spinner.hide();
        if (result === '0') {
          this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
        } else if (result === '1') {
          this.itemsCount = -1;
          this.deleteRow(_rowIndex);
        } else {
          this.toastr.error(result.result.validationErrors ? result.result.validationErrors[0].errorMessage : "", this.constants.infoMessages.error);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(this.constants.infoMessages.contactAdmin);
      });
    }
    else {
      this.deleteRow(_rowIndex);
      this.newRowAdded = false;
    }
  }
  onBtStopEditing(rowIndex) {
    this.gridApi.stopEditing();
    let $event = this.gridApi.getRowNode(rowIndex);
    const description = $event.data.Description;
    this.spinner.show();
    this.setupService.getData('Promotion/itemlist/checkDescription' + '/' + this.userInfo.companyId + '/' + description).subscribe(
      (res) => {
        this.spinner.hide();
        if (res == "false" && $event.data.isNewRow && $event.data.isNewRow == true) {
          const postData = {
            ItemListID: 0,
            companyID: this.userInfo.companyId,
            description: $event.data.Description,
            createdBy: this.userInfo.userName,
            createdDateTime: new Date(),
            lastModifiedDatetime: new Date(),
            LastModifiedBy: this.userInfo.userName
          };
          this.spinner.show();
          this.setupService.postData('Promotion/itemlist/addnew', postData).subscribe(
            (res) => {
              this.spinner.hide();
              if (res.itemListID) {
                this.newRowAdded = false;
                $event.data["ItemListID"] = res.itemListID;
                $event.data["NoOfItems"] = 0;
                $event.data.isEdit = false;
                $event.data.isNewRow = false;
                $event.data.isCancel = true;
                this.gridApi.stopEditing();
                this.rowData.push($event.data);
                this.toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
              } else {
                this.getStartEditingCell('Description', 0);
                this.toastr.error(res.result.validationErrors ? res.result.validationErrors[0].errorMessage : "", this.constants.infoMessages.error);
              }
            }, (error) => {
              this.spinner.hide();
              console.log(error);
            }
          );
        }
        else if (res == "false" && $event.data.ItemListID > 0) {
          const postData = {
            ItemListID: $event.data.ItemListID,
            companyID: this.userInfo.companyId,
            description: $event.data.Description,
            createdBy: this.userInfo.userName,
            createdDateTime: new Date(),
            lastModifiedDatetime: new Date(),
            LastModifiedBy: this.userInfo.userName
          }
          this.spinner.show();
          this.setupService.updateData('Promotion/itemlist/update', postData).subscribe(
            (res) => {
              if (res == '1')
                this.spinner.hide();
              $event.data.isEdit = false;
              $event.data.isCancel = true;
              this.toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
            }, (error) => {
              console.log(error);
              this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
              this.spinner.hide();
            }
          );
        }
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }
  editAction(rowIndex) {
    this.gridApi.redrawRows();
    this.gridApi.forEachNode((rowNode, index) => {
      if (rowNode.rowIndex == parseInt(rowIndex)) {
        rowNode.data.copy = null;
        rowNode.data.copy = JSON.parse(JSON.stringify(rowNode.data));
        rowNode.data.isEdit = true;
      }
      else
        rowNode.data.isEdit = false;
    });

    this.getStartEditingCell('Description', rowIndex);
  }
  onCellClicked(params) {
    if (params.colDef.headerName != "Action") {
      if (params.data.isNewRow) {
        this.getStartEditingCell('Description', parseInt(params.rowIndex));
        return;
      }
      this.selectedItem = params.data;
      if (params.data.NoOfItems)
        this.itemsCount = params.data.NoOfItems;
      else
        this.itemsCount = 0;
      this.renderChildGridData();
    }
  }

  renderChildGridData() {
    this.spinner.show();
    this.setupService.getData('Promotion/ItemList/GetitemListDetailsByItemListID?ItemListID=' + this.selectedItem.ItemListID + '&StorelocationID=' + this.childStoreLocationID).subscribe(
      (res) => {
        this.spinner.hide();
        let itemListItems;
        if (this.childStoreLocationID) {
          itemListItems = res.itemListStorelocationItems;
        }
        else {
          itemListItems = res.itemListItems;
        }
        let itemListGroup = res.itemListGroups;

        itemListGroup.unshift({
          "companyPriceGroupName": "Items",
          "childGridData": itemListItems,
          "companyPriceGroupID": null,
          "storeLocationID": this.childStoreLocationID,
          "itemListID": this.selectedItem.ItemListID
        });
        itemListGroup.forEach(element => {
          element.storeLocationID = this.childStoreLocationID;
          element.itemListID = this.selectedItem.ItemListID;
        });
        if (this.expGridApi)
          this.expGridApi.setRowData(itemListGroup);
        setTimeout(() => {
          if (this.expGridApi && this.expGridApi.getDisplayedRowAtIndex && this.expGridApi.getDisplayedRowAtIndex(0))
            this.expGridApi.getDisplayedRowAtIndex(0).setExpanded(true);
        });
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }

  openSideContainer() {
    if (!this.selectedItem) {
      this.toastr.warning("Please select an item");
      return;
    }
    this.isPriceGroupAdded = false;
    document.getElementById("overlay").style.display = "block";
    this.advancedSearchForm.reset();
    this.prcGrpDesc = "";
    this.filterTextOverlay = "";
    this.sideContainer = 'side-container-open';
    this.selectedRadio = "priceGroups";
    this.radioChange('');
  }

  closeSideContainer() {
    document.getElementById("overlay").style.display = "none";
    this.sideContainer = 'side-container-close';
    this.selectedRadio = null;
    this.priceGroupsList = [];
    this.itemCatalogGridData = [];
    this.clearAdvanceSearch();
    this.itemList = '';
    if (this.isPriceGroupAdded) {
      this.renderChildGridData();
    }
  }

  onOverlayGridReady(params) {
    this.subContGridApi = params.api;
    this.subContGridApi.setRowData([]);
    this.subContGridApi.sizeColumnsToFit();
  }
  onItemCatalogGridReady(params) {
    this.itemCatalogGridApi = params.api;
    let itemCatalogGridOptionsWithPriceColumn;
    if (this.showPriceStoreLocationId && this.showPricing)
      itemCatalogGridOptionsWithPriceColumn = _.cloneDeep(this.gridService.getGridOption(this.constants.gridTypes.itemCatalogStoreGrid));
    else
      itemCatalogGridOptionsWithPriceColumn = _.cloneDeep(this.gridService.getGridOption(this.constants.gridTypes.itemCatalogGrid));
    this.itemCatalogGridApi.setColumnDefs(itemCatalogGridOptionsWithPriceColumn.columnDefs);
    this.itemCatalogGridApi.setRowData(this.itemCatalogGridData);
    this.itemCatalogGridApi.sizeColumnsToFit();
  }

  delAction(params: any) {
    this.spinner.show();
    this.setupService.deleteData(`Promotion/itemListGroup/delete/` + params.data.itemListIGroupID).subscribe(result => {
      this.spinner.hide();
      if (result === '0') {
        this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
      } else if (result === '1') {
        this.toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.delete);
        const allNodesData = Array<any>()
        this.expGridApi.forEachNode((node, i) => {
          if (params.rowIndex !== parseInt(node.id)) {
            allNodesData.push(node.data);
          }
        });
        this.expGridApi.setRowData(allNodesData);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(this.constants.infoMessages.contactAdmin);
    });
  }
}
