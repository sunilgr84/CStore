import { Component, OnInit, Input } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { EditableGridService } from '@shared/services/editableGrid/editable-grid.service';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '@shared/services/commmon/common.service';
import { ConfirmationDialogService } from '@shared/component/confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-add-pricing',
  templateUrl: './add-pricing.component.html',
  styleUrls: ['./add-pricing.component.scss']
})
export class AddPricingComponent implements OnInit {
  @Input() itemId: any;
  @Input() unitsInCase?: any;
  isApplyPriceChangestoAllStores = false;
  editStoreItemsGridApi: any;
  editStoreItemsRowData: any;
  storeItemsGridEditableOptions: any;
  userInfo = this.constantService.getUserInfo();
  _pricingRowIndex: any;
  isCase: boolean;
  gridColumnApi: any;
  constructor(private constantService: ConstantService,
    private editGridService: EditableGridService, private confirmationDialogService: ConfirmationDialogService,
    private toastr: ToastrService, private dataSerice: SetupService,
    private spinner: NgxSpinnerService, private commonService: CommonService) {
    this.storeItemsGridEditableOptions =
      this.editGridService.getGridOption(this.constantService.editableGridConfig.gridTypes.storeItemsGridEditable);
  }

  ngOnInit() {
    this.fetchStoreLocationItemByItemID(this.itemId, true);
    this.isCase = true;
  }
  onCaseChange($event) {
    // this.isCase = $event.checked;
    if (this.isCase == false) {
      this.gridColumnApi
        .setColumnsVisible(['buyingDiscount', 'buyingCost'], this.isCase);
      this.editStoreItemsRowData.forEach(element => {
        element["inventoryValuePrice"] = element.inventoryValuePriceCopy;
      });
      this.editStoreItemsGridApi.redrawRows();
      this.editStoreItemsGridApi.sizeColumnsToFit();
    } else {
      this.gridColumnApi
        .setColumnsVisible(['buyingDiscount', 'buyingCost'], this.isCase);
      this.editStoreItemsGridApi.sizeColumnsToFit();
    }
  }

  onEditGridReady(params) {
    this.editStoreItemsGridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.editStoreItemsGridApi.sizeColumnsToFit();
  }
  deletePricingAction(params) {

  }
  getStartEditingCell(_colKey, _rowIndex) {
    this.editStoreItemsGridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }
  editPriceingGrid(param) {

    if (param.data && param.data.inventoryValuePrice && Number(param.data.inventoryValuePrice) > 999.99) {
      this.toastr.warning('Cost should be below in 999.99');
      this.getStartEditingCell('inventoryValuePrice', param.rowIndex);
      return;
    }
    // if (param.data.regularSellPrice && Number(param.data.regularSellPrice) > param.data.mrp) {
    //   this.toastr.warning('Sell Price should be below in ' + param.data.mrp);
    //   this.getStartEditingCell('regularSellPrice', param.rowIndex);
    //   return;
    // }
    if (param.data.regularSellPrice && Number(param.data.regularSellPrice) > param.data.mrp && Number(param.data.mrp) > 0) {
      this.confirmationDialogService.confirm('Please confirm', 'Price is greater than max suggested retail price $' + param.data.mrp + ' Do you still want to proceed.')
        .then((confirmed) => {
          const postData = this.isApplyPriceChangestoAllStores === true ? this.getvalidateGrid(param) :
            [{ ...param.data, lastModifiedBy: this.userInfo.userName, currentAsOfDateTime: new Date() }];
          if (postData.length > 0) {
            this.editStoreItemsRowData = this.isApplyPriceChangestoAllStores ? postData : this.editStoreItemsRowData;
            this.spinner.show();
            // tslint:disable-next-line:max-line-length
            this.dataSerice.postData('StoreLocationItem/updateListStoreLocationItem?CompanyID=' + this.userInfo.companyId, postData).subscribe(res => {
              this.spinner.hide();
              if (res && res['statusCode']) {
                this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
                this.fetchStoreLocationItemByItemID(this.itemId, true);
                return;
              }
              if (res) {
                this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
              } else {
                this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
              }
              this.fetchStoreLocationItemByItemID(this.itemId, true);
            }, err => {
              this.spinner.hide();
              this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
              console.log(err);
            });
          }
        })
        .catch(() => {
          this.getStartEditingCell('regularSellPrice', param.rowIndex);
          return;
        });
    } else {
      const postData = this.isApplyPriceChangestoAllStores === true ? this.getvalidateGrid(param) :
        [{ ...param.data, lastModifiedBy: this.userInfo.userName, currentAsOfDateTime: new Date() }];
      if (postData.length > 0) {
        this.editStoreItemsRowData = this.isApplyPriceChangestoAllStores ? postData : this.editStoreItemsRowData;
        this.spinner.show();
        // tslint:disable-next-line:max-line-length
        this.dataSerice.postData('StoreLocationItem/updateListStoreLocationItem?CompanyID=' + this.userInfo.companyId, postData).subscribe(res => {
          this.spinner.hide();
          if (res && res['statusCode']) {
            this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
            this.fetchStoreLocationItemByItemID(this.itemId, true);
            return;
          }
          if (res) {
            this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
          } else {
            this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
          }
          this.fetchStoreLocationItemByItemID(this.itemId, true);
        }, err => {
          this.spinner.hide();
          this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
          console.log(err);
        });
      }
    }



    // else {
    //   const postdata = {
    //     ...param.data,
    //     LastModifiedBy: this.userInfo.userName
    //   };
    //   if (param.data.storeLocationItemID > 0) {
    //     this.spinner.show();
    //     this.dataSerice.postData('StoreLocationItem/update?isMobile=false&CompanyID=' + this.userInfo.companyId,
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
    //     this.dataSerice.postData('StoreLocationItem/addNew',
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
    this.spinner.show();
    // tslint:disable-next-line:max-line-length
    this.dataSerice.getData(`StoreLocationItem/getAllStoreLocationItemByItemID/${id}/${this.userInfo.companyId}/${this.userInfo.userName}`).subscribe(res => {
      this.spinner.hide();
      if (res && res['statusCode']) {
        this.commonService.itemStoreList = this.editStoreItemsRowData = [];
        this.editStoreItemsGridApi.sizeColumnsToFit();
        return;
      }
      this.commonService.itemStoreList = res;
      // const data = res.map(obj => ({ ...obj, isSaveRequired: true}));
      const data = [...res];
      data.forEach(element => {
        element["inventoryValuePriceCopy"] = element.inventoryValuePrice;
        element["isSaveRequired"] = true;
        element["unitsInCase"] = this.unitsInCase;
      });
      this.editStoreItemsRowData = data;
      this.editStoreItemsGridApi.sizeColumnsToFit();
    }, err => {
      this.spinner.hide();
      console.log(err);
    });
  }
  getvalidateGrid(param?: any) {
    const postData = [];
    let selectRow = null;
    const isApply = this.isApplyPriceChangestoAllStores;
    const userName = this.userInfo.userName;
    if (param.rowIndex) {
      selectRow = this.editStoreItemsGridApi.getRowNode(param.rowIndex);
    }
    // if (this._pricingRowIndex !== null) {
    //   selectRow = this.editStoreItemsGridApi.getRowNode(this._pricingRowIndex);
    // }
    this.editStoreItemsRowData.forEach(function (x: any, i: number) {
      if (isApply && param.data) {
        x['inventoryValuePrice'] = param.data['inventoryValuePrice'];
        x['regularSellPrice'] = param.data['regularSellPrice'];
        // x['profitMargin'] = param.data['profitMargin'];
        // x['minInventory'] = param.data['minInventory'];
        // x['maxInventory'] = param.data['maxInventory'];
        // x['currentInventory'] = param.data['currentInventory'];
        // add new fields
        // x['buydown'] = param.data['buydown'];
        // x['rackAllowance'] = param.data['rackAllowance'];
      }
      x['lastModifiedBy'] = userName;
      x['currentAsOfDateTime'] = new Date();
      postData.push(x);
    });
    return postData;
  }
  cellValueChanged(params) {
    var colId = params.column.getId();
    if (colId === "buyingCost") {
      if (params.data.buyingCost && Number(params.data.buyingCost) >= 0) {
        this.editStoreItemsGridApi.redrawRows({ rowNodes: [params.node] });
      }
    }
    if (colId === "buyingDiscount") {
      if (params.data.buyingCost && params.data.buyingDiscount && (Number(params.data.buyingDiscount) < Number(params.data.buyingCost))) {
        this.editStoreItemsGridApi.redrawRows({ rowNodes: [params.node] });
      }
    }

    if (colId === "buyDownAmt") {
      if (params.data.buyDownAmt && Number(params.data.buyDownAmt) >= 0) {
        this.editStoreItemsGridApi.redrawRows({ rowNodes: [params.node] });
      }
    }

    if (colId === "rackAllowance") {
      if (params.data.rackAllowance && Number(params.data.rackAllowance) >= 0) {
        this.editStoreItemsGridApi.redrawRows({ rowNodes: [params.node] });
      }
    }

    if (colId === "inventoryValuePrice") {
      if (params.data.inventoryValuePrice && Number(params.data.inventoryValuePrice) >= 0) {
        this.editStoreItemsGridApi.redrawRows({ rowNodes: [params.node] });
      }
    }

    if (colId === "regularSellPrice") {
      if (params.data.regularSellPrice && Number(params.data.regularSellPrice) >= 0) {
        this.editStoreItemsGridApi.redrawRows({ rowNodes: [params.node] });
      }
    }

    if ((Number(params.data.buyingDiscount) >= Number(params.data.buyingCost))) {
      this.toastr.warning('Cost Buy Should be greater than Cost Discount');
      params.data.buyingDiscount = null;
      this.getStartEditingCell('buyingDiscount', params.rowIndex);
      return;
    }
    if (Number(params.oldValue) !== Number(params.newValue)) {
      this._pricingRowIndex = params.rowIndex;
    }
    if (params.data && params.data.inventoryValuePrice && Number(params.data.inventoryValuePrice) > 999.99) {
      this.toastr.warning('Cost should be below in 999.99');
      this.getStartEditingCell('inventoryValuePrice', params.rowIndex);
      return;
    }
    // if (params.data.regularSellPrice && Number(params.data.regularSellPrice) > params.data.mrp) {
    //   this.confirmationDialogService.confirm('Please confirm', 'Price is greater than max suggested price ' + params.data.mrp + '. Do you still want to proceed.')
    //     .then((confirmed) => {
    //     })
    //     .catch(() => {
    //       this.getStartEditingCell('regularSellPrice', params.rowIndex);
    //       return;
    //     });
    // }
  }

  suspendAction(event) {
    this.spinner.show();
    let postData = [{
      itemId: event.data.itemID,
      username: this.userInfo.userName,
      StoreLocationId: event.data.storeLocationID
    }];
    this.dataSerice.postData(`Item/SuspendItem`, postData).
      subscribe((response: any) => {
        if (response.status && response.status === 1) {
          this.spinner.hide();
          this.toastr.success("Item Suspended Successfully", this.constantService.infoMessages.success);
          this.fetchStoreLocationItemByItemID(this.itemId, true);
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
    let postData = [{
      itemId: event.data.itemID,
      username: this.userInfo.userName,
      storeLocationId: event.data.storeLocationID,
      withMultipackItem: true
    }];
    this.dataSerice.postData(`Item/ItemRecovery`, postData).
      subscribe((response: any) => {
        if (response.status && response.status === 1) {
          this.spinner.hide();
          this.toastr.success("Item Recovered Successfully", this.constantService.infoMessages.success);
          this.fetchStoreLocationItemByItemID(this.itemId, true);
        } else {
          this.spinner.hide();
          this.toastr.error("Item Recovery Failed", this.constantService.infoMessages.error);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.contactAdmin);
      });
  }
}
