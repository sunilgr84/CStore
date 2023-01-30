import { Component, OnInit, Input } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { EditableGridService } from '@shared/services/editableGrid/editable-grid.service';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '@shared/services/commmon/common.service';
import { GridOptions } from 'ag-grid-community';
import * as _ from 'lodash';
@Component({
  selector: 'app-add-item-vendor',
  templateUrl: './add-item-vendor.component.html',
  styleUrls: ['./add-item-vendor.component.scss']
})
export class AddItemVendorComponent implements OnInit {
  @Input() itemId: any;
  vendorOptions: GridOptions;
  vendorGridApi: any;
  vendorRowData: any;
  userInfo = this.constantService.getUserInfo();
  newRowAdded: boolean;
  addrow: any;
  tempId: number;
  isHideButtons = false;
  constructor(private constantService: ConstantService,
    private editGridService: EditableGridService,
    private toastr: ToastrService, private dataSerice: SetupService,
    private spinner: NgxSpinnerService, private commonService: CommonService) {
    this.vendorOptions = this.editGridService.getGridOption(this.constantService.editableGridConfig.gridTypes.editItemVendorGrid);

  }

  ngOnInit() {
    this.getVendorItem();
    this.fetchVendorItemItemID(this.itemId);
  }
  onVendorGridReady(params) {
    this.vendorGridApi = params.api;
    this.vendorGridApi.sizeColumnsToFit();
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
  editVendorItem() {
    if (this.newRowAdded) {
      this.toastr.error('Please save existing data first before adding another!');
      return;
    }
    this.newRowAdded = true;
    const newItem = this.createNewRowData();
    this.vendorGridApi.updateRowData({
      add: [newItem],
      addIndex: 0
    });
    this.addrow = this.addrow + 1;
    this.getStartEditingCell('vendorName', 0);
  }
  getStartEditingCell(_colKey, _rowIndex) {
    this.vendorGridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }
  editVendorItemAction(params) {
    // const vendorObj = params.data.vendorName.split(',');
    if (!this.commonService.vendorItemList) {
      return;
    }
    const vendorObj = this.commonService.vendorItemList.filter(
      x => x.vendorName === params.data.vendorName);
    if (vendorObj && vendorObj.length === 0) {
      this.toastr.error('Please Select Vendor Name...', 'Error');
      //  this.getStartEditingCell('vendorName', params.rowIndex);
      return;
    }
    if (params.data.vendorItemCode === '') {
      this.toastr.error('Please Enter Vendor item Code...', 'Error');
      // this.getStartEditingCell('vendorItemCode', params.rowIndex);

      return;
    }
    if (params.data.vendorItemID > 0) {
      const isDuplicate = _.find(this.vendorRowData, function (o) {
        return o.vendorName === params.data.vendorName &&
          o.vendorItemID !== params.data.vendorItemID;
      });
      if (isDuplicate) {
        this.toastr.warning('Vendor Name Already Exists..', this.constantService.infoMessages.error);
        return;
      }
      const postData = {
        vendorItemID: params.data.vendorItemID,
        vendorID: Number(vendorObj[0].vendorID),
        itemID: this.itemId,
        vendorItemCode: params.data.vendorItemCode,
        itemName: '',
        itemPosCode: '',
        vendorName: '',
        vendorCode: params.data.vendorCode,
        vendorExists: false,
        description: '',
      };
      this.spinner.show();
      this.dataSerice.updateData('VendorItem', postData).subscribe(res => {
        this.spinner.hide();
        if (res === '1') {
          // this.newRowAdded = false;
          this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
        } else {
          this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
          this.fetchVendorItemItemID(this.itemId);
        }
      }, err => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
        console.log(err);
      });
    } else {
      const isDuplicate = _.find(this.vendorRowData, ['vendorName', params.data.vendorName]);
      if (isDuplicate) {
        this.toastr.warning('Vendor Name Already Exists..', this.constantService.infoMessages.error);
        return;
      }
      const postData = {
        vendorItemID: params.data.vendorItemID,
        vendorID: Number(vendorObj[0].vendorID),
        itemID: this.itemId,
        vendorItemCode: params.data.vendorItemCode,
        itemName: '',
        itemPosCode: '',
        vendorName: '',
        vendorCode: '', // (vendorObj[1]),
        vendorExists: false,
        description: '',
      };
      this.spinner.show();
      this.dataSerice.postData('VendorItem', postData).subscribe(res => {
        this.spinner.hide();
        if (res && res.vendorItemID) {
          this.newRowAdded = false;
          this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
          this.fetchVendorItemItemID(this.itemId);
        } else {
          this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
        }
      }, err => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
        console.log(err);
      });
    }

  }
  fetchVendorItemItemID(id) {
    this.spinner.show();
    this.dataSerice.getData(`VendorItem/getByItemId/${id}`).subscribe(res => {
      this.newRowAdded = false;
      this.spinner.hide();
      if (res && res['statusCode']) {
        this.vendorRowData = [];
        return;
      }
      this.vendorRowData = res;
    }, err => {
      this.spinner.hide();
      console.log(err);
    });
  }
  deleteVendorItem(params) {
    if (params.data.vendorItemID === 0) {
      this.vendorGridApi.updateRowData({ remove: [params.data] });
      this.newRowAdded = false;
      return;
    } else {
      this.spinner.show();
      this.dataSerice.deleteData('VendorItem?id=' + params.data.vendorItemID).subscribe(res => {
        this.spinner.hide();
        if (res === '1') {
          this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
          this.vendorGridApi.updateRowData({ remove: [params.data] });
        }
      }, err => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
        console.log(err);
      });
    }
  }

}
