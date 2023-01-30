import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild } from '@angular/core';
import { SetupService } from '@shared/services/setupService/setup-service';
import { CommonService } from '@shared/services/commmon/common.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'lodash';
import { AdvPaginationGridComponent } from '@shared/component/pagination-grid/adv-pagination-grid/adv-pagination-grid.component';

@Component({
  selector: 'app-vendors-mitems',
  templateUrl: './vendors.component.html',
  styleUrls: ['./vendors.component.scss'],
})
export class VendorsComponent {

  @Output() rowCount: EventEmitter<any> = new EventEmitter();
  @Input('show')
  set show(val) {
    this.isShow = val;
    this.newRowAdded = false;
  }
  isShow;

  @Input() itemID: number
  @ViewChild(AdvPaginationGridComponent) child: AdvPaginationGridComponent;
  userInfo = this.constantService.getUserInfo();
  vendorOptions: any;
  vendorGridApi: any;
  vendorRowData: any = [];
  newRowAdded: boolean;
  addrow: any;
  tempId: number;

  constructor(private dataSerice: SetupService, private constantService: ConstantService, private toastr: ToastrService, private spinner: NgxSpinnerService, private paginationGridService: PaginationGridService,
    private commonService: CommonService) {
    this.vendorOptions = this.paginationGridService.getGridOption(this.constantService.gridTypes.editItemVendorGrid);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.itemID && changes.itemID.currentValue) {
      this.getVendorItem();
      this.fetchVendorItemItemID(this.itemID);
    }
  }

  onVendorGridReady(params) {
    this.vendorGridApi = params.api;
    this.vendorGridApi.sizeColumnsToFit();
    this.vendorGridApi.setDomLayout('normal');
    this.child.setHeight('200px');
  }

  getVendorItem() {
    // this.spinner.show();
    this.dataSerice.getData('Vendor/getAll/' + this.userInfo.companyId).subscribe(
      (response) => {
        // this.spinner.hide();
        if (response && response['statusCode']) {
          this.commonService.vendorItemList = [];
          return;
        }
        const myOrderedArray = _.sortBy(response, o => o.vendorName);
        this.commonService.vendorItemList = myOrderedArray;
      });
  }

  onEdit(params) {
    this.getStartEditingCell('vendorName', params.rowIndex);
  }

  onCancel(params) {
    if (params.data.vendorItemID === 0) {
      this.vendorGridApi.updateRowData({ remove: [params.data] });
      this.newRowAdded = false;
      this.getVendorRow();
      this.vendorGridApi.setRowData(this.vendorRowData);
      this.rowCount.emit({ key: 'vendor', value: this.vendorRowData.length });
      return;
    } else {
      this.vendorGridApi.stopEditing();
    }
  }

  createNewRowData() {
    this.tempId = 0;
    //this.tempId = this.vendorGridApi.getDisplayedRowCount();
    const newData = {
      id: this.tempId,
      isSaveRequired: true,
      vendorItemID: 0,
      vendorID: 0,
      itemID: this.itemID,
      vendorItemCode: '',
      itemName: '',
      itemPosCode: '',
      vendorName: null,
      vendorCode: '',
      vendorExists: false,
      description: '',
      isNewRecord: true
    };

    return newData;
  }
  editVendorItem(event) {
    event.stopPropagation();
    if (!this.itemID)
      return false;
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
    this.vendorGridApi.stopEditing();
    this.getStartEditingCell('vendorName', params.rowIndex);
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
        itemID: this.itemID,
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
          this.getVendorRow();
          this.vendorGridApi.setRowData(this.vendorRowData);
          this.rowCount.emit({ key: 'vendor', value: this.vendorRowData.length });
        } else {
          this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
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
        itemID: this.itemID,
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
          this.fetchVendorItemItemID(this.itemID);
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
    // this.spinner.show();
    this.dataSerice.getData(`VendorItem/getByItemId/${id}`).subscribe(res => {
      this.newRowAdded = false;
      // this.spinner.hide();
      if (res && res['statusCode']) {
        this.vendorRowData = [];
        return;
      }
      this.vendorRowData = res;
      if (this.vendorGridApi)
        this.vendorGridApi.setRowData(this.vendorRowData);
      this.rowCount.emit({ key: 'vendor', value: this.vendorRowData.length });
    }, err => {
      this.spinner.hide();
      console.log(err);
    });
  }
  getVendorRow() {
    const arr = [];
    this.vendorGridApi && this.vendorGridApi.forEachNode(function (node) {
      arr.push(node.data);
    });
    this.vendorRowData = arr;
  }
  deleteVendorItem(params) {
    if (params.data.vendorItemID === 0) {
      this.vendorGridApi.updateRowData({ remove: [params.data] });
      this.newRowAdded = false;
      this.getVendorRow();
      this.vendorGridApi.setRowData(this.vendorRowData);
      this.rowCount.emit({ key: 'vendor', value: this.vendorRowData.length });
      return;
    } else {
      this.spinner.show();
      this.dataSerice.deleteData('VendorItem?id=' + params.data.vendorItemID).subscribe(res => {
        this.spinner.hide();
        if (res === '1') {
          this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
          this.vendorGridApi.updateRowData({ remove: [params.data] });
          this.getVendorRow();
          this.vendorGridApi.setRowData(this.vendorRowData);
          this.rowCount.emit({ key: 'vendor', value: this.vendorRowData.length });
        }
      }, err => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
        console.log(err);
      });
    }
  }

}
