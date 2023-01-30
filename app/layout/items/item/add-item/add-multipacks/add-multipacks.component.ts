import { Component, OnInit, Input } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { ConstantService } from '@shared/services/constant/constant.service';
import { EditableGridService } from '@shared/services/editableGrid/editable-grid.service';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '@shared/services/commmon/common.service';
import * as _ from 'lodash';
@Component({
  selector: 'app-add-multipacks',
  templateUrl: './add-multipacks.component.html',
  styleUrls: ['./add-multipacks.component.scss']
})
export class AddMultipacksComponent implements OnInit {
  @Input() itemId: any;
  @Input() unitsInCase?: any;
  multipacksIEditGridOptions: GridOptions;
  multipacksIEditGridApi: any;
  multipacksIRowData: any;
  userInfo = this.constantService.getUserInfo();
  constructor(private constantService: ConstantService,
    private editGridService: EditableGridService,
    private toastr: ToastrService, private dataService: SetupService,
    private spinner: NgxSpinnerService, private commonService: CommonService) {
    this.multipacksIEditGridOptions = this.editGridService.getGridOption(this.constantService.editableGridConfig.gridTypes.multipacksIGrid);
  }

  ngOnInit() {
    this.fetchStoreLocationItemByItemID(this.itemId);
    this.GetModifierById(0);
  }
  onMultipacksEditGridReady(params) {
    this.multipacksIEditGridApi = params.api;
    params.api.sizeColumnsToFit();
  }
  fetchStoreLocationItemByItemID(id) {
    this.spinner.show();
    // tslint:disable-next-line:max-line-length
    this.dataService.getData(`StoreLocationItem/getAllStoreLocationItemByItemID/${id}/${this.userInfo.companyId}/${this.userInfo.userName}`).subscribe(res => {
      this.spinner.hide();
      if (res && res['statusCode']) {
        this.commonService.itemStoreList = [];
        return;
      } else {
        this.commonService.itemStoreList = _.filter(res, function (o) { return o.storeLocationItemID > 0; });
      }
      this.GetMultipacks(this.itemId);
    }, err => {
      console.log(err);
    });
  }
  GetMultipacks(id) {
    const temp = {
      isSaveRequired: true,
      multipackItemID: 0,
      posCodeModifier: '',
      storeLocationItemID: 0,
      unitCostPrice: 0,
      regularPackageSellPrice: 0,
      createdDateTime: new Date(),
      lastModifiedBy: this.userInfo.userName,
      lastModifiedDateTime: new Date(),
      buyDown: 0,
      totaInventoryValuePrice: 0,
      grossProfit: 0,
      sellingUnits: 0,
      isNewPriceChecked: true,
      itemID: this.itemId
    };
    this.spinner.show();
    this.dataService.getData(`MultipackItem/GetMultiPackItemByItemID/${id}`).subscribe(res => {
      this.spinner.hide();
      if (res && res['statusCode']) {
        const arr = [temp];
        this.multipacksIRowData = arr;
        return;
      }
      const mergeById = (a1, a2) =>
        a1.map(itm => ({
          ...a2.find((item) => (item.storeLocationItemID === itm.storeLocationItemID) && item),
          ...itm
        }));
      if (this.commonService.itemStoreList) {
        const data = mergeById(res, this.commonService.itemStoreList);
        const arr = [...data, temp];
        this.multipacksIRowData = arr;
      } else {
        const arr = [...res, temp];
        this.multipacksIRowData = arr;
      }
    }, err => {
      this.spinner.hide();
      this.toastr.error(this.constantService.infoMessages.contactAdmin);
      console.log(err);
    });
  }
  onCellChanged(params) {
    if (params.column.colId === 'storeName' && params.value !== ''
      && params.value) {
      const storeItem = _.find(this.commonService.itemStoreList, ['storeName', params.data.storeName]);
      this.GetModifierById(storeItem.storeLocationItemID);
    }
  }
  GetModifierById(storeId?: any) {
    const buc = this.unitsInCase ? this.unitsInCase : 1;
    const storeIds = storeId ? storeId : 0;
    this.dataService.getData('MultipackItem/getSellingUnitByStoreLocationItems/' + buc
      + '/' + this.itemId +
      '/' + storeIds).subscribe(
        (res) => {
          if (res && (res['statusCode'])) {
            return;
          }
          this.commonService.multipackModifierList = res ? res : [];
        }, (err) => {
          console.log(err);
        }
      );
  }
  AddMultipackRow() {
    this.multipacksIEditGridApi.updateRowData({
      add: [{
        isSaveRequired: true,
        multipackItemID: 0,
        posCodeModifier: '',
        storeLocationItemID: 0,
        unitCostPrice: 0,
        regularPackageSellPrice: 0,
        createdDateTime: new Date(),
        lastModifiedBy: this.userInfo.userName,
        lastModifiedDateTime: new Date(),
        buyDown: 0,
        totaInventoryValuePrice: 0,
        grossProfit: 0,
        sellingUnits: 0,
        isNewPriceChecked: true,
        itemID: this.itemId
      }],
      addIndex: this.multipacksIRowData ? this.multipacksIRowData.length : 0
    });
  }
  // set edit cell
  getStartMultipacksCell(_colKey, _rowIndex) {
    this.multipacksIEditGridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }
  saveMultipacks(param) {
    if (!param.data.storeName) {
      this.toastr.warning('Please Select Store Name', 'warning');
      this.getStartMultipacksCell('storeName', param.rowIndex);
      return;
    }
    if (!param.data.posCodeModifier) {
      this.toastr.warning('Please Select POS Code Modifier', 'warning');
      this.getStartMultipacksCell('posCodeModifier', param.rowIndex);
      return;
    }
    const storeItem = _.find(this.commonService.itemStoreList, ['storeName', param.data.storeName]);
    const postData = {
      multipackItemID: param.data.multipackItemID,
      posCodeModifier: param.data.posCodeModifier,
      storeLocationItemID: storeItem && storeItem.storeLocationItemID ? storeItem.storeLocationItemID : param.data.storeLocationItemID,
      unitCostPrice: param.data.unitCostPrice,
      regularPackageSellPrice: param.data.regularPackageSellPrice,
      createdDateTime: new Date(),
      lastModifiedBy: this.userInfo.userName,
      lastModifiedDateTime: new Date(),
      buyDown: 0,
      totaInventoryValuePrice: 0,
      grossProfit: 0,
      sellingUnits: 0,
      isNewPriceChecked: true,
      itemID: this.itemId
    };
    if (postData.multipackItemID > 0) {
      this.spinner.show();
      this.dataService.updateData('MultipackItem/update', postData).subscribe(
        (res) => {
          this.spinner.hide();
          let errorMessage = '';
          if (res && res['statusCode']) {
            if (res.statusCode === 400) {
              res.result.validationErrors.forEach(vError => {
                errorMessage += vError.errorMessage;
              });
              this.toastr.error('Store Name & POS Code Modifier already exists', 'Error');
              return;
            } else {
              this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
              return;
            }
          }

          if (res && res === '1') {
            this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
            this.GetMultipacks(this.itemId);
          } else {
            this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
          }
        },
        (err) => {
          this.toastr.error(this.constantService.infoMessages.contactAdmin, this.constantService.infoMessages.error);
          this.spinner.hide();
        }
      );
    } else {
      this.spinner.show();
      this.dataService.postData('MultipackItem/addNew', postData).subscribe(
        (res) => {
          this.spinner.hide();
          let errorMessage = '';
          if (res && res['statusCode']) {
            if (res.statusCode === 400) {
              res.result.validationErrors.forEach(vError => {
                errorMessage += vError.errorMessage;
              });
              this.toastr.error(errorMessage, 'Error');
              return;
            } else {
              this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
              return;
            }
          }

          if (res && res.multipackItemID) {
            this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
            this.GetMultipacks(this.itemId);
          } else {
            this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
          }
        },
        (err) => {
          this.toastr.error(this.constantService.infoMessages.contactAdmin, this.constantService.infoMessages.error);
          this.spinner.hide();
        }
      );
    }

  }
  deleteMultipacks(param) {
    if (param.data && param.data.multipackItemID > 0) {
      this.spinner.show();
      this.dataService.deleteData('MultipackItem?mixMatchItemId=' + param.data.multipackItemID).subscribe(
        (res) => {
          this.spinner.hide();
          if (res && res['statusCode']) {
            this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
            return;
          }
          if (res && res === '1') {
            this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
            this.GetMultipacks(this.itemId);
          } else {
            this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
          }
        },
        (err) => {
          this.toastr.error(this.constantService.infoMessages.contactAdmin, this.constantService.infoMessages.error);
          this.spinner.hide();
        }
      );
    }
  }

  suspendAction(event) {
    this.spinner.show();
    let postData = [{
      multipackItemId: event.data.multipackItemID,
      username: this.userInfo.userName,
    }];
    this.dataService.postData(`Item/SuspendMultipackItem`, postData).
      subscribe((response: any) => {
        if (response.status && response.status === 1) {
          this.spinner.hide();
          this.toastr.success("Multipack Item Suspended Successfully", this.constantService.infoMessages.success);
          this.fetchStoreLocationItemByItemID(this.itemId);
        } else {
          this.spinner.hide();
          this.toastr.error("Multipack Item Suspension Failed", this.constantService.infoMessages.error);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.contactAdmin);
      });
  }

  recoverAction(event) {
    this.spinner.show();
    let postData = [{
      multipackItemId: event.data.multipackItemID,
      username: this.userInfo.userName,
    }];
    this.dataService.postData(`Item/MultipackItemRecovery`, postData).
      subscribe((response: any) => {
        if (response.status && response.status === 1) {
          this.spinner.hide();
          this.toastr.success("Multipack Item Recovered Successfully", this.constantService.infoMessages.success);
          this.fetchStoreLocationItemByItemID(this.itemId);
        } else {
          this.spinner.hide();
          this.toastr.error("Multipack Item Recovery Failed", this.constantService.infoMessages.error);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.contactAdmin);
      });
  }
}
