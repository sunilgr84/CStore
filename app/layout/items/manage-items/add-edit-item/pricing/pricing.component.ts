import { Component, OnInit, Input, Output, ChangeDetectorRef, ViewChild, EventEmitter } from '@angular/core';
import { get as _get } from 'lodash';

import { SetupService } from '@shared/services/setupService/setup-service';
import { CommonService } from '@shared/services/commmon/common.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'lodash';
import { StoreService } from '@shared/services/store/store.service';
import { AdvPaginationGridComponent } from '@shared/component/pagination-grid/adv-pagination-grid/adv-pagination-grid.component';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss'],
})
export class PricingComponent implements OnInit {
  @Input()
  itemID: number;
  @Input() unitsInCase?: any;
  @Output() onSave: EventEmitter<any> = new EventEmitter();

  private _isAddMultipacks: boolean;

  @Input()
  get isAddMultipacks() {
    return this._isAddMultipacks;
  }
  set isAddMultipacks(value: boolean) {
    this._isAddMultipacks = value;
    this.onMultiPackChange(value);
  }


  isShow = true;
  isMultipleStores = true;
  isCase: boolean;
  selectedStores: any[] = [];
  storesList: any[] = [];
  inventoryValuePrice: any;
  sellingPrice: any;
  isApplyPriceChangestoAllStores = false;
  editStoreItemsGridApi: any;
  editStoreItemsRowData: any = [];
  storeItemsGridEditableOptions: any;
  userInfo = this.constantService.getUserInfo();
  _pricingRowIndex: any;
  gridApi: any;
  gridColumnApi: any;
  isConfirmRemoveOpen: boolean = false;
  removeData: any;
  @ViewChild(AdvPaginationGridComponent) child: AdvPaginationGridComponent;
  constructor(
    private dataService: SetupService,
    private constantService: ConstantService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private paginationGridService: PaginationGridService,
    private commonService: CommonService,
    private storeService: StoreService,
    private cdRef: ChangeDetectorRef
  ) {
    this.storeItemsGridEditableOptions = this.paginationGridService.getGridOption(
      this.constantService.gridTypes.storeItemsGrid
    );
  }
  onMultiPackChange(isMultiPack: boolean): void {
    if (this.editStoreItemsRowData && this.editStoreItemsRowData.length > 0) {
      this.editStoreItemsRowData.forEach(row => {
        row.isAddMultipacks = isMultiPack;
      });
      this.editStoreItemsGridApi.setRowData(this.editStoreItemsRowData);
    }
  }
  ngOnInit() {
    this.getStoreLocation();
    this.fetchStoreLocationItemByItemID(this.itemID, true);
    this.isCase = false;
  }

  handleConfirmRemoveClose(e) {
    if (e == 'confirm') {
      this.spinner.show();
      let postData = {
        userName: this.userInfo.userName,
        itemId: this.removeData.data.ItemID,
        storeLocationId: this.removeData.data.StoreLocationID,
      };
      this.dataService.postData(`Item/ItemDeletion`, postData).subscribe(
        (response: any) => {
          this.spinner.hide();
          if (response && response.status == 1) {
            this.toastr.success(
              this.constantService.infoMessages.suspendRecord,
              this.constantService.infoMessages.success
            );
            this.fetchStoreLocationItemByItemID(this.itemID, true);
          } else {
            this.toastr.error(
              this.constantService.infoMessages.suspendRecordFailed,
              this.constantService.infoMessages.error
            );
          }
        },
        (error) => {
          this.spinner.hide();
          this.toastr.error(
            this.constantService.infoMessages.suspendRecordFailed,
            this.constantService.infoMessages.contactAdmin
          );
        }
      );
    }
    this.isConfirmRemoveOpen = false;
    this.removeData = null;
  }



  onCaseChange($event) {
    this.isShow = false;
    this.isCase = $event.currentTarget.checked;
    this.selectedStores = [];
    if (this.isCase) {
      this.storeItemsGridEditableOptions = this.paginationGridService.getGridOption(
        this.constantService.gridTypes.storeItemsGridCase
      );
    } else {
      this.storeItemsGridEditableOptions = this.paginationGridService.getGridOption(
        this.constantService.gridTypes.storeItemsGrid
      );
    }
    if (this.isCase == false) {
      this.editStoreItemsRowData.forEach((element) => {
        element['InventoryValuePrice'] = element.InventoryValuePriceCopy;
        element.isAddMultipacks = this._isAddMultipacks;
      });
    }
    setTimeout(() => {
      this.isShow = true;
      setTimeout(() => {
        if (this.editStoreItemsGridApi) {
          if (this.editStoreItemsRowData && this.editStoreItemsRowData.length != 0 && this.editStoreItemsRowData.length <= 6) {
            this.editStoreItemsGridApi.setDomLayout('normal');
            this.child.setHeight('400px');
          }
          else {
            this.editStoreItemsGridApi.setDomLayout('autoHeight');
            this.child.setHeight('');
          }
          this.editStoreItemsGridApi.sizeColumnsToFit();
        }
      }, 100);
    }, 100);
  }

  getStoreLocation(): any {
    if (this.storeService.storeLocation) {
      this.storesList = this.storeService.storeLocation;
    } else {
      this.storeService
        .getStoreLocation(this.userInfo.companyId, this.userInfo.userName)
        .subscribe(
          (response) => {
            this.storesList = this.storeService.storeLocation;
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }

  onStoreSelection(event) {
    this.editStoreItemsGridApi.forEachNode((rowNode) => {
      if (rowNode.data) {
        let storeSelected = event.filter(
          (store) => store.storeLocationID === rowNode.data.StoreLocationID
        );
        if (storeSelected.length > 0) rowNode.setSelected(true);
        else rowNode.setSelected(false);
      }
    });
  }

  onRowSelected(event) {
    if (event.node.data) {
      if (event.node.selected) {
        let selected = this.selectedStores.filter(
          (store) => store === event.node.data.storeLocationID
        );
        if (selected.length === 0) {
          this.selectedStores = [
            ...this.selectedStores,
            event.node.data.storeLocationID,
          ];
        }
      } else {
        this.selectedStores = this.selectedStores.filter(
          (store) => store !== event.node.data.storeLocationID
        );
      }
    }
  }

  onEditGridReady(params) {
    this.editStoreItemsGridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.editStoreItemsGridApi.sizeColumnsToFit();
    this.gridApi = params.api;
  }

  getStartEditingCell(_colKey, _rowIndex) {
    this.gridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey,
    });
  }

  editPriceingGrid(param) {
    this.editStoreItemsGridApi.stopEditing();
    if (
      param.node.data.inventoryValuePrice &&
      Number(param.node.data.inventoryValuePrice) > 999.99
    ) {
      this.toastr.warning('Buying Cost should be below in 999.99');
      this.getStartEditingCell('inventoryValuePrice', param.rowIndex);
      let rowNode = this.gridApi.getRowNode(param.rowIndex);
      rowNode.data.isNewRecord = true;//for save button showing
      return;
    }
    if (
      param.node.data.currentInventory &&
      Number(param.node.data.currentInventory) > 999.99
    ) {
      this.toastr.warning('Current Inventory should be below in 999.99');
      this.getStartEditingCell('currentInventory', param.rowIndex);
      let rowNode = this.gridApi.getRowNode(param.rowIndex);
      rowNode.data.isNewRecord = true;//for save button showing
      return;
    }

    if (
      param.node.data.currentInventory &&
      Number(param.node.data.currentInventory) <= 0
    ) {
      this.toastr.warning('Current Inventory should be greater than 0');
      this.getStartEditingCell('currentInventory', param.rowIndex);
      let rowNode = this.gridApi.getRowNode(param.rowIndex);
      rowNode.data.isNewRecord = true;//for save button showing
      return;
    }

    if (
      param.node.data.regularSellPrice &&
      Number(param.node.data.regularSellPrice) > 999.99
    ) {
      this.toastr.warning('Sell Price should be below in 999.99');
      this.getStartEditingCell('RegularSellPrice', param.rowIndex);
      let rowNode = this.gridApi.getRowNode(param.rowIndex);
      rowNode.data.isNewRecord = true;//for save button showing
      return;
    }

    const postData =
      this.isApplyPriceChangestoAllStores === true
        ? this.getvalidateGrid(param)
        : [
          {
            ...param.node.data,
            inventoryValuePrice: Number(param.node.data.inventoryValuePrice),
            regularSellPrice: Number(param.node.data.regularSellPrice),
            lastModifiedBy: this.userInfo.userName,
            currentAsOfDateTime: new Date(),
          },
        ];
    if (postData.length > 0) {
      this.editStoreItemsRowData = this.isApplyPriceChangestoAllStores
        ? postData
        : this.editStoreItemsRowData;
      this.spinner.show();
      // tslint:disable-next-line:max-line-length
      this.dataService
        .postData(
          'StoreLocationItem/updateListStoreLocationItem?CompanyID=' +
          this.userInfo.companyId,
          postData
        )
        .subscribe(
          (res) => {
            this.spinner.hide();
            if (res && res['statusCode']) {
              this.toastr.error(
                this.constantService.infoMessages.addRecordFailed,
                this.constantService.infoMessages.error
              );
              this.fetchStoreLocationItemByItemID(this.itemID, true);
              this.onSave.emit(postData[0]);
              return;
            }
            if (res) {
              this.toastr.success(
                this.constantService.infoMessages.addedRecord,
                this.constantService.infoMessages.success
              );
            } else {
              this.toastr.error(
                this.constantService.infoMessages.addRecordFailed,
                this.constantService.infoMessages.error
              );
            }
            this.fetchStoreLocationItemByItemID(this.itemID, true);
            this.onSave.emit(postData[0]);
          },
          (err) => {
            this.spinner.hide();
            this.toastr.error(
              this.constantService.infoMessages.addRecordFailed,
              this.constantService.infoMessages.error
            );
            console.log(err);
          }
        );
    }

    // else {
    //   const postdata = {
    //     ...param.data,
    //     LastModifiedBy: this.userInfo.userName
    //   };
    //   if (param.data.storeLocationItemID > 0) {
    //     this.spinner.show();
    //     this.dataService.postData('StoreLocationItem/update?isMobile=false&CompanyID=' + this.userInfo.companyId,
    //       postdata).subscribe(res => {
    //         this.spinner.hide();
    //         if (res && res['statusCode']) {
    //           this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
    //           this.fetchStoreLocationItemByItemID(this.itemId, true);
    //           return;
    //         }
    //         if (Number(res) > 0) {
    //           this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
    //         } else {
    //           this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
    //         }
    //       }, err => {
    //         this.spinner.hide();
    //         this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
    //         console.log(err);
    //       });
    //   } else {
    //     this.spinner.show();
    //     this.dataService.postData('StoreLocationItem/addNew',
    //       postdata).subscribe(res => {
    //         this.spinner.hide();
    //         if (res && res['statusCode']) {
    //           this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
    //           return;
    //         }
    //         if (res && res.storeLocationItemID) {
    //           this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
    //         } else {
    //           this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
    //         }
    //         this.fetchStoreLocationItemByItemID(this.itemId, true);
    //       }, err => {
    //         this.spinner.hide();
    //         this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
    //         console.log(err);
    //       });
    //   }
    // }
  }
  fetchStoreLocationItemByItemID(id, isMuti?: boolean) {
    this.isApplyPriceChangestoAllStores = false;
    // this.spinner.show();
    // tslint:disable-next-line:max-line-length
    this.dataService
      .getData(
        `StoreLocationItem/getAllStoreLocationItemByItemID/${id}/${this.userInfo.companyId}/${this.userInfo.userName}`
      )
      .subscribe(
        (res) => {
          // this.spinner.hide();
          if (res && res['statusCode']) {
            this.isMultipleStores = false;
            this.commonService.itemStoreList = this.editStoreItemsRowData = [];
            if (this.editStoreItemsGridApi)
              this.editStoreItemsGridApi.sizeColumnsToFit();
            return;
          }
          this.commonService.itemStoreList = res;
          let otherGroupData = [];
          this.editStoreItemsRowData = [];
          res.forEach((element) => {
            element.isSaveRequired = true;
            element['InventoryValuePriceCopy'] = element.InventoryValuePrice;
            element.isAddMultipacks = this._isAddMultipacks;
            if (element.CompanyStoregroupID == null) {
              element.storeGroup = { value: 0, name: 'Others' };
              otherGroupData.push(element);
            } else {
              element.storeGroup = {
                value: element.CompanyStoregroupID,
                name: element.CompanyStoreGroupName,
              };
              this.editStoreItemsRowData.push(element);
            }
          });
          this.editStoreItemsRowData = this.editStoreItemsRowData.concat(
            otherGroupData
          );
          if (this.editStoreItemsGridApi) {
            if (this.editStoreItemsRowData && this.editStoreItemsRowData.length <= 1)
              this.isMultipleStores = false;
            else
              this.isMultipleStores = true;
            this.editStoreItemsGridApi.setRowData(this.editStoreItemsRowData);
            if (this.editStoreItemsRowData && this.editStoreItemsRowData.length != 0 && this.editStoreItemsRowData.length <= 6) {
              this.editStoreItemsGridApi.setDomLayout('normal');
              this.child.setHeight('400px');
            }
            else {
              this.editStoreItemsGridApi.setDomLayout('autoHeight');
              this.child.setHeight('');
            }
            this.editStoreItemsGridApi.sizeColumnsToFit();
          }
        },
        (err) => {
          this.spinner.hide();
          console.log(err);
        }
      );
  }

  getvalidateGrid(param?: any) {
    const postData = [];
    this.editStoreItemsRowData.forEach(function (x: any, i: number) {
      if (this.isApplyPriceChangestoAllStores && param.node.data) {
        x['inventoryValuePrice'] = param.node.data['inventoryValuePrice'];
        x['regularSellPrice'] = param.node.data['regularSellPrice'];
      }
      x['lastModifiedBy'] = this.userInfo.userName;
      x['currentAsOfDateTime'] = new Date();
      postData.push(x);
    });
    return postData;
  }

  cellValueChanged(params) {
    var colId = params.column.getId();
    if (colId === 'BuyingCost') {
      if (
        params.data.BuyingCost &&
        params.data.BuyingDiscount &&
        Number(params.data.BuyingDiscount) < Number(params.data.BuyingCost)
      ) {
        params.data.inventoryValuePrice = (
          (params.data.BuyingCost - params.data.BuyingDiscount) /
          this.unitsInCase
        ).toFixed(2);
        const profit =
          parseFloat(params.data.RegularSellPrice) -
          parseFloat(params.data.InventoryValuePrice);
        let grossMargin =
          (profit * 100) / parseFloat(params.data.RegularSellPrice);
        params.data.ProfitMargin = grossMargin.toFixed(2);
        this.gridApi.redrawRows();
      }
    }
    if (colId === 'BuyingDiscount') {
      if (
        params.data.BuyingCost &&
        params.data.BuyingDiscount &&
        Number(params.data.BuyingDiscount) < Number(params.data.BuyingCost)
      ) {
        params.data.InventoryValuePrice = (
          (params.data.BuyingCost - params.data.BuyingDiscount) /
          this.unitsInCase
        ).toFixed(2);
        let profit =
          parseFloat(params.data.RegularSellPrice) -
          parseFloat(params.data.InventoryValuePrice);
        let grossMargin =
          (profit * 100) / parseFloat(params.data.RegularSellPrice);
        params.data.ProfitMargin = grossMargin.toFixed(2);
        this.gridApi.redrawRows();
      }
    }
    if (Number(params.data.BuyingDiscount) > Number(params.data.BuyingCost)) {
      this.toastr.warning('Cost Buy Should be greater than Cost Discount');
      params.data.BuyingDiscount = null;
      this.getStartEditingCell('BuyingDiscount', params.rowIndex);
      return;
    }
    if (Number(params.oldValue) !== Number(params.newValue)) {
      this._pricingRowIndex = params.rowIndex;
    }
    if (
      params.data &&
      params.data.InventoryValuePrice &&
      Number(params.data.InventoryValuePrice) > 999.99
    ) {
      this.toastr.warning('Cost should be below in 999.99');
      this.getStartEditingCell('InventoryValuePrice', params.rowIndex);
      return;
    }

    if (
      params.data.RegularSellPrice &&
      Number(params.data.RegularSellPrice) > 999.99
    ) {
      this.toastr.warning('Sell Price should be below in 999.99');
      this.getStartEditingCell('RegularSellPrice', params.rowIndex);
      return;
    }
  }

  onEdit(params) {
    this.getStartEditingCell('storeName', params.rowIndex);
  }

  onCancel(params) {
    let rowNode = this.gridApi.getRowNode(params.rowIndex);
    rowNode.data.isNewRecord = false;//for save button showing
    this.editStoreItemsGridApi.stopEditing();
  }

  // private cellValueChange = new Subject<any>();

  onCellValueChanged(params) {
    if (
      params.column.colId == 'inventoryValuePrice' ||
      params.column.colId == 'grossProfit'
    ) {
      this.commonService.setCellChange(params);
    }
    // this.cellValueChange.next("id");
  }

  applyPricing() {
    if (this.selectedStores.length == 0) {
      this.toastr.warning("Please select a store");
      return;
    }
    if (
      this.inventoryValuePrice &&
      Number(this.inventoryValuePrice) > 999.99
    ) {
      this.toastr.warning('Cost should be below in 999.99');
      return;
    }

    if (
      this.sellingPrice &&
      Number(this.sellingPrice) > 999.99
    ) {
      this.toastr.warning('Sell Price should be below in 999.99');
      return;
    }

    this.spinner.show();
    this.dataService.postData(`StoreLocationItem/UpdateStoreItemsprices?ItemID=` + this.itemID + '&UserName=' + this.userInfo.userName + '&StoreLocationID=' + this.selectedStores.join(',') + '&InventoryValuePrice=' + this.inventoryValuePrice + '&SellingPrice=' + this.sellingPrice, null).
      subscribe((response: any) => {
        if (response === "1") {
          this.spinner.hide();
          this.toastr.success("Pricing applied Successfully", this.constantService.infoMessages.success);
          this.fetchStoreLocationItemByItemID(this.itemID, true);
        } else {
          this.spinner.hide();
          this.toastr.error("Failed to apply pricing", this.constantService.infoMessages.error);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error("Failed to apply pricing", this.constantService.infoMessages.contactAdmin);
      });

  }

  showOverlayComponent: boolean = false;
  overlayComponentData: any = null;
  onCellButtonClick(e) {
    const cellId = _get(e.params, 'colDef.cellId', '');
    switch (cellId) {
      case 'multipack':
        {
          if (this._isAddMultipacks) {
            this.showOverlayComponent = true;
            this.overlayComponentData = e.params;
          }
          break;
        }
      default:
        console.warn('No case defined for cellId:' + cellId);
        break;
    }
  }

  onOverlayBackClick(e: Event) {
    this.showOverlayComponent = false;
    this.overlayComponentData = null;
  }

  stringify = (data) => JSON.stringify(data);

  handleScroll(el: any) {
    el.scrollIntoView({ behavior: 'smooth' });
  }

  suspendAction(event) {
    this.spinner.show();
    let postData = [{
      itemId: event.data.itemID,
      username: this.userInfo.userName,
      StoreLocationId: event.data.storeLocationID
    }];
    this.dataService.postData(`Item/SuspendItem`, postData).
      subscribe((response: any) => {
        if (response.status && response.status === 1) {
          this.spinner.hide();
          this.toastr.success("Item Suspended Successfully", this.constantService.infoMessages.success);
          this.fetchStoreLocationItemByItemID(this.itemID, true);
        } else {
          this.spinner.hide();
          this.toastr.error("Item Suspension Failed", this.constantService.infoMessages.error);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.contactAdmin);
      });
  }

  recoverAction(event) {
    this.spinner.show();
    let postData = {
      itemId: event.data.ItemID,
      username: this.userInfo.userName,
      storeLocationId: event.data.StoreLocationID,
      withMultipackItem: false
    }
    this.dataService.postData(`Item/ItemRecovery`, postData).
      subscribe((response: any) => {
        if (response.status && response.status === 1) {
          this.spinner.hide();
          this.toastr.success("Item Recovered Successfully", this.constantService.infoMessages.success);
          this.fetchStoreLocationItemByItemID(this.itemID, true);
        } else {
          this.spinner.hide();
          this.toastr.error("Item Recovery Failed", this.constantService.infoMessages.error);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.contactAdmin);
      });
  }

  onRowEditingStopped(params) {
    let rowNode = this.editStoreItemsGridApi.getRowNode(params.rowIndex);
    rowNode.data.isNewRecord = false;//for save button showing
    this.editStoreItemsGridApi.stopEditing();
    params.api.refreshCells({
      columns: ['actions'],
      rowNodes: [params.node],
      force: true,
    });
  }
}
