import { Component, OnInit, Input } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '@shared/services/commmon/common.service';
import * as _ from 'lodash';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';

@Component({
  selector: 'app-add-multi-packs',
  templateUrl: './add-multi-packs.component.html',
  styleUrls: ['./add-multi-packs.component.scss']
})
export class AddMultiPacksComponent implements OnInit {
  @Input() itemId: any;
  @Input() unitsInCase?: any;
  @Input() storeLocationID:any;
  multipacksIEditGridOptions: any;
  multipacksIEditGridApi: any;
  multipacksIRowData: any;
  userInfo = this.constantService.getUserInfo();
  constructor(private constantService: ConstantService,
    private toastr: ToastrService, private dataService: SetupService,
    private paginationGridService: PaginationGridService,
    private spinner: NgxSpinnerService, private commonService: CommonService) {
    this.multipacksIEditGridOptions = this.paginationGridService.getGridOption(
      this.constantService.gridTypes.advmultipacksIGrid
    );
  }

  ngOnInit() {
    this.fetchStoreLocationItemByItemID(this.itemId);
    this.GetModifierById(this.storeLocationID);

  }
  onMultipacksEditGridReady(params) {
    this.multipacksIEditGridApi = params.api;
    params.api.sizeColumnsToFit();
  }
  fetchStoreLocationItemByItemID(id) {
    // tslint:disable-next-line:max-line-length
    this.dataService.getData(`StoreLocationItem/getAllStoreLocationItemByItemID/${id}/${this.userInfo.companyId}/${this.userInfo.userName}`).subscribe(res => {
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
      isNewRecord:true,
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
        const arr = [temp,...data];
        this.multipacksIEditGridApi.setRowData(arr);
        this.multipacksIRowData=arr;
        console.log(this.multipacksIRowData);
        this.getStartMultipacksCell('posCodeModifier',  0 );
      } else {
        const arr = [temp,...res];
        this.multipacksIEditGridApi.setRowData(arr);
        this.multipacksIRowData=arr;
        console.log(this.multipacksIRowData);
        this.getStartMultipacksCell('posCodeModifier', 0 );
      }
    }, err => {
      this.spinner.hide();
      this.toastr.error(this.constantService.infoMessages.contactAdmin);
      console.log(err);
    });
  }
 
  GetModifierById(storeId?: any) {
    this.spinner.show();
    const buc = this.unitsInCase ? this.unitsInCase : 1;
    const storeIds = storeId ? storeId : 0;
    this.dataService.getData('MultipackItem/getSellingUnitByStoreLocationItems/' + buc
      + '/' + this.itemId +
      '/' + storeIds).subscribe(
        (res) => {
          this.spinner.hide();
          if (res && (res['statusCode'])) {
            return;
          }
          this.commonService.multipackModifierList = res ? res : [];
        }, (err) => {
          console.log(err);
        }
      );
  }

  // set edit cell
  getStartMultipacksCell(_colKey, _rowIndex) {
    this.multipacksIEditGridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }
  saveMultipacks(param) {

    if (!param.node.data.posCodeModifier) {
      this.toastr.warning('Please Select POS Code Modifier', 'warning');
      this.getStartMultipacksCell('posCodeModifier', param.rowIndex);
      return;
    }
    const storeItem = _.find(this.commonService.itemStoreList, ['storeLocationID', this.storeLocationID]);
    const postData = {
      multipackItemID: param.node.data.multipackItemID,
      posCodeModifier: param.node.data.posCodeModifier.toString(),
      storeLocationItemID: storeItem && storeItem.storeLocationItemID ? storeItem.storeLocationItemID : param.node.data.storeLocationItemID,
      unitCostPrice: param.node.data.unitCostPrice.toString(),
      regularPackageSellPrice: param.node.data.regularPackageSellPrice.toString(),
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
  getMultipacksRow() {
    const arr = [];
    this.multipacksIEditGridApi && this.multipacksIEditGridApi.forEachNode(function (node) {
      arr.push(node.data);
    });
    this.multipacksIEditGridApi.setRowData(arr);
  }
  onCancel(params) {
    if (params.data.multipackItemID === 0) {
    //  this.multipacksIEditGridApi.applyTransaction({ remove: [params.data] });
    //  this.isAddRowMultip = false;
    //  this.getMultiplierRow();
      return;
    } else {
      this.multipacksIEditGridApi.stopEditing();
    }
  }
  deleteMultipacks(params) {
    if (params.data.multiplierID === 0) {
      this.multipacksIEditGridApi.applyTransaction({ remove: [params.data] });
     // this.isAddRowMultip = false;
      this.getMultipacksRow();
      return;
    } else if (params.data && params.data.multipackItemID > 0) {
      this.spinner.show();
      this.dataService.deleteData('MultipackItem?mixMatchItemId=' + params.data.multipackItemID + `&CompanyID=` + this.userInfo.companyId).subscribe(
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
